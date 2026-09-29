/**
 * TOMÉA PERFUMES - Animation & Micro-interaction Controller
 * 
 * Provides smooth scroll reveals, hero parallax, and preloader management.
 * Fully honours `prefers-reduced-motion: reduce`.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Preloader Dismissal
  const preloader = document.getElementById('tomea-preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('is-loaded');
        setTimeout(() => preloader.remove(), 700);
      }, prefersReducedMotion ? 50 : 450);
    });

    // Safety timeout in case window.load is delayed
    setTimeout(() => {
      if (document.body.contains(preloader)) {
        preloader.classList.add('is-loaded');
        setTimeout(() => preloader.remove(), 700);
      }
    }, 2000);
  }

  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
      el.classList.add('is-revealed');
    });
    return;
  }

  // 2. Scroll Reveal with IntersectionObserver
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.12
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    revealObserver.observe(el);
  });

  // Re-check dynamic items when new products load
  window.reobserveScrollReveals = () => {
    document.querySelectorAll('.reveal-on-scroll:not(.is-revealed)').forEach(el => {
      revealObserver.observe(el);
    });
  };

  // 3. Subtle Parallax on Hero Image
  const heroImage = document.querySelector('.hero-bg-media');
  if (heroImage) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroImage.style.transform = `scale(1.05) translateY(${scrollY * 0.18}px)`;
      }
    }, { passive: true });
  }
});
