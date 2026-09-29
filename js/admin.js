/**
 * TOMÉA PERFUMES - Admin Core & Dashboard Controller
 * Fully responsive mobile sidebar with backdrop, drawer gestures, and metrics.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Ensure administrator is authenticated
  if (window.Auth) {
    window.Auth.requireAuth();
  }

  // 2. Logout button handler
  const logoutBtns = document.querySelectorAll('.js-admin-logout');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.Auth) {
        window.Auth.logout();
      }
    });
  });

  // 3. Mobile Sidebar Toggle with Backdrop
  const sidebarToggle = document.querySelector('.admin-sidebar-toggle');
  const sidebar = document.querySelector('.admin-sidebar');

  // Ensure backdrop element exists
  let backdrop = document.querySelector('.admin-sidebar-backdrop');
  if (!backdrop && sidebar) {
    backdrop = document.createElement('div');
    backdrop.className = 'admin-sidebar-backdrop';
    document.body.appendChild(backdrop);
  }

  const openSidebar = () => {
    if (sidebar) sidebar.classList.add('is-open');
    if (backdrop) backdrop.classList.add('is-open');
    document.body.classList.add('admin-sidebar-locked');
  };

  const closeSidebar = () => {
    if (sidebar) sidebar.classList.remove('is-open');
    if (backdrop) backdrop.classList.remove('is-open');
    document.body.classList.remove('admin-sidebar-locked');
  };

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (sidebar.classList.contains('is-open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeSidebar);
  }

  // Close sidebar when clicking any navigation link on mobile
  document.querySelectorAll('.admin-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 991) {
        closeSidebar();
      }
    });
  });

  // Close on Escape key press
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('is-open')) {
      closeSidebar();
    }
  });

  // 4. Active navigation highlight
  const currentPath = window.location.pathname;
  document.querySelectorAll('.admin-nav-item').forEach(item => {
    const href = item.getAttribute('href');
    if (href && currentPath.endsWith(href)) {
      item.classList.add('is-active');
    }
  });

  // 5. If on dashboard page, load summary metrics
  const totalCountEl = document.getElementById('metric-total-products');
  if (totalCountEl && window.DB) {
    await loadDashboardMetrics();
  }
});

async function loadDashboardMetrics() {
  try {
    const products = await window.DB.getProducts();
    const settings = await window.DB.getSettings();

    const totalEl = document.getElementById('metric-total-products');
    const activeEl = document.getElementById('metric-active-products');
    const featuredEl = document.getElementById('metric-featured-products');
    const outOfStockEl = document.getElementById('metric-out-of-stock');
    const waNumberEl = document.getElementById('dash-wa-number');

    const total = products.length;
    const active = products.filter(p => p.isActive).length;
    const featured = products.filter(p => p.isFeatured).length;
    const outOfStock = products.filter(p => p.isOutOfStock).length;

    if (totalEl) totalEl.textContent = total;
    if (activeEl) activeEl.textContent = active;
    if (featuredEl) featuredEl.textContent = featured;
    if (outOfStockEl) outOfStockEl.textContent = outOfStock;
    if (waNumberEl) waNumberEl.textContent = settings.whatsappNumber ? `+${settings.whatsappNumber}` : 'Not Configured';

    // Render Recent Products in Dashboard table
    const tableBody = document.getElementById('dashboard-recent-products');
    if (tableBody) {
      if (products.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No fragrances registered yet. <a href="products.html" style="color:var(--admin-primary);font-weight:600;">Add your first fragrance →</a></td></tr>`;
      } else {
        const Utils = window.Utils;
        tableBody.innerHTML = products.slice(0, 6).map(prod => `
          <tr>
            <td>
              <div class="table-product-cell">
                <img src="${prod.primaryImage || 'assets/images/bottle-lorigine.jpg'}" alt="${Utils.escapeHtml(prod.name)}" class="table-thumb" />
                <div>
                  <strong class="table-product-name">${Utils.escapeHtml(prod.name)}</strong>
                  <span class="subtext">${Utils.escapeHtml(prod.concentration || 'Extrait de Parfum')}</span>
                </div>
              </div>
            </td>
            <td><span class="family-tag">${Utils.escapeHtml(prod.fragranceFamily || 'N/A')}</span></td>
            <td><span class="font-price">${Utils.formatCurrency(prod.price)}</span></td>
            <td>
              <span class="badge ${prod.isActive ? 'badge-success' : 'badge-neutral'}">
                ${prod.isActive ? 'Active' : 'Draft'}
              </span>
            </td>
            <td>
              ${prod.isFeatured
                ? '<span class="badge badge-gold">Featured</span>'
                : '<span class="badge badge-neutral">—</span>'
              }
            </td>
            <td style="text-align: right;">
              <a href="products.html" class="btn btn-sm btn-secondary">Edit</a>
            </td>
          </tr>
        `).join('');
      }
    }
  } catch (err) {
    console.error('[TOMÉA Admin] Error loading metrics:', err);
  }
}
