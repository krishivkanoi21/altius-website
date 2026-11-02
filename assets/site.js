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

// Enquiry form: emails the details to the office and builds a WhatsApp message for the visitor to send
(function () {
  var form = document.getElementById('enq');
  if (!form) return;
  var link = document.getElementById('enq-link');
  var note = document.getElementById('enq-note');
  var sent = '';
  function email(f, name) {
    if (f._honey.value) return;
    var data = { Name: name, Location: f.location.value.trim(), Need: f.range.value, 'Area (sq ft)': f.area.value.trim(), Details: f.message.value.trim(), Page: location.href,
      _subject: 'Website enquiry from ' + name, _template: 'table', _captcha: 'false' };
    var key = JSON.stringify(data);
    if (key === sent) return;
    sent = key;
    fetch('https://formsubmit.co/ajax/' + form.dataset.mail, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: key })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (String(d.success) === 'true') note.textContent = 'We have your details by email. Tap below to send them on WhatsApp too.';
      })
      .catch(function () {});
  }
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var f = form.elements;
    var name = f.name.value.trim();
    if (!name) {
      f.name.setAttribute('aria-invalid', 'true');
      note.textContent = 'Please add your name so we know who to reply to.';
      f.name.focus();
      return;
    }
    f.name.removeAttribute('aria-invalid');
    var lines = ['Hello Altius, I would like a quote.', 'Name: ' + name];
    if (f.location.value.trim()) lines.push('Location: ' + f.location.value.trim());
    lines.push('Need: ' + f.range.value);
    if (f.area.value.trim()) lines.push('Area: ' + f.area.value.trim() + ' sq ft');
    if (f.message.value.trim()) lines.push('Details: ' + f.message.value.trim());
    link.href = 'https://wa.me/919830020010?text=' + encodeURIComponent(lines.join('\n'));
    link.hidden = false;
    note.textContent = 'Your message is ready. Tap below to open WhatsApp and send it.';
    link.focus();
    email(f, name);
  });
})();
