// ===========================================================
// Sizzlers — main.js
// ===========================================================
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Sticky nav on scroll ---------- */
  const nav = document.querySelector('.site-nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile nav drawer (custom-built: backdrop, scroll lock, focus trap, Esc-to-close) ---------- */
  const navToggle = document.querySelector('#nav-toggle');
  const drawer = document.querySelector('#mobile-drawer');
  const backdrop = document.querySelector('#nav-backdrop');
  const drawerClose = document.querySelector('#drawer-close');

  if (navToggle && drawer && backdrop) {
    let lockedScrollY = 0;
    let lastFocused = null;
    const focusableSelector = 'a[href], button:not([disabled])';

    const getFocusable = () =>
      Array.from(drawer.querySelectorAll(focusableSelector)).filter(el => el.offsetParent !== null);

    function onKeydown(e) {
      if (e.key === 'Escape') {
        closeDrawer();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = getFocusable();
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    function openDrawer() {
      lastFocused = document.activeElement;
      lockedScrollY = window.scrollY;

      // Pin body at current scroll position — plain overflow:hidden isn't
      // reliable against rubber-band scrolling on iOS Safari.
      document.body.classList.add('nav-open');
      document.body.style.position = 'fixed';
      document.body.style.top = `-${lockedScrollY}px`;
      document.body.style.width = '100%';

      drawer.classList.add('open');
      backdrop.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Close menu');

      document.addEventListener('keydown', onKeydown);
      const focusable = getFocusable();
      if (focusable.length) focusable[0].focus();
    }

    function closeDrawer() {
      if (!drawer.classList.contains('open')) return;

      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');

      document.body.classList.remove('nav-open');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, lockedScrollY);

      document.removeEventListener('keydown', onKeydown);
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    navToggle.addEventListener('click', () => {
      if (drawer.classList.contains('open')) closeDrawer();
      else openDrawer();
    });
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    // If the viewport grows past the drawer breakpoint (rotation, resize,
    // devtools) while it's open, close it so it can't get stuck mid-state.
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > 1024 && drawer.classList.contains('open')) closeDrawer();
      }, 150);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Testimonial carousel ---------- */
  const slides = document.querySelectorAll('.testimonial-slide');
  const dotsWrap = document.querySelector('.testimonial-dots');
  if (slides.length && dotsWrap) {
    let current = 0;
    let timer;

    const dots = Array.from(slides).map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Show testimonial ${i + 1}`);
      if (i === 0) b.classList.add('active');
      b.addEventListener('click', () => show(i, true));
      dotsWrap.appendChild(b);
      return b;
    });

    function show(idx, userTriggered) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
      if (userTriggered) restart();
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(() => show(current + 1), 6000);
    }
    restart();
  }

  /* ---------- Reservation / contact form ---------- */
  const reserveForm = document.querySelector('#reserve-form');
  if (reserveForm) {
    reserveForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(reserveForm);
      const name = data.get('name') || 'Guest';
      const success = document.querySelector('#reserve-form-success');
      if (success) {
        success.textContent = `Thank you, ${name}! Your request has been received — our team will confirm your table shortly by phone or email.`;
        success.classList.add('show');
      }
      reserveForm.reset();
    });
  }

  /* ---------- Newsletter form ---------- */
  const newsletterForm = document.querySelector('#newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = newsletterForm.querySelector('button');
      const original = btn.textContent;
      btn.textContent = 'Subscribed ✓';
      newsletterForm.reset();
      setTimeout(() => { btn.textContent = original; }, 3000);
    });
  }

  /* ---------- Current year ---------- */
  document.querySelectorAll('.current-year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
});
