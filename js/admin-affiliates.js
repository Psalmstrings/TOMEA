/**
 * admin-affiliates.js
 * TOMÉA Perfumes — Affiliate Management Controller
 * Handles: list, create, edit, delete, stats, payout recording
 */

(function () {
  'use strict';

  // ─── State ───────────────────────────────────────────────────────────────────
  let affiliates = [];
  let currentAffiliateId = null;
  let currentDetailId = null;

  // ─── DOM References ───────────────────────────────────────────────────────────
  const tableBody = document.getElementById('affiliates-table-body');
  const filterStatus = document.getElementById('aff-filter-status');

  // Metrics
  const metricTotal = document.getElementById('aff-metric-total');
  const metricActive = document.getElementById('aff-metric-active');
  const metricSales = document.getElementById('aff-metric-sales');
  const metricPending = document.getElementById('aff-metric-pending');

  // Affiliate modal
  const affiliateModal = document.getElementById('affiliate-modal');
  const affiliateForm = document.getElementById('affiliate-form');
  const btnOpenAdd = document.getElementById('btn-open-add-affiliate');

  // Detail modal
  const detailModal = document.getElementById('affiliate-detail-modal');
  const detailBody = document.getElementById('affiliate-detail-body');
  const btnDetailEdit = document.getElementById('btn-detail-edit');
  const btnRecordPayout = document.getElementById('btn-record-payout');

  // Payout modal
  const payoutModal = document.getElementById('payout-modal');
  const btnConfirmPayout = document.getElementById('btn-confirm-payout');

  // Form fields
  const fldId = document.getElementById('aff-id');
  const fldName = document.getElementById('aff-name');
  const fldEmail = document.getElementById('aff-email');
  const fldPhone = document.getElementById('aff-phone');
  const fldInstagram = document.getElementById('aff-instagram');
  const fldCode = document.getElementById('aff-code');
  const fldSlug = document.getElementById('aff-slug');
  const fldDiscount = document.getElementById('aff-discount');
  const fldCommission = document.getElementById('aff-commission');
  const fldStartDate = document.getElementById('aff-start-date');
  const fldEndDate = document.getElementById('aff-end-date');
  const fldUsageLimit = document.getElementById('aff-usage-limit');
  const fldActive = document.getElementById('aff-active');
  const affLinkUrl = document.getElementById('aff-link-url');

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  function formatNGN(amount) {
    if (!amount && amount !== 0) return '—';
    return '\u20a6' + Number(amount).toLocaleString('en-NG');
  }

  function formatDate(ts) {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function generateCode(name) {
    const base = name ? name.split(' ')[0].toUpperCase() : 'AFF';
    const num = Math.floor(Math.random() * 30) + 5;
    return base + num;
  }

  function getSiteBase() {
    return window.location.origin || 'https://yourdomain.com';
  }

  function buildRefLink(slug) {
    return slug ? getSiteBase() + '/?ref=' + slug : getSiteBase() + '/?ref=';
  }

  function getStatusBadge(isActive) {
    return isActive
      ? '<span class="status-badge status-badge--active">Active</span>'
      : '<span class="status-badge status-badge--draft">Inactive</span>';
  }

  // ─── Load & Render ────────────────────────────────────────────────────────────
  async function loadAffiliates() {
    try {
      affiliates = await window.DB.getAffiliates();
      renderTable(affiliates);
      renderMetrics(affiliates);
    } catch (err) {
      console.error('Failed to load affiliates:', err);
      if (tableBody) tableBody.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-muted">Failed to load affiliates.</td></tr>';
    }
  }

  function renderMetrics(list) {
    const total = list.length;
    const active = list.filter(a => a.isActive).length;
    const totalSales = list.reduce((sum, a) => sum + (a.totalSales || 0), 0);
    const pendingComm = list.reduce((sum, a) => sum + (a.pendingCommission || 0), 0);

    if (metricTotal) metricTotal.textContent = total;
    if (metricActive) metricActive.textContent = active;
    if (metricSales) metricSales.textContent = formatNGN(totalSales);
    if (metricPending) metricPending.textContent = formatNGN(pendingComm);
  }

  function renderTable(list) {
    if (!tableBody) return;
    if (!list || list.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-muted">No affiliates found. Add your first influencer partner.</td></tr>';
      return;
    }

    tableBody.innerHTML = list.map(aff => `
      <tr>
        <td>
          <div class="product-cell">
            <span class="product-cell-name">${aff.name}</span>
            ${aff.instagram ? '<span class="product-cell-sub">' + aff.instagram + '</span>' : ''}
          </div>
        </td>
        <td><code style="font-family:monospace;font-size:0.85em;background:rgba(0,0,0,0.06);padding:2px 7px;border-radius:4px;">${aff.code}</code></td>
        <td><strong>${aff.discountPercent || 0}%</strong></td>
        <td>${aff.commissionPercent || 0}%</td>
        <td>${aff.totalOrders || 0}</td>
        <td>${formatNGN(aff.totalSales || 0)}</td>
        <td>${formatNGN(aff.totalCommission || 0)}</td>
        <td>${getStatusBadge(aff.isActive)}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-xs btn-outline" onclick="AffiliatesAdmin.viewDetail('${aff.id}')">Stats</button>
            <button class="btn btn-xs btn-secondary" onclick="AffiliatesAdmin.editAffiliate('${aff.id}')">Edit</button>
            <button class="btn btn-xs btn-danger" onclick="AffiliatesAdmin.deleteAffiliate('${aff.id}', '${aff.name}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // ─── Filter ───────────────────────────────────────────────────────────────────
  function applyFilter() {
    const val = filterStatus ? filterStatus.value : 'all';
    let filtered = [...affiliates];
    if (val === 'active') filtered = filtered.filter(a => a.isActive);
    if (val === 'inactive') filtered = filtered.filter(a => !a.isActive);
    renderTable(filtered);
  }

  // ─── Modal: Create/Edit ───────────────────────────────────────────────────────
  function openAddModal() {
    currentAffiliateId = null;
    if (affiliateForm) affiliateForm.reset();
    if (fldId) fldId.value = '';
    if (fldActive) fldActive.checked = true;
    updateLinkPreview('');
    const titleEl = document.getElementById('affiliate-modal-title');
    if (titleEl) titleEl.textContent = 'Add Affiliate';
    openModal(affiliateModal);
  }

  function editAffiliate(id) {
    const aff = affiliates.find(a => a.id === id);
    if (!aff) return;
    currentAffiliateId = id;

    if (fldId) fldId.value = aff.id;
    if (fldName) fldName.value = aff.name || '';
    if (fldEmail) fldEmail.value = aff.email || '';
    if (fldPhone) fldPhone.value = aff.phone || '';
    if (fldInstagram) fldInstagram.value = aff.instagram || '';
    if (fldCode) fldCode.value = aff.code || '';
    if (fldSlug) fldSlug.value = aff.affiliateSlug || '';
    if (fldDiscount) fldDiscount.value = aff.discountPercent || '';
    if (fldCommission) fldCommission.value = aff.commissionPercent || '';
    if (fldActive) fldActive.checked = !!aff.isActive;
    if (fldUsageLimit) fldUsageLimit.value = aff.usageLimit || '';

    // Dates
    if (fldStartDate && aff.startDate) {
      const d = aff.startDate.toDate ? aff.startDate.toDate() : new Date(aff.startDate);
      fldStartDate.value = d.toISOString().split('T')[0];
    }
    if (fldEndDate && aff.endDate) {
      const d = aff.endDate.toDate ? aff.endDate.toDate() : new Date(aff.endDate);
      fldEndDate.value = d.toISOString().split('T')[0];
    }

    updateLinkPreview(aff.affiliateSlug || '');
    const titleEl = document.getElementById('affiliate-modal-title');
    if (titleEl) titleEl.textContent = 'Edit Affiliate';
    openModal(affiliateModal);
  }

  async function saveAffiliate(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-save-affiliate');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

    const data = {
      name: fldName ? fldName.value.trim() : '',
      email: fldEmail ? fldEmail.value.trim() : '',
      phone: fldPhone ? fldPhone.value.trim() : '',
      instagram: fldInstagram ? fldInstagram.value.trim() : '',
      code: fldCode ? fldCode.value.trim().toUpperCase() : '',
      affiliateSlug: fldSlug ? fldSlug.value.trim().toLowerCase() : '',
      discountPercent: parseInt(fldDiscount ? fldDiscount.value : 0) || 0,
      commissionPercent: parseInt(fldCommission ? fldCommission.value : 0) || 0,
      isActive: fldActive ? fldActive.checked : true,
      usageLimit: fldUsageLimit && fldUsageLimit.value ? parseInt(fldUsageLimit.value) : null,
      startDate: fldStartDate && fldStartDate.value ? new Date(fldStartDate.value) : null,
      endDate: fldEndDate && fldEndDate.value ? new Date(fldEndDate.value) : null,
    };

    if (currentAffiliateId) data.id = currentAffiliateId;

    try {
      const result = await window.DB.saveAffiliate(data);
      if (result.success) {
        window.Utils.showToast(
          currentAffiliateId ? 'Affiliate updated successfully.' : 'Affiliate created successfully.',
          'success'
        );
        closeModal(affiliateModal);
        loadAffiliates();
      } else {
        window.Utils.showToast(result.error || 'Failed to save affiliate.', 'error');
      }
    } catch (err) {
      console.error(err);
      window.Utils.showToast('An unexpected error occurred.', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Save Affiliate'; }
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────────
  async function deleteAffiliate(id, name) {
    if (!confirm(`Delete affiliate "${name}"? This cannot be undone.`)) return;
    try {
      const result = await window.DB.deleteAffiliate(id);
      if (result.success) {
        window.Utils.showToast('Affiliate deleted.', 'success');
        loadAffiliates();
      } else {
        window.Utils.showToast('Failed to delete affiliate.', 'error');
      }
    } catch (err) {
      window.Utils.showToast('An unexpected error occurred.', 'error');
    }
  }

  // ─── Detail/Stats Modal ───────────────────────────────────────────────────────
  function viewDetail(id) {
    const aff = affiliates.find(a => a.id === id);
    if (!aff) return;
    currentDetailId = id;

    const link = buildRefLink(aff.affiliateSlug);
    const payoutHistory = aff.payoutHistory || [];

    if (detailBody) {
      detailBody.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;">
          <div style="background:var(--admin-bg-light,#f9f7f4);padding:18px;border-radius:8px;border:1px solid var(--admin-border-subtle,#e8e3dc);">
            <h4 style="font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;color:var(--admin-gold,#c5a059);margin-bottom:12px;">Contact Information</h4>
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(0,0,0,0.05);"><span class="text-muted">Name</span><strong>${aff.name}</strong></div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(0,0,0,0.05);"><span class="text-muted">Email</span><strong>${aff.email || '—'}</strong></div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(0,0,0,0.05);"><span class="text-muted">Phone</span><strong>${aff.phone || '—'}</strong></div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;"><span class="text-muted">Instagram</span><strong>${aff.instagram || '—'}</strong></div>
          </div>

          <div style="background:var(--admin-bg-light,#f9f7f4);padding:18px;border-radius:8px;border:1px solid var(--admin-border-subtle,#e8e3dc);">
            <h4 style="font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;color:var(--admin-gold,#c5a059);margin-bottom:12px;">Campaign Setup</h4>
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(0,0,0,0.05);"><span class="text-muted">Code</span><strong><code style="font-family:monospace;">${aff.code}</code></strong></div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(0,0,0,0.05);"><span class="text-muted">Customer Discount</span><strong>${aff.discountPercent || 0}%</strong></div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(0,0,0,0.05);"><span class="text-muted">Commission Rate</span><strong>${aff.commissionPercent || 0}%</strong></div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(0,0,0,0.05);"><span class="text-muted">Status</span>${getStatusBadge(aff.isActive)}</div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(0,0,0,0.05);"><span class="text-muted">Usage Limit</span><strong>${aff.usageLimit || 'Unlimited'}</strong></div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;"><span class="text-muted">Usage Count</span><strong>${aff.usageCount || 0}</strong></div>
          </div>
        </div>

        <div style="margin-top:20px;background:var(--admin-bg-light,#f9f7f4);padding:18px;border-radius:8px;border:1px solid var(--admin-border-subtle,#e8e3dc);">
          <h4 style="font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;color:var(--admin-gold,#c5a059);margin-bottom:12px;">Performance Summary</h4>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;">
            <div style="text-align:center;padding:12px;background:#fff;border-radius:6px;border:1px solid rgba(0,0,0,0.05);"><span class="text-muted" style="font-size:0.75rem;display:block;">Visits</span><strong style="font-size:1.3rem;">${aff.totalVisits || 0}</strong></div>
            <div style="text-align:center;padding:12px;background:#fff;border-radius:6px;border:1px solid rgba(0,0,0,0.05);"><span class="text-muted" style="font-size:0.75rem;display:block;">Total Orders</span><strong style="font-size:1.3rem;">${aff.totalOrders || 0}</strong></div>
            <div style="text-align:center;padding:12px;background:#fff;border-radius:6px;border:1px solid rgba(0,0,0,0.05);"><span class="text-muted" style="font-size:0.75rem;display:block;">Confirmed</span><strong style="font-size:1.3rem;color:var(--admin-green,#1e824c);">${aff.confirmedOrders || 0}</strong></div>
            <div style="text-align:center;padding:12px;background:#fff;border-radius:6px;border:1px solid rgba(0,0,0,0.05);"><span class="text-muted" style="font-size:0.75rem;display:block;">Total Sales</span><strong style="font-size:1.1rem;">${formatNGN(aff.totalSales || 0)}</strong></div>
            <div style="text-align:center;padding:12px;background:#fff;border-radius:6px;border:1px solid rgba(0,0,0,0.05);"><span class="text-muted" style="font-size:0.75rem;display:block;">Commission</span><strong style="font-size:1.1rem;">${formatNGN(aff.totalCommission || 0)}</strong></div>
            <div style="text-align:center;padding:12px;background:#fff;border-radius:6px;border:1px solid rgba(0,0,0,0.05);"><span class="text-muted" style="font-size:0.75rem;display:block;">Paid</span><strong style="font-size:1.1rem;color:var(--admin-green,#1e824c);">${formatNGN(aff.paidCommission || 0)}</strong></div>
            <div style="text-align:center;padding:12px;background:#fff;border-radius:6px;border:1px solid rgba(0,0,0,0.05);"><span class="text-muted" style="font-size:0.75rem;display:block;">Pending</span><strong style="font-size:1.1rem;color:var(--admin-amber,#e8a000);">${formatNGN(aff.pendingCommission || 0)}</strong></div>
          </div>
        </div>

        <div style="margin-top:20px;">
          <h4 style="font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;color:var(--admin-gold,#c5a059);margin-bottom:8px;">Referral URL</h4>
          <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--admin-bg-light,#f9f7f4);border:1px solid var(--admin-border-subtle,#e8e3dc);border-radius:6px;">
            <span style="flex:1;font-family:monospace;font-size:0.85rem;color:var(--admin-primary,#2c1810);word-break:break-all;">${link}</span>
            <button class="btn btn-sm btn-outline" onclick="navigator.clipboard.writeText('${link}').then(() => window.Utils.showToast('Link copied!', 'success'))">Copy</button>
          </div>
        </div>

        <div style="margin-top:20px;">
          <h4 style="font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;color:var(--admin-gold,#c5a059);margin-bottom:8px;">Payout History</h4>
          ${payoutHistory.length === 0
            ? '<p class="text-muted text-sm" style="padding:12px 0;">No payouts recorded yet.</p>'
            : `<div class="table-responsive"><table class="admin-table">
              <thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Reference</th></tr></thead>
              <tbody>
                ${payoutHistory.map(p => `<tr>
                  <td>${formatDate(p.date)}</td>
                  <td><strong>${formatNGN(p.amount)}</strong></td>
                  <td>${p.method || '—'}</td>
                  <td>${p.reference || '—'}</td>
                </tr>`).join('')}
              </tbody>
            </table></div>`
          }
        </div>
      `;
    }

    openModal(detailModal);
  }

  // ─── Payout ───────────────────────────────────────────────────────────────────
  function openPayoutModal() {
    const payoutAffId = document.getElementById('payout-affiliate-id');
    if (payoutAffId) payoutAffId.value = currentDetailId || '';
    const amtEl = document.getElementById('payout-amount');
    if (amtEl) amtEl.value = '';
    const refEl = document.getElementById('payout-reference');
    if (refEl) refEl.value = '';
    openModal(payoutModal);
  }

  async function confirmPayout() {
    const affId = document.getElementById('payout-affiliate-id').value;
    const amount = parseFloat(document.getElementById('payout-amount').value);
    const method = document.getElementById('payout-method').value;
    const reference = document.getElementById('payout-reference').value.trim();

    if (!affId || !amount || amount <= 0) {
      window.Utils.showToast('Please enter a valid payout amount.', 'error');
      return;
    }

    const btn = document.getElementById('btn-confirm-payout');
    if (btn) { btn.disabled = true; btn.textContent = 'Recording...'; }

    try {
      const result = await window.DB.recordAffiliatePayout(affId, { amount, method, reference });
      if (result.success) {
        window.Utils.showToast('Payout recorded successfully.', 'success');
        closeModal(payoutModal);
        closeModal(detailModal);
        loadAffiliates();
      } else {
        window.Utils.showToast(result.error || 'Failed to record payout.', 'error');
      }
    } catch (err) {
      window.Utils.showToast('An unexpected error occurred.', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Confirm Payout'; }
    }
  }

  // ─── Modal Helpers ────────────────────────────────────────────────────────────
  function openModal(modal) {
    if (modal) {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modal) {
    if (modal) {
      modal.classList.remove('is-open');
      const anyOpen = document.querySelector('.admin-modal-backdrop.is-open');
      if (!anyOpen) {
        document.body.style.overflow = '';
      }
    }
  }

  // ─── Link Preview ─────────────────────────────────────────────────────────────
  function updateLinkPreview(slug) {
    if (affLinkUrl) affLinkUrl.textContent = buildRefLink(slug);
  }

  // ─── Event Listeners ──────────────────────────────────────────────────────────
  function bindEvents() {
    // Open add modal
    if (btnOpenAdd) btnOpenAdd.addEventListener('click', openAddModal);

    // Close modals
    document.querySelectorAll('.js-close-affiliate-modal').forEach(btn => {
      btn.addEventListener('click', () => closeModal(affiliateModal));
    });
    document.querySelectorAll('.js-close-detail-modal').forEach(btn => {
      btn.addEventListener('click', () => closeModal(detailModal));
    });
    document.querySelectorAll('.js-close-payout-modal').forEach(btn => {
      btn.addEventListener('click', () => closeModal(payoutModal));
    });

    // Close on backdrop click
    [affiliateModal, detailModal, payoutModal].forEach(modal => {
      if (modal) modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    });

    // Form submit
    if (affiliateForm) affiliateForm.addEventListener('submit', saveAffiliate);

    // Generate code
    const btnGenCode = document.getElementById('btn-generate-code');
    if (btnGenCode) btnGenCode.addEventListener('click', () => {
      if (fldCode) {
        fldCode.value = generateCode(fldName ? fldName.value : '');
        if (fldSlug && !fldSlug.value) {
          fldSlug.value = (fldName ? fldName.value.split(' ')[0] : 'partner').toLowerCase();
          updateLinkPreview(fldSlug.value);
        }
      }
    });

    // Copy referral link buttons
    ['btn-copy-link', 'btn-copy-link-2'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', () => {
        const slug = fldSlug ? fldSlug.value.trim() : '';
        navigator.clipboard.writeText(buildRefLink(slug))
          .then(() => window.Utils.showToast('Referral link copied!', 'success'))
          .catch(() => window.Utils.showToast('Copy failed. Please copy manually.', 'error'));
      });
    });

    // Auto-update slug on name input if empty
    if (fldName) fldName.addEventListener('input', () => {
      if (fldSlug && !currentAffiliateId && (!fldSlug.value || fldSlug.dataset.autofilled === 'true')) {
        fldSlug.value = fldName.value.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '');
        fldSlug.dataset.autofilled = 'true';
        updateLinkPreview(fldSlug.value);
      }
    });

    // Slug change → update link preview
    if (fldSlug) fldSlug.addEventListener('input', () => {
      delete fldSlug.dataset.autofilled;
      updateLinkPreview(fldSlug.value);
    });

    // Filter
    if (filterStatus) filterStatus.addEventListener('change', applyFilter);

    // Detail modal actions
    if (btnDetailEdit) btnDetailEdit.addEventListener('click', () => {
      closeModal(detailModal);
      if (currentDetailId) editAffiliate(currentDetailId);
    });
    if (btnRecordPayout) btnRecordPayout.addEventListener('click', openPayoutModal);
    if (btnConfirmPayout) btnConfirmPayout.addEventListener('click', confirmPayout);
  }

  // ─── Init ─────────────────────────────────────────────────────────────────────
  function init() {
    if (window.Auth) window.Auth.requireAuth();
    bindEvents();
    loadAffiliates();
  }

  document.addEventListener('DOMContentLoaded', init);

  // ─── Public API (for inline onclick handlers) ─────────────────────────────────
  window.AffiliatesAdmin = { viewDetail, editAffiliate, deleteAffiliate };

})();
