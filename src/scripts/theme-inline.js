(() => {
  const d = document.documentElement;
  const mq = matchMedia('(prefers-color-scheme: dark)');
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  const current = () => d.dataset.theme || (mq.matches ? 'dark' : 'light');
  const apply = (t) => {
    if (t === 'light' || t === 'dark') d.dataset.theme = t; else delete d.dataset.theme;
    const dark = current() === 'dark';
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => { m.content = dark ? '#171512' : '#faf3e5'; });
    document.querySelectorAll('[data-theme-toggle]').forEach((b) => {
      b.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      const label = b.querySelector('[data-theme-label]');
      if (label) label.textContent = dark ? 'light' : 'dark';
    });
  };
  d.classList.add('theme-js');
  apply(saved);
  document.addEventListener('DOMContentLoaded', () => apply(d.dataset.theme));
  mq.addEventListener('change', () => apply(d.dataset.theme));
  document.addEventListener('click', (e) => {
    const button = e.target instanceof Element && e.target.closest('[data-theme-toggle]');
    if (!button) return;
    const next = current() === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
})();
