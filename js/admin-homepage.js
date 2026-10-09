/**
 * TOMÉA PERFUMES - Admin Homepage CMS Controller
 * 
 * Enables editing of hero statements, editorial intros, vision & mission copy,
 * and campaign banner imagery directly from the admin dashboard.
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.Auth) window.Auth.requireAuth();

  const form = document.getElementById('admin-homepage-form');
  const heroImageInput = document.getElementById('cms-hero-image');
  const heroImagePreview = document.getElementById('cms-hero-image-preview');
  const heroUploadBtn = document.getElementById('btn-upload-hero-image');
  const heroFileInput = document.getElementById('hero-file-input');
  const openHeroLibraryBtn = document.getElementById('btn-open-hero-library');

  // Load existing homepage CMS data
  async function loadData() {
    if (!window.DB) return;
    try {
      const data = await window.DB.getHomepageContent();
      if (!data) return;

      document.getElementById('cms-hero-tagline').value = data.heroTagline || '';
      document.getElementById('cms-hero-heading').value = data.heroHeading || '';
      document.getElementById('cms-hero-subtitle').value = data.heroSubtitle || '';
      document.getElementById('cms-hero-image').value = data.heroImage || '';
      document.getElementById('cms-hero-primary-cta').value = data.heroPrimaryCtaText || '';
      document.getElementById('cms-hero-secondary-cta').value = data.heroSecondaryCtaText || '';

      document.getElementById('cms-intro-pretitle').value = data.introPretitle || '';
      document.getElementById('cms-intro-title').value = data.introTitle || '';
      document.getElementById('cms-intro-p1').value = data.introParagraph1 || '';
      document.getElementById('cms-intro-p2').value = data.introParagraph2 || '';

      document.getElementById('cms-vision-title').value = data.visionTitle || '';
      document.getElementById('cms-vision-text').value = data.visionText || '';
      document.getElementById('cms-mission-title').value = data.missionTitle || '';
      document.getElementById('cms-mission-text').value = data.missionText || '';

      document.getElementById('cms-final-cta-heading').value = data.finalCtaHeading || '';
      document.getElementById('cms-final-cta-subtitle').value = data.finalCtaSubtitle || '';
      document.getElementById('cms-final-cta-btn').value = data.finalCtaButtonText || '';

      if (heroImagePreview && data.heroImage) {
        heroImagePreview.src = data.heroImage;
      }
    } catch (err) {
      console.error('[TOMÉA Admin CMS] Error loading homepage content:', err);
      Utils.showToast('Failed to load homepage content.', 'error');
    }
  }

  // Update preview on input change
  if (heroImageInput && heroImagePreview) {
    heroImageInput.addEventListener('input', () => {
      heroImagePreview.src = heroImageInput.value || 'assets/images/hero-banner.jpg';
    });
  }

  // File Upload via Cloudinary
  if (heroUploadBtn && heroFileInput) {
    heroUploadBtn.addEventListener('click', () => heroFileInput.click());

    heroFileInput.addEventListener('change', async () => {
      if (heroFileInput.files && heroFileInput.files.length > 0) {
        const file = heroFileInput.files[0];
        if (file.size > 10 * 1024 * 1024) {
          Utils.showToast('Image exceeds 10MB limit. Please select a smaller photo.', 'error');
          return;
        }
        let localPreview = null;
        try {
          localPreview = URL.createObjectURL(file);
          if (heroImagePreview) heroImagePreview.src = localPreview;
        } catch (e) {}

        try {
          heroUploadBtn.disabled = true;
          heroUploadBtn.textContent = 'Uploading to Cloudinary...';
          const url = await window.Cloudinary.uploadImage(file);
          heroImageInput.value = url;
          if (heroImagePreview) heroImagePreview.src = url;
          Utils.showToast('Hero image uploaded to Cloudinary successfully.', 'success');
        } catch (e) {
          Utils.showToast(e.message || 'Upload failed. Check your connection.', 'error');
        } finally {
          if (localPreview) {
            try { URL.revokeObjectURL(localPreview); } catch (e) {}
          }
          heroUploadBtn.disabled = false;
          heroUploadBtn.textContent = 'Upload to Cloudinary';
          heroFileInput.value = '';
        }
      }
    });
  }

  // Form Submit
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('btn-save-homepage');
      saveBtn.disabled = true;
      saveBtn.innerHTML = 'Publishing Editorial Changes...';

      try {
        const payload = {
          heroTagline: document.getElementById('cms-hero-tagline').value.trim(),
          heroHeading: document.getElementById('cms-hero-heading').value.trim(),
          heroSubtitle: document.getElementById('cms-hero-subtitle').value.trim(),
          heroImage: document.getElementById('cms-hero-image').value.trim() || 'assets/images/hero-banner.jpg',
          heroPrimaryCtaText: document.getElementById('cms-hero-primary-cta').value.trim(),
          heroSecondaryCtaText: document.getElementById('cms-hero-secondary-cta').value.trim(),

          introPretitle: document.getElementById('cms-intro-pretitle').value.trim(),
          introTitle: document.getElementById('cms-intro-title').value.trim(),
          introParagraph1: document.getElementById('cms-intro-p1').value.trim(),
          introParagraph2: document.getElementById('cms-intro-p2').value.trim(),

          visionTitle: document.getElementById('cms-vision-title').value.trim(),
          visionText: document.getElementById('cms-vision-text').value.trim(),
          missionTitle: document.getElementById('cms-mission-title').value.trim(),
          missionText: document.getElementById('cms-mission-text').value.trim(),

          finalCtaHeading: document.getElementById('cms-final-cta-heading').value.trim(),
          finalCtaSubtitle: document.getElementById('cms-final-cta-subtitle').value.trim(),
          finalCtaButtonText: document.getElementById('cms-final-cta-btn').value.trim()
        };

        await window.DB.saveHomepageContent(payload);
        Utils.showToast('Homepage editorial content published successfully.', 'success');
      } catch (err) {
        console.error('[TOMÉA Admin CMS] Save error:', err);
        Utils.showToast('Failed to save homepage content.', 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Save & Publish Changes';
      }
    });
  }

  await loadData();
});
