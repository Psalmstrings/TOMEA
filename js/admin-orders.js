/**
 * admin-orders.js
 * TOMÉA Perfumes — Order Management Controller
 * Handles: list orders, filter by status, update order status, view details
 */

(function () {
  'use strict';

  // ─── State ───────────────────────────────────────────────────────────────────
  let orders = [];
  let currentOrderId = null;

  // ─── DOM References ───────────────────────────────────────────────────────────
  const tableBody = document.getElementById('orders-table-body');
  const filterStatus = document.getElementById('order-filter-status');
  const detailModal = document.getElementById('order-detail-modal');
  const detailBody = document.getElementById('order-detail-body');
  const detailActions = document.getElementById('order-detail-actions');

  // Metrics
  const metricTotal = document.getElementById('order-metric-total');
  const metricPending = document.getElementById('order-metric-pending');
  const metricConfirmed = document.getElementById('order-metric-confirmed');
  const metricRevenue = document.getElementById('order-metric-revenue');

  // ─── Constants ────────────────────────────────────────────────────────────────
  const STATUS_LABELS = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    paid: 'Paid',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  const STATUS_BADGE_CLASSES = {
    pending: 'status-badge--amber',
    confirmed: 'status-badge--active',
    paid: 'status-badge--active',
    completed: 'status-badge--active',
    cancelled: 'status-badge--draft',
  };

  const CONFIRMED_STATUSES = ['confirmed', 'paid', 'completed'];

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  function formatNGN(amount) {
    if (!amount && amount !== 0) return '—';
    return '\u20a6' + Number(amount).toLocaleString('en-NG');
  }

  function formatDate(ts) {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  function getStatusBadge(status) {
    const cls = STATUS_BADGE_CLASSES[status] || 'status-badge--draft';
    const label = STATUS_LABELS[status] || status;
    return `<span class="status-badge ${cls}">${label}</span>`;
  }

  function getNextStatuses(current) {
    const transitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['paid', 'cancelled'],
      paid: ['completed', 'cancelled'],
      completed: [],
      cancelled: ['pending'],
    };
    return transitions[current] || [];
  }

  // ─── Load & Render ────────────────────────────────────────────────────────────
  async function loadOrders() {
    try {
      orders = await window.DB.getOrders();
      orders.sort((a, b) => {
        const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const db = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return db - da;
      });
      renderMetrics(orders);
      renderTable(orders);
    } catch (err) {
      console.error('Failed to load orders:', err);
      if (tableBody) tableBody.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-muted">Failed to load orders.</td></tr>';
    }
  }

  function renderMetrics(list) {
    const total = list.length;
    const pending = list.filter(o => o.status === 'pending').length;
    const confirmed = list.filter(o => CONFIRMED_STATUSES.includes(o.status)).length;
    const revenue = list
      .filter(o => CONFIRMED_STATUSES.includes(o.status))
      .reduce((sum, o) => sum + (o.finalPrice || 0) * (o.quantity || 1), 0);

    if (metricTotal) metricTotal.textContent = total;
    if (metricPending) metricPending.textContent = pending;
    if (metricConfirmed) metricConfirmed.textContent = confirmed;
    if (metricRevenue) metricRevenue.textContent = formatNGN(revenue);
  }

  function renderTable(list) {
    if (!tableBody) return;
    if (!list || list.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-muted">No orders recorded yet. WhatsApp order clicks will appear here.</td></tr>';
      return;
    }

    tableBody.innerHTML = list.map(order => `
      <tr>
        <td>
          <div class="product-cell">
            <span class="product-cell-name">${order.productName || '—'}</span>
            ${order.affiliateCode ? '<span class="product-cell-sub">Code: <code>' + order.affiliateCode + '</code></span>' : ''}
          </div>
        </td>
        <td>${order.quantity || 1}</td>
        <td>${formatNGN(order.originalPrice)}</td>
        <td><strong>${formatNGN(order.finalPrice)}</strong>${order.discountPercent ? ' <small class="text-muted">(-' + order.discountPercent + '%)</small>' : ''}</td>
        <td>${order.affiliateName || '<span class="text-muted">—</span>'}</td>
        <td>${order.commissionAmount ? formatNGN(order.commissionAmount) : '<span class="text-muted">—</span>'}</td>
        <td class="text-muted" style="font-size:0.82em;">${formatDate(order.createdAt)}</td>
        <td>${getStatusBadge(order.status)}</td>
        <td style="text-align:right;">
          <div class="table-actions" style="justify-content:flex-end;">
            <button class="btn btn-xs btn-outline" onclick="OrdersAdmin.viewDetail('${order.id}')">Manage</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // ─── Filter ───────────────────────────────────────────────────────────────────
  function applyFilter() {
    const val = filterStatus ? filterStatus.value : 'all';
    let filtered = [...orders];
    if (val !== 'all') filtered = filtered.filter(o => o.status === val);
    renderTable(filtered);
  }

  // ─── Detail Modal ─────────────────────────────────────────────────────────────
  function viewDetail(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    currentOrderId = id;

    if (detailBody) {
      detailBody.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;">
          <div style="background:var(--admin-bg-light,#f9f7f4);padding:16px;border-radius:8px;border:1px solid var(--admin-border-subtle,#e8e3dc);">
            <h4 style="font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;color:var(--admin-gold,#c5a059);margin-bottom:12px;">Order Summary</h4>
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(0,0,0,0.05);"><span class="text-muted">Product</span><strong>${order.productName || '—'}</strong></div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(0,0,0,0.05);"><span class="text-muted">Quantity</span><strong>${order.quantity || 1}</strong></div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(0,0,0,0.05);"><span class="text-muted">Order Date</span><strong>${formatDate(order.createdAt)}</strong></div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;"><span class="text-muted">Status</span>${getStatusBadge(order.status)}</div>
          </div>

          <div style="background:var(--admin-bg-light,#f9f7f4);padding:16px;border-radius:8px;border:1px solid var(--admin-border-subtle,#e8e3dc);">
            <h4 style="font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;color:var(--admin-gold,#c5a059);margin-bottom:12px;">Financial Breakdown</h4>
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(0,0,0,0.05);"><span class="text-muted">Original Price</span><strong>${formatNGN(order.originalPrice)}</strong></div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(0,0,0,0.05);"><span class="text-muted">Discount</span><strong>${order.discountPercent ? order.discountPercent + '%' : '—'} ${order.discountAmount ? '(' + formatNGN(order.discountAmount) + ')' : ''}</strong></div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;"><span class="text-muted">Final Price</span><strong style="color:var(--admin-primary,#2c1810);font-size:1.1rem;">${formatNGN(order.finalPrice)}</strong></div>
          </div>

          <div style="background:var(--admin-bg-light,#f9f7f4);padding:16px;border-radius:8px;border:1px solid var(--admin-border-subtle,#e8e3dc);">
            <h4 style="font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;color:var(--admin-gold,#c5a059);margin-bottom:12px;">Affiliate Attribution</h4>
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(0,0,0,0.05);"><span class="text-muted">Influencer</span><strong>${order.affiliateName || 'None (Direct)'}</strong></div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(0,0,0,0.05);"><span class="text-muted">Code</span><strong>${order.affiliateCode ? '<code style="font-family:monospace;">' + order.affiliateCode + '</code>' : '—'}</strong></div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(0,0,0,0.05);"><span class="text-muted">Commission Rate</span><strong>${order.commissionPercent ? order.commissionPercent + '%' : '—'}</strong></div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;"><span class="text-muted">Commission Amount</span><strong style="color:var(--admin-amber,#e8a000);">${order.commissionAmount ? formatNGN(order.commissionAmount) : '—'}</strong></div>
          </div>
        </div>

        <div style="margin-top:16px;padding:12px;background:#fff8ee;border:1px solid #ffd299;border-radius:6px;font-size:0.85rem;color:#7c4800;">
          <strong>Commission Rule:</strong> Marking this order as <em>Confirmed</em> or <em>Paid</em> will automatically update the influencer's confirmed orders, sales total, and pending commission balance.
        </div>
      `;
    }

    const nextStatuses = getNextStatuses(order.status);
    const statusBtns = nextStatuses.map(s => {
      const isDanger = s === 'cancelled';
      const cls = isDanger ? 'btn-danger' : 'btn-primary';
      return `<button class="btn btn-sm ${cls}" onclick="OrdersAdmin.updateStatus('${order.id}', '${s}')">Mark as ${STATUS_LABELS[s]}</button>`;
    }).join(' ');

    if (detailActions) {
      detailActions.innerHTML = `
        <button type="button" class="btn btn-secondary js-close-order-modal">Close</button>
        ${statusBtns}
      `;
      detailActions.querySelectorAll('.js-close-order-modal').forEach(btn => {
        btn.addEventListener('click', () => closeModal(detailModal));
      });
    }

    openModal(detailModal);
  }

  // ─── Status Update ────────────────────────────────────────────────────────────
  async function updateStatus(orderId, newStatus) {
    if (!orderId || !newStatus) return;

    try {
      const result = await window.DB.updateOrderStatus(orderId, newStatus);
      if (result.success) {
        window.Utils.showToast(`Order marked as ${STATUS_LABELS[newStatus]}.`, 'success');
        closeModal(detailModal);
        loadOrders();
      } else {
        window.Utils.showToast(result.error || 'Failed to update order status.', 'error');
      }
    } catch (err) {
      console.error(err);
      window.Utils.showToast('An unexpected error occurred.', 'error');
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

  // ─── Event Listeners ──────────────────────────────────────────────────────────
  function bindEvents() {
    document.querySelectorAll('.js-close-order-modal').forEach(btn => {
      btn.addEventListener('click', () => closeModal(detailModal));
    });

    if (detailModal) detailModal.addEventListener('click', (e) => {
      if (e.target === detailModal) closeModal(detailModal);
    });

    if (filterStatus) filterStatus.addEventListener('change', applyFilter);
  }

  // ─── Init ─────────────────────────────────────────────────────────────────────
  function init() {
    if (window.Auth) window.Auth.requireAuth();
    bindEvents();
    loadOrders();
  }

  document.addEventListener('DOMContentLoaded', init);

  // ─── Public API ───────────────────────────────────────────────────────────────
  window.OrdersAdmin = { viewDetail, updateStatus };

})();
