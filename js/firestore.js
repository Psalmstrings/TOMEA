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
  heroSecondaryCtaText: "ORDER VIA WHATSAPP",
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
    }
    if (!localStorage.getItem('tomea_settings')) {
      localStorage.setItem('tomea_settings', JSON.stringify(INITIAL_SETTINGS_SEED));
    }
    if (!localStorage.getItem('tomea_homepage')) {
      localStorage.setItem('tomea_homepage', JSON.stringify(INITIAL_HOMEPAGE_SEED));
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
          products.push({ id: doc.id, ...doc.data() });
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
          return { id: doc.id, ...doc.data() };
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
          return { id: doc.id, ...doc.data() };
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
    const isNew = !product.id;
    const now = new Date().toISOString();
    
    // Auto-generate slug if missing
    if (!product.slug) {
      product.slug = Utils.slugify(product.name);
    }

    if (this.isFirebaseReady) {
      try {
        if (isNew) {
          product.createdAt = now;
          product.updatedAt = now;
          const ref = await this.db.collection('products').add(product);
          product.id = ref.id;
          return product;
        } else {
          product.updatedAt = now;
          await this.db.collection('products').doc(product.id).set(product, { merge: true });
          return product;
        }
      } catch (e) {
        console.error('[TOMÉA] Firestore saveProduct error:', e);
        throw e;
      }
    }

    // LocalStorage Fallback
    this.ensureLocalStorageSeed();
    const items = JSON.parse(localStorage.getItem('tomea_products') || '[]');
    if (isNew) {
      product.id = 'prod_' + Date.now();
      product.createdAt = now;
      product.updatedAt = now;
      items.push(product);
    } else {
      product.updatedAt = now;
      const index = items.findIndex(p => p.id === product.id);
      if (index !== -1) {
        items[index] = { ...items[index], ...product };
      } else {
        items.push(product);
      }
    }
    localStorage.setItem('tomea_products', JSON.stringify(items));
    return product;
  }

  async deleteProduct(productId) {
    if (!productId) return false;
    if (this.isFirebaseReady) {
      try {
        await this.db.collection('products').doc(productId).delete();
        return true;
      } catch (e) {
        console.error('[TOMÉA] Firestore deleteProduct error:', e);
        throw e;
      }
    }

    this.ensureLocalStorageSeed();
    let items = JSON.parse(localStorage.getItem('tomea_products') || '[]');
    items = items.filter(p => p.id !== productId);
    localStorage.setItem('tomea_products', JSON.stringify(items));
    return true;
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

  /**
   * Reset local storage to initial brand guidelines seed
   */
  resetToInitialBrandSeed() {
    localStorage.setItem('tomea_products', JSON.stringify(INITIAL_PRODUCTS_SEED));
    localStorage.setItem('tomea_settings', JSON.stringify(INITIAL_SETTINGS_SEED));
    localStorage.setItem('tomea_homepage', JSON.stringify(INITIAL_HOMEPAGE_SEED));
  }
}

// Global Singleton Instance
const DB = new FirestoreService();

if (typeof window !== 'undefined') {
  window.DB = DB;
  window.INITIAL_PRODUCTS_SEED = INITIAL_PRODUCTS_SEED;
}
