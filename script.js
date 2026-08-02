/* ==========================================================================
   ANUSURI YASWANTH KUMAR — PORTFOLIO SCRIPT
   Handles: loader, theme toggle, nav behavior, scroll progress,
   scroll-reveal (Intersection Observer), timeline fill, counters,
   tech stack hover/tap descriptions, title rotator.
   ========================================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     1. LOADING SCREEN
     ------------------------------------------------------------------ */
  const loader = document.getElementById('loader');

  window.addEventListener('load', () => {
    // Small delay so the loading animation is perceptible, not jarring.
    setTimeout(() => {
      loader.classList.add('loader-hidden');
    }, 500);
  });

  /* ------------------------------------------------------------------
     2. THEME TOGGLE (dark / light) — persisted for the session
     ------------------------------------------------------------------ */
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');

  function applyTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
  }

  // Respect OS preference on first load, but allow manual override.
  let storedTheme = null;
  try {
    storedTheme = window.__portfolioTheme || null;
  } catch (e) {
    storedTheme = null;
  }

  if (storedTheme) {
    applyTheme(storedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    applyTheme('light');
  }

  themeToggle.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    const next = isLight ? 'dark' : 'light';
    applyTheme(next);
    window.__portfolioTheme = next; // in-memory only, no storage APIs
  });

  /* ------------------------------------------------------------------
     3. NAVBAR — blur on scroll + mobile toggle + active link highlight
     ------------------------------------------------------------------ */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const navLinkEls = document.querySelectorAll('[data-nav]');

  function handleNavbarScroll() {
    navbar.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  handleNavbarScroll();

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinkEls.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ------------------------------------------------------------------
     4. SCROLL PROGRESS INDICATOR
     ------------------------------------------------------------------ */
  const scrollProgress = document.getElementById('scroll-progress');

  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  }

  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        handleNavbarScroll();
        updateScrollProgress();
        updateActiveNavLink();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });
  updateScrollProgress();

  /* ------------------------------------------------------------------
     5. ACTIVE NAV HIGHLIGHTING (based on section in view)
     ------------------------------------------------------------------ */
  const sections = document.querySelectorAll('main section[id]');

  function updateActiveNavLink() {
    let currentId = '';
    const scrollPos = window.scrollY + window.innerHeight * 0.35;

    sections.forEach((section) => {
      if (scrollPos >= section.offsetTop) {
        currentId = section.id;
      }
    });

    navLinkEls.forEach((link) => {
      const isActive = link.getAttribute('href') === '#' + currentId;
      link.classList.toggle('active', isActive);
    });
  }
  updateActiveNavLink();

  /* ------------------------------------------------------------------
     6. SCROLL REVEAL (Intersection Observer) — fade in + slide up
     ------------------------------------------------------------------ */
  const revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ------------------------------------------------------------------
     7. EDUCATION TIMELINE — node activation on scroll
     ------------------------------------------------------------------ */
  const timelineItems = document.querySelectorAll('.timeline-item');

  const timelineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    },
    { threshold: 0.4 }
  );
  timelineItems.forEach((item) => timelineObserver.observe(item));

  /* ------------------------------------------------------------------
     8. COUNTER ANIMATION — animates numbers once when visible
     ------------------------------------------------------------------ */
  const counters = document.querySelectorAll('[data-count]');

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-count'));
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1400;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo for a satisfying settle
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = target * eased;
      el.textContent = current.toFixed(decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toFixed(decimals) + suffix;
      }
    }
    requestAnimationFrame(tick);
  }

  if (prefersReducedMotion) {
    counters.forEach((el) => {
      const target = parseFloat(el.getAttribute('data-count'));
      const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      const suffix = el.getAttribute('data-suffix') || '';
      el.textContent = target.toFixed(decimals) + suffix;
    });
  } else {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  }

  /* ------------------------------------------------------------------
     9. TECH STACK CANVAS — hover/tap reveals description
     ------------------------------------------------------------------ */
  const stackCells = document.querySelectorAll('.stack-cell');
  const descPanel = document.getElementById('stackDescPanel');
  const defaultDescText = descPanel ? descPanel.textContent : '';

  stackCells.forEach((cell) => {
    const desc = cell.getAttribute('data-desc');

    cell.addEventListener('mouseenter', () => {
      descPanel.textContent = desc;
      stackCells.forEach((c) => c.classList.remove('is-active'));
      cell.classList.add('is-active');
    });

    cell.addEventListener('focus', () => {
      descPanel.textContent = desc;
      stackCells.forEach((c) => c.classList.remove('is-active'));
      cell.classList.add('is-active');
    });

    cell.addEventListener('click', () => {
      descPanel.textContent = desc;
      stackCells.forEach((c) => c.classList.remove('is-active'));
      cell.classList.add('is-active');
    });
  });

  if (descPanel) {
    descPanel.addEventListener('mouseleave', () => {}); // panel stays put; no reset needed
  }
  const stackCanvas = document.querySelector('.stack-canvas');
  if (stackCanvas) {
    stackCanvas.addEventListener('mouseleave', () => {
      descPanel.textContent = defaultDescText;
      stackCells.forEach((c) => c.classList.remove('is-active'));
    });
  }

  /* ------------------------------------------------------------------
     10. HERO TITLE ROTATOR — cycles through the three professional titles
     ------------------------------------------------------------------ */
  const titles = [
    'Computer Science Engineering Student',
    'Aspiring Software Engineer',
    'Problem Solver'
  ];
  const rotatorEl = document.querySelector('[data-title]');
  let titleIndex = 0;

  if (rotatorEl && !prefersReducedMotion) {
    setInterval(() => {
      titleIndex = (titleIndex + 1) % titles.length;
      rotatorEl.style.opacity = '0';
      setTimeout(() => {
        rotatorEl.textContent = titles[titleIndex];
        rotatorEl.style.opacity = '1';
      }, 350);
    }, 3200);

    rotatorEl.style.transition = 'opacity 0.35s ease';
  }

  /* ------------------------------------------------------------------
     11. FOOTER YEAR
     ------------------------------------------------------------------ */
  const footerYear = document.getElementById('footerYear');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

})();
