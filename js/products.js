/**
 * TOMÉA PERFUMES - Collection & Shop Controller
 * 
 * Manages dynamic catalog loading, search, category filtering, and sorting.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const gridContainer = document.getElementById('collection-grid');
  const searchInput = document.getElementById('collection-search');
  const filterButtons = document.querySelectorAll('.collection-filter-btn');
  const sortSelect = document.getElementById('collection-sort');
  const countDisplay = document.getElementById('collection-count');

  let allProducts = [];
  let currentCategory = 'all';
  let currentSearch = '';
  let currentSort = 'default';

  // Populate dynamic category buttons from products
  function setupDynamicFilterButtons() {
    const filterContainer = document.querySelector('.col-filters');
    if (!filterContainer) return;

    // Extract unique fragrance families from all active products
    const families = new Set();
    allProducts.forEach(p => {
      if (p.fragranceFamily) {
        families.add(p.fragranceFamily.trim());
      }
    });

    let buttonsHtml = `<button class="col-filter-btn collection-filter-btn ${currentCategory === 'all' ? 'is-active' : ''}" data-category="all">All Fragrances</button>`;
    
    families.forEach(fam => {
      const isActive = currentCategory.toLowerCase() === fam.toLowerCase();
      buttonsHtml += `<button class="col-filter-btn collection-filter-btn ${isActive ? 'is-active' : ''}" data-category="${Utils.escapeHtml(fam)}">${Utils.escapeHtml(fam)}</button>`;
    });

    filterContainer.innerHTML = buttonsHtml;

    // Re-bind click handlers
    filterContainer.querySelectorAll('.collection-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterContainer.querySelectorAll('.collection-filter-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        currentCategory = btn.getAttribute('data-category') || 'all';
        applyFiltersAndRender();
      });
    });
  }

  // Load products from Firestore
  async function fetchCollection() {
    if (!gridContainer || !window.DB) return;
    try {
      allProducts = await window.DB.getProducts({ onlyActive: true });
      setupDynamicFilterButtons();
      applyFiltersAndRender();
      updateCollectionFooter();
    } catch (err) {
      console.error('[TOMÉA] Error fetching collection:', err);
      gridContainer.innerHTML = `
        <div class="empty-state">
          <p class="empty-text">Unable to load the collection at this moment. Please refresh the page.</p>
        </div>
      `;
    }
  }

  function updateCollectionFooter() {
    const headings = document.querySelectorAll('.footer-links-col .footer-heading');
    headings.forEach(heading => {
      if (heading.textContent.trim().toUpperCase() === 'CREATIONS') {
        const list = heading.nextElementSibling;
        if (list && list.tagName === 'UL') {
          list.innerHTML = allProducts.slice(0, 4).map(p => `
            <li><a href="product.html?id=${p.id || p.slug}">${Utils.escapeHtml(p.name)}</a></li>
          `).join('') + `<li><a href="collection.html">All Fragrances</a></li>`;
        }
      }
    });
  }

  function applyFiltersAndRender() {
    let filtered = [...allProducts];

    // 1. Search Query Filter
    if (currentSearch.trim()) {
      const q = currentSearch.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const nameMatch = p.name && p.name.toLowerCase().includes(q);
        const subtitleMatch = p.subtitle && p.subtitle.toLowerCase().includes(q);
        const familyMatch = p.fragranceFamily && p.fragranceFamily.toLowerCase().includes(q);
        const notesMatch = (p.topNotes || []).concat(p.heartNotes || []).concat(p.baseNotes || []).some(n => n.toLowerCase().includes(q));
        const descMatch = (p.shortDescription && p.shortDescription.toLowerCase().includes(q)) || (p.fullDescription && p.fullDescription.toLowerCase().includes(q));
        return nameMatch || subtitleMatch || familyMatch || notesMatch || descMatch;
      });
    }

    // 2. Category Filter
    if (currentCategory !== 'all') {
      const catLower = currentCategory.toLowerCase();
      filtered = filtered.filter(p => {
        return p.fragranceFamily && p.fragranceFamily.toLowerCase().includes(catLower);
      });
    }

    // 3. Sorting
    if (currentSort === 'price-asc') {
      filtered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (currentSort === 'price-desc') {
      filtered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else {
      // Default: display order
      filtered.sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
    }

    // Update count display
    if (countDisplay) {
      countDisplay.textContent = `${filtered.length} ${filtered.length === 1 ? 'Fragrance' : 'Fragrances'}`;
    }

    // Render Cards
    if (filtered.length === 0) {
      gridContainer.innerHTML = `
        <div class="empty-collection-state">
          <p class="empty-title">NO MATCHING FRAGRANCE FOUND</p>
          <p class="empty-desc">We could not find any creation matching "${Utils.escapeHtml(currentSearch || currentCategory)}".</p>
          <button class="btn btn-secondary" id="reset-filters-btn">Clear All Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('reset-filters-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          currentSearch = '';
          currentCategory = 'all';
          if (searchInput) searchInput.value = '';
          filterButtons.forEach(b => b.classList.toggle('is-active', b.getAttribute('data-category') === 'all'));
          applyFiltersAndRender();
        });
      }
      return;
    }

    gridContainer.innerHTML = filtered.map((product, idx) => {
      const primaryImg = product.primaryImage || (product.images && product.images[0]) || 'assets/images/bottle-lorigine.jpg';
      const secondaryImg = (product.images && product.images[1]) || product.campaignImage || primaryImg;
      const formattedPrice = Utils.formatCurrency(product.price);
      const delay = (idx * 0.1).toFixed(2);

      return `
        <article class="product-card reveal-on-scroll" style="transition-delay: ${delay}s">
          <div class="product-card-media-wrapper">
            <a href="product.html?id=${product.id || product.slug}" class="product-card-image-link" aria-label="Explore ${Utils.escapeHtml(product.name)}">
              <img 
                src="${primaryImg}" 
                alt="${Utils.escapeHtml(product.name)} Extrait de Parfum" 
                class="product-card-image primary-img"
                loading="lazy"
              />
              ${secondaryImg !== primaryImg ? `
                <img 
                  src="${secondaryImg}" 
                  alt="${Utils.escapeHtml(product.name)} Visual Story" 
                  class="product-card-image secondary-img"
                  loading="lazy"
                />
              ` : ''}
            </a>
            ${product.isOutOfStock ? `
              <span class="product-badge badge-out-of-stock">Waitlist Only</span>
            ` : `
              <span class="product-badge badge-concentration">${Utils.escapeHtml(product.concentration || 'Extrait de Parfum')}</span>
            `}
          </div>

          <div class="product-card-body">
            <div class="product-card-meta">
              <span class="product-family">${Utils.escapeHtml(product.fragranceFamily || 'Luxury Extrait')}</span>
              <span class="product-size">${Utils.escapeHtml(product.size || '50ml')}</span>
            </div>

            <h3 class="product-card-title">
              <a href="product.html?id=${product.id || product.slug}">${Utils.escapeHtml(product.name)}</a>
            </h3>

            <p class="product-card-desc">${Utils.escapeHtml(product.shortDescription || '')}</p>

            <div class="product-card-price-row">
              <span class="product-price">${formattedPrice}</span>
              ${product.compareAtPrice && product.compareAtPrice > product.price ? `
                <span class="product-compare-price">${Utils.formatCurrency(product.compareAtPrice)}</span>
              ` : ''}
            </div>

            <div class="product-card-actions">
              <button 
                class="btn btn-primary btn-order-wa" 
                data-action="order-whatsapp" 
                data-product-id="${product.id}"
                ${product.isOutOfStock ? 'disabled' : ''}
              >
                <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.053-1.042-.047-.282-.07-1.144-.383-2.18-1.309-1.312-1.173-1.846-2.348-1.925-2.522-.079-.174-.537-.714-.537-1.362 0-.649.34-0.968.461-1.099.121-.131.265-.164.354-.164.088 0 .177.001.254.005.081.004.19-.031.297.226.11.265.376.917.409.985.033.069.055.15.011.238-.044.088-.066.143-.132.22-.066.077-.139.172-.199.232-.066.066-.135.138-.058.271.077.133.344.568.739.919.508.453.937.593 1.07.659.133.066.21.055.288-.033.077-.089.332-.387.42-.519.088-.133.177-.11.299-.066.121.044.774.365.907.432.133.066.221.099.254.154.033.056.033.322-.111.727z"/>
                </svg>
                <span>${product.isOutOfStock ? 'Sold Out' : 'Order Now'}</span>
              </button>

              <a href="product.html?id=${product.id || product.slug}" class="btn btn-secondary btn-view-fragrance">
                <span>View Fragrance</span>
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    if (window.reobserveScrollReveals) {
      window.reobserveScrollReveals();
    }
  }

  // Event Listeners for Filters
  if (searchInput) {
    searchInput.addEventListener('input', Utils.debounce((e) => {
      currentSearch = e.target.value;
      applyFiltersAndRender();
    }, 250));
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentCategory = btn.getAttribute('data-category') || 'all';
      applyFiltersAndRender();
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      applyFiltersAndRender();
    });
  }

  // Initial Fetch
  fetchCollection();
});
