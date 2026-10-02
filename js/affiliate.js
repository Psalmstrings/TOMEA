/**
 * TOMÉA PERFUMES - Client Affiliate & Referral Service
 * 
 * Handles URL referral link detection (?ref=slug), session attribution,
 * automatic discount inheritance, and coupon validation.
 * 
 * Rule (Part 6): Explicit discount code entered by the customer always takes priority
 * over an earlier referral link attribution.
 */

const AffiliateService = {
  STORAGE_KEY: 'tomea_affiliate_attribution',

  /**
   * Initialize affiliate attribution from URL or local storage
   */
  async init() {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref') || params.get('affiliate') || params.get('aff');

    if (refParam && window.DB) {
      const cleanRef = refParam.trim();
      try {
        const result = await window.DB.validateAffiliate(cleanRef, true);
        if (result && result.valid && result.affiliate) {
          const aff = result.affiliate;
          // Store attribution
          this.setAttribution(aff, 'referral_url');
          // Lightweight visit tracking
          await window.DB.trackAffiliateVisit(aff.affiliateSlug || aff.code);

          // Dispatch event for UI listeners (e.g. VIP welcome banner)
          window.dispatchEvent(new CustomEvent('tomea:affiliate-detected', {
            detail: { affiliate: aff, source: 'referral_url' }
          }));

          console.info(`[TOMÉA] Affiliate detected: ${aff.name} (${aff.code} - ${aff.discountPercent}%)`);
        }
      } catch (err) {
        console.warn('[TOMÉA] Error checking referral link:', err);
      }
    }
  },

  /**
   * Retrieve active affiliate attribution from localStorage
   */
  getStoredAttribution() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('[TOMÉA] Error parsing stored affiliate attribution:', e);
    }
    return null;
  },

  /**
   * Store active affiliate attribution
   * @param {object} affiliate 
   * @param {string} source 'referral_url' | 'coupon_input'
   */
  setAttribution(affiliate, source = 'coupon_input') {
    if (!affiliate) return;
    const payload = {
      affiliateId: affiliate.id,
      name: affiliate.name,
      code: affiliate.code,
      affiliateSlug: affiliate.affiliateSlug,
      discountPercent: Number(affiliate.discountPercent) || 0,
      commissionPercent: Number(affiliate.commissionPercent) || 0,
      source: source,
      appliedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('[TOMÉA] Failed to persist affiliate attribution:', e);
    }
    return payload;
  },

  /**
   * Clear active affiliate attribution
   */
  clearAttribution() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('tomea:affiliate-cleared'));
    } catch (e) {
      console.warn('[TOMÉA] Error clearing affiliate attribution:', e);
    }
  },

  /**
   * Manually validate and apply a discount code.
   * Priority Rule: Explicit coupon code takes priority over existing URL referral attribution.
   * @param {string} rawCode 
   */
  async applyCode(rawCode) {
    if (!rawCode || !rawCode.trim()) {
      return { success: false, error: 'Please enter a discount code.' };
    }

    if (!window.DB) {
      return { success: false, error: 'Service temporarily initializing. Please try again in a moment.' };
    }

    const cleanCode = rawCode.trim().toUpperCase();
    try {
      const validation = await window.DB.validateAffiliate(cleanCode, false);
      if (!validation.valid || !validation.affiliate) {
        return { 
          success: false, 
          error: validation.error || 'This discount code is invalid or expired.' 
        };
      }

      const aff = validation.affiliate;
      // Overwrite any previous attribution (explicit coupon code takes priority)
      const attribution = this.setAttribution(aff, 'coupon_input');

      window.dispatchEvent(new CustomEvent('tomea:affiliate-applied', {
        detail: { affiliate: aff, source: 'coupon_input' }
      }));

      return {
        success: true,
        affiliate: aff,
        attribution
      };
    } catch (err) {
      console.error('[TOMÉA] Error applying coupon code:', err);
      return { 
        success: false, 
        error: 'Unable to validate discount code. Please check your connection.' 
      };
    }
  }
};

if (typeof window !== 'undefined') {
  window.AffiliateService = AffiliateService;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AffiliateService.init());
  } else {
    AffiliateService.init();
  }
}
