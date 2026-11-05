// Tells Google Ads about an enquiry. Does nothing until the tag is on the page.
function track(kind) {
  var labels = window.ADS_LABELS || {};
  if (window.gtag && labels[kind]) window.gtag('event', 'conversion', { send_to: labels[kind] });
}
document.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('a[href]');
  if (!a) return;
  var href = a.getAttribute('href');
  if (href.indexOf('https://wa.me/') === 0) track('whatsapp');
  else if (href.indexOf('tel:') === 0) track('phone');
});

// Catalogue search and filter
(function () {
  var grid = document.querySelector('.grid');
  var input = document.querySelector('.search input');
  if (!grid || !input) return;
  var cards = [].slice.call(grid.children);
  var chips = [].slice.call(document.querySelectorAll('.chip'));
  var count = document.querySelector('[data-count]');
  var none = document.querySelector('.none');
  var active = '';
  function apply() {
    var q = input.value.trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (c) {
      var ok = (!active || c.dataset.group === active) && (!q || c.dataset.name.indexOf(q) > -1);
      c.hidden = !ok;
      if (ok) shown++;
    });
    count.textContent = shown;
    none.hidden = shown > 0;
  }
  input.addEventListener('input', apply);
  chips.forEach(function (ch) {
    ch.addEventListener('click', function () {
      active = ch.dataset.f;
      chips.forEach(function (x) { x.setAttribute('aria-pressed', String(x === ch)); });
      apply();
    });
  });
  // Ads open the catalogue on one type, for example ?type=Slides
  var want = new URLSearchParams(location.search).get('type');
  var chip = chips.filter(function (x) { return want && x.dataset.f === want; })[0];
  if (chip) {
    chip.click();
    window.addEventListener('load', function () {
      setTimeout(function () { document.querySelector('.tools').scrollIntoView({ behavior: 'instant' }); }, 0);
    });
  }
})();

// Enquiry form: emails the details to the office
(function () {
  var form = document.getElementById('enq');
  if (!form) return;
  var send = document.getElementById('enq-send');
  var note = document.getElementById('enq-note');
  var label = send.innerHTML;
  function say(text, kind) {
    note.textContent = text;
    note.className = 'fnote' + (kind ? ' fnote-' + kind : '');
  }
  function stop(field, text) {
    field.setAttribute('aria-invalid', 'true');
    say(text, 'bad');
    field.focus();
  }
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var f = form.elements;
    var name = f.name.value.trim();
    var phone = f.phone.value.trim();
    var mail = f.email.value.trim();
    [f.name, f.phone, f.email].forEach(function (x) { x.removeAttribute('aria-invalid'); });
    if (!name) return stop(f.name, 'Please add your name so we know who to reply to.');
    if (phone.replace(/\D/g, '').length < 10) return stop(f.phone, 'Please add a phone number with at least 10 digits so we can reach you.');
    if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) return stop(f.email, 'That email address does not look right. Please check it or leave it blank.');
    function done() {
      form.reset();
      say('Thank you. We have your enquiry and will get back to you soon.', 'ok');
    }
    if (f._honey.value) return done();
    var data = { access_key: form.dataset.key, subject: 'Website enquiry from ' + name, from_name: 'Altius website', Name: name, Phone: phone, Email: mail, Location: f.location.value.trim(), Need: f.range.value, 'Area (sq ft)': f.area.value.trim(), Details: f.message.value.trim(), Page: location.href };
    if (mail) data.replyto = mail;
    send.disabled = true;
    send.textContent = 'Sending...';
    say('Sending your enquiry...');
    fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (String(d.success) !== 'true') throw new Error('not sent');
        track('form');
        done();
      })
      .catch(function () {
        say('Sorry, that did not send. Please try again, or call us on +91 98300 20010.', 'bad');
      })
      .then(function () {
        send.disabled = false;
        send.innerHTML = label;
      });
  });
})();

// Phone menu
(function () {
  var top = document.querySelector('.top');
  var btn = top && top.querySelector('.menu-btn');
  if (!btn) return;
  function set(open) {
    top.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.querySelector('span').textContent = open ? 'Close' : 'Menu';
  }
  btn.addEventListener('click', function () {
    set(!top.classList.contains('open'));
  });
  top.querySelector('nav').addEventListener('click', function (e) {
    if (e.target.closest('a')) set(false);
  });
  document.addEventListener('click', function (e) {
    if (!top.contains(e.target)) set(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && top.classList.contains('open')) {
      set(false);
      btn.focus();
    }
  });
})();
