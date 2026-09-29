/**
 * TOMÉA PERFUMES - Admin Product Management Controller
 * 
 * Manages full CRUD operations for fragrances, Cloudinary image uploads,
 * dynamic olfactory notes builder, and inventory toggles.
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.Auth) window.Auth.requireAuth();

  const productTableBody = document.getElementById('admin-products-table-body');
  const searchInput = document.getElementById('admin-product-search');
  const filterSelect = document.getElementById('admin-product-filter');
  const openAddModalBtn = document.getElementById('btn-open-add-product');
  const productModal = document.getElementById('admin-product-modal');
  const closeModalBtns = document.querySelectorAll('.js-close-product-modal');
  const productForm = document.getElementById('admin-product-form');

  let allProducts = [];
  let currentImages = [];
  let currentTopNotes = [];
  let currentHeartNotes = [];
  let currentBaseNotes = [];
  let editingProductId = null;

  // Load products list
  async function loadProducts() {
    if (!productTableBody || !window.DB) return;
    try {
      allProducts = await window.DB.getProducts();
      renderProductTable();
    } catch (err) {
      console.error('[TOMÉA Admin] Error loading products:', err);
      productTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Failed to load products.</td></tr>`;
    }
  }

  function renderProductTable() {
    let list = [...allProducts];

    // Filter
    const filter = filterSelect ? filterSelect.value : 'all';
    if (filter === 'active') list = list.filter(p => p.isActive);
    if (filter === 'draft') list = list.filter(p => !p.isActive);
    if (filter === 'featured') list = list.filter(p => p.isFeatured);
    if (filter === 'outofstock') list = list.filter(p => p.isOutOfStock);

    // Search
    const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
    if (q) {
      list = list.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.fragranceFamily && p.fragranceFamily.toLowerCase().includes(q))
      );
    }

    if (list.length === 0) {
      productTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4">
            <p class="text-muted">No fragrances found matching the criteria.</p>
          </td>
        </tr>
      `;
      return;
    }

    productTableBody.innerHTML = list.map(prod => {
      const primaryImg = prod.primaryImage || (prod.images && prod.images[0]) || 'assets/images/bottle-lorigine.jpg';
      return `
        <tr data-id="${prod.id}">
          <td>
            <div class="table-product-cell">
              <img src="${primaryImg}" alt="${Utils.escapeHtml(prod.name)}" class="table-thumb" />
              <div>
                <a href="../product.html?id=${prod.id || prod.slug}" target="_blank" class="table-product-name">
                  ${Utils.escapeHtml(prod.name)}
                </a>
                <span class="subtext">${Utils.escapeHtml(prod.size || '50ml')} &bull; ${Utils.escapeHtml(prod.concentration || 'Extrait')}</span>
              </div>
            </div>
          </td>
          <td>${Utils.escapeHtml(prod.fragranceFamily || 'N/A')}</td>
          <td><strong>${Utils.formatCurrency(prod.price)}</strong></td>
          <td>
            <button class="status-toggle-btn ${prod.isActive ? 'is-active' : ''}" data-action="toggle-active" data-id="${prod.id}" title="Toggle Active">
              ${prod.isActive ? 'Active' : 'Draft'}
            </button>
          </td>
          <td>
            <button class="featured-star-btn ${prod.isFeatured ? 'is-featured' : ''}" data-action="toggle-featured" data-id="${prod.id}" title="Toggle Featured">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${prod.isFeatured ? '#C5A059' : 'none'}" stroke="${prod.isFeatured ? '#C5A059' : 'currentColor'}" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
          </td>
          <td>
            <span class="badge ${prod.isOutOfStock ? 'badge-danger' : 'badge-success'}">
              ${prod.isOutOfStock ? 'Sold Out' : 'In Stock'}
            </span>
          </td>
          <td class="text-right">
            <div class="table-actions">
              <button class="btn btn-sm btn-secondary" data-action="edit-product" data-id="${prod.id}">Edit</button>
              <button class="btn btn-sm btn-danger-outline" data-action="delete-product" data-id="${prod.id}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Search & Filter event handlers
  if (searchInput) {
    searchInput.addEventListener('input', Utils.debounce(renderProductTable, 200));
  }
  if (filterSelect) {
    filterSelect.addEventListener('change', renderProductTable);
  }

  // Quick Action delegation (table clicks)
  if (productTableBody) {
    productTableBody.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      const prod = allProducts.find(p => p.id === id);
      if (!prod) return;

      if (action === 'toggle-active') {
        prod.isActive = !prod.isActive;
        await window.DB.saveProduct(prod);
        Utils.showToast(`${prod.name} marked as ${prod.isActive ? 'Active' : 'Draft'}.`, 'success');
        renderProductTable();
      } else if (action === 'toggle-featured') {
        prod.isFeatured = !prod.isFeatured;
        await window.DB.saveProduct(prod);
        Utils.showToast(`${prod.name} ${prod.isFeatured ? 'featured on homepage' : 'unfeatured'}.`, 'success');
        renderProductTable();
      } else if (action === 'edit-product') {
        openEditModal(prod);
      } else if (action === 'delete-product') {
        const confirmed = await Utils.confirm(
          `Are you sure you want to permanently delete "${prod.name}" from the TOMÉA collection?`,
          { title: "Delete Fragrance", confirmText: "Delete Fragrance" }
        );
        if (confirmed) {
          await window.DB.deleteProduct(prod.id);
          Utils.showToast(`"${prod.name}" has been deleted.`, 'info');
          await loadProducts();
        }
      }
    });
  }

  // Modal Open / Close
  function openModal(title = "Add New Fragrance") {
    document.getElementById('product-modal-title').textContent = title;
    productModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    productModal.classList.remove('is-open');
    document.body.style.overflow = '';
    editingProductId = null;
    productForm.reset();
    currentImages = [];
    currentTopNotes = [];
    currentHeartNotes = [];
    currentBaseNotes = [];
    renderImageGalleryPreview();
    renderNotesTags();
  }

  if (openAddModalBtn) {
    openAddModalBtn.addEventListener('click', () => {
      editingProductId = null;
      productForm.reset();
      currentImages = ['assets/images/bottle-lorigine.jpg'];
      currentTopNotes = [];
      currentHeartNotes = [];
      currentBaseNotes = [];
      renderImageGalleryPreview();
      renderNotesTags();
      openModal("Add New Fragrance");
    });
  }

  closeModalBtns.forEach(btn => btn.addEventListener('click', closeModal));

  // Edit Product Modal
  function openEditModal(prod) {
    editingProductId = prod.id;
    document.getElementById('prod-name').value = prod.name || '';
    document.getElementById('prod-slug').value = prod.slug || '';
    document.getElementById('prod-subtitle').value = prod.subtitle || '';
    document.getElementById('prod-price').value = prod.price || '';
    document.getElementById('prod-compare-price').value = prod.compareAtPrice || '';
    document.getElementById('prod-concentration').value = prod.concentration || 'Extrait de Parfum';
    document.getElementById('prod-size').value = prod.size || '50ml / 1.7 FL. OZ.';
    document.getElementById('prod-family').value = prod.fragranceFamily || 'Woody Aromatic';
    document.getElementById('prod-short-desc').value = prod.shortDescription || '';
    document.getElementById('prod-full-desc').value = prod.fullDescription || '';
    document.getElementById('prod-story').value = prod.story || '';
    document.getElementById('prod-display-order').value = prod.displayOrder || 1;
    document.getElementById('prod-active').checked = !!prod.isActive;
    document.getElementById('prod-featured').checked = !!prod.isFeatured;
    document.getElementById('prod-outofstock').checked = !!prod.isOutOfStock;

    currentImages = (prod.images && prod.images.length) ? [...prod.images] : [prod.primaryImage || 'assets/images/bottle-lorigine.jpg'];
    currentTopNotes = prod.topNotes ? [...prod.topNotes] : [];
    currentHeartNotes = prod.heartNotes ? [...prod.heartNotes] : [];
    currentBaseNotes = prod.baseNotes ? [...prod.baseNotes] : [];

    renderImageGalleryPreview();
    renderNotesTags();
    openModal(`Edit ${prod.name}`);
  }

  // Dynamic Notes Tags Builders
  function renderNotesTags() {
    renderTagList('top-notes-tags', currentTopNotes, (idx) => {
      currentTopNotes.splice(idx, 1);
      renderNotesTags();
    });
    renderTagList('heart-notes-tags', currentHeartNotes, (idx) => {
      currentHeartNotes.splice(idx, 1);
      renderNotesTags();
    });
    renderTagList('base-notes-tags', currentBaseNotes, (idx) => {
      currentBaseNotes.splice(idx, 1);
      renderNotesTags();
    });
  }

  function renderTagList(containerId, list, onRemove) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = list.map((item, idx) => `
      <span class="note-pill-tag">
        ${Utils.escapeHtml(item)}
        <button type="button" class="remove-tag-btn" data-index="${idx}">&times;</button>
      </span>
    `).join('');

    el.querySelectorAll('.remove-tag-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.getAttribute('data-index'), 10);
        onRemove(i);
      });
    });
  }

  // Attach Add Note button triggers
  ['top', 'heart', 'base'].forEach(type => {
    const input = document.getElementById(`prod-add-${type}-input`);
    const btn = document.getElementById(`btn-add-${type}-note`);

    const addNote = () => {
      if (!input) return;
      const val = input.value.trim();
      if (val) {
        if (type === 'top') currentTopNotes.push(val);
        if (type === 'heart') currentHeartNotes.push(val);
        if (type === 'base') currentBaseNotes.push(val);
        input.value = '';
        renderNotesTags();
      }
    };

    if (btn) btn.addEventListener('click', addNote);
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addNote();
        }
      });
    }
  });

  // Images Preview & Cloudinary Upload UI
  function renderImageGalleryPreview() {
    const previewContainer = document.getElementById('product-images-preview-grid');
    if (!previewContainer) return;

    if (currentImages.length === 0) {
      previewContainer.innerHTML = `<p class="text-muted text-sm">No images attached. Add or upload at least one image.</p>`;
      return;
    }

    previewContainer.innerHTML = currentImages.map((url, idx) => `
      <div class="image-preview-item ${idx === 0 ? 'is-primary' : ''}">
        <img src="${url}" alt="Preview ${idx + 1}" />
        <div class="image-preview-overlay">
          ${idx === 0 ? '<span class="primary-tag">Primary</span>' : `
            <button type="button" class="btn-make-primary" data-index="${idx}" title="Set as primary image">Make Primary</button>
          `}
          <button type="button" class="btn-remove-image" data-index="${idx}" title="Remove image">&times;</button>
        </div>
      </div>
    `).join('');

    previewContainer.querySelectorAll('.btn-make-primary').forEach(b => {
      b.addEventListener('click', () => {
        const idx = parseInt(b.getAttribute('data-index'), 10);
        const item = currentImages.splice(idx, 1)[0];
        currentImages.unshift(item);
        renderImageGalleryPreview();
      });
    });

    previewContainer.querySelectorAll('.btn-remove-image').forEach(b => {
      b.addEventListener('click', () => {
        const idx = parseInt(b.getAttribute('data-index'), 10);
        currentImages.splice(idx, 1);
        renderImageGalleryPreview();
      });
    });
  }

  // Cloudinary File Input & Drag/Drop
  const fileDropzone = document.getElementById('cloudinary-dropzone');
  const fileInput = document.getElementById('cloudinary-file-input');
  const uploadProgress = document.getElementById('cloudinary-upload-progress');
  const uploadProgressBar = document.getElementById('cloudinary-progress-bar');
  const uploadStatusText = document.getElementById('cloudinary-status-text');

  if (fileDropzone && fileInput) {
    fileDropzone.addEventListener('click', () => fileInput.click());

    fileDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileDropzone.classList.add('is-dragover');
    });

    fileDropzone.addEventListener('dragleave', () => {
      fileDropzone.classList.remove('is-dragover');
    });

    fileDropzone.addEventListener('drop', async (e) => {
      e.preventDefault();
      fileDropzone.classList.remove('is-dragover');
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        await handleImageUpload(files[0]);
      }
    });

    fileInput.addEventListener('change', async () => {
      if (fileInput.files && fileInput.files.length > 0) {
        await handleImageUpload(fileInput.files[0]);
        fileInput.value = '';
      }
    });
  }

  async function handleImageUpload(file) {
    if (!window.Cloudinary) return;
    try {
      if (uploadProgress) uploadProgress.classList.remove('d-none');
      if (uploadStatusText) uploadStatusText.textContent = `Uploading ${file.name}...`;

      const secureUrl = await window.Cloudinary.uploadImage(file, (percent) => {
        if (uploadProgressBar) uploadProgressBar.style.width = `${percent}%`;
        if (uploadStatusText) uploadStatusText.textContent = `Uploading to Cloudinary: ${percent}%`;
      });

      currentImages.push(secureUrl);
      renderImageGalleryPreview();
      Utils.showToast('Image uploaded and linked successfully.', 'success');
    } catch (err) {
      console.error('[TOMÉA Cloudinary] Upload error:', err);
      Utils.showToast(err.message || 'Image upload failed.', 'error');
    } finally {
      if (uploadProgress) uploadProgress.classList.add('d-none');
      if (uploadProgressBar) uploadProgressBar.style.width = '0%';
    }
  }

  // Brand Asset Library Quick Picker Modal
  const openLibraryBtn = document.getElementById('btn-open-brand-library');
  const libraryModal = document.getElementById('brand-library-modal');
  const libraryGrid = document.getElementById('brand-library-grid');
  const closeLibraryBtns = document.querySelectorAll('.js-close-library-modal');

  if (openLibraryBtn && libraryModal && window.Cloudinary) {
    openLibraryBtn.addEventListener('click', () => {
      const assets = window.Cloudinary.getBrandAssetLibrary();
      libraryGrid.innerHTML = assets.map(item => `
        <div class="library-item" data-url="${item.url}">
          <img src="${item.url}" alt="${item.label}" loading="lazy" />
          <span class="library-label">${item.label}</span>
        </div>
      `).join('');

      libraryGrid.querySelectorAll('.library-item').forEach(item => {
        item.addEventListener('click', () => {
          const url = item.getAttribute('data-url');
          if (url && !currentImages.includes(url)) {
            currentImages.push(url);
            renderImageGalleryPreview();
            Utils.showToast('Asset added to fragrance gallery.', 'success');
          }
          libraryModal.classList.remove('is-open');
        });
      });

      libraryModal.classList.add('is-open');
    });

    closeLibraryBtns.forEach(b => b.addEventListener('click', () => libraryModal.classList.remove('is-open')));
  }

  // Form Submit (Save Product to Firestore)
  if (productForm) {
    productForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('btn-save-product');
      saveBtn.disabled = true;
      saveBtn.innerHTML = 'Saving to Maison Catalog...';

      try {
        const name = document.getElementById('prod-name').value.trim();
        const price = parseFloat(document.getElementById('prod-price').value);

        if (!name || isNaN(price)) {
          throw new Error('Product Name and a valid Price are required.');
        }

        const productData = {
          id: editingProductId,
          name,
          slug: document.getElementById('prod-slug').value.trim() || Utils.slugify(name),
          subtitle: document.getElementById('prod-subtitle').value.trim(),
          price,
          compareAtPrice: parseFloat(document.getElementById('prod-compare-price').value) || null,
          concentration: document.getElementById('prod-concentration').value.trim() || 'Extrait de Parfum',
          size: document.getElementById('prod-size').value.trim() || '50ml / 1.7 FL. OZ.',
          fragranceFamily: document.getElementById('prod-family').value.trim() || 'Woody Aromatic',
          shortDescription: document.getElementById('prod-short-desc').value.trim(),
          fullDescription: document.getElementById('prod-full-desc').value.trim(),
          story: document.getElementById('prod-story').value.trim(),
          displayOrder: parseInt(document.getElementById('prod-display-order').value || '1', 10),
          isActive: document.getElementById('prod-active').checked,
          isFeatured: document.getElementById('prod-featured').checked,
          isOutOfStock: document.getElementById('prod-outofstock').checked,
          images: currentImages.length > 0 ? currentImages : ['assets/images/bottle-lorigine.jpg'],
          primaryImage: currentImages[0] || 'assets/images/bottle-lorigine.jpg',
          campaignImage: currentImages[1] || currentImages[0] || 'assets/images/bottle-lorigine.jpg',
          topNotes: currentTopNotes,
          heartNotes: currentHeartNotes,
          baseNotes: currentBaseNotes
        };

        await window.DB.saveProduct(productData);
        Utils.showToast(`"${productData.name}" saved successfully.`, 'success');
        closeModal();
        await loadProducts();
      } catch (err) {
        console.error('[TOMÉA Admin] Save product error:', err);
        Utils.showToast(err.message || 'Failed to save product.', 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Save Fragrance';
      }
    });
  }

  // Initial load
  await loadProducts();

  // If URL has ?edit=ID, auto-open editor
  const urlParams = new URLSearchParams(window.location.search);
  const editParam = urlParams.get('edit');
  if (editParam) {
    const prodToEdit = allProducts.find(p => p.id === editParam);
    if (prodToEdit) openEditModal(prodToEdit);
  }
});
