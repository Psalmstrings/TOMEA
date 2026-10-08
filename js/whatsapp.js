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
  /**
   * Validate phone number and return clean digits or null
   */
  async getActiveNumber() {
    try {
      if (window.DB) {
        const settings = await window.DB.getSettings();
        if (settings && settings.whatsappNumber) {
          const cleaned = String(settings.whatsappNumber).replace(/[^0-9]/g, '');
          if (cleaned && cleaned.length >= 7) {
            return cleaned;
          }
        }
      }
    } catch (e) {
      console.warn('[TOMÉA WhatsApp] Error reading WhatsApp setting:', e);
    }
    const fallback = (window.TOMEA_CONFIG && window.TOMEA_CONFIG.defaultWhatsApp) || '2348000000000';
    const cleanedFallback = String(fallback).replace(/[^0-9]/g, '');
    return (cleanedFallback && cleanedFallback.length >= 7) ? cleanedFallback : null;
  },

  /**
   * Universal WhatsApp URL builder
   * @param {string} phone 
   * @param {string} message 
   * @returns {string} Universal wa.me URL
   */
  generateWhatsAppUrl(phone, message) {
    const encoded = encodeURIComponent(message || '');
    return `https://wa.me/${phone}?text=${encoded}`;
  },

  /**
   * Direct same-tab navigation to WhatsApp.
   * NEVER uses window.open, new windows, or popups.
   * @param {string} message 
   */
  async navigateToWhatsApp(message) {
    const phoneNumber = await this.getActiveNumber();
    if (!phoneNumber) {
      console.error('[TOMÉA WhatsApp] Technical error: WhatsApp number not configured or invalid in settings.');
      if (window.Utils && typeof window.Utils.showToast === 'function') {
        window.Utils.showToast("WhatsApp ordering is temporarily unavailable. Please contact TOMÉA Concierge.", "error", 5000);
      } else {
        alert("WhatsApp ordering is temporarily unavailable. Please contact TOMÉA Concierge.");
      }
      return false;
    }

    const waUrl = this.generateWhatsAppUrl(phoneNumber, message);
    // Direct same-tab navigation: eliminates popup blocker issues on iOS Safari, Android Chrome, and Desktop
    window.location.assign(waUrl);
    return true;
  },

  /**
   * Generate and navigate to a personalized WhatsApp order message for a specific perfume.
   * Includes product details, live pricing, and affiliate attribution if applied.
   * 
   * @param {object} product { name, price, size, concentration, slug, id }
   * @param {number} quantity 
   * @param {object|null} discountInfo Optional applied discount information
   */
  async orderProduct(product, quantity = 1, discountInfo = null) {
    if (!product) return;

    const currency = (window.TOMEA_CONFIG && window.TOMEA_CONFIG.defaultCurrency) || '₦';
    const originalTotal = (Number(product.price) || 0) * quantity;
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
      if (window.DB && typeof window.DB.createOrder === 'function') {
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

    // Determine canonical public product URL
    const origin = window.location.origin || '';
    const productLink = window.location.pathname.includes('/product.html')
      ? window.location.href
      : `${origin}/product.html?id=${product.id || product.slug}`;

    // Construct professional, pre-filled WhatsApp message
    let lines = [];
    if (discountPercent > 0 && affiliateCode) {
      lines = [
        "Hello TOMÉA Perfumes,",
        "",
        "I would like to place an order.",
        "",
        `Product: ${product.name}`,
        `Price: ${formattedFinalPrice}`,
        `Quantity: ${quantity}`,
        "",
        `Product link:`,
        productLink,
        "",
        `Original Price: ${formattedOriginalPrice}`,
        `Discount Code: ${affiliateCode}`,
        `Discount: ${discountPercent}%`,
        affiliateName ? `Affiliate: ${affiliateName}` : null,
        "",
        "Please provide me with the next steps.",
        "",
        "Thank you."
      ].filter(l => l !== null && l !== undefined);
    } else {
      lines = [
        "Hello TOMÉA Perfumes,",
        "",
        "I would like to place an order.",
        "",
        `Product: ${product.name}`,
        `Price: ${formattedOriginalPrice}`,
        `Quantity: ${quantity}`,
        "",
        `Product link:`,
        productLink,
        "",
        "Please provide me with the next steps.",
        "",
        "Thank you."
      ];
    }

    const message = lines.join("\n");
    await this.navigateToWhatsApp(message);
  },

  /**
   * Open general concierge chat on WhatsApp via direct same-tab navigation
   * @param {string} customContext Optional context e.g. "Bespoke Fragrance Consultation"
   */
  async openConcierge(customContext = "") {
    let message = "Hello TOMÉA Perfumes,\n\nI would like to make an inquiry regarding your luxury Extrait de Parfum collection.\n\nPlease guide me with the available options.\n\nThank you.";
    
    if (customContext) {
      message = `Hello TOMÉA Perfumes,\n\nI would like to inquire about: ${customContext}.\n\nThank you.`;
    }

    await this.navigateToWhatsApp(message);
  },

  /**
   * Open custom formatted inquiry message via direct same-tab navigation
   * @param {string} messageText 
   */
  async openCustomMessage(messageText) {
    if (!messageText) return;
    await this.navigateToWhatsApp(messageText);
  },

  /**
   * Attach automatic order listeners to buttons with data-action="order-whatsapp" and data-action="whatsapp-concierge"
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
            
            let product = await window.DB.getProductById(productId);
            if (!product) {
              product = await window.DB.getProductBySlug(productId);
            }

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
