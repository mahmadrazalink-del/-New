/* ============================
   BEEHIVE CREATIVE — SCRIPTS
   ============================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================
     NAVBAR: Scroll + Mobile
     ============================ */
  const navbar   = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  // Scroll shrink
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    updateActiveLink();
  });

  // Mobile menu
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close on nav link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = navbar.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ============================
     ACTIVE LINK HIGHLIGHT
     ============================ */
  const sections = document.querySelectorAll('section[id]');
  function updateActiveLink() {
    const scrollY = window.scrollY + navbar.offsetHeight + 80;
    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = document.querySelector(`.nav-link[href="#${id}"]`);
      if (link) {
        link.classList.toggle('active', scrollY >= top && scrollY < top + height);
      }
    });
  }
  updateActiveLink();

  /* ============================
     SCROLL REVEAL
     ============================ */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
      setTimeout(() => el.classList.add('visible'), delay);
      revealObserver.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ============================
     COUNTER ANIMATION
     ============================ */
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target);
      const duration = 1800;
      const step     = 16;
      const steps    = Math.floor(duration / step);
      let current    = 0;
      const increment = target / steps;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          el.textContent = target;
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(current);
        }
      }, step);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

  /* ============================
     PORTFOLIO FILTER
     ============================ */
  const filterBtns  = document.querySelectorAll('.pf-btn');
  const portCards   = document.querySelectorAll('.port-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      portCards.forEach(card => {
        const cat = card.dataset.category;
        const show = filter === 'all' || cat === filter;

        if (show) {
          card.classList.remove('hidden');
          // Re-trigger animation
          card.style.animation = 'none';
          card.offsetHeight; // reflow
          card.style.animation = '';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  /* ============================
     TESTIMONIAL SLIDER
     ============================ */
  const track    = document.getElementById('testiTrack');
  const dotsWrap = document.getElementById('tcDots');
  const prevBtn  = document.getElementById('tcPrev');
  const nextBtn  = document.getElementById('tcNext');
  const cards    = track ? track.querySelectorAll('.testi-card') : [];

  if (track && cards.length > 0) {
    let current    = 0;
    let autoTimer;
    let perView    = getPerView();
    let total      = Math.ceil(cards.length / perView);

    function getPerView() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    // Build dots
    function buildDots() {
      dotsWrap.innerHTML = '';
      total = Math.ceil(cards.length / perView);
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.className = 'tc-dot' + (i === current ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      }
    }

    function updateDots() {
      dotsWrap.querySelectorAll('.tc-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });
    }

    function goTo(index) {
      total = Math.ceil(cards.length / perView);
      current = Math.max(0, Math.min(index, total - 1));
      const cardW = cards[0].offsetWidth + 24; // gap = 1.5rem = 24px
      track.style.transform = `translateX(-${current * perView * cardW}px)`;
      updateDots();
    }

    function next() { goTo(current + 1 < total ? current + 1 : 0); }
    function prev() { goTo(current - 1 >= 0 ? current - 1 : total - 1); }

    prevBtn.addEventListener('click', () => { clearAuto(); prev(); startAuto(); });
    nextBtn.addEventListener('click', () => { clearAuto(); next(); startAuto(); });

    function startAuto() {
      clearAuto();
      autoTimer = setInterval(next, 4500);
    }
    function clearAuto() { clearInterval(autoTimer); }

    // Touch/swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        clearAuto();
        diff > 0 ? next() : prev();
        startAuto();
      }
    });

    // Init
    buildDots();
    startAuto();

    // Rebuild on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        perView = getPerView();
        current = 0;
        buildDots();
        goTo(0);
      }, 200);
    });
  }

  /* ============================
     CONTACT FORM
     ============================ */
  const form        = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalHTML = btn.innerHTML;

      // Loading state
      btn.innerHTML = `<span>Sending...</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
             style="animation:spin .8s linear infinite;width:16px;height:16px">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
        </svg>`;
      btn.disabled = true;

      // Simulate async
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        form.reset();
        formSuccess.classList.add('visible');
        setTimeout(() => formSuccess.classList.remove('visible'), 5000);
      }, 1800);
    });
  }

  /* ============================
     TIMELINE PLAYHEAD ANIMATION
     ============================ */
  const playhead = document.querySelector('.tl-playhead');
  if (playhead) {
    let dir = 1;
    let pos = 35;
    setInterval(() => {
      pos += dir * 0.15;
      if (pos > 75 || pos < 10) dir *= -1;
      playhead.style.left = pos + '%';
    }, 30);
  }

  /* ============================
     PARALLAX HEX GRID
     ============================ */
  const hexes = document.querySelectorAll('.hex');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        hexes.forEach((hex, i) => {
          const speed = (i % 3 + 1) * 0.04;
          hex.style.transform = `translateY(${scrollY * speed}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  });

  /* ============================
     CURSOR GLOW EFFECT (desktop)
     ============================ */
  if (window.innerWidth > 1024) {
    const glow = document.querySelector('.hero-glow');
    if (glow) {
      document.addEventListener('mousemove', e => {
        const x = e.clientX;
        const y = e.clientY;
        glow.style.transform = `translate(${(x - window.innerWidth) * 0.05}px, ${(y - window.innerHeight) * 0.05}px)`;
      });
    }
  }

  /* ============================
     SERVICE CARD TILT (subtle)
     ============================ */
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const x      = (e.clientX - rect.left) / rect.width  - 0.5;
      const y      = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-6px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'all 0.5s ease';
    });
  });

  /* ============================
     PORTFOLIO CARD TILT
     ============================ */
  document.querySelectorAll('.port-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-8px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'all 0.5s ease';
    });
  });

  /* ============================
     SPIN KEYFRAME (for form loader)
     ============================ */
  if (!document.querySelector('#beehiveKeyframes')) {
    const style = document.createElement('style');
    style.id = 'beehiveKeyframes';
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

});
