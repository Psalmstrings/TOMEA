/**
 * TOMÉA PERFUMES - Cloudinary Image Upload Service
 *
 * Provides secure client-side uploads to Cloudinary via unsigned upload presets.
 * The API Secret is NEVER exposed on the frontend — only cloudName + uploadPreset are used.
 *
 * Setup: In your Cloudinary Console → Settings → Upload → Upload Presets
 *        Create a preset named "tomea_unsigned" with Signing Mode: Unsigned
 */

class CloudinaryService {
  constructor() {
    this.cloudName = (window.TOMEA_CONFIG && window.TOMEA_CONFIG.cloudinary.cloudName) || 'dd5p5t2rs';
    this.uploadPreset = (window.TOMEA_CONFIG && window.TOMEA_CONFIG.cloudinary.uploadPreset) || 'tomea_unsigned';
  }

  isConfigured() {
    return !!(this.cloudName && this.uploadPreset &&
              this.cloudName !== 'YOUR_CLOUDINARY_CLOUD_NAME' &&
              this.uploadPreset !== 'YOUR_CLOUDINARY_UNSIGNED_UPLOAD_PRESET');
  }

  /**
   * Upload an image file to Cloudinary
   * @param {File} file
   * @param {Function} onProgress callback(percent)
   * @returns {Promise<string>} secure_url
   */
  async uploadImage(file, onProgress = null) {
    if (!file) throw new Error('No image file selected.');

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Image size exceeds 10MB limit. Please select a smaller file.');
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      throw new Error('Selected file is not an image.');
    }

    // If Cloudinary credentials are provided, perform real unsigned upload
    if (this.isConfigured()) {
      return new Promise((resolve, reject) => {
        const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.uploadPreset);
        formData.append('folder', 'tomea_perfumes');

        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);

        if (onProgress && xhr.upload) {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              onProgress(percent);
            }
          };
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response.secure_url);
            } catch (err) {
              reject(new Error('Invalid Cloudinary response.'));
            }
          } else {
            let errorMsg = 'Cloudinary upload failed.';
            try {
              const res = JSON.parse(xhr.responseText);
              if (res.error && res.error.message) {
                errorMsg = res.error.message;
              }
            } catch (e) {}
            reject(new Error(errorMsg));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during Cloudinary upload.'));
        xhr.send(formData);
      });
    }

    // Demo / Local preview fallback: converts to Data URL or simulated local URL
    return new Promise((resolve) => {
      let percent = 0;
      const interval = setInterval(() => {
        percent += 25;
        if (onProgress) onProgress(percent);
        if (percent >= 100) {
          clearInterval(interval);
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        }
      }, 100);
    });
  }

  /**
   * Pre-curated official brand image catalog for admin selection
   */
  getBrandAssetLibrary() {
    return [
      { label: "L'Origine Clean Bottle", url: "assets/images/bottle-lorigine.jpg" },
      { label: "L'Origine Editorial Silk Campaign", url: "assets/images/campaign-lorigine.jpg" },
      { label: "L'Origine Fragrance Notes Poster", url: "assets/images/product-lorigine-notes.jpg" },
      { label: "Charme Clean Bottle", url: "assets/images/bottle-charme.jpg" },
      { label: "Charme Editorial Silk Campaign", url: "assets/images/campaign-charme.jpg" },
      { label: "Charme Fragrance Notes Poster", url: "assets/images/product-charme-notes.jpg" },
      { label: "Désir Clean Bottle", url: "assets/images/bottle-desir.jpg" },
      { label: "Désir Editorial Silk Campaign", url: "assets/images/campaign-desir.jpg" },
      { label: "Désir Fragrance Notes Poster", url: "assets/images/product-desir-notes.jpg" },
      { label: "Luxury Red Silk Flowing Hero", url: "assets/images/hero-banner.jpg" },
      { label: "Maison Packaging & Unboxing", url: "assets/images/packaging-unboxing.jpg" },
      { label: "Luxury Burgundy Shopping Bag", url: "assets/images/brand-bag-luxury.jpg" },
      { label: "Brand Vision & Mission Showcase", url: "assets/images/brand-vision-mission.jpg" }
    ];
  }
}

const Cloudinary = new CloudinaryService();

if (typeof window !== 'undefined') {
  window.Cloudinary = Cloudinary;
}
