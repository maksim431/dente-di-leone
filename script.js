(function () {
  'use strict';

  /* ---------- Мобильное меню ---------- */
  var top = document.querySelector('.hero__top');
  var burger = document.querySelector('.burger');
  if (burger && top) {
    burger.addEventListener('click', function () {
      var open = top.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    top.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        top.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Карточка врача в первом экране: стрелки ведут к команде ---------- */
  document.querySelectorAll('.hcard__arrow').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var t = document.getElementById('team');
      if (t) t.scrollIntoView({ behavior: 'smooth' });
    });
  });

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
