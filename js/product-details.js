/**
 * TOMÉA PERFUMES - Product Details Controller
 * 
 * Renders individual fragrance page, interactive gallery, olfactory pyramid,
 * dynamic SEO metadata, and personalized WhatsApp order triggers.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id') || params.get('slug');

  if (!productId) {
    // If no ID is provided, default to L'Origine or redirect
    loadProduct('lorigine');
    return;
  }

  await loadProduct(productId);
});

let currentProduct = null;
let currentQuantity = 1;

async function loadProduct(identifier) {
  const container = document.getElementById('product-details-container');
  if (!container || !window.DB) return;

  try {
    let product = await window.DB.getProductById(identifier);
    if (!product) {
      product = await window.DB.getProductBySlug(identifier);
    }

    if (!product) {
      container.innerHTML = `
        <div class="product-not-found">
          <h2 class="title">FRAGRANCE NOT FOUND</h2>
          <p class="subtitle">The creation you are seeking may be retired or unavailable.</p>
          <a href="collection.html" class="btn btn-primary">Discover the Collection</a>
        </div>
      `;
      return;
    }

    currentProduct = product;

    // Update SEO title and description
    document.title = `${product.name} | Extrait de Parfum | TOMÉA PERFUMES`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', `${product.name} Extrait de Parfum - ${product.shortDescription}`);
    }

    renderProductDetails(product, container);
    loadMaisonRecommendations(product.id);
  } catch (err) {
    console.error('[TOMÉA] Error loading product details:', err);
    container.innerHTML = `
      <div class="product-not-found">
        <h2>UNABLE TO LOAD FRAGRANCE</h2>
        <p>Please check your connection or contact our concierge.</p>
        <a href="collection.html" class="btn btn-secondary">Return to Collection</a>
      </div>
    `;
  }
}

function renderProductDetails(product, container) {
  const images = (product.images && product.images.length > 0) 
    ? product.images 
    : [product.primaryImage || 'assets/images/bottle-lorigine.jpg'];
  
  const mainImage = images[0];
  const formattedPrice = Utils.formatCurrency(product.price);

  container.innerHTML = `
    <div class="product-details-grid">
      <!-- Left: Visual Gallery -->
      <div class="product-gallery-section">
        <div class="product-gallery-main">
          <img 
            id="gallery-featured-img" 
            src="${mainImage}" 
            alt="${Utils.escapeHtml(product.name)}" 
            class="gallery-featured-image"
          />
        </div>
        ${images.length > 1 ? `
          <div class="product-gallery-thumbs" role="tablist">
            ${images.map((img, i) => `
              <button 
                class="gallery-thumb-btn ${i === 0 ? 'is-active' : ''}" 
                data-image="${img}"
                role="tab"
                aria-label="Thumbnail ${i + 1}"
              >
                <img src="${img}" alt="Thumbnail ${i + 1}" loading="lazy" />
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Right: Editorial Details & Ordering -->
      <div class="product-info-section">
        <nav class="product-breadcrumb" aria-label="Breadcrumb">
          <a href="index.html">Home</a>
          <span class="sep">/</span>
          <a href="collection.html">The Collection</a>
          <span class="sep">/</span>
          <span class="current">${Utils.escapeHtml(product.name)}</span>
        </nav>

        <span class="product-badge badge-concentration">${Utils.escapeHtml(product.concentration || 'Extrait de Parfum')}</span>

        <h1 class="product-title">${Utils.escapeHtml(product.name)}</h1>
        
        ${product.subtitle ? `
          <p class="product-subtitle">${Utils.escapeHtml(product.subtitle)}</p>
        ` : ''}

        <div class="product-price-bar">
          <span class="price-val" id="dynamic-price">${formattedPrice}</span>
          ${product.compareAtPrice && product.compareAtPrice > product.price ? `
            <span class="price-compare">${Utils.formatCurrency(product.compareAtPrice)}</span>
          ` : ''}
          <span class="stock-pill ${product.isOutOfStock ? 'stock-out' : 'stock-in'}">
            ${product.isOutOfStock ? 'Currently Waitlist Only' : 'Available for Delivery'}
          </span>
        </div>

        <div class="product-spec-pills">
          <div class="spec-pill">
            <span class="spec-label">Volume:</span>
            <span class="spec-val">${Utils.escapeHtml(product.size || '50ml / 1.7 FL. OZ.')}</span>
          </div>
          <div class="spec-pill">
            <span class="spec-label">Olfactory Family:</span>
            <span class="spec-val">${Utils.escapeHtml(product.fragranceFamily || 'Luxury Extrait')}</span>
          </div>
        </div>

        <div class="product-description-block">
          <p class="product-full-desc">${Utils.escapeHtml(product.fullDescription || product.shortDescription || '')}</p>
        </div>

        <!-- Olfactory Architecture (Pyramid) -->
        <div class="olfactory-pyramid-block">
          <h3 class="pyramid-heading">OLFACTORY ARCHITECTURE</h3>
          <div class="pyramid-levels">
            <div class="pyramid-level top-notes">
              <span class="level-badge">TOP</span>
              <div class="notes-content">
                ${(product.topNotes || []).map(n => `<span class="note-tag">${Utils.escapeHtml(n)}</span>`).join('')}
              </div>
            </div>

            <div class="pyramid-level heart-notes">
              <span class="level-badge">HEART</span>
              <div class="notes-content">
                ${(product.heartNotes || []).map(n => `<span class="note-tag">${Utils.escapeHtml(n)}</span>`).join('')}
              </div>
            </div>

            <div class="pyramid-level base-notes">
              <span class="level-badge">BASE</span>
              <div class="notes-content">
                ${(product.baseNotes || []).map(n => `<span class="note-tag">${Utils.escapeHtml(n)}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Purchase & WhatsApp Action -->
        <div class="product-purchase-box">
          <div class="qty-selector-row">
            <label for="product-qty-input" class="qty-label">Quantity</label>
            <div class="qty-control">
              <button class="qty-btn" id="qty-minus" aria-label="Decrease quantity">&minus;</button>
              <input type="number" id="product-qty-input" value="1" min="1" max="10" readonly />
              <button class="qty-btn" id="qty-plus" aria-label="Increase quantity">&plus;</button>
            </div>
          </div>

          <!-- Affiliate Discount Code Module -->
          <div class="product-discount-wrapper" id="product-discount-block">
            <div class="discount-input-header">
              <span class="discount-title">Have a discount code?</span>
            </div>
            <div class="discount-input-group" id="discount-input-row">
              <div class="discount-input-box">
                <input 
                  type="text" 
                  id="affiliate-coupon-input" 
                  placeholder="e.g. AMARA20" 
                  autocomplete="off" 
                  spellcheck="false"
                  aria-label="Enter affiliate discount code"
                />
              </div>
              <button type="button" class="btn btn-sm btn-discount-apply" id="btn-apply-coupon">
                APPLY
              </button>
            </div>
            <div class="discount-message" id="discount-feedback" role="status" aria-live="polite" style="display: none;"></div>

            <!-- Price Breakdown Summary -->
            <div class="order-pricing-breakdown" id="order-pricing-summary">
              <div class="pricing-row" id="row-original-subtotal">
                <span class="label">Original price</span>
                <span class="value" id="summary-subtotal">${formattedPrice}</span>
              </div>
              <div class="pricing-row discount-row" id="row-discount" style="display: none;">
                <span class="label" id="summary-discount-label">Discount</span>
                <span class="value" id="summary-discount-val">-₦0</span>
              </div>
              <div class="pricing-row total-row">
                <span class="label">Your price</span>
                <span class="value" id="summary-total">${formattedPrice}</span>
              </div>
            </div>
          </div>

          <button 
            class="btn btn-primary btn-order-large" 
            id="order-product-whatsapp-btn"
            ${product.isOutOfStock ? 'disabled' : ''}
          >
            <svg class="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.053-1.042-.047-.282-.07-1.144-.383-2.18-1.309-1.312-1.173-1.846-2.348-1.925-2.522-.079-.174-.537-.714-.537-1.362 0-.649.34-0.968.461-1.099.121-.131.265-.164.354-.164.088 0 .177.001.254.005.081.004.19-.031.297.226.11.265.376.917.409.985.033.069.055.15.011.238-.044.088-.066.143-.132.22-.066.077-.139.172-.199.232-.066.066-.135.138-.058.271.077.133.344.568.739.919.508.453.937.593 1.07.659.133.066.21.055.288-.033.077-.089.332-.387.42-.519.088-.133.177-.11.299-.066.121.044.774.365.907.432.133.066.221.099.254.154.033.056.033.322-.111.727z"/>
            </svg>
            <span>${product.isOutOfStock ? 'Join Private Waitlist' : 'Order Now'}</span>
          </button>

          <p class="order-guarantee-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Direct communication with the TOMÉA concierge. Fast nationwide delivery.
          </p>
        </div>

        ${product.story ? `
          <div class="product-editorial-story">
            <h4 class="story-title">THE STORY</h4>
            <p class="story-body">${Utils.escapeHtml(product.story)}</p>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  // Gallery thumbnail click handler
  const featuredImg = document.getElementById('gallery-featured-img');
  const thumbBtns = container.querySelectorAll('.gallery-thumb-btn');

  thumbBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      thumbBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const newSrc = btn.getAttribute('data-image');
      if (featuredImg && newSrc) {
        featuredImg.style.opacity = '0.3';
        setTimeout(() => {
          featuredImg.src = newSrc;
          featuredImg.style.opacity = '1';
        }, 150);
      }
    });
  });

  // State for active discount attribution
  let activeDiscount = null;

  // UI Elements
  const qtyInput = document.getElementById('product-qty-input');
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');
  const priceDisplay = document.getElementById('dynamic-price');
  
  const couponInput = document.getElementById('affiliate-coupon-input');
  const applyCouponBtn = document.getElementById('btn-apply-coupon');
  const feedbackEl = document.getElementById('discount-feedback');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const rowDiscount = document.getElementById('row-discount');
  const summaryDiscountLabel = document.getElementById('summary-discount-label');
  const summaryDiscountVal = document.getElementById('summary-discount-val');
  const summaryTotal = document.getElementById('summary-total');

  /**
   * Recalculate price breakdown smoothly
   */
  function updatePriceBreakdown() {
    const originalSubtotal = product.price * currentQuantity;
    if (summarySubtotal) {
      summarySubtotal.textContent = Utils.formatCurrency(originalSubtotal);
    }

    if (activeDiscount && activeDiscount.discountPercent > 0) {
      const discountPercent = activeDiscount.discountPercent;
      const discountAmount = Math.round((originalSubtotal * discountPercent) / 100);
      const finalPrice = Math.max(0, originalSubtotal - discountAmount);

      if (rowDiscount) rowDiscount.style.display = 'flex';
      if (summaryDiscountLabel) {
        summaryDiscountLabel.textContent = `${discountPercent}% discount`;
      }
      if (summaryDiscountVal) {
        summaryDiscountVal.textContent = `-${Utils.formatCurrency(discountAmount)}`;
      }
      if (summaryTotal) {
        summaryTotal.textContent = Utils.formatCurrency(finalPrice);
      }
      if (priceDisplay) {
        priceDisplay.textContent = Utils.formatCurrency(finalPrice);
      }
    } else {
      if (rowDiscount) rowDiscount.style.display = 'none';
      if (summaryTotal) {
        summaryTotal.textContent = Utils.formatCurrency(originalSubtotal);
      }
      if (priceDisplay) {
        priceDisplay.textContent = Utils.formatCurrency(originalSubtotal);
      }
    }
  }

  function showDiscountMessage(type, messageHtml) {
    if (!feedbackEl) return;
    feedbackEl.className = `discount-message is-${type}`;
    feedbackEl.innerHTML = messageHtml;
    feedbackEl.style.display = 'flex';
  }

  function clearDiscountMessage() {
    if (!feedbackEl) return;
    feedbackEl.style.display = 'none';
    feedbackEl.innerHTML = '';
  }

  function setAppliedDiscountState(aff) {
    activeDiscount = aff;
    if (couponInput) {
      couponInput.value = aff.code;
    }
    showDiscountMessage('success', `
      <span>✓ <strong>${Utils.escapeHtml(aff.code)}</strong> applied (${aff.discountPercent}% discount)</span>
      <button type="button" class="btn-remove-discount" id="btn-remove-coupon" aria-label="Remove discount code">Remove</button>
    `);
    
    // Bind remove button
    const removeBtn = document.getElementById('btn-remove-coupon');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        activeDiscount = null;
        if (couponInput) couponInput.value = '';
        clearDiscountMessage();
        if (window.AffiliateService) {
          window.AffiliateService.clearAttribution();
        }
        updatePriceBreakdown();
      });
    }

    updatePriceBreakdown();
  }

  // Pre-load stored referral attribution if available (Part 4 & 6)
  if (window.AffiliateService && window.DB) {
    const storedAttribution = window.AffiliateService.getStoredAttribution();
    if (storedAttribution && (storedAttribution.code || storedAttribution.affiliateSlug)) {
      window.DB.validateAffiliate(storedAttribution.code || storedAttribution.affiliateSlug, false)
        .then(result => {
          if (result && result.valid && result.affiliate) {
            setAppliedDiscountState(result.affiliate);
          }
        })
        .catch(err => console.warn('[TOMÉA] Error validating pre-stored referral:', err));
    }
  }

  // Handle explicit coupon application
  async function handleApplyCoupon() {
    if (!couponInput) return;
    const rawCode = couponInput.value.trim();
    if (!rawCode) {
      showDiscountMessage('error', 'Please enter a discount code.');
      return;
    }

    applyCouponBtn.disabled = true;
    const originalBtnText = applyCouponBtn.textContent;
    applyCouponBtn.textContent = 'CHECKING...';

    if (window.AffiliateService) {
      const res = await window.AffiliateService.applyCode(rawCode);
      applyCouponBtn.disabled = false;
      applyCouponBtn.textContent = originalBtnText;

      if (res.success && res.affiliate) {
        setAppliedDiscountState(res.affiliate);
      } else {
        showDiscountMessage('error', res.error || 'This discount code is invalid or expired.');
        activeDiscount = null;
        updatePriceBreakdown();
      }
    } else {
      applyCouponBtn.disabled = false;
      applyCouponBtn.textContent = originalBtnText;
    }
  }

  if (applyCouponBtn) {
    applyCouponBtn.addEventListener('click', handleApplyCoupon);
  }

  if (couponInput) {
    couponInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleApplyCoupon();
      }
    });
  }

  // Quantity controls
  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.addEventListener('click', () => {
      if (currentQuantity > 1) {
        currentQuantity--;
        qtyInput.value = currentQuantity;
        updatePriceBreakdown();
      }
    });

    qtyPlus.addEventListener('click', () => {
      if (currentQuantity < 10) {
        currentQuantity++;
        qtyInput.value = currentQuantity;
        updatePriceBreakdown();
      }
    });
  }

  // Order button click
  const orderBtn = document.getElementById('order-product-whatsapp-btn');
  if (orderBtn) {
    orderBtn.addEventListener('click', async () => {
      let discountInfo = null;
      if (activeDiscount && activeDiscount.discountPercent > 0) {
        const subtotal = product.price * currentQuantity;
        const discountAmount = Math.round((subtotal * activeDiscount.discountPercent) / 100);
        const finalPrice = Math.max(0, subtotal - discountAmount);
        const commissionPercent = Number(activeDiscount.commissionPercent) || 0;
        const commissionAmount = Math.round((finalPrice * commissionPercent) / 100);

        discountInfo = {
          code: activeDiscount.code,
          percent: activeDiscount.discountPercent,
          discountAmount,
          finalPrice,
          affiliateId: activeDiscount.id || activeDiscount.affiliateId || '',
          affiliateName: activeDiscount.name || '',
          commissionPercent,
          commissionAmount
        };
      }

      await WhatsAppService.orderProduct(product, currentQuantity, discountInfo);
    });
  }
}

async function loadMaisonRecommendations(currentId) {
  const container = document.getElementById('recommendations-grid');
  if (!container || !window.DB) return;

  try {
    const products = await window.DB.getProducts({ onlyActive: true });
    const others = products.filter(p => p.id !== currentId).slice(0, 2);

    if (others.length === 0) {
      document.querySelector('.product-recommendations-section')?.classList.add('d-none');
      return;
    }

    container.innerHTML = others.map(prod => `
      <article class="product-card reveal-on-scroll">
        <div class="product-card-media-wrapper">
          <a href="product.html?id=${prod.id || prod.slug}">
            <img src="${prod.primaryImage || 'assets/images/bottle-lorigine.jpg'}" alt="${Utils.escapeHtml(prod.name)}" class="product-card-image" loading="lazy" />
          </a>
          <span class="product-badge badge-concentration">${Utils.escapeHtml(prod.concentration || 'Extrait de Parfum')}</span>
        </div>
        <div class="product-card-body">
          <span class="product-family">${Utils.escapeHtml(prod.fragranceFamily || '')}</span>
          <h3 class="product-card-title"><a href="product.html?id=${prod.id || prod.slug}">${Utils.escapeHtml(prod.name)}</a></h3>
          <div class="product-card-price-row">
            <span class="product-price">${Utils.formatCurrency(prod.price)}</span>
          </div>
          <div class="product-card-actions">
            <a href="product.html?id=${prod.id || prod.slug}" class="btn btn-secondary">Discover</a>
          </div>
        </div>
      </article>
    `).join('');

    if (window.reobserveScrollReveals) {
      window.reobserveScrollReveals();
    }
  } catch (e) {
    console.warn('[TOMÉA] Error loading recommendations:', e);
  }
}
