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
    var data = { Name: name, Phone: phone, Email: mail, Location: f.location.value.trim(), Need: f.range.value, 'Area (sq ft)': f.area.value.trim(), Details: f.message.value.trim(), Page: location.href,
      _subject: 'Website enquiry from ' + name, _template: 'table', _captcha: 'false' };
    if (mail) data._replyto = mail;
    send.disabled = true;
    send.textContent = 'Sending...';
    say('Sending your enquiry. This can take up to a minute, so please keep this page open.');
    fetch('https://formsubmit.co/ajax/' + form.dataset.mail, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (String(d.success) !== 'true') throw new Error('not sent');
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
