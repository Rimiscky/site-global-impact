/* ============================================================
   GLOBAL IMPACT CONSULTING — Interactions & Animations
   Vanilla JS — no dependencies
   ============================================================ */

(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ---------- LOADER ---------- */
  const loader = $('#loader');
  const loaderBar = $('#loaderBar');

  function runLoader() {
    let p = 0;
    const step = () => {
      p = Math.min(100, p + Math.random() * 18 + 6);
      if (loaderBar) loaderBar.style.width = p + '%';
      if (p < 100) setTimeout(step, 90);
      else setTimeout(() => {
        loader?.classList.add('is-done');
        document.body.classList.add('is-ready');
      }, 250);
    };
    step();
  }

  if (document.readyState === 'complete') runLoader();
  else window.addEventListener('load', runLoader);

  /* ---------- YEAR ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- NAV ---------- */
  const nav = $('#nav');
  const burger = $('#burger');
  const navMenu = $('#navMenu');

  const onScroll = () => {
    nav?.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  burger?.addEventListener('click', () => {
    const open = navMenu.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  $$('[data-nav]').forEach(a => {
    a.addEventListener('click', () => {
      navMenu?.classList.remove('is-open');
      burger?.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });

  /* ---------- SCROLL PROGRESS ---------- */
  const scrollBar = $('#scrollBar');
  const updateProgress = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
    if (scrollBar) scrollBar.style.width = (scrolled * 100) + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });

  /* ---------- CUSTOM CURSOR ---------- */
  if (!isTouch && !prefersReduced) {
    const cursor = $('#cursor');
    const dot = $('#cursorDot');
    let mx = 0, my = 0, cx = 0, cy = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      if (dot) dot.style.transform = `translate3d(${mx - 2.5}px, ${my - 2.5}px, 0)`;
    }, { passive: true });

    const loop = () => {
      cx += (mx - cx) * 0.15;
      cy += (my - cy) * 0.15;
      if (cursor) cursor.style.transform = `translate3d(${cx - 19}px, ${cy - 19}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();

    const hoverables = 'a, button, .card, .method__card, .level, .faq__item summary, .tab, input, textarea, select, .gallery__item, .gfilter, .featured-video__play, .hero__photo';
    document.querySelectorAll(hoverables).forEach(el => {
      el.addEventListener('mouseenter', () => cursor?.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor?.classList.remove('is-hover'));
    });
  }

  /* ---------- REVEAL ON SCROLL ---------- */
  if (!prefersReduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('is-in'));
  }

  /* ---------- COUNTERS ---------- */
  const counters = $$('[data-count]');
  if (counters.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const duration = 1800;
        const start = performance.now();
        const run = (t) => {
          const p = Math.min(1, (t - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(target * eased).toLocaleString('fr-FR');
          if (p < 1) requestAnimationFrame(run);
          else el.textContent = target.toLocaleString('fr-FR');
        };
        requestAnimationFrame(run);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.6 });

    counters.forEach(c => countObserver.observe(c));
  }

  /* ---------- PARALLAX ---------- */
  if (!prefersReduced && !isTouch) {
    const parallaxEls = $$('[data-parallax]');
    const scenes = $$('[data-parallax-scene]');

    let ticking = false;
    const updateParallax = () => {
      const vh = window.innerHeight;
      scenes.forEach(scene => {
        const rect = scene.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > vh + 100) return;

        const progress = (rect.top + rect.height / 2 - vh / 2) / vh;

        scene.querySelectorAll('[data-parallax]').forEach(el => {
          const speed = parseFloat(el.dataset.parallax) || 0.1;
          const y = progress * 100 * speed * -1;
          el.style.transform = `translate3d(0, ${y}px, 0)`;
        });
      });
      ticking = false;
    };

    const requestParallax = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestParallax, { passive: true });
    window.addEventListener('resize', requestParallax, { passive: true });
    updateParallax();
  }

  /* ---------- MAGNETIC BUTTONS ---------- */
  if (!isTouch && !prefersReduced) {
    $$('.magnetic').forEach(btn => {
      const strength = 0.35;
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ---------- SERVICE TABS ---------- */
  const tabs = $$('.tab');
  const panels = $$('.panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab);
      });
      panels.forEach(p => {
        const match = p.dataset.panel === target;
        p.classList.toggle('active', match);
        if (match) p.removeAttribute('hidden');
        else p.setAttribute('hidden', '');
      });
    });
  });

  /* ---------- FAQ (close others on open) ---------- */
  const faqItems = $$('.faq__item');
  faqItems.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach(other => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---------- CARD TILT ---------- */
  if (!isTouch && !prefersReduced) {
    $$('.card, .method__card, .level').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1000px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ---------- CONTACT FORM ---------- */
  const form = $('#contactForm');
  const note = $('#formNote');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = fd.get('name');
    if (!name || !fd.get('email') || !fd.get('message')) {
      if (note) {
        note.textContent = '⚠︎ Merci de compléter les champs requis.';
        note.style.color = '#E3BE7C';
      }
      return;
    }
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          email: fd.get('email'),
          org: fd.get('org') || '',
          phone: fd.get('phone') || '',
          topic: fd.get('topic') || '',
          message: fd.get('message'),
        }),
      });
      if (!res.ok) throw new Error('request_failed');
      if (note) {
        note.textContent = `✓ Merci ${String(name).split(' ')[0]}, votre message est bien envoyé. Nous revenons vers vous sous 24h.`;
        note.style.color = '#E3BE7C';
      }
      form.reset();
    } catch (err) {
      if (note) {
        note.textContent = '⚠︎ Une erreur est survenue. Merci de réessayer ou de nous écrire directement par email.';
        note.style.color = '#E3BE7C';
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  /* ---------- GALLERY — reveal with stagger + filters ---------- */
  const galleryItems = $$('[data-reveal-img]');
  if (galleryItems.length && !prefersReduced) {
    const giObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const idx = galleryItems.indexOf(entry.target);
          entry.target.style.setProperty('--d', (idx % 8) * 0.08 + 's');
          entry.target.classList.add('is-in');
          giObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    galleryItems.forEach(el => giObserver.observe(el));
  } else {
    galleryItems.forEach(el => el.classList.add('is-in'));
  }

  /* ---------- GALLERY FILTERS ---------- */
  const gfilters = $$('.gfilter');
  gfilters.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      gfilters.forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', b === btn);
      });
      galleryItems.forEach(item => {
        const cat = item.dataset.cat;
        const show = filter === 'all' || cat === filter;
        item.classList.toggle('is-filtered-out', !show);
      });
    });
  });

  /* ---------- LIGHTBOX ---------- */
  const lightbox = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbCap = $('#lbCap');
  const lbCounter = $('#lbCounter');
  const lbClose = $('#lbClose');
  const lbPrev = $('#lbPrev');
  const lbNext = $('#lbNext');
  let lbIdx = 0;
  let visibleItems = [];

  const getVisibleGalleryItems = () =>
    galleryItems.filter(i => !i.classList.contains('is-filtered-out'));

  const openLightbox = (item) => {
    visibleItems = getVisibleGalleryItems();
    lbIdx = visibleItems.indexOf(item);
    renderLightbox();
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add('is-open'));
    document.body.classList.add('is-modal-open');
  };

  const renderLightbox = () => {
    const item = visibleItems[lbIdx];
    if (!item) return;
    const img = item.querySelector('img');
    const cap = item.querySelector('.gallery__cap');
    lbImg.src = img.src;
    lbImg.alt = img.alt || '';
    if (cap) {
      const title = cap.querySelector('h3')?.textContent || '';
      const sub = cap.querySelector('p')?.textContent || '';
      const tag = cap.querySelector('.gallery__tag')?.textContent || '';
      lbCap.innerHTML = `<strong style="color:#E3BE7C">${tag}</strong> · ${title} — <span style="opacity:.7">${sub}</span>`;
    } else {
      lbCap.textContent = '';
    }
    lbCounter.textContent = `${lbIdx + 1} / ${visibleItems.length}`;
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    setTimeout(() => { lightbox.hidden = true; }, 400);
    document.body.classList.remove('is-modal-open');
  };

  galleryItems.forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
  });

  lbClose?.addEventListener('click', closeLightbox);
  lbPrev?.addEventListener('click', () => {
    lbIdx = (lbIdx - 1 + visibleItems.length) % visibleItems.length;
    renderLightbox();
  });
  lbNext?.addEventListener('click', () => {
    lbIdx = (lbIdx + 1) % visibleItems.length;
    renderLightbox();
  });
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (lightbox?.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lbPrev?.click();
    if (e.key === 'ArrowRight') lbNext?.click();
  });

  /* ---------- VIDEO MODAL ---------- */
  const videoModal = $('#videoModal');
  const vmPlayer = $('#vmPlayer');
  const vmClose = $('#vmClose');
  const featuredVideoBtn = $('.featured-video__play');
  const VIDEO_SRC = 'assets/video-presentation.mp4';

  const openVideoModal = async () => {
    videoModal.hidden = false;
    requestAnimationFrame(() => videoModal.classList.add('is-open'));
    document.body.classList.add('is-modal-open');

    try {
      const res = await fetch(VIDEO_SRC, { method: 'HEAD' });
      if (res.ok) {
        videoModal.classList.add('has-source');
        const source = vmPlayer.querySelector('source');
        if (source && source.src !== location.origin + '/' + VIDEO_SRC) {
          source.src = VIDEO_SRC;
          vmPlayer.load();
        }
        vmPlayer.play().catch(() => {});
      }
    } catch (_) { /* video not present, keep placeholder */ }
  };

  const closeVideoModal = () => {
    videoModal.classList.remove('is-open');
    setTimeout(() => {
      videoModal.hidden = true;
      vmPlayer?.pause();
    }, 400);
    document.body.classList.remove('is-modal-open');
  };

  featuredVideoBtn?.addEventListener('click', openVideoModal);
  vmClose?.addEventListener('click', closeVideoModal);
  videoModal?.addEventListener('click', (e) => {
    if (e.target === videoModal) closeVideoModal();
  });
  document.addEventListener('keydown', (e) => {
    if (!videoModal?.hidden && e.key === 'Escape') closeVideoModal();
  });

  /* ---------- HERO PHOTO TILT ON MOUSE (applied to inner img) ---------- */
  if (!isTouch && !prefersReduced) {
    const hero = $('#hero');
    const tiltImgs = $$('[data-tilt] img');
    hero?.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      tiltImgs.forEach((img, i) => {
        const str = 6 + i * 3;
        img.style.transform = `scale(1.05) translate3d(${x * str}px, ${y * str}px, 0)`;
      });
    }, { passive: true });
    hero?.addEventListener('mouseleave', () => {
      tiltImgs.forEach(img => { img.style.transform = ''; });
    });
  }

  /* ---------- DARK MODE TOGGLE ---------- */
  const themeToggle = $('#themeToggle');
  const savedTheme = localStorage.getItem('gic-theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const applyTheme = (dark) => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('gic-theme', dark ? 'dark' : 'light');
  };

  applyTheme(savedTheme ? savedTheme === 'dark' : systemDark);

  themeToggle?.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(!isDark);
  });

  /* ---------- ANCHOR SMOOTH OFFSET ---------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

})();
