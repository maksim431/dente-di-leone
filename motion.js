/* Плавный скролл и анимации появления. Без зависимостей. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HEADER = function () { var b = document.getElementById('topbar'); return b ? b.offsetHeight : 0; };

  /* ---------- 1. Инерционный скролл колесом мыши ---------- */
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var target = window.scrollY, current = window.scrollY, raf = null, anim = null;
  var maxScroll = function () { return root.scrollHeight - window.innerHeight; };
  var clamp = function (v) { return Math.max(0, Math.min(maxScroll(), v)); };

  var loop = function () {
    current += (target - current) * 0.12;
    if (Math.abs(target - current) < 0.5) current = target;
    window.scrollTo(0, current);
    raf = current === target ? null : requestAnimationFrame(loop);
  };

  // Плавная прокрутка к точке (для якорей): easeInOutCubic
  var scrollToY = function (y, dur) {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    if (anim) cancelAnimationFrame(anim);
    var from = window.scrollY, to = clamp(y), t0 = performance.now();
    dur = dur || Math.min(1400, 500 + Math.abs(to - from) * 0.25);
    if (reduce) { window.scrollTo(0, to); target = current = to; return; }
    var step = function (now) {
      var p = Math.min(1, (now - t0) / dur);
      var e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      window.scrollTo(0, from + (to - from) * e);
      if (p < 1) anim = requestAnimationFrame(step); else { anim = null; target = current = to; }
    };
    anim = requestAnimationFrame(step);
  };

  if (finePointer && !reduce) {
    root.style.scrollBehavior = 'auto';
    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.defaultPrevented) return;
      // горизонтальная прокрутка карусели и прокручиваемых блоков остаётся родной
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      for (var el = e.target; el && el !== document.body; el = el.parentElement) {
        if (el.scrollHeight > el.clientHeight + 1) {
          var oy = getComputedStyle(el).overflowY;
          if (oy === 'auto' || oy === 'scroll') return;
        }
      }
      // тачпады шлют мелкие частые дельты, их не трогаем
      var lineMode = e.deltaMode === 1;
      var dy = lineMode ? e.deltaY * 40 : e.deltaY;
      if (!lineMode && Math.abs(dy) < 40) return;
      e.preventDefault();
      if (anim) { cancelAnimationFrame(anim); anim = null; current = window.scrollY; target = current; }
      if (!raf) { current = window.scrollY; target = current; }
      target = clamp(target + dy);
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: false });
    // клавиатура, полоса прокрутки и т.п. — синхронизируем позицию
    window.addEventListener('scroll', function () {
      if (!raf && !anim) { current = target = window.scrollY; }
    }, { passive: true });
  }

  // Якорные ссылки — плавно, с учётом высоты шапки
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    var y = el.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : HEADER());
    scrollToY(id === '#top' ? 0 : y);
    if (history.replaceState) history.replaceState(null, '', id);
  });

  /* ---------- 2. Появление блоков при прокрутке ---------- */
  window.__motionReady = true;
  if (reduce || !('IntersectionObserver' in window)) { root.classList.remove('motion'); return; }
  root.classList.add('motion');

  var groups = [
    // [селектор, задержка между элементами, мс]
    ['.sec__head .h2, .sec__head .sec__desc', 90],
    ['.intro__main > *', 90],
    ['.intro__facts li', 70],
    ['.bento > *', 110],
    ['.prices > *', 60],
    ['.sit__row', 50],
    ['.mini', 0],
    ['.steps li', 80],
    ['.impl > *', 110],
    ['.dir__photo', 0],
    ['.dir__text > *', 70],
    ['.doc', 70],
    ['.car__nav', 0],
    ['.case', 90],
    ['.revs > *', 90],
    ['.fear--big, .fears__grid > *', 70],
    ['.formsec__body > *', 80],
    ['.kids__text > *, .promo', 90],
    ['.faq__head > *', 80],
    ['.qa', 40],
    ['.addr, .map', 110],
    ['.footer__cols > *, .footer__bottom', 60]
  ];
  var all = [];
  groups.forEach(function (g) {
    var parents = new Map();
    document.querySelectorAll(g[0]).forEach(function (el) {
      if (el.classList.contains('rv') || el.hidden) return;
      var p = el.parentElement, i = parents.get(p) || 0;
      parents.set(p, i + 1);
      el.classList.add('rv');
      if (el.matches('.dir__photo, .impl__photo, .map, .formsec__photo')) el.classList.add('rv--zoom');
      el.style.setProperty('--rv-delay', Math.min(i * g[1], 600) + 'ms');
      all.push(el);
    });
  });
  document.querySelectorAll('.formsec__photo').forEach(function (el) { el.classList.add('rv', 'rv--zoom'); all.push(el); });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -30px 0px', threshold: 0.01 });
  all.forEach(function (el) { io.observe(el); });

  // Карусель врачей: карточки за правым краем показываем сразу, когда видна секция
  var car = document.querySelector('[data-carousel]');
  if (car) new IntersectionObserver(function (en, o) {
    if (en[0].isIntersecting) { car.querySelectorAll('.doc').forEach(function (d) { d.classList.add('is-in'); }); o.disconnect(); }
  }, { threshold: 0.15 }).observe(car);

  // Счётчики цифр: 18 лет, 2014, 4,9, цены 95 500 ₽
  var countUp = function (el) {
    var txt = el.textContent, m = txt.match(/\d[\d\s ]*(?:,\d+)?/);
    if (!m) return;
    var raw = m[0], isDec = raw.indexOf(',') > -1;
    var end = parseFloat(raw.replace(/[\s ]/g, '').replace(',', '.'));
    if (!end || end === 2014) return; // год не «накручиваем»
    var pre = txt.slice(0, m.index), post = txt.slice(m.index + raw.length), t0 = null, dur = 1100;
    var fmt = function (v) {
      if (isDec) return v.toFixed(1).replace('.', ',');
      return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };
    var sep = raw.match(/[\s ]/);
    var tick = function (now) {
      if (!t0) t0 = now;
      var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      var s = fmt(end * e); if (sep && sep[0] === ' ') s = s.replace(/ /g, ' ');
      el.textContent = pre + s + post;
      if (p < 1) requestAnimationFrame(tick); else el.textContent = txt;
    };
    requestAnimationFrame(tick);
  };
  var nums = document.querySelectorAll('.dir__num, .rating__num, .est__total b, .pcard__big, .promo__price');
  var io2 = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); io2.unobserve(en.target); } });
  }, { threshold: 0.6 });
  nums.forEach(function (n) { io2.observe(n); });
})();
