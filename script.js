(function () {
  'use strict';

  /* ---------- Шапка: фиксированная, меняется после начала скролла ---------- */
  var bar = document.getElementById('topbar');
  var top = document.querySelector('.hero__top');
  var burger = document.querySelector('.burger');
  if (bar) {
    var onScroll = function () { bar.classList.toggle('is-scrolled', window.scrollY > 0); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  var setMenu = function (open) {
    top.classList.toggle('is-open', open);
    if (bar) bar.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  if (burger && top) {
    burger.addEventListener('click', function () { setMenu(!top.classList.contains('is-open')); });
    top.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* ---------- Слайдер первого экрана: специалисты, автопереключение каждые 5 с ---------- */
  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var DELAY = 5000;
    var slides = [
      { name: 'Горбачев Алексей Владимирович', role: 'Директор, стоматолог, ортопед, хирург и имплантолог.<br>Стаж работы 18 лет' },
      { name: 'Смирнова Елизавета Игоревна', role: 'Стоматолог - терапевт. <br>Стаж работы 1 год' }
    ];
    var bgs = hero.querySelectorAll('.hero__bg');
    var imgs = hero.querySelectorAll('.hcard__img');
    var info = hero.querySelector('.hcard__info');
    var nameEl = hero.querySelector('.hcard__name');
    var roleEl = hero.querySelector('.hcard__role');
    var dotsWrap = hero.querySelector('.hcard__dots');
    var cur = 0;
    var dots = slides.map(function (s, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'hcard__dot';
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', s.name);
      d.appendChild(document.createElement('i'));
      d.addEventListener('click', function () { if (i !== cur) go(i); });
      dotsWrap.appendChild(d);
      return d;
    });
    hero.style.setProperty('--hero-delay', DELAY + 'ms');

    var mark = function () {
      dots.forEach(function (d, i) {
        var on = i === cur;
        d.classList.remove('is-active');
        d.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      void dotsWrap.offsetWidth; // перезапуск анимации таймера
      dots[cur].classList.add('is-active');
    };
    var go = function (n) {
      cur = (n + slides.length) % slides.length;
      bgs.forEach(function (b, i) { b.classList.toggle('is-active', i === cur); });
      imgs.forEach(function (im, i) { im.classList.toggle('is-active', i === cur); });
      info.classList.add('is-fading');
      setTimeout(function () {
        nameEl.textContent = slides[cur].name;
        roleEl.innerHTML = slides[cur].role;
        info.classList.remove('is-fading');
      }, 300);
      mark();
    };
    // таймер-индикатор сам переключает слайд, когда заполнится
    dotsWrap.addEventListener('animationend', function (e) {
      if (e.animationName === 'heroTimer') go(cur + 1);
    });
    hero.querySelector('.hcard__arrow--prev').addEventListener('click', function () { go(cur - 1); });
    hero.querySelector('.hcard__arrow--next').addEventListener('click', function () { go(cur + 1); });
    // пауза, пока первый экран не виден
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        hero.classList.toggle('is-paused', !en[0].isIntersecting);
      }).observe(hero);
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) hero.classList.add('is-paused');
    mark();
  }

  /* ---------- Карусель врачей ---------- */
  var car = document.querySelector('[data-carousel]');
  if (car) {
    var section = car.closest('section');
    var prev = section.querySelector('.car__btn--prev');
    var next = section.querySelector('.car__btn--next');
    var curEl = section.querySelector('.car__cur');
    var cards = car.querySelectorAll('.doc');
    var step = function () {
      var c = cards[0];
      var gap = parseFloat(getComputedStyle(car.firstElementChild).columnGap) || 16;
      return c.getBoundingClientRect().width + gap;
    };
    var syncPadding = function () {
      car.style.scrollPaddingLeft = getComputedStyle(car).paddingLeft;
    };
    var update = function () {
      var max = car.scrollWidth - car.clientWidth;
      var idx = Math.round(car.scrollLeft / step());
      curEl.textContent = ('0' + Math.min(idx + 1, cards.length)).slice(-2);
      prev.disabled = car.scrollLeft <= 2;
      next.disabled = car.scrollLeft >= max - 2;
    };
    prev.addEventListener('click', function () { car.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { car.scrollBy({ left: step(), behavior: 'smooth' }); });
    car.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', function () { syncPadding(); update(); });
    syncPadding();
    update();
  }

  /* ---------- Форма ---------- */
  var form = document.querySelector('.lead');
  if (form) {
    var input = form.querySelector('.lead__input');
    var ok = document.querySelector('.lead__ok');
    var fmt = function (v) {
      var d = v.replace(/\D/g, '');
      if (d.charAt(0) === '8') d = '7' + d.slice(1);
      if (d.charAt(0) !== '7') d = '7' + d;
      d = d.slice(0, 11);
      var r = '+7';
      if (d.length > 1) r += ' (' + d.slice(1, 4);
      if (d.length >= 4) r += ')';
      if (d.length > 4) r += ' ' + d.slice(4, 7);
      if (d.length > 7) r += '-' + d.slice(7, 9);
      if (d.length > 9) r += '-' + d.slice(9, 11);
      return r;
    };
    input.addEventListener('input', function () {
      input.value = input.value ? fmt(input.value) : '';
      input.classList.remove('is-error');
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (input.value.replace(/\D/g, '').length < 11) {
        input.classList.add('is-error');
        input.focus();
        return;
      }
      ok.hidden = false;
      form.reset();
    });
  }
})();
