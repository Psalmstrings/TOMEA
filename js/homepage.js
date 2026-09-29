/**
 * TOMÉA PERFUMES - Homepage Controller
 * 
 * Dynamically loads and renders Homepage CMS content and Featured Perfume Collection.
 */

document.addEventListener('DOMContentLoaded', async () => {
  await loadHomepageContent();
  await loadFeaturedProducts();
  initFragranceNotesExplorer();
});

async function loadHomepageContent() {
  if (!window.DB) return;
  try {
    const content = await window.DB.getHomepageContent();
    if (!content) return;

    // Hero Section elements
    const heroHeading = document.getElementById('hero-heading');
    const heroSubtitle = document.getElementById('hero-subtitle');
    const heroTagline = document.getElementById('hero-tagline');
    const heroBg = document.getElementById('hero-bg-image');
    const heroPrimaryCta = document.getElementById('hero-primary-cta');
    const heroSecondaryCta = document.getElementById('hero-secondary-cta');

    if (heroHeading && content.heroHeading) heroHeading.textContent = content.heroHeading;
    if (heroSubtitle && content.heroSubtitle) heroSubtitle.textContent = content.heroSubtitle;
    if (heroTagline && content.heroTagline) heroTagline.textContent = content.heroTagline;
    if (heroBg && content.heroImage) heroBg.src = content.heroImage;
    if (heroPrimaryCta && content.heroPrimaryCtaText) heroPrimaryCta.textContent = content.heroPrimaryCtaText;
    if (heroSecondaryCta && content.heroSecondaryCtaText) heroSecondaryCta.textContent = content.heroSecondaryCtaText;

    // Intro Section
    const introPretitle = document.getElementById('intro-pretitle');
    const introTitle = document.getElementById('intro-title');
    const introP1 = document.getElementById('intro-p1');
    const introP2 = document.getElementById('intro-p2');

    if (introPretitle && content.introPretitle) introPretitle.textContent = content.introPretitle;
    if (introTitle && content.introTitle) introTitle.textContent = content.introTitle;
    if (introP1 && content.introParagraph1) introP1.textContent = content.introParagraph1;
    if (introP2 && content.introParagraph2) introP2.textContent = content.introParagraph2;

    // Vision & Mission
    const visionTitle = document.getElementById('vision-title');
    const visionText = document.getElementById('vision-text');
    const missionTitle = document.getElementById('mission-title');
    const missionText = document.getElementById('mission-text');

    if (visionTitle && content.visionTitle) visionTitle.textContent = content.visionTitle;
    if (visionText && content.visionText) visionText.textContent = content.visionText;
    if (missionTitle && content.missionTitle) missionTitle.textContent = content.missionTitle;
    if (missionText && content.missionText) missionText.textContent = content.missionText;

    // Final CTA
    const finalCtaHeading = document.getElementById('final-cta-heading');
    const finalCtaSubtitle = document.getElementById('final-cta-subtitle');
    const finalCtaBtn = document.getElementById('final-cta-btn');

    if (finalCtaHeading && content.finalCtaHeading) finalCtaHeading.textContent = content.finalCtaHeading;
    if (finalCtaSubtitle && content.finalCtaSubtitle) finalCtaSubtitle.textContent = content.finalCtaSubtitle;
    if (finalCtaBtn && content.finalCtaButtonText) finalCtaBtn.textContent = content.finalCtaButtonText;

  } catch (err) {
    console.warn('[TOMÉA] Error populating homepage content:', err);
  }
}

async function loadFeaturedProducts() {
  const container = document.getElementById('featured-products-grid');
  if (!container) return;

  try {
    const products = await window.DB.getProducts({ onlyActive: true, onlyFeatured: true });
    
    if (!products || products.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p class="empty-text">The collection is currently being updated by the Maison.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = products.map((product, index) => {
      const primaryImg = product.primaryImage || (product.images && product.images[0]) || 'assets/images/bottle-lorigine.jpg';
      const secondaryImg = (product.images && product.images[1]) || product.campaignImage || primaryImg;
      const formattedPrice = Utils.formatCurrency(product.price);
      const delay = (index * 0.15).toFixed(2);

      return `
        <article class="product-card reveal-on-scroll" style="transition-delay: ${delay}s">
          <div class="product-card-media-wrapper">
            <a href="product.html?id=${product.id || product.slug}" class="product-card-image-link" aria-label="View ${Utils.escapeHtml(product.name)}">
              <img 
                src="${primaryImg}" 
                alt="${Utils.escapeHtml(product.name)} Extrait de Parfum Bottle" 
                class="product-card-image primary-img"
                loading="lazy"
              />
              ${secondaryImg !== primaryImg ? `
                <img 
                  src="${secondaryImg}" 
                  alt="${Utils.escapeHtml(product.name)} Editorial Campaign" 
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
                <span>${product.isOutOfStock ? 'Sold Out' : 'Order via WhatsApp'}</span>
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
  } catch (err) {
    console.error('[TOMÉA] Error loading featured products:', err);
    container.innerHTML = `<p class="error-text">Unable to load the collection. Please refresh or contact concierge.</p>`;
  }
}

/**
 * Visual Fragrance Notes Explorer (Top, Heart, Base tabs for each signature scent)
 */
function initFragranceNotesExplorer() {
  const tabs = document.querySelectorAll('.fragrance-tab-btn');
  const panels = document.querySelectorAll('.fragrance-notes-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target');
      
      tabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => p.classList.remove('is-active'));

      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('is-active');
      }
    });
  });
}
