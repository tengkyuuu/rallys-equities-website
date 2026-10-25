/* Per-page motion, ported from the original site. Each function enhances the markup
   currently on screen and returns a cleanup. Server-rendered content is fully visible
   without them; reveal classes are only added once this code runs. */

import { cssRGB } from '@/lib/overrides/engine';

type Cleanup = () => void;
const reduceMotion = () => matchMedia('(prefers-reduced-motion:reduce)').matches;

/* Scroll-reveal — the wow.js/animate.css behaviour of the original WordPress theme */
const REVEAL = '.svc-card,.reg-card,.fc,.how-step,.testi,.sc2,.calc-card,.ctc-card,.loc-card,.faq-item,.perf-chip';
const STAGGER =
  '.svc-grid,.reg-grid,.feat-band,.how-steps,.testi-grid,.stats-band,.reg-strip,.calc-grid,.ctc-grid,.loc-grid,.faq-list,.perf-grid';

export function initReveal(root: ParentNode = document): Cleanup {
  root.querySelectorAll(REVEAL).forEach((el) => el.classList.add('rv'));
  root.querySelectorAll(STAGGER).forEach((g) => {
    [...g.children].forEach((c, i) => {
      if (c.classList.contains('rv')) (c as HTMLElement).style.setProperty('--rvd', Math.min(i * 70, 420) + 'ms');
    });
  });
  const obs = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('vis');
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -36px 0px' },
  );
  root.querySelectorAll('.rv').forEach((el) => obs.observe(el));
  return () => obs.disconnect();
}

/** Reveal whatever is already in the first viewport (after the preloader lifts). */
export function revealFirstViewport() {
  document.querySelectorAll('.page.active .rv').forEach((el) => {
    if (el.getBoundingClientRect().top < innerHeight * 0.92) el.classList.add('vis');
  });
}

/* Stats band count-up */
export function startCounters(): Cleanup {
  const band = document.querySelector('.stats-band');
  if (!band) return () => {};
  const timers: ReturnType<typeof setInterval>[] = [];
  const obs = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      document.querySelectorAll<HTMLElement>('.cnt').forEach((el) => {
        const t = parseInt(el.dataset.t || '0'),
          step = t / 65;
        let cur = 0;
        const iv = setInterval(() => {
          cur = Math.min(cur + step, t);
          el.textContent = String(Math.round(cur));
          if (cur >= t) clearInterval(iv);
        }, 18);
        timers.push(iv);
      });
    },
    { threshold: 0.3 },
  );
  obs.observe(band);
  return () => {
    obs.disconnect();
    timers.forEach(clearInterval);
  };
}

/* 3D tilt on cards — wide screens with a fine pointer only */
export function initTilt(): Cleanup {
  if (!matchMedia('(pointer:fine)').matches) return () => {};
  const wide = () => innerWidth >= 900;
  const offs: Cleanup[] = [];
  document.querySelectorAll<HTMLElement>('.svc-card,.perf-chip').forEach((card) => {
    const lift = card.classList.contains('perf-chip') ? -6 : -7;
    const enter = () => {
      if (wide()) card.style.transition = 'transform .12s ease,box-shadow .45s';
    };
    const move = (e: MouseEvent) => {
      if (!wide()) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5,
        py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(720px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 7).toFixed(2)}deg) translateY(${lift}px)`;
    };
    const leave = () => {
      card.style.transform = '';
      card.style.transition = '';
    };
    card.addEventListener('mouseenter', enter);
    card.addEventListener('mousemove', move);
    card.addEventListener('mouseleave', leave);
    offs.push(() => {
      card.removeEventListener('mouseenter', enter);
      card.removeEventListener('mousemove', move);
      card.removeEventListener('mouseleave', leave);
    });
  });
  return () => offs.forEach((f) => f());
}

/* Hero: particle constellation + parallax photo (home page only) */
export function initHero(): Cleanup {
  const offs: Cleanup[] = [];
  const reduce = reduceMotion();
  const heroPhoto = document.querySelector<HTMLElement>('.hero-photo');
  let heroInView = true;

  if (heroPhoto && !reduce) {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (heroInView) heroPhoto.style.transform = `translate3d(0,${scrollY * 0.14}px,0)`;
        ticking = false;
      });
    };
    addEventListener('scroll', onScroll, { passive: true });
    offs.push(() => removeEventListener('scroll', onScroll));
  }

  const cv = document.getElementById('heroFx') as HTMLCanvasElement | null;
  if (cv && cv.parentElement && !reduce && innerWidth >= 760) {
    const ctx = cv.getContext('2d')!;
    const hero = cv.parentElement;
    const DPR = Math.min(devicePixelRatio || 1, 2);
    let W = 0,
      H = 0,
      raf = 0,
      running = false;
    let nodes: { x: number; y: number; vx: number; vy: number; g: boolean }[] = [];
    const size = () => {
      const r = hero.getBoundingClientRect();
      W = r.width;
      H = r.height;
      cv.width = W * DPR;
      cv.height = H * DPR;
      cv.style.width = W + 'px';
      cv.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const n = Math.round(Math.min(54, Math.max(24, W / 24)));
      nodes = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        g: Math.random() < 0.4,
      }));
    };
    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      const GD = cssRGB('--au'),
        EM = cssRGB('--g3');
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j],
            d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 132) {
            ctx.strokeStyle = `rgba(${a.g ? GD : EM},${(1 - d / 132) * 0.16})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.g ? 1.6 : 1.3, 0, 6.283);
        ctx.fillStyle = `rgba(${a.g ? GD : EM},${a.g ? '.7' : '.6'})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!running) {
        running = true;
        frame();
      }
    };
    const stop = () => {
      if (running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };
    size();
    start();
    let rt: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(rt);
      rt = setTimeout(size, 200);
    };
    const onVis = () => (document.hidden ? stop() : start());
    addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    // pause when the hero scrolls out of view (also gates the parallax)
    const io = new IntersectionObserver(
      (es) => {
        heroInView = es[0].isIntersecting;
        if (heroInView) start();
        else stop();
      },
      { threshold: 0.02 },
    );
    io.observe(hero);
    offs.push(() => {
      stop();
      clearTimeout(rt);
      removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      io.disconnect();
    });
  }
  return () => offs.forEach((f) => f());
}
