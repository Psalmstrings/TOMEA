/**
 * TOMÉA PERFUMES - Firestore Database Layer
 * 
 * Provides unified data access for Products, Settings, and Homepage CMS.
 * Connects to live Firebase Firestore when credentials are provided,
 * with an intelligent offline/local-storage seed layer matching the
 * official brand guidelines for immediate demonstration.
 */

// Initial Seed Data directly from TOMÉA Brand Guideline document
const INITIAL_PRODUCTS_SEED = [
  {
    id: "lorigine",
    slug: "tomea-lorigine",
    name: "TOMÉA L'Origine",
    subtitle: "Power, Depth, Quiet Confidence, Sophisticated",
    concentration: "Extrait de Parfum",
    price: 45000,
    compareAtPrice: 50000,
    size: "50ml / 1.7 FL. OZ.",
    fragranceFamily: "Woody Aromatic",
    shortDescription: "An intense, commanding Extrait de Parfum defined by bright Italian citrus, aromatic depth, and clean ambered woods.",
    fullDescription: "TOMÉA L'Origine embodies the essence of quiet power and magnetic sophistication. Created for those whose presence is felt before they speak, it opens with radiant Italian bergamot and crisp citrus peel before unfolding into a complex heart of aromatic herbs and soft spice, anchored on a lingering foundation of golden amber and skin musks.",
    story: "L'Origine represents the foundational statement of TOMÉA — uncompromising luxury, elevated longevity, and the timeless confidence of modern refinement.",
    images: [
      "assets/images/bottle-lorigine.jpg",
      "assets/images/campaign-lorigine.jpg",
      "assets/images/product-lorigine-notes.jpg"
    ],
    primaryImage: "assets/images/bottle-lorigine.jpg",
    campaignImage: "assets/images/campaign-lorigine.jpg",
    topNotes: [
      "Italian bergamot",
      "Bright citrus peel"
    ],
    heartNotes: [
      "Aromatic herbs",
      "Soft spicy accords",
      "Creamed gourmand nuance"
    ],
    baseNotes: [
      "Ambered woods",
      "Clean musks",
      "Subtle sweetness"
    ],
    isActive: true,
    isFeatured: true,
    isOutOfStock: false,
    displayOrder: 1,
    createdAt: new Date("2026-01-01").toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "charme",
    slug: "tomea-charme",
    name: "TOMÉA Charme",
    subtitle: "Soft Luxury, Feminine Confidence, Warm Elegance",
    concentration: "Extrait de Parfum",
    price: 45000,
    compareAtPrice: 50000,
    size: "50ml / 1.7 FL. OZ.",
    fragranceFamily: "Floral Amber",
    shortDescription: "A luminous symphony of sparkling bergamot, delicate floral warmth, creamy vanilla infusion, and smooth golden amber.",
    fullDescription: "TOMÉA Charme captures the irresistible aura of graceful allure. Radiating an effortless charm, this Extrait de Parfum weaves glistening citrus brightness with an intoxicating heart of delicate florals and lush vanilla, settling into an embrace of golden amber and intimate skin-close musk.",
    story: "Charme is dedicated to radiant confidence and feminine grace. An olfactory signature that invites intimacy and leaves an unforgettable, velvety impression.",
    images: [
      "assets/images/bottle-charme.jpg",
      "assets/images/campaign-charme.jpg",
      "assets/images/product-charme-notes.jpg"
    ],
    primaryImage: "assets/images/bottle-charme.jpg",
    campaignImage: "assets/images/campaign-charme.jpg",
    topNotes: [
      "Sparkling bergamot",
      "Soft citrus brightness"
    ],
    heartNotes: [
      "Aromatic accords",
      "Creamy vanilla infusion",
      "Delicate floral warmth"
    ],
    baseNotes: [
      "Golden amber",
      "Smooth woods",
      "Skin-close musk"
    ],
    isActive: true,
    isFeatured: true,
    isOutOfStock: false,
    displayOrder: 2,
    createdAt: new Date("2026-01-02").toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "desir",
    slug: "tomea-desir",
    name: "TOMÉA Désir",
    subtitle: "Balance, Attraction, Subtle Seduction, Genderless Modernity",
    concentration: "Extrait de Parfum",
    price: 45000,
    compareAtPrice: 50000,
    size: "50ml / 1.7 FL. OZ.",
    fragranceFamily: "Fresh Amber & Musk",
    shortDescription: "A seductive balance of crisp green citrus, creamy vanilla, and velvety musky woods designed for lovers of subtle cool perfumery.",
    fullDescription: "TOMÉA Désir is a triumph of balance and attraction. Neither solely feminine nor masculine, it is tailored for discerning connoisseurs of cool, enigmatic perfumery. Fresh citrus and crisp green notes elevate a heart of gentle floral vanilla, before drying down into clean musky woods and warm amber.",
    story: "Désir defies classification. It is pure attraction in its most refined form — effortless, magnetic, and undeniably sensual.",
    images: [
      "assets/images/bottle-desir.jpg",
      "assets/images/campaign-desir.jpg",
      "assets/images/product-desir-notes.jpg"
    ],
    primaryImage: "assets/images/bottle-desir.jpg",
    campaignImage: "assets/images/campaign-desir.jpg",
    topNotes: [
      "Fresh citrus",
      "Green notes"
    ],
    heartNotes: [
      "Creamy vanilla",
      "Soft aromatic florals"
    ],
    baseNotes: [
      "Musky woods",
      "Warm amber",
      "Lingering softness"
    ],
    isActive: true,
    isFeatured: true,
    isOutOfStock: false,
    displayOrder: 3,
    createdAt: new Date("2026-01-03").toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_SETTINGS_SEED = {
  brandName: "TOMÉA PERFUMES",
  tagline: "Confidence, Bottled.",
  whatsappNumber: "2348000000000",
  currency: "₦",
  currencyCode: "NGN",
  email: "concierge@tomeaperfumes.com",
  phone: "+234 800 000 0000",
  address: "Lagos, Nigeria",
  instagram: "https://instagram.com/tomeaperfumes",
  facebook: "https://facebook.com/tomeaperfumes",
  tiktok: "https://tiktok.com/@tomeaperfumes",
  updatedAt: new Date().toISOString()
};

const INITIAL_HOMEPAGE_SEED = {
  heroTagline: "EXTRAIT DE PARFUM",
  heroHeading: "SCENT YOUR PRESENCE.",
  heroSubtitle: "Handcrafted high-concentration fragrances curated for timeless elegance, quiet confidence, and enduring distinction.",
  heroImage: "assets/images/hero-banner.jpg",
  heroPrimaryCtaText: "EXPLORE THE COLLECTION",
  heroSecondaryCtaText: "ORDER NOW",
  introPretitle: "THE MAISON",
  introTitle: "A NEW DEFINITION OF TIMELESS LUXURY",
  introParagraph1: "TOMÉA was founded on an unapologetic belief: that high-concentration luxury fragrance should be an experience of personal empowerment, sophistication, and lasting allure.",
  introParagraph2: "Every Extrait de Parfum in our collection is formulated with the highest grade essence concentrations, delivering exceptional sillage and an intimate scent journey from the initial spray to its skin-close dry down.",
  visionTitle: "OUR VISION",
  visionText: "To build a fragrance brand that represents confidence, elegance, and timeless luxury while making premium scents accessible.",
  missionTitle: "OUR MISSION",
  missionText: "To provide luxurious, high-quality Extrait de Parfum fragrances that are long-lasting and affordable, allowing more people to experience premium scents without the traditional luxury price tag.",
  finalCtaHeading: "FIND YOUR SIGNATURE SCENT.",
  finalCtaSubtitle: "Experience the distinction of TOMÉA. Connect directly with our concierge on WhatsApp to place your order or receive bespoke fragrance counsel.",
  finalCtaButtonText: "EXPLORE THE COLLECTION",
  updatedAt: new Date().toISOString()
};

const INITIAL_AFFILIATES_SEED = [
  {
    id: "amara",
    name: "Amara Johnson",
    code: "AMARA20",
    email: "amara@tomea-creators.com",
    phone: "+234 812 345 6789",
    instagram: "@amarajohnson",
    discountPercent: 20,
    commissionPercent: 10,
    isActive: true,
    startDate: "2026-01-01T00:00:00.000Z",
    endDate: "2026-12-31T23:59:59.000Z",
    usageLimit: null,
    usageCount: 0,
    totalVisits: 38,
    totalOrders: 0,
    confirmedOrders: 0,
    cancelledOrders: 0,
    totalSales: 0,
    totalCommission: 0,
    paidCommission: 0,
    pendingCommission: 0,
    affiliateSlug: "amara",
    payoutHistory: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  },
  {
    id: "david",
    name: "David Adeleke",
    code: "DAVID20",
    email: "david@tomea-creators.com",
    phone: "+234 803 987 6543",
    instagram: "@davidadeleke",
    discountPercent: 20,
    commissionPercent: 10,
    isActive: true,
    startDate: "2026-01-01T00:00:00.000Z",
    endDate: "2026-12-31T23:59:59.000Z",
    usageLimit: 100,
    usageCount: 0,
    totalVisits: 19,
    totalOrders: 0,
    confirmedOrders: 0,
    cancelledOrders: 0,
    totalSales: 0,
    totalCommission: 0,
    paidCommission: 0,
    pendingCommission: 0,
    affiliateSlug: "david",
    payoutHistory: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_ORDERS_SEED = [];

class FirestoreService {
  constructor() {
    this.isFirebaseReady = false;
    this.db = null;
    this.listeners = [];
    this.init();
  }

  async init() {
    // Check if Firebase SDK is present in window and configured
    if (window.firebase && typeof window.isFirebaseConfigured === 'function' && window.isFirebaseConfigured()) {
      try {
        if (!firebase.apps || !firebase.apps.length) {
          firebase.initializeApp(window.firebaseConfig);
        }
        this.db = firebase.firestore();
        this.isFirebaseReady = true;

        // Initialize Analytics if available
        try {
          if (firebase.analytics) {
            firebase.analytics();
          }
        } catch (analyticsErr) {
          // Analytics optional — not critical
        }

        console.info('[TOMÉA] Connected to Firebase Firestore successfully.');
        return;
      } catch (err) {
        console.warn('[TOMÉA] Firebase initialization error. Falling back to local storage layer:', err);
      }
    } else {
      console.info('[TOMÉA] Running in local demo mode with official brand assets and persistent storage.');
    }

    // Initialize LocalStorage with seed data if absent
    this.ensureLocalStorageSeed();
  }

  ensureLocalStorageSeed() {
    if (!localStorage.getItem('tomea_products')) {
      localStorage.setItem('tomea_products', JSON.stringify(INITIAL_PRODUCTS_SEED));
    } else {
      try {
        let items = JSON.parse(localStorage.getItem('tomea_products') || '[]');
        let modified = false;
        items = items.map((p, idx) => {
          if (!p.id || p.id === 'null' || p.id === 'undefined') {
            p.id = p.slug || ('prod_' + (Date.now() + idx));
            modified = true;
          }
          return p;
        });
        if (modified) {
          localStorage.setItem('tomea_products', JSON.stringify(items));
        }
      } catch (e) {
        localStorage.setItem('tomea_products', JSON.stringify(INITIAL_PRODUCTS_SEED));
      }
    }
    if (!localStorage.getItem('tomea_settings')) {
      localStorage.setItem('tomea_settings', JSON.stringify(INITIAL_SETTINGS_SEED));
    }
    if (!localStorage.getItem('tomea_homepage')) {
      localStorage.setItem('tomea_homepage', JSON.stringify(INITIAL_HOMEPAGE_SEED));
    }
    if (!localStorage.getItem('tomea_affiliates')) {
      localStorage.setItem('tomea_affiliates', JSON.stringify(INITIAL_AFFILIATES_SEED));
    }
    if (!localStorage.getItem('tomea_orders')) {
      localStorage.setItem('tomea_orders', JSON.stringify(INITIAL_ORDERS_SEED));
    }
  }

  /* ========================================================
     PRODUCTS API
     ======================================================== */

  async getProducts(options = {}) {
    if (this.isFirebaseReady) {
      try {
        let query = this.db.collection('products');
        if (options.onlyActive) {
          query = query.where('isActive', '==', true);
        }
        if (options.onlyFeatured) {
          query = query.where('isFeatured', '==', true);
        }
        const snapshot = await query.orderBy('displayOrder', 'asc').get();
        const products = [];
        snapshot.forEach(doc => {
          products.push({ ...doc.data(), id: doc.id });
        });
        return products;
      } catch (e) {
        console.warn('[TOMÉA] Firestore fetch error, falling back to local storage:', e);
      }
    }

    // Fallback: LocalStorage
    this.ensureLocalStorageSeed();
    let items = JSON.parse(localStorage.getItem('tomea_products') || '[]');
    if (options.onlyActive) {
      items = items.filter(p => p.isActive);
    }
    if (options.onlyFeatured) {
      items = items.filter(p => p.isFeatured);
    }
    if (options.category && options.category !== 'all') {
      items = items.filter(p => p.fragranceFamily && p.fragranceFamily.toLowerCase().includes(options.category.toLowerCase()));
    }
    return items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  async getProductById(id) {
    if (!id) return null;
    if (this.isFirebaseReady) {
      try {
        const doc = await this.db.collection('products').doc(id).get();
        if (doc.exists) {
          return { ...doc.data(), id: doc.id };
        }
      } catch (e) {
        console.warn('[TOMÉA] Firestore error fetching product by ID:', e);
      }
    }

    this.ensureLocalStorageSeed();
    const items = JSON.parse(localStorage.getItem('tomea_products') || '[]');
    return items.find(p => p.id === id || p.slug === id) || null;
  }

  async getProductBySlug(slug) {
    if (!slug) return null;
    if (this.isFirebaseReady) {
      try {
        const snapshot = await this.db.collection('products').where('slug', '==', slug).limit(1).get();
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          return { ...doc.data(), id: doc.id };
        }
      } catch (e) {
        console.warn('[TOMÉA] Firestore error fetching product by slug:', e);
      }
    }

    this.ensureLocalStorageSeed();
    const items = JSON.parse(localStorage.getItem('tomea_products') || '[]');
    return items.find(p => p.slug === slug || p.id === slug) || null;
  }

  async saveProduct(product) {
    const isNew = !product.id || product.id === 'null' || product.id === 'undefined';
    const now = new Date().toISOString();
    
    // Auto-generate slug if missing
    if (!product.slug) {
      product.slug = Utils.slugify(product.name);
    }

    const dataToSave = { ...product };
    delete dataToSave.id; // Do not store id inside document fields to prevent null overwrite

    if (this.isFirebaseReady) {
      try {
        if (isNew) {
          dataToSave.createdAt = now;
          dataToSave.updatedAt = now;
          const ref = await this.db.collection('products').add(dataToSave);
          return { ...dataToSave, id: ref.id };
        } else {
          dataToSave.updatedAt = now;
          await this.db.collection('products').doc(product.id).set(dataToSave, { merge: true });
          return { ...dataToSave, id: product.id };
        }
      } catch (e) {
        console.error('[TOMÉA] Firestore saveProduct error:', e);
        throw e;
      }
    }

    // LocalStorage Fallback
    this.ensureLocalStorageSeed();
    let items = JSON.parse(localStorage.getItem('tomea_products') || '[]');
    let savedProduct;
    if (isNew) {
      savedProduct = {
        ...dataToSave,
        id: 'prod_' + Date.now(),
        createdAt: now,
        updatedAt: now
      };
      items.push(savedProduct);
    } else {
      savedProduct = {
        ...dataToSave,
        id: product.id,
        updatedAt: now
      };
      const index = items.findIndex(p => p.id === product.id || (p.slug && p.slug === product.slug));
      if (index !== -1) {
        items[index] = { ...items[index], ...savedProduct };
      } else {
        items.push(savedProduct);
      }
    }
    localStorage.setItem('tomea_products', JSON.stringify(items));
    return savedProduct;
  }

  async deleteProduct(productId) {
    if (!productId) return false;
    let deleted = false;
    if (this.isFirebaseReady) {
      try {
        if (productId !== 'null' && productId !== 'undefined') {
          await this.db.collection('products').doc(productId).delete();
          deleted = true;
        }
      } catch (e) {
        console.warn('[TOMÉA] Firestore deleteProduct error, trying fallback:', e);
      }
    }

    this.ensureLocalStorageSeed();
    let items = JSON.parse(localStorage.getItem('tomea_products') || '[]');
    const prevLen = items.length;
    items = items.filter(p => p.id !== productId && p.slug !== productId);
    if (items.length < prevLen) {
      deleted = true;
    }
    localStorage.setItem('tomea_products', JSON.stringify(items));
    return deleted;
  }

  /* ========================================================
     SETTINGS API
     ======================================================== */

  async getSettings() {
    if (this.isFirebaseReady) {
      try {
        const doc = await this.db.collection('settings').doc('site').get();
        if (doc.exists) {
          return { ...INITIAL_SETTINGS_SEED, ...doc.data() };
        }
      } catch (e) {
        console.warn('[TOMÉA] Firestore getSettings error:', e);
      }
    }

    this.ensureLocalStorageSeed();
    return JSON.parse(localStorage.getItem('tomea_settings') || JSON.stringify(INITIAL_SETTINGS_SEED));
  }

  async saveSettings(settings) {
    settings.updatedAt = new Date().toISOString();
    if (this.isFirebaseReady) {
      try {
        await this.db.collection('settings').doc('site').set(settings, { merge: true });
        return settings;
      } catch (e) {
        console.error('[TOMÉA] Firestore saveSettings error:', e);
        throw e;
      }
    }

    localStorage.setItem('tomea_settings', JSON.stringify(settings));
    return settings;
  }

  /* ========================================================
     HOMEPAGE CMS API
     ======================================================== */

  async getHomepageContent() {
    if (this.isFirebaseReady) {
      try {
        const doc = await this.db.collection('homepage').doc('content').get();
        if (doc.exists) {
          return { ...INITIAL_HOMEPAGE_SEED, ...doc.data() };
        }
      } catch (e) {
        console.warn('[TOMÉA] Firestore getHomepageContent error:', e);
      }
    }

    this.ensureLocalStorageSeed();
    return JSON.parse(localStorage.getItem('tomea_homepage') || JSON.stringify(INITIAL_HOMEPAGE_SEED));
  }

  async saveHomepageContent(content) {
    content.updatedAt = new Date().toISOString();
    if (this.isFirebaseReady) {
      try {
        await this.db.collection('homepage').doc('content').set(content, { merge: true });
        return content;
      } catch (e) {
        console.error('[TOMÉA] Firestore saveHomepageContent error:', e);
        throw e;
      }
    }

    localStorage.setItem('tomea_homepage', JSON.stringify(content));
    return content;
  }

  /* ========================================================
     AFFILIATES API
     ======================================================== */

  async getAffiliates(options = {}) {
    if (this.isFirebaseReady) {
      try {
        let query = this.db.collection('affiliates');
        if (options.onlyActive) {
          query = query.where('isActive', '==', true);
        }
        const snapshot = await query.get();
        const affiliates = [];
        snapshot.forEach(doc => {
          affiliates.push({ ...doc.data(), id: doc.id });
        });
        affiliates.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        return affiliates;
      } catch (e) {
        console.warn('[TOMÉA] Firestore getAffiliates error, falling back to local storage:', e);
      }
    }

    this.ensureLocalStorageSeed();
    let affiliates = JSON.parse(localStorage.getItem('tomea_affiliates') || '[]');
    if (options.onlyActive) {
      affiliates = affiliates.filter(a => a.isActive);
    }
    affiliates.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return affiliates;
  }

  async getAffiliateById(id) {
    if (!id) return null;
    if (this.isFirebaseReady) {
      try {
        const doc = await this.db.collection('affiliates').doc(id).get();
        if (doc.exists) {
          return { ...doc.data(), id: doc.id };
        }
      } catch (e) {
        console.warn('[TOMÉA] Firestore getAffiliateById error:', e);
      }
    }

    const affiliates = await this.getAffiliates();
    return affiliates.find(a => a.id === id || a.affiliateSlug === id) || null;
  }

  async getAffiliateByCode(code) {
    if (!code) return null;
    const cleanCode = code.toString().trim().toUpperCase();
    if (this.isFirebaseReady) {
      try {
        const snapshot = await this.db.collection('affiliates')
          .where('code', '==', cleanCode)
          .limit(1)
          .get();
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          return { ...doc.data(), id: doc.id };
        }
      } catch (e) {
        console.warn('[TOMÉA] Firestore getAffiliateByCode error:', e);
      }
    }

    const affiliates = await this.getAffiliates();
    return affiliates.find(a => (a.code || '').trim().toUpperCase() === cleanCode) || null;
  }

  async getAffiliateBySlug(slug) {
    if (!slug) return null;
    const cleanSlug = slug.toString().trim().toLowerCase();
    if (this.isFirebaseReady) {
      try {
        const snapshot = await this.db.collection('affiliates')
          .where('affiliateSlug', '==', cleanSlug)
          .limit(1)
          .get();
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          return { ...doc.data(), id: doc.id };
        }
      } catch (e) {
        console.warn('[TOMÉA] Firestore getAffiliateBySlug error:', e);
      }
    }

    const affiliates = await this.getAffiliates();
    return affiliates.find(a => (a.affiliateSlug || '').trim().toLowerCase() === cleanSlug || (a.code || '').trim().toLowerCase() === cleanSlug) || null;
  }

  /**
   * Validate an affiliate code or referral slug.
   * Checks existence, active state, date window, and usage limit.
   */
  async validateAffiliate(codeOrSlug, isSlug = false) {
    if (!codeOrSlug) {
      return { valid: false, error: 'Please enter a discount code.' };
    }

    let affiliate = null;
    if (isSlug) {
      affiliate = await this.getAffiliateBySlug(codeOrSlug);
      if (!affiliate) {
        affiliate = await this.getAffiliateByCode(codeOrSlug);
      }
    } else {
      affiliate = await this.getAffiliateByCode(codeOrSlug);
      if (!affiliate) {
        affiliate = await this.getAffiliateBySlug(codeOrSlug);
      }
    }

    if (!affiliate) {
      return { valid: false, error: 'This discount code is invalid or expired.' };
    }

    if (affiliate.isActive === false) {
      return { valid: false, error: 'This discount code is currently unavailable.' };
    }

    const now = new Date();
    if (affiliate.startDate) {
      const start = new Date(affiliate.startDate);
      if (!isNaN(start.getTime()) && now < start) {
        return { valid: false, error: 'This campaign is not active yet.' };
      }
    }

    if (affiliate.endDate) {
      const end = new Date(affiliate.endDate);
      if (!isNaN(end.getTime()) && now > end) {
        return { valid: false, error: 'This discount code is invalid or expired.' };
      }
    }

    if (affiliate.usageLimit !== null && affiliate.usageLimit !== undefined && affiliate.usageLimit !== '') {
      const limit = parseInt(affiliate.usageLimit, 10);
      const count = parseInt(affiliate.usageCount || 0, 10);
      if (!isNaN(limit) && limit > 0 && count >= limit) {
        return { valid: false, error: 'This discount code has reached its maximum usage limit.' };
      }
    }

    return {
      valid: true,
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        code: affiliate.code,
        affiliateSlug: affiliate.affiliateSlug,
        discountPercent: Number(affiliate.discountPercent) || 0,
        commissionPercent: Number(affiliate.commissionPercent) || 0
      }
    };
  }

  /**
   * Lightweight referral visit tracking with session deduplication
   */
  async trackAffiliateVisit(slug) {
    if (!slug) return;
    const cleanSlug = slug.toString().trim().toLowerCase();
    
    // Prevent duplicate writes within same browser session
    const sessionKey = `tomea_ref_visited_${cleanSlug}`;
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(sessionKey)) {
      return;
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(sessionKey, '1');
    }

    const affiliate = await this.getAffiliateBySlug(cleanSlug);
    if (!affiliate) return;

    const newVisits = (parseInt(affiliate.totalVisits, 10) || 0) + 1;

    if (this.isFirebaseReady) {
      try {
        const ref = this.db.collection('affiliates').doc(affiliate.id);
        if (window.firebase && firebase.firestore && firebase.firestore.FieldValue) {
          await ref.update({
            totalVisits: firebase.firestore.FieldValue.increment(1),
            updatedAt: new Date().toISOString()
          });
        } else {
          await ref.update({ totalVisits: newVisits, updatedAt: new Date().toISOString() });
        }
        return;
      } catch (e) {
        console.warn('[TOMÉA] Error updating live affiliate visit count:', e);
      }
    }

    this.ensureLocalStorageSeed();
    const affiliates = JSON.parse(localStorage.getItem('tomea_affiliates') || '[]');
    const idx = affiliates.findIndex(a => a.id === affiliate.id);
    if (idx !== -1) {
      affiliates[idx].totalVisits = newVisits;
      affiliates[idx].updatedAt = new Date().toISOString();
      localStorage.setItem('tomea_affiliates', JSON.stringify(affiliates));
    }
  }

  /**
   * Create or update affiliate record with strict validation
   */
  async saveAffiliate(data) {
    if (!data.name || !data.name.trim()) {
      throw new Error('Influencer name is required.');
    }

    const cleanCode = (data.code || '').trim().toUpperCase();
    if (!cleanCode) {
      throw new Error('Affiliate code is required.');
    }
    if (!/^[A-Z0-9_-]+$/.test(cleanCode)) {
      throw new Error('Affiliate code must contain only letters, numbers, hyphens, or underscores.');
    }

    let cleanSlug = (data.affiliateSlug || data.code || '').trim().toLowerCase()
      .replace(/[^a-z0-9_-]/g, '');
    if (!cleanSlug) {
      cleanSlug = cleanCode.toLowerCase();
    }

    const discount = Number(data.discountPercent);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      throw new Error('Customer discount must be a number between 0% and 100%.');
    }

    const commission = Number(data.commissionPercent);
    if (isNaN(commission) || commission < 0 || commission > 100) {
      throw new Error('Influencer commission must be a number between 0% and 100%.');
    }

    if (data.startDate && data.endDate) {
      const s = new Date(data.startDate);
      const e = new Date(data.endDate);
      if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e < s) {
        throw new Error('End date cannot be before start date.');
      }
    }

    let limit = null;
    if (data.usageLimit !== undefined && data.usageLimit !== null && data.usageLimit !== '') {
      limit = parseInt(data.usageLimit, 10);
      if (isNaN(limit) || limit < 0) {
        throw new Error('Usage limit must be a positive number or left blank.');
      }
    }

    // Check code and slug uniqueness
    const existingList = await this.getAffiliates();
    const currentId = data.id || null;

    const duplicateCode = existingList.find(a => 
      a.id !== currentId && (a.code || '').trim().toUpperCase() === cleanCode
    );
    if (duplicateCode) {
      throw new Error(`The affiliate code "${cleanCode}" is already in use by ${duplicateCode.name}.`);
    }

    const duplicateSlug = existingList.find(a => 
      a.id !== currentId && (a.affiliateSlug || '').trim().toLowerCase() === cleanSlug
    );
    if (duplicateSlug) {
      throw new Error(`The affiliate referral slug "${cleanSlug}" is already in use by ${duplicateSlug.name}.`);
    }

    const nowIso = new Date().toISOString();
    const affiliatePayload = {
      name: data.name.trim(),
      code: cleanCode,
      email: (data.email || '').trim(),
      phone: (data.phone || '').trim(),
      instagram: (data.instagram || '').trim(),
      discountPercent: discount,
      commissionPercent: commission,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      usageLimit: limit,
      usageCount: Number(data.usageCount) || 0,
      totalVisits: Number(data.totalVisits) || 0,
      totalOrders: Number(data.totalOrders) || 0,
      confirmedOrders: Number(data.confirmedOrders) || 0,
      cancelledOrders: Number(data.cancelledOrders) || 0,
      totalSales: Number(data.totalSales) || 0,
      totalCommission: Number(data.totalCommission) || 0,
      paidCommission: Number(data.paidCommission) || 0,
      pendingCommission: Number(data.pendingCommission) || 0,
      affiliateSlug: cleanSlug,
      payoutHistory: Array.isArray(data.payoutHistory) ? data.payoutHistory : [],
      updatedAt: nowIso
    };

    if (currentId) {
      // Update existing
      affiliatePayload.id = currentId;
      affiliatePayload.createdAt = data.createdAt || nowIso;

      if (this.isFirebaseReady) {
        try {
          await this.db.collection('affiliates').doc(currentId).set(affiliatePayload, { merge: true });
          return affiliatePayload;
        } catch (e) {
          console.error('[TOMÉA] Firestore update affiliate error:', e);
          throw e;
        }
      }

      this.ensureLocalStorageSeed();
      const list = JSON.parse(localStorage.getItem('tomea_affiliates') || '[]');
      const idx = list.findIndex(a => a.id === currentId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...affiliatePayload };
      } else {
        list.push(affiliatePayload);
      }
      localStorage.setItem('tomea_affiliates', JSON.stringify(list));
      return affiliatePayload;
    } else {
      // Create new
      const newId = cleanSlug || ('aff_' + Date.now().toString(36));
      affiliatePayload.id = newId;
      affiliatePayload.createdAt = nowIso;

      if (this.isFirebaseReady) {
        try {
          await this.db.collection('affiliates').doc(newId).set(affiliatePayload);
          return affiliatePayload;
        } catch (e) {
          console.error('[TOMÉA] Firestore create affiliate error:', e);
          throw e;
        }
      }

      this.ensureLocalStorageSeed();
      const list = JSON.parse(localStorage.getItem('tomea_affiliates') || '[]');
      list.push(affiliatePayload);
      localStorage.setItem('tomea_affiliates', JSON.stringify(list));
      return affiliatePayload;
    }
  }

  async deleteAffiliate(id) {
    if (!id) return;
    if (this.isFirebaseReady) {
      try {
        await this.db.collection('affiliates').doc(id).delete();
        return;
      } catch (e) {
        console.error('[TOMÉA] Firestore deleteAffiliate error:', e);
        throw e;
      }
    }

    this.ensureLocalStorageSeed();
    const list = JSON.parse(localStorage.getItem('tomea_affiliates') || '[]');
    const filtered = list.filter(a => a.id !== id && a.affiliateSlug !== id);
    localStorage.setItem('tomea_affiliates', JSON.stringify(filtered));
  }

  /**
   * Recalculates an affiliate's lifetime metrics from all historical orders
   */
  async recalculateAffiliateMetrics(affiliateId) {
    if (!affiliateId) return;
    const affiliate = await this.getAffiliateById(affiliateId);
    if (!affiliate) return;

    const allOrders = await this.getOrders();
    const affOrders = allOrders.filter(o => 
      o.affiliateId === affiliate.id || 
      (o.affiliateCode && affiliate.code && o.affiliateCode.toUpperCase() === affiliate.code.toUpperCase())
    );

    const totalOrders = affOrders.length;
    const confirmedList = affOrders.filter(o => 
      ['confirmed', 'paid', 'completed'].includes((o.status || '').toLowerCase())
    );
    const confirmedOrders = confirmedList.length;
    const cancelledOrders = affOrders.filter(o => (o.status || '').toLowerCase() === 'cancelled').length;

    const totalSales = confirmedList.reduce((sum, o) => sum + (Number(o.finalPrice) || 0), 0);
    const totalCommission = confirmedList.reduce((sum, o) => sum + (Number(o.commissionAmount) || 0), 0);

    const paidCommission = Number(affiliate.paidCommission) || 0;
    const pendingCommission = Math.max(0, totalCommission - paidCommission);

    const updates = {
      totalOrders,
      confirmedOrders,
      cancelledOrders,
      totalSales,
      totalCommission,
      pendingCommission,
      usageCount: totalOrders,
      updatedAt: new Date().toISOString()
    };

    if (this.isFirebaseReady) {
      try {
        await this.db.collection('affiliates').doc(affiliate.id).set(updates, { merge: true });
        return;
      } catch (e) {
        console.warn('[TOMÉA] Error syncing affiliate recalculated metrics to Firestore:', e);
      }
    }

    this.ensureLocalStorageSeed();
    const list = JSON.parse(localStorage.getItem('tomea_affiliates') || '[]');
    const idx = list.findIndex(a => a.id === affiliate.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      localStorage.setItem('tomea_affiliates', JSON.stringify(list));
    }
  }

  /**
   * Record a payout to an affiliate
   */
  async recordAffiliatePayout(affiliateId, amountOrData, note = '') {
    const affiliate = await this.getAffiliateById(affiliateId);
    if (!affiliate) throw new Error('Affiliate not found.');

    let payoutAmount;
    let method = 'bank_transfer';
    let reference = '';
    let payoutNote = note;

    if (typeof amountOrData === 'object' && amountOrData !== null) {
      payoutAmount = Number(amountOrData.amount);
      method = amountOrData.method || 'bank_transfer';
      reference = (amountOrData.reference || '').trim();
      payoutNote = (amountOrData.note || amountOrData.reference || note || '').trim();
    } else {
      payoutAmount = Number(amountOrData);
    }

    if (isNaN(payoutAmount) || payoutAmount <= 0) {
      throw new Error('Please enter a valid payout amount.');
    }

    const currentPaid = Number(affiliate.paidCommission) || 0;
    const totalComm = Number(affiliate.totalCommission) || 0;
    const newPaid = currentPaid + payoutAmount;
    const newPending = Math.max(0, totalComm - newPaid);

    const payoutItem = {
      id: 'PAY-' + Date.now().toString(36).toUpperCase(),
      amount: payoutAmount,
      method,
      reference,
      note: payoutNote,
      date: new Date().toISOString()
    };

    const payoutHistory = Array.isArray(affiliate.payoutHistory) ? [...affiliate.payoutHistory] : [];
    payoutHistory.unshift(payoutItem);

    const updates = {
      paidCommission: newPaid,
      pendingCommission: newPending,
      payoutHistory,
      updatedAt: new Date().toISOString()
    };

    if (this.isFirebaseReady) {
      try {
        await this.db.collection('affiliates').doc(affiliate.id).set(updates, { merge: true });
        return { success: true, ...updates };
      } catch (e) {
        console.error('[TOMÉA] Error recording payout in Firestore:', e);
        throw e;
      }
    }

    this.ensureLocalStorageSeed();
    const list = JSON.parse(localStorage.getItem('tomea_affiliates') || '[]');
    const idx = list.findIndex(a => a.id === affiliate.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      localStorage.setItem('tomea_affiliates', JSON.stringify(list));
    }
    return { success: true, ...updates };
  }

  /* ========================================================
     ORDERS API
     ======================================================== */

  async getOrders(options = {}) {
    if (this.isFirebaseReady) {
      try {
        let query = this.db.collection('orders');
        if (options.affiliateId) {
          query = query.where('affiliateId', '==', options.affiliateId);
        }
        if (options.status) {
          query = query.where('status', '==', options.status);
        }
        const snapshot = await query.get();
        const orders = [];
        snapshot.forEach(doc => {
          orders.push({ ...doc.data(), id: doc.id });
        });
        orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        return orders;
      } catch (e) {
        console.warn('[TOMÉA] Firestore getOrders error, falling back to local storage:', e);
      }
    }

    this.ensureLocalStorageSeed();
    let orders = JSON.parse(localStorage.getItem('tomea_orders') || '[]');
    if (options.affiliateId) {
      orders = orders.filter(o => o.affiliateId === options.affiliateId);
    }
    if (options.status) {
      orders = orders.filter(o => (o.status || '').toLowerCase() === options.status.toLowerCase());
    }
    orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return orders;
  }

  async getOrderById(id) {
    if (!id) return null;
    if (this.isFirebaseReady) {
      try {
        const doc = await this.db.collection('orders').doc(id).get();
        if (doc.exists) {
          return { ...doc.data(), id: doc.id };
        }
      } catch (e) {
        console.warn('[TOMÉA] Firestore getOrderById error:', e);
      }
    }

    const orders = await this.getOrders();
    return orders.find(o => o.id === id) || null;
  }

  /**
   * Create an order (status defaults to "pending")
   * Calculates commission and updates affiliate usageCount and totalOrders
   */
  async createOrder(orderData) {
    const nowIso = new Date().toISOString();
    const orderId = orderData.id || ('TOM-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900));

    const finalOrder = {
      id: orderId,
      productId: orderData.productId || '',
      productName: orderData.productName || 'TOMÉA Fragrance',
      quantity: Number(orderData.quantity) || 1,
      originalPrice: Number(orderData.originalPrice) || 0,
      discountPercent: Number(orderData.discountPercent) || 0,
      discountAmount: Number(orderData.discountAmount) || 0,
      finalPrice: Number(orderData.finalPrice) || Number(orderData.originalPrice) || 0,
      
      affiliateId: orderData.affiliateId || '',
      affiliateCode: (orderData.affiliateCode || '').trim().toUpperCase(),
      affiliateName: orderData.affiliateName || '',
      
      commissionPercent: Number(orderData.commissionPercent) || 0,
      commissionAmount: Number(orderData.commissionAmount) || 0,
      
      status: 'pending',
      commissionStatus: 'pending',
      
      customerName: (orderData.customerName || '').trim(),
      customerPhone: (orderData.customerPhone || '').trim(),
      
      createdAt: nowIso,
      updatedAt: nowIso
    };

    if (this.isFirebaseReady) {
      try {
        await this.db.collection('orders').doc(orderId).set(finalOrder);
      } catch (e) {
        console.warn('[TOMÉA] Firestore createOrder error, saving locally:', e);
      }
    }

    this.ensureLocalStorageSeed();
    const orders = JSON.parse(localStorage.getItem('tomea_orders') || '[]');
    orders.unshift(finalOrder);
    localStorage.setItem('tomea_orders', JSON.stringify(orders));

    // If order was associated with an affiliate, update initial metrics
    if (finalOrder.affiliateId || finalOrder.affiliateCode) {
      let aff = null;
      if (finalOrder.affiliateId) {
        aff = await this.getAffiliateById(finalOrder.affiliateId);
      }
      if (!aff && finalOrder.affiliateCode) {
        aff = await this.getAffiliateByCode(finalOrder.affiliateCode);
      }
      if (aff) {
        const usageCount = (Number(aff.usageCount) || 0) + 1;
        const totalOrders = (Number(aff.totalOrders) || 0) + 1;
        const affUpdates = {
          usageCount,
          totalOrders,
          updatedAt: nowIso
        };

        if (this.isFirebaseReady) {
          try {
            await this.db.collection('affiliates').doc(aff.id).set(affUpdates, { merge: true });
          } catch (e) {
            console.warn('[TOMÉA] Error updating affiliate count on order creation:', e);
          }
        }

        const affList = JSON.parse(localStorage.getItem('tomea_affiliates') || '[]');
        const idx = affList.findIndex(a => a.id === aff.id);
        if (idx !== -1) {
          affList[idx] = { ...affList[idx], ...affUpdates };
          localStorage.setItem('tomea_affiliates', JSON.stringify(affList));
        }
      }
    }

    return { success: true, ...finalOrder };
  }

  /**
   * Update an order's status and re-aggregate affiliate metrics
   */
  async updateOrderStatus(orderId, newStatus) {
    const validStatuses = ['pending', 'confirmed', 'paid', 'completed', 'cancelled'];
    const cleanStatus = (newStatus || '').toLowerCase().trim();
    if (!validStatuses.includes(cleanStatus)) {
      throw new Error(`Invalid status "${newStatus}". Must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await this.getOrderById(orderId);
    if (!order) throw new Error('Order not found.');

    const nowIso = new Date().toISOString();
    const updates = {
      status: cleanStatus,
      updatedAt: nowIso
    };

    if (cleanStatus === 'paid') {
      updates.commissionStatus = 'approved';
    } else if (cleanStatus === 'cancelled') {
      updates.commissionStatus = 'cancelled';
    }

    if (this.isFirebaseReady) {
      try {
        await this.db.collection('orders').doc(orderId).set(updates, { merge: true });
      } catch (e) {
        console.error('[TOMÉA] Firestore updateOrderStatus error:', e);
        throw e;
      }
    }

    this.ensureLocalStorageSeed();
    const orders = JSON.parse(localStorage.getItem('tomea_orders') || '[]');
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      orders[idx] = { ...orders[idx], ...updates };
      localStorage.setItem('tomea_orders', JSON.stringify(orders));
    }

    // Trigger affiliate metrics recalculation
    if (order.affiliateId) {
      await this.recalculateAffiliateMetrics(order.affiliateId);
    } else if (order.affiliateCode) {
      const aff = await this.getAffiliateByCode(order.affiliateCode);
      if (aff) {
        await this.recalculateAffiliateMetrics(aff.id);
      }
    }

    return { success: true, ...order, ...updates };
  }

  async deleteOrder(id) {
    if (!id) return;
    const order = await this.getOrderById(id);
    if (this.isFirebaseReady) {
      try {
        await this.db.collection('orders').doc(id).delete();
      } catch (e) {
        console.error('[TOMÉA] Firestore deleteOrder error:', e);
        throw e;
      }
    }

    this.ensureLocalStorageSeed();
    const orders = JSON.parse(localStorage.getItem('tomea_orders') || '[]');
    const filtered = orders.filter(o => o.id !== id);
    localStorage.setItem('tomea_orders', JSON.stringify(filtered));

    if (order && order.affiliateId) {
      await this.recalculateAffiliateMetrics(order.affiliateId);
    }
  }

  /**
   * Reset local storage to initial brand guidelines seed
   */
  resetToInitialBrandSeed() {
    localStorage.setItem('tomea_products', JSON.stringify(INITIAL_PRODUCTS_SEED));
    localStorage.setItem('tomea_settings', JSON.stringify(INITIAL_SETTINGS_SEED));
    localStorage.setItem('tomea_homepage', JSON.stringify(INITIAL_HOMEPAGE_SEED));
    localStorage.setItem('tomea_affiliates', JSON.stringify(INITIAL_AFFILIATES_SEED));
    localStorage.setItem('tomea_orders', JSON.stringify(INITIAL_ORDERS_SEED));
  }
}

// Global Singleton Instance
const DB = new FirestoreService();

if (typeof window !== 'undefined') {
  window.DB = DB;
  window.INITIAL_PRODUCTS_SEED = INITIAL_PRODUCTS_SEED;
  window.INITIAL_AFFILIATES_SEED = INITIAL_AFFILIATES_SEED;
  window.INITIAL_ORDERS_SEED = INITIAL_ORDERS_SEED;
}
