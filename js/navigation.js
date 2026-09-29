/**
 * TOMÉA PERFUMES - Navigation & Header Interaction
 */

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav-drawer');
  const mobileOverlay = document.querySelector('.mobile-nav-overlay');
  const mobileCloseBtn = document.querySelector('.mobile-nav-close');
  const navLinks = document.querySelectorAll('.nav-link');

  // 1. Sticky Header with Glassmorphism on Scroll
  const handleScroll = () => {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check

  // 2. Active Page Highlighting
  const currentPath = window.location.pathname;
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Check if matching current page
    const isCurrent = 
      (href === 'index.html' && (currentPath.endsWith('/') || currentPath.endsWith('index.html'))) ||
      (href !== 'index.html' && currentPath.endsWith(href));

    if (isCurrent) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
  });

  // 3. Mobile Navigation Drawer
  const openMobileMenu = () => {
    if (!mobileNav) return;
    document.body.classList.add('mobile-nav-open');
    mobileNav.classList.add('is-open');
    if (mobileOverlay) mobileOverlay.classList.add('is-open');
    if (mobileToggle) {
      mobileToggle.classList.add('is-active');
      mobileToggle.setAttribute('aria-expanded', 'true');
    }
  };

  const closeMobileMenu = () => {
    if (!mobileNav) return;
    document.body.classList.remove('mobile-nav-open');
    mobileNav.classList.remove('is-open');
    if (mobileOverlay) mobileOverlay.classList.remove('is-open');
    if (mobileToggle) {
      mobileToggle.classList.remove('is-active');
      mobileToggle.setAttribute('aria-expanded', 'false');
    }
  };

  if (mobileToggle) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileNav && mobileNav.classList.contains('is-open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener('click', closeMobileMenu);
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileMenu);
  }

  // Close mobile nav on link click
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('is-open')) {
      closeMobileMenu();
    }
  });
});
