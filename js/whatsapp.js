/**
 * TOMÉA PERFUMES - WhatsApp Order & Concierge Service
 * 
 * Generates personalized, elegant pre-filled WhatsApp order messages.
 * Automatically fetches the active WhatsApp number dynamically from Firestore settings.
 */

const WhatsAppService = {
  /**
   * Retrieve active WhatsApp phone number from Firestore settings or default config
   */
  async getActiveNumber() {
    try {
      if (window.DB) {
        const settings = await window.DB.getSettings();
        if (settings && settings.whatsappNumber) {
          // Remove non-numeric characters
          return settings.whatsappNumber.replace(/[^0-9]/g, '');
        }
      }
    } catch (e) {
      console.warn('[TOMÉA WhatsApp] Error reading WhatsApp setting:', e);
    }
    const fallback = (window.TOMEA_CONFIG && window.TOMEA_CONFIG.defaultWhatsApp) || '2348000000000';
    return fallback.replace(/[^0-9]/g, '');
  },

  /**
   * Generate and open a personalized WhatsApp order message for a specific perfume
   * @param {object} product { name, price, size, concentration, slug, id }
   * @param {number} quantity 
   */
  async orderProduct(product, quantity = 1) {
    if (!product) return;

    const phoneNumber = await this.getActiveNumber();
    const currency = (window.TOMEA_CONFIG && window.TOMEA_CONFIG.defaultCurrency) || '₦';
    const formattedPrice = Utils.formatCurrency(product.price * quantity, currency);
    
    // Construct current page or product link
    const origin = window.location.origin || '';
    const productPath = window.location.pathname.includes('/product.html')
      ? window.location.href
      : `${origin}/product.html?id=${product.id || product.slug}`;

    const lines = [
      "Hello TOMÉA Perfumes,",
      "",
      "I would like to place an order.",
      "",
      `Product: ${product.name}`,
      `Concentration: ${product.concentration || 'Extrait de Parfum'}`,
      `Size: ${product.size || '50ml'}`,
      `Quantity: ${quantity}`,
      `Total: ${formattedPrice}`,
      "",
      `Product Link: ${productPath}`,
      "",
      "Please provide me with the payment details and delivery steps.",
      "",
      "Thank you."
    ];

    const message = lines.join("\n");
    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  },

  /**
   * Open general concierge chat on WhatsApp
   * @param {string} customContext Optional context e.g. "Bespoke Fragrance Consultation"
   */
  async openConcierge(customContext = "") {
    const phoneNumber = await this.getActiveNumber();
    let message = "Hello TOMÉA Perfumes,\n\nI would like to make an inquiry regarding your luxury Extrait de Parfum collection.\n\nPlease guide me with the available options.\n\nThank you.";
    
    if (customContext) {
      message = `Hello TOMÉA Perfumes,\n\nI would like to inquire about: ${customContext}.\n\nThank you.`;
    }

    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/${phoneNumber}?text=${encoded}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  },

  /**
   * Attach automatic order listeners to buttons with data-product-id
   */
  initDelegation() {
    document.addEventListener('click', async (e) => {
      const orderBtn = e.target.closest('[data-action="order-whatsapp"]');
      if (orderBtn) {
        e.preventDefault();
        const productId = orderBtn.getAttribute('data-product-id');
        const qty = parseInt(orderBtn.getAttribute('data-quantity') || '1', 10);
        
        if (productId && window.DB) {
          try {
            orderBtn.disabled = true;
            const originalText = orderBtn.innerHTML;
            orderBtn.innerHTML = 'Connecting to WhatsApp...';
            
            const product = await window.DB.getProductById(productId);
            if (product) {
              await this.orderProduct(product, qty);
            } else {
              Utils.showToast('Product information could not be loaded.', 'error');
            }

            setTimeout(() => {
              orderBtn.disabled = false;
              orderBtn.innerHTML = originalText;
            }, 1000);
          } catch (err) {
            console.error('[TOMÉA WhatsApp] Click error:', err);
            orderBtn.disabled = false;
          }
        } else {
          // General concierge CTA
          await this.openConcierge();
        }
      }

      // Concierge link listener
      const conciergeBtn = e.target.closest('[data-action="whatsapp-concierge"]');
      if (conciergeBtn) {
        e.preventDefault();
        const context = conciergeBtn.getAttribute('data-context') || '';
        await this.openConcierge(context);
      }
    });
  }
};

if (typeof window !== 'undefined') {
  window.WhatsAppService = WhatsAppService;
  // Initialize delegation on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WhatsAppService.initDelegation());
  } else {
    WhatsAppService.initDelegation();
  }
}
