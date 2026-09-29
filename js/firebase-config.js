/**
 * TOMÉA PERFUMES - Firebase & Cloudinary Configuration
 * Production credentials — keep this file server-side or behind auth rules in production.
 */

const firebaseConfig = {
  apiKey: "AIzaSyDRryAEAu5UVqR3UtQRPqPpfJ6EUGNH0aY",
  authDomain: "tomea-8b51b.firebaseapp.com",
  projectId: "tomea-8b51b",
  storageBucket: "tomea-8b51b.firebasestorage.app",
  messagingSenderId: "99653816937",
  appId: "1:99653816937:web:64ef13288d2c67b8cd48f8",
  measurementId: "G-W53PXDM4L6"
};

// Global brand defaults
const TOMEA_CONFIG = {
  brandName: "TOMÉA PERFUMES",
  tagline: "Confidence, Bottled.",
  defaultWhatsApp: "2348000000000",
  defaultCurrency: "₦",
  defaultCurrencyCode: "NGN",
  contactEmail: "concierge@tomeaperfumes.com",
  instagramUrl: "https://instagram.com/tomeaperfumes",
  facebookUrl: "https://facebook.com/tomeaperfumes",
  tiktokUrl: "https://tiktok.com/@tomeaperfumes",
  cloudinary: {
    cloudName: "dd5p5t2rs",
    apiKey: "342248938234565",
    // NOTE: API Secret should NEVER be exposed on the frontend.
    // Use only cloudName + uploadPreset for unsigned client-side uploads.
    uploadPreset: "tomea_unsigned" // Create this unsigned preset in your Cloudinary console
  }
};

// Check if Firebase credentials have been configured
function isFirebaseConfigured() {
  return firebaseConfig.apiKey &&
         firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY" &&
         firebaseConfig.projectId !== "YOUR_PROJECT_ID";
}

// Export for module or global use
if (typeof window !== "undefined") {
  window.firebaseConfig = firebaseConfig;
  window.TOMEA_CONFIG = TOMEA_CONFIG;
  window.isFirebaseConfigured = isFirebaseConfigured;
}
