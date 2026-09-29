/**
 * TOMÉA PERFUMES - Admin Settings Controller
 * 
 * Manages central WhatsApp ordering number, Maison contact details,
 * social media links, and Cloudinary API configuration.
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.Auth) window.Auth.requireAuth();

  const form = document.getElementById('admin-settings-form');
  const resetBtn = document.getElementById('btn-reset-defaults');

  async function loadSettings() {
    if (!window.DB) return;
    try {
      const data = await window.DB.getSettings();
      if (!data) return;

      document.getElementById('setting-wa-number').value = data.whatsappNumber || '';
      document.getElementById('setting-brand-name').value = data.brandName || 'TOMÉA PERFUMES';
      document.getElementById('setting-tagline').value = data.tagline || 'Confidence, Bottled.';
      document.getElementById('setting-currency').value = data.currency || '₦';
      document.getElementById('setting-currency-code').value = data.currencyCode || 'NGN';
      document.getElementById('setting-email').value = data.email || '';
      document.getElementById('setting-phone').value = data.phone || '';
      document.getElementById('setting-address').value = data.address || '';
      document.getElementById('setting-instagram').value = data.instagram || '';
      document.getElementById('setting-facebook').value = data.facebook || '';
      document.getElementById('setting-tiktok').value = data.tiktok || '';

      // Cloudinary configuration fields
      const cloudNameInput = document.getElementById('setting-cloud-name');
      const uploadPresetInput = document.getElementById('setting-upload-preset');
      if (cloudNameInput && window.TOMEA_CONFIG) {
        cloudNameInput.value = data.cloudinaryCloudName || window.TOMEA_CONFIG.cloudinary.cloudName || '';
      }
      if (uploadPresetInput && window.TOMEA_CONFIG) {
        uploadPresetInput.value = data.cloudinaryUploadPreset || window.TOMEA_CONFIG.cloudinary.uploadPreset || '';
      }
    } catch (err) {
      console.error('[TOMÉA Settings] Error loading settings:', err);
      Utils.showToast('Failed to load settings.', 'error');
    }
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('btn-save-settings');
      saveBtn.disabled = true;
      saveBtn.innerHTML = 'Saving Brand Settings...';

      try {
        const rawWa = document.getElementById('setting-wa-number').value.trim();
        const cleanWa = rawWa.replace(/[^0-9]/g, '');

        if (!cleanWa || cleanWa.length < 9) {
          throw new Error('Please enter a valid WhatsApp phone number with country code (e.g. 2348000000000).');
        }

        const payload = {
          brandName: document.getElementById('setting-brand-name').value.trim() || 'TOMÉA PERFUMES',
          tagline: document.getElementById('setting-tagline').value.trim(),
          whatsappNumber: cleanWa,
          currency: document.getElementById('setting-currency').value.trim() || '₦',
          currencyCode: document.getElementById('setting-currency-code').value.trim() || 'NGN',
          email: document.getElementById('setting-email').value.trim(),
          phone: document.getElementById('setting-phone').value.trim(),
          address: document.getElementById('setting-address').value.trim(),
          instagram: document.getElementById('setting-instagram').value.trim(),
          facebook: document.getElementById('setting-facebook').value.trim(),
          tiktok: document.getElementById('setting-tiktok').value.trim(),
          cloudinaryCloudName: document.getElementById('setting-cloud-name')?.value.trim() || '',
          cloudinaryUploadPreset: document.getElementById('setting-upload-preset')?.value.trim() || ''
        };

        // If Cloudinary credentials were updated in settings, reflect in global runtime
        if (window.TOMEA_CONFIG) {
          if (payload.cloudinaryCloudName) window.TOMEA_CONFIG.cloudinary.cloudName = payload.cloudinaryCloudName;
          if (payload.cloudinaryUploadPreset) window.TOMEA_CONFIG.cloudinary.uploadPreset = payload.cloudinaryUploadPreset;
        }

        await window.DB.saveSettings(payload);
        Utils.showToast('Settings and WhatsApp ordering number updated successfully.', 'success');
      } catch (err) {
        console.error('[TOMÉA Settings] Save error:', err);
        Utils.showToast(err.message || 'Failed to save settings.', 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Save Settings';
      }
    });
  }

  // Restore Default Brand Guideline Seed Button
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      const confirmed = await Utils.confirm(
        'This will reset products, copy, and settings back to the official TOMÉA Brand Guideline original seed. Proceed?',
        { title: 'Reset to Brand Guideline Seed', confirmText: 'Reset Everything' }
      );
      if (confirmed) {
        window.DB.resetToInitialBrandSeed();
        Utils.showToast('Reset to original Brand Guideline seed successfully.', 'success');
        setTimeout(() => window.location.reload(), 800);
      }
    });
  }

  await loadSettings();
});
