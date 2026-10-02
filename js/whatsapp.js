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
   * Generate and open a personalized WhatsApp order message for a specific perfume.
   * Upgraded to include affiliate attribution and automatically records the order as pending.
   * 
   * @param {object} product { name, price, size, concentration, slug, id }
   * @param {number} quantity 
   * @param {object|null} discountInfo Optional applied discount information
   */
  async orderProduct(product, quantity = 1, discountInfo = null) {
    if (!product) return;

    const phoneNumber = await this.getActiveNumber();
    const currency = (window.TOMEA_CONFIG && window.TOMEA_CONFIG.defaultCurrency) || '₦';
    const originalTotal = (product.price || 0) * quantity;
    const formattedOriginalPrice = Utils.formatCurrency(originalTotal, currency);

    let finalPrice = originalTotal;
    let discountAmount = 0;
    let discountPercent = 0;
    let affiliateCode = '';
    let affiliateName = '';
    let affiliateId = '';
    let commissionPercent = 0;
    let commissionAmount = 0;

    if (discountInfo && discountInfo.code && discountInfo.percent > 0) {
      discountPercent = Number(discountInfo.percent) || 0;
      discountAmount = Math.round((originalTotal * discountPercent) / 100);
      finalPrice = Math.max(0, originalTotal - discountAmount);
      affiliateCode = discountInfo.code;
      affiliateName = discountInfo.affiliateName || '';
      affiliateId = discountInfo.affiliateId || '';
      commissionPercent = Number(discountInfo.commissionPercent) || 0;
      commissionAmount = Math.round((finalPrice * commissionPercent) / 100);
    }

    const formattedFinalPrice = Utils.formatCurrency(finalPrice, currency);

    // Track order in Firestore / localStorage DB (Status defaults to "pending")
    try {
      if (window.DB) {
        await window.DB.createOrder({
          productId: product.id || product.slug || '',
          productName: product.name || '',
          quantity,
          originalPrice: originalTotal,
          discountPercent,
          discountAmount,
          finalPrice,
          affiliateId,
          affiliateCode,
          affiliateName,
          commissionPercent,
          commissionAmount,
          status: 'pending'
        });
      }
    } catch (orderErr) {
      console.warn('[TOMÉA WhatsApp] Error tracking order record:', orderErr);
    }

    // Construct WhatsApp message conforming to Part 8
    let lines = [];
    if (discountPercent > 0 && affiliateCode) {
      lines = [
        "Hello TOMÉA Perfumes,",
        "",
        "I would like to place an order.",
        "",
        `Product: ${product.name}`,
        `Quantity: ${quantity}`,
        "",
        `Original Price: ${formattedOriginalPrice}`,
        `Discount Code: ${affiliateCode}`,
        `Discount: ${discountPercent}%`,
        `Final Price: ${formattedFinalPrice}`,
        "",
        affiliateName ? `Affiliate: ${affiliateName}` : "",
        "",
        "Please provide me with the next steps.",
        "",
        "Thank you."
      ].filter(l => l !== undefined);
    } else {
      // Standard order message
      const origin = window.location.origin || '';
      const productPath = window.location.pathname.includes('/product.html')
        ? window.location.href
        : `${origin}/product.html?id=${product.id || product.slug}`;

      lines = [
        "Hello TOMÉA Perfumes,",
        "",
        "I would like to place an order.",
        "",
        `Product: ${product.name}`,
        `Concentration: ${product.concentration || 'Extrait de Parfum'}`,
        `Size: ${product.size || '50ml'}`,
        `Quantity: ${quantity}`,
        `Total: ${formattedOriginalPrice}`,
        "",
        `Product Link: ${productPath}`,
        "",
        "Please provide me with the payment details and delivery steps.",
        "",
        "Thank you."
      ];
    }

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
