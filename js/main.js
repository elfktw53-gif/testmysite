// Мобильное меню и форма заявки.
// Сервера нет: форма собирает текст заявки и открывает его готовым сообщением
// в Telegram (@leyurtim) или в почтовой программе (sentivalk@yandex.ru).
(function () {
  var TELEGRAM = 'leyurtim';
  var EMAIL = 'sentivalk@yandex.ru';

  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');

  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); toggle.focus(); }
    });
  }

  var form = document.getElementById('lead-form');
  if (!form) return;
  var status = form.querySelector('.lead-form__status');
  var consent = form.elements.consent;
  var consentLabel = consent.closest('.consent');
  var FALLBACK = ' Если ничего не открылось, напишите в Telegram @leyurtim или позвоните: +7 (915) 565-53-22.';

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = 'lead-form__status' + (kind ? ' is-' + kind : '');
  }

  function buildMessage() {
    var lines = ['Заявка с сайта', '', 'Имя: ' + form.elements.name.value.trim(), 'Контакт: ' + form.elements.contact.value.trim()];
    var site = form.elements.site.value.trim();
    var task = form.elements.task.value.trim();
    if (site) lines.push('Сайт: ' + site);
    if (task) lines.push('Задача: ' + task);
    return lines.join('\n');
  }

  form.addEventListener('input', function (e) {
    if (e.target.getAttribute('aria-invalid') === 'true' && e.target.value.trim()) {
      e.target.setAttribute('aria-invalid', 'false');
      setStatus('', '');
    }
  });
  consent.addEventListener('change', function () {
    if (consent.checked) { consentLabel.classList.remove('is-invalid'); setStatus('', ''); }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var via = e.submitter && e.submitter.value === 'mail' ? 'mail' : 'tg';
    var name = form.elements.name;
    var contact = form.elements.contact;
    var missing = [];
    [name, contact].forEach(function (el) {
      var empty = !el.value.trim();
      el.setAttribute('aria-invalid', empty ? 'true' : 'false');
      if (empty) missing.push(el);
    });
    if (missing.length) {
      setStatus('Заполните имя и телефон или Telegram – по ним я с вами свяжусь.', 'error');
      missing[0].focus();
      return;
    }
    if (!consent.checked) {
      consentLabel.classList.add('is-invalid');
      setStatus('Отметьте согласие на обработку персональных данных – без него заявку отправить нельзя.', 'error');
      consent.focus();
      return;
    }

    var text = buildMessage();
    if (via === 'mail') {
      window.location.href = 'mailto:' + EMAIL +
        '?subject=' + encodeURIComponent('Заявка с сайта: ' + name.value.trim()) +
        '&body=' + encodeURIComponent(text);
      setStatus('Открываю почту с текстом заявки – отправьте письмо. Отвечу с 9:00 до 21:00 по Москве.' + FALLBACK, 'ok');
    } else {
      window.open('https://t.me/' + TELEGRAM + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      setStatus('Открываю Telegram с текстом заявки – нажмите в чате «Отправить». Отвечу с 9:00 до 21:00 по Москве.' + FALLBACK, 'ok');
    }
  });
})();

// Волна на кнопках: кольцо расходится от точки нажатия. Запускается сразу при нажатии (pointerdown),
// чтобы её было видно и на кнопках, которые уводят в Telegram или к звонку; с клавиатуры – из центра.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function wave(btn, x, y) {
    var r = btn.getBoundingClientRect();
    if (x == null) { x = r.width / 2; y = r.height / 2; } else { x -= r.left; y -= r.top; }
    var size = Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y)) * 2;
    var w = document.createElement('span');
    w.className = 'btn__wave';
    w.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + size + 'px;height:' + size + 'px';
    btn.appendChild(w);
    w.addEventListener('animationend', function () { w.remove(); });
  }
  document.addEventListener('pointerdown', function (e) {
    var btn = e.target.closest('.btn');
    if (btn && e.button === 0) wave(btn, e.clientX, e.clientY);
  });
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.btn');
    if (btn && e.detail === 0) wave(btn); // нажатие Enter или пробелом
  });
})();
