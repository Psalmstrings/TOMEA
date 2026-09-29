/**
 * TOMÉA PERFUMES - Core Utilities
 */

const Utils = {
  /**
   * Format numbers to Nigerian Naira or configured currency
   * @param {number|string} amount 
   * @param {string} currencySymbol 
   * @returns {string} e.g. "₦45,000"
   */
  formatCurrency(amount, currencySymbol = '₦') {
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return `${currencySymbol}0`;
    }
    const num = Math.round(Number(amount));
    return `${currencySymbol}${num.toLocaleString('en-NG')}`;
  },

  /**
   * Generate URL friendly slug from string
   * @param {string} text 
   * @returns {string} e.g. "tomea-lorigine"
   */
  slugify(text) {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^a-z0-9 -]/g, '')     // remove invalid chars
      .replace(/\s+/g, '-')            // collapse whitespace
      .replace(/-+/g, '-');            // collapse dashes
  },

  /**
   * Escape HTML to prevent XSS
   * @param {string} str 
   * @returns {string}
   */
  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Format Cloudinary URL with optimization transformations
   * @param {string} url 
   * @param {object} options { width, height, crop, quality, format }
   * @returns {string}
   */
  getOptimizedImageUrl(url, options = {}) {
    if (!url) return 'assets/images/bottle-lorigine.jpg';
    if (!url.includes('cloudinary.com')) return url;

    // Apply auto format & quality + dimensions if standard cloudinary upload URL
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return url;

    const prefix = url.substring(0, uploadIndex + 8);
    const suffix = url.substring(uploadIndex + 8);

    const transforms = ['f_auto', 'q_auto'];
    if (options.width) transforms.push(`w_${options.width}`);
    if (options.height) transforms.push(`h_${options.height}`);
    if (options.crop) transforms.push(`c_${options.crop || 'fill'}`);

    return `${prefix}${transforms.join(',')}/${suffix}`;
  },

  /**
   * Toast notification system
   * Displays luxury notifications with subtle animations
   */
  showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('tomea-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'tomea-toast-container';
      container.className = 'tomea-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `tomea-toast tomea-toast-${type}`;
    
    const icon = type === 'success' 
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>'
      : type === 'error'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">${this.escapeHtml(message)}</div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    });

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  },

  /**
   * Confirmation Modal
   */
  confirm(message, options = {}) {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'tomea-modal-backdrop';
      modal.innerHTML = `
        <div class="tomea-confirm-modal" role="dialog" aria-modal="true">
          <h4 class="tomea-modal-title">${options.title || 'Please Confirm'}</h4>
          <p class="tomea-modal-desc">${this.escapeHtml(message)}</p>
          <div class="tomea-modal-actions">
            <button class="btn btn-secondary cancel-btn">${options.cancelText || 'Cancel'}</button>
            <button class="btn btn-danger confirm-btn">${options.confirmText || 'Confirm'}</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      setTimeout(() => modal.classList.add('is-visible'), 10);

      const cleanup = (result) => {
        modal.classList.remove('is-visible');
        setTimeout(() => {
          modal.remove();
          resolve(result);
        }, 200);
      };

      modal.querySelector('.cancel-btn').addEventListener('click', () => cleanup(false));
      modal.querySelector('.confirm-btn').addEventListener('click', () => cleanup(true));
      modal.addEventListener('click', (e) => {
        if (e.target === modal) cleanup(false);
      });
    });
  },

  /**
   * Debounce helper
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

if (typeof window !== 'undefined') {
  window.Utils = Utils;
}
