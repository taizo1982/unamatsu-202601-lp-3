/**
 * 近江鰻処 うな松 - Takeout LP Scripts
 */

(function() {
  'use strict';

  // ===================================
  // Intersection Observer for Scroll Animations
  // ===================================
  const initScrollAnimations = () => {
    // Elements to animate on scroll
    const animatedElements = document.querySelectorAll(
      '.benefit-card, .menu-item, .reason, .flow-step, .faq-item, .reservation-card'
    );

    // Reset animation state for elements (CSS handles initial animation)
    // For scroll-triggered animations, we'll use IntersectionObserver

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    };

    const observerCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          observer.unobserve(entry.target);
        }
      });
    };

    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(observerCallback, observerOptions);
      animatedElements.forEach(el => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
      });
    }
  };

  // ===================================
  // Smooth Scroll for Anchor Links
  // ===================================
  const initSmoothScroll = () => {
    const header = document.querySelector('.header');
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const headerHeight = header ? header.offsetHeight : 0;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  };

  // ===================================
  // Header Scroll Effect
  // ===================================
  const initHeaderEffect = () => {
    const header = document.querySelector('.header');
    if (!header) {
      return;
    }
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll <= 0) {
        header.classList.remove('header--hidden');
        return;
      }

      if (currentScroll > lastScroll && currentScroll > 100) {
        // Scrolling down
        header.classList.add('header--hidden');
      } else {
        // Scrolling up
        header.classList.remove('header--hidden');
      }

      lastScroll = currentScroll;
    }, { passive: true });
  };

  // ===================================
  // FAQ Accordion Enhancement
  // ===================================
  const initFaqAccordion = () => {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
      const summary = item.querySelector('summary');

      summary.addEventListener('click', (e) => {
        // Close other items (optional - for accordion behavior)
        // faqItems.forEach(otherItem => {
        //   if (otherItem !== item && otherItem.open) {
        //     otherItem.open = false;
        //   }
        // });
      });
    });
  };

  // ===================================
  // Conversion Tracking
  // ===================================
  const initConversionTracking = () => {
    const cvElements = document.querySelectorAll('[data-cv]');

    cvElements.forEach(el => {
      el.addEventListener('click', function() {
        const cvType = this.getAttribute('data-cv');
        const cvLabel = this.textContent.trim();

        // Google Analytics (if available)
        if (typeof gtag !== 'undefined') {
          gtag('event', 'click', {
            'event_category': 'conversion',
            'event_label': cvType,
            'value': cvLabel
          });
        }

        // Console log for debugging
        console.log(`CV Event: ${cvType} - ${cvLabel}`);
      });
    });
  };

  // ===================================
  // Lazy Loading Images (for future use)
  // ===================================
  const initLazyLoading = () => {
    // Native lazy loading is handled by loading="lazy" attribute
    // This is for fallback or enhanced lazy loading if needed

    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading supported
      const images = document.querySelectorAll('img[loading="lazy"]');
      images.forEach(img => {
        img.src = img.dataset.src || img.src;
      });
    } else {
      // Fallback for older browsers
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lozad.js/1.16.0/lozad.min.js';
      script.onload = () => {
        const observer = lozad();
        observer.observe();
      };
      document.body.appendChild(script);
    }
  };

  // ===================================
  // Performance: Preload critical resources
  // ===================================
  const preloadCriticalResources = () => {
    // Preload LINE page (for faster CTA response)
    const lineLink = document.createElement('link');
    lineLink.rel = 'preconnect';
    lineLink.href = 'https://page.line.me';
    document.head.appendChild(lineLink);
  };

  // ===================================
  // Mobile Menu (if needed in future)
  // ===================================
  const initMobileMenu = () => {
    // Currently header has minimal design
    // Add hamburger menu logic here if needed
  };

  // ===================================
  // Add CSS for header hide/show
  // ===================================
  const addDynamicStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
      .header {
        transition: transform 0.3s ease;
      }
      .header--hidden {
        transform: translateY(-100%);
      }
    `;
    document.head.appendChild(style);
  };

  // ===================================
  // Initialize All
  // ===================================
  const init = () => {
    addDynamicStyles();
    initScrollAnimations();
    initSmoothScroll();
    initHeaderEffect();
    initFaqAccordion();
    initConversionTracking();
    initLazyLoading();
    preloadCriticalResources();

    // Log initialization
    console.log('うな松 LP initialized');
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


/**
 * コンバージョン追跡コード（自動生成）
 */
(function() {
  // data-cv属性を持つ要素のクリックを追跡
  document.querySelectorAll('[data-cv]').forEach(function(el) {
    el.addEventListener('click', function() {
      var cvType = this.dataset.cv;
      var label = this.textContent || this.innerText;

      // Meta Pixel
      if (typeof fbq === 'function') {
        var metaEvent = cvType === 'tel' ? 'Contact' : 'Lead';
        fbq('track', metaEvent);
      }
    });
  });
})();