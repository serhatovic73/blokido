// Blokido website: sticky bar, scroll reveal, language picker, screenshot arrows and the self-playing board demo.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const top = $('.top');
  const onScroll = () => top && top.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal sections as they scroll in
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('in'));
  }

  // Language picker: remember the choice so the root page stops auto-redirecting
  const sel = $('#lang');
  if (sel) sel.addEventListener('change', () => {
    const opt = sel.selectedOptions[0];
    try { localStorage.setItem('blokido-lang', sel.value); } catch (e) {}
    location.href = opt.dataset.href;
  });

  // Screenshot arrows
  const shots = $('.shots');
  $$('[data-shots]').forEach(b => b.addEventListener('click', () => {
    const dir = (+b.dataset.shots) * (document.dir === 'rtl' ? -1 : 1);
    shots.scrollBy({ left: dir * 262, behavior: reduce ? 'auto' : 'smooth' });
  }));

  // Self-playing board: pieces drop into a row and a column, both pop, combo grows
  const board = $('#demoBoard');
  if (!board) return;
  const N = 8, COLORS = ['#4C7CFF', '#00D4FF', '#FFD166', '#FF6B81', '#7EF29A', '#A78BFA', '#FF9F43'];
  const cells = [], grid = Array(N * N).fill(null);
  for (let i = 0; i < N * N; i++) { const c = document.createElement('div'); c.className = 'cell'; board.appendChild(c); cells.push(c); }
  const scoreEl = $('#demoScore'), burst = $('#demoBurst'), comboEl = $('#demoCombo');
  const rnd = n => Math.floor(Math.random() * n);
  const pick = a => a[rnd(a.length)];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  function set(i, color) {
    grid[i] = color;
    const c = cells[i];
    c.classList.remove('clr', 'glow');
    if (color) { c.style.setProperty('--c', color); c.classList.remove('f'); void c.offsetWidth; c.classList.add('f'); }
    else { c.classList.remove('f'); c.style.removeProperty('--c'); }
  }
  // Start with a scattered, half-full board
  for (let i = 0; i < N * N; i++) if (Math.random() < .42) set(i, pick(COLORS));
  let score = 0, combo = 0;

  async function turn() {
    const r = rnd(N), c = rnd(N);
    const both = Math.random() < .45;
    const line = [];
    for (let k = 0; k < N; k++) line.push(r * N + k);
    if (both) for (let k = 0; k < N; k++) if (k !== r) line.push(k * N + c);
    // Fill the empty cells of the target lines in small "pieces" of one color
    const empty = line.filter(i => !grid[i]);
    while (empty.length) {
      const color = pick(COLORS), size = 1 + rnd(3);
      for (const i of empty.splice(0, size)) set(i, color);
      await wait(380);
    }
    line.forEach(i => cells[i].classList.add('glow'));
    await wait(320);
    combo++;
    const lines = both ? 2 : 1;
    score += lines * 80 * combo;
    line.forEach((i, n) => { cells[i].style.setProperty('--d', (n % N) * 28 + 'ms'); cells[i].classList.add('clr'); });
    if (combo >= 2) {
      comboEl.textContent = '×' + combo;
      burst.classList.remove('go'); void burst.offsetWidth; burst.classList.add('go');
    }
    countTo(score);
    await wait(420);
    line.forEach(i => set(i, null));
    // Keep the board lively: sprinkle a few blocks back in
    for (let k = 0; k < 4 + rnd(4); k++) { const i = rnd(N * N); if (!grid[i]) set(i, pick(COLORS)); }
    if (combo >= 6) { combo = 0; }
    await wait(700);
  }
  let shown = 0;
  function countTo(target) {
    const from = shown, t0 = performance.now();
    (function step(t) {
      const p = Math.min(1, (t - t0) / 500);
      shown = Math.round(from + (target - from) * p);
      scoreEl.textContent = shown.toLocaleString(document.documentElement.lang);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  if (reduce) return;
  let running = false, visible = false;
  async function loop() {
    if (running) return;
    running = true;
    while (visible && !document.hidden) await turn();
    running = false;
  }
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) loop(); }).observe(board);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible) loop(); });
})();
