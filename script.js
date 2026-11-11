/* ============================================================
   CONTACT FORM SETTING (the only thing you need to edit)
   After creating your form at formspree.io, paste only the ID here.
   Example: if your link is https://formspree.io/f/xyzabcde  ->  'xyzabcde'
   Leave it empty ('') and the Send button opens the visitor's email app instead.
============================================================ */
const FORMSPREE_ID = '';
const MY_EMAIL = 'mokshitakothari@gmail.com';

/* Small, dependency-free enhancements. The page works fully even without this file. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

$('#year').textContent = new Date().getFullYear();

/* Theme toggle: light by default, dark remembered if chosen */
try { if (localStorage.getItem('theme') === 'dark') document.documentElement.dataset.theme = 'dark'; } catch (e) {}
$('#theme').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
});

/* Mobile menu */
const menu = $('#menu'), burger = $('#burger');
burger.addEventListener('click', () => burger.setAttribute('aria-expanded', menu.classList.toggle('open')));
$$('#menu a').forEach(a => a.addEventListener('click', () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }));

/* Typing animation in the hero */
const typed = $('#typed'), phrase = typed.textContent;
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  typed.textContent = '';
  let i = 0;
  (function type() { typed.textContent = phrase.slice(0, ++i); if (i < phrase.length) setTimeout(type, 50); })();
}

/* Highlight the current section in the nav */
const links = $$('#menu a');
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
$$('main section').forEach(s => spy.observe(s));

/* Certificates: if an image file is missing, show a neat box with the expected filename */
$$('img.cert').forEach(img => {
  const fail = () => {
    const box = document.createElement('div');
    box.className = 'cert cert-missing';
    box.textContent = 'Add image: ' + img.getAttribute('src');
    img.replaceWith(box);
  };
  if (img.complete && img.naturalWidth === 0) fail();
  else img.addEventListener('error', fail, { once: true });
});

/* Contact form: Formspree if FORMSPREE_ID is set, otherwise opens the visitor's email app */
$('#form').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target, note = $('#form-note'), btn = $('button[type="submit"]', form);

  if (!form.checkValidity()) {
    note.textContent = 'Please enter your name, a valid email and a message.';
    return;
  }

  const name = form.name.value.trim(), email = form.email.value.trim(), message = form.message.value.trim();

  /* No Formspree ID yet: open the email app with the message prefilled */
  if (!FORMSPREE_ID) {
    const subject = encodeURIComponent('Portfolio message from ' + name);
    const body = encodeURIComponent(message + '\n\nFrom: ' + name + ' (' + email + ')');
    location.href = 'mailto:' + MY_EMAIL + '?subject=' + subject + '&body=' + body;
    note.textContent = 'Opening your email app. Press send there to deliver the message.';
    return;
  }

  /* Formspree is set: send directly */
  btn.disabled = true;
  note.textContent = 'Sending...';
  try {
    const res = await fetch('https://formspree.io/f/' + FORMSPREE_ID, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    });
    if (res.ok) {
      note.textContent = 'Thank you! Your message has been sent.';
      form.reset();
    } else {
      note.textContent = 'Sorry, something went wrong. Please email me directly at ' + MY_EMAIL + '.';
    }
  } catch (err) {
    note.textContent = 'Network error. Please email me directly at ' + MY_EMAIL + '.';
  }
  btn.disabled = false;
});