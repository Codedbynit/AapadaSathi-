/**
 * AapadaSathi Scroll Observer Utility
 * Smooth scroll-triggered reveal animations for cards and sections.
 * Guarantees that below-hero cards (such as the quick status strip) remain hidden
 * until the user actively scrolls into them.
 */

export class ScrollObserver {
  static observer = null;
  static handleScroll = null;

  static init() {
    if (this.observer) {
      this.observer.disconnect();
    }

    // Set rootMargin so elements reveal smoothly as soon as they approach or enter viewport on scroll
    const options = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // If page is at scroll top (window.scrollY < 80), do not reveal below-hero status cards until scroll starts!
          if (window.scrollY < 80 && entry.target.classList.contains('status-stat-card')) {
            return;
          }
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, options);

    if (this.handleScroll) {
      window.removeEventListener('scroll', this.handleScroll);
    }
    this.handleScroll = () => {
      if (window.scrollY > 40) {
        document.querySelectorAll('.status-stat-card.scroll-reveal:not(.is-revealed)').forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight - 20) {
            el.classList.add('is-revealed');
            if (this.observer) this.observer.unobserve(el);
          }
        });
      }
    };
    window.addEventListener('scroll', this.handleScroll, { passive: true });

    this.refresh();
  }

  static refresh() {
    if (!this.observer) return;

    // Target below-hero cards, steps, factors, metrics, and sections
    const elements = document.querySelectorAll(`
      .status-stat-card,
      .step-card,
      .factor-card,
      .impact-card,
      .alert-item-card,
      .trust-card,
      .checklist-item,
      .priority-table-wrapper
    `);

    elements.forEach((el, index) => {
      // Add base animation class
      el.classList.add('scroll-reveal');

      // Add subtle staggered delays for grids
      const staggerIndex = (index % 4) + 1;
      el.classList.add(`scroll-stagger-${staggerIndex}`);

      // If user has already scrolled past, reveal immediately if within view.
      // If user is at the top (scrollY < 120), keep them hidden and strictly observe on scroll!
      if (window.scrollY > 120) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          el.classList.add('is-revealed');
          return;
        }
      }

      // Observe via IntersectionObserver
      this.observer.observe(el);
    });
  }
}
