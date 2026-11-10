// Builds the static Blokido website (16 languages + privacy policy and terms) from _build/data.json.
// data.json holds the game's own texts (LANGS, store copy, UI strings). Rebuild: node _build/build.js
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const { LANGS, COPY, STR } = require('./data.json');
// The game ships policy texts in tr/en only; legal.json adds the other 14 languages
const LEGAL = require('./legal.json');
for (const [l, t] of Object.entries(LEGAL)) Object.assign(STR[l], t);

const BASE = 'https://serhatovic73.github.io/blokido/';
const EMAIL = 'serhatgicer49@gmail.com';
const RTL = new Set(['ar', 'fa']);
const LEGAL_LANGS = new Set(LANGS.map(x => x[0]).filter(l => STR[l].privacyText && STR[l].termsText));
const COLORS = ['#4C7CFF', '#00D4FF', '#FFD166', '#FF6B81', '#7EF29A', '#A78BFA', '#FF9F43'];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Numbers like "38" or "20×20" get the gold accent, same as the store art
const accent = s => esc(s).replace(/([0-9০-৯۰-۹]+(?:[×x][0-9০-৯۰-۹]+)?)/g, '<b>$1</b>');
const dir = l => (l === 'en' ? '' : l + '/');            // folder of a language's pages, relative to the root
const up = l => (l === 'en' ? './' : '../');             // from that folder back to the root
const legalLang = l => (LEGAL_LANGS.has(l) ? l : 'en');
const mail = `<a href="mailto:${EMAIL}">${EMAIL}</a>`;
const withMail = html => html.replace(/\[(contact email|iletişim e-postası)\]/g, mail);

const icon = {
  chev: '<svg class="i" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
  plus: '<svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  left: '<svg class="i" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>',
  right: '<svg class="i" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>',
  star: '<svg class="i" viewBox="0 0 24 24"><path class="fill" d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
  cal: '<svg class="i" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>',
  trophy: '<svg class="i" viewBox="0 0 24 24"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8"/></svg>',
  mail: '<svg class="i" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>',
  globe: '<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
  play: '<svg class="i" viewBox="0 0 24 24"><path class="fill" d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.7l-10-6.5A1 1 0 0 0 8 5.5z"/></svg>',
  back: '<svg class="i" viewBox="0 0 24 24"><path d="M19 12H5m6-6-6 6 6 6"/></svg>',
};
const storeIcons = {
  ios: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.5 18.5h3"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path fill="#00D4FF" d="M4 3.6v16.8c0 .6.6 1 1.1.7L13 12 5.1 2.9C4.6 2.6 4 3 4 3.6z"/><path fill="#7EF29A" d="m13 12 3.3 3.3L6 21.3 13 12z"/><path fill="#FFD166" d="M16.3 8.7 13 12l3.3 3.3 3.4-2a1.5 1.5 0 0 0 0-2.6z"/><path fill="#FF6B81" d="M6 2.7 16.3 8.7 13 12 6 2.7z"/></svg>',
};

const wordmark = `<div class="wordmark" role="img" aria-label="Blokido"><span class="wl">BL</span><span class="wo" style="--c:var(--coral)"></span><span class="wl">K</span><span class="wi"><span class="wl">I</span><i class="wdot"></i></span><span class="wl">D</span><span class="wo wo2" style="--c:var(--cyan)"></span></div>`;

// Rising jelly blocks behind the hero (deterministic so rebuilds don't churn the diff)
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const rise = () => '<div class="rise" aria-hidden="true">' + Array.from({ length: 16 }, (_, k) => {
  const s = 14 + Math.round(rand() * 26), t = 11 + Math.round(rand() * 10), d = -Math.round(rand() * 20);
  return `<i style="left:${Math.round(rand() * 96)}%;--s:${s}px;--c:${COLORS[k % COLORS.length]};--t:${t}s;--d:${d}s;--r:${Math.round(rand() * 240 - 120)}deg"></i>`;
}).join('') + '</div>';

function stores(l) {
  const soon = esc(COPY[l].soon);
  return `<div class="stores">
      <span class="store" aria-label="App Store – ${soon}">${storeIcons.ios}<span><small>${soon}</small><b>App Store</b></span></span>
      <span class="store" aria-label="Google Play – ${soon}">${storeIcons.play}<span><small>${soon}</small><b>Google Play</b></span></span>
    </div>`;
}

function head(l, { title, desc, canonical, alternates = [], og }) {
  return `<!doctype html>
<html lang="${l}" dir="${RTL.has(l) ? 'rtl' : 'ltr'}" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#0B0F2A">
<link rel="canonical" href="${canonical}">
${alternates.join('\n')}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Blokido">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${BASE}assets/img/og-${og}.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="32x32" href="${up(l)}assets/img/icon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="${up(l)}assets/img/icon-192.png">
<link rel="apple-touch-icon" href="${up(l)}assets/img/icon-180.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@700;800;900&display=swap">
<link rel="stylesheet" href="${up(l)}assets/site.css">
<script>document.documentElement.classList.remove('no-js')</script>`;
}

function topbar(l, page, nav) {
  const options = LANGS.map(([code, name]) => {
    // Legal pages switch between the two policy languages; the home page between all 16
    const href = page === 'home' ? up(l) + dir(code) : up(l) + dir(legalLang(code)) + page + '.html';
    return `<option value="${code}" data-href="${href}"${code === l ? ' selected' : ''}>${esc(name)}</option>`;
  }).join('');
  return `<header class="top">
  <div class="wrap">
    <a class="brand" href="${up(l)}${dir(page === 'home' ? l : (LEGAL_LANGS.has(l) ? l : 'en'))}"><img src="${up(l)}assets/img/icon-192.png" alt="" width="36" height="36"><span>Blokido</span></a>
    ${nav || ''}
    <label class="langsel">${icon.globe.replace('class="i"', 'class="i" style="inset-inline-start:10px;inset-inline-end:auto"')}<span hidden>${esc(STR[l].lang)}</span>
      <select id="lang" aria-label="${esc(STR[l].lang)}" style="padding-inline-start:34px">${options}</select>${icon.chev}</label>
  </div>
</header>`;
}

function footer(l) {
  const ll = legalLang(l), p = up(l) + dir(ll);
  return `<footer>
  <div class="wrap">
    <div>© 2026 Blokido</div>
    <nav>
      <a href="${p}privacy.html">${esc(STR[l].privacy)}</a>
      <a href="${p}terms.html">${esc(STR[l].terms)}</a>
      <a class="mail" href="mailto:${EMAIL}">${icon.mail}${EMAIL}</a>
    </nav>
  </div>
</footer>
<script src="${up(l)}assets/site.js" defer></script>
</body>
</html>
`;
}

function home(l) {
  const c = COPY[l], s = STR[l], u = up(l);
  const langNames = LANGS.map(x => x[1]).join(', ');
  const alternates = LANGS.map(([code]) => `<link rel="alternate" hreflang="${code}" href="${BASE}${dir(code)}">`)
    .concat(`<link rel="alternate" hreflang="x-default" href="${BASE}">`);
  // On the root page only: send first-time visitors to their own language
  const redirect = l !== 'en' ? '' : `
<script>(function(){try{if(localStorage.getItem('blokido-lang'))return}catch(e){}
var have=${JSON.stringify(LANGS.map(x => x[0]).filter(x => x !== 'en'))};
var ls=navigator.languages||[navigator.language||''];for(var i=0;i<ls.length;i++){var k=String(ls[i]).toLowerCase().split('-')[0];if(k==='en')return;if(have.indexOf(k)>=0){location.replace(k+'/');return}}})()</script>`;

  const featColors = ['#FFD166', '#00D4FF', '#FF6B81', '#7EF29A', '#A78BFA', '#4C7CFF'];
  const features = c.f.map(([t, d], k) => {
    const col = featColors[k];
    // a tiny 2×2 board: three filled cells in the feature's color, one empty
    const ico = [0, 1, 2, 3].map(n => (n === (k % 4) ? '<i class="e"></i>' : `<i class="jb" style="--c:${col}"></i>`)).join('');
    return `<article class="card feat reveal" style="--i:${k % 3};--fc:${col}"><div class="ico" aria-hidden="true">${ico}</div><h3>${accent(t)}</h3><p>${esc(d)}</p></article>`;
  }).join('\n      ');

  const caps = [s.tagline, ...c.f.slice(1).map(f => f[0])];
  const shots = caps.map((cap, k) => `<figure class="shot"><figcaption><span>${accent(cap)}</span></figcaption><div class="phone"><img src="${u}assets/shots/${l}/${k + 1}.webp" alt="${esc(cap)}" width="540" height="1169" loading="lazy" decoding="async"></div></figure>`).join('\n      ');

  const faq = c.faq.map(([q, a]) => `<details class="card reveal"><summary>${esc(q)}${icon.plus}</summary><p>${esc(a.replace('{langs}', langNames))}</p></details>`).join('\n    ');

  const steps = [1, 2, 3].map(n => `<div class="card step reveal" style="--i:${n - 1}"><div class="num">${n}</div><div><h3>${esc(s['tut' + n + 't'])}</h3><p>${esc(s['tut' + n + 'p'])}</p></div></div>`).join('\n        ');

  const nav = `<nav class="nav" aria-label="Blokido">
      <a href="#how">${esc(s.how)}</a><a href="#features">${esc(c.why)}</a><a href="#faq">${esc(c.faqTitle)}</a><a href="${u}${dir(legalLang(l))}privacy.html">${esc(s.privacy)}</a>
    </nav>`;

  return head(l, { title: c.title, desc: c.desc, canonical: BASE + dir(l), alternates, og: l }) + redirect + `
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'MobileApplication', name: 'Blokido', operatingSystem: 'Android, iOS', applicationCategory: 'GameApplication', description: c.desc, inLanguage: l, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } })}</script>
</head>
<body>
${topbar(l, 'home', nav)}
<main>
  <section class="hero">
    ${rise()}
    <div class="wrap">
      <div class="hero-copy">
        ${wordmark}
        <h1><span class="gold">${esc(s.tagline)}</span><br>${esc(c.sub)}</h1>
        <p class="lead">${esc(c.hero)}</p>
        <div class="cta">
          <a class="btn btn-primary" href="#download">${icon.play}${esc(c.soon)}</a>
          <a class="btn btn-ghost" href="#how">${esc(s.how)}</a>
        </div>
        <div class="pills">
          <span class="chip">${icon.star}${accent(c.f[2][0])}</span>
          <span class="chip">${icon.cal}${esc(c.f[3][0])}</span>
          <span class="chip">${icon.trophy}${esc(s.lbTitle)}</span>
        </div>
      </div>
      <div class="stage" aria-hidden="true">
        <div class="phone"><img src="${u}assets/shots/${l}/1.webp" alt="" width="540" height="1169" fetchpriority="high"></div>
        <span class="float jb hole" style="--c:var(--coral);width:74px;height:74px;left:6%;top:12%;--rot:-12deg"></span>
        <span class="float jb" style="--c:var(--blue);width:46px;height:46px;left:12%;bottom:14%;--rot:10deg;animation-delay:-1.2s"></span>
        <span class="float jb hole" style="--c:var(--cyan);width:56px;height:56px;right:6%;bottom:22%;--rot:14deg;animation-delay:-2.1s"></span>
        <span class="float jb" style="--c:var(--green);width:30px;height:30px;right:22%;top:4%;animation-delay:-.6s"></span>
        <div class="combo-badge"><small>${esc(s.combo)}</small><b>×3</b></div>
      </div>
    </div>
  </section>

  <section class="sec" id="how">
    <div class="wrap">
      <div class="sec-head reveal"><span class="kicker">Blokido</span><h2>${esc(s.how)}</h2><p>${esc(c.f[0][1])}</p></div>
      <div class="demo">
        <div class="boardwrap reveal">
          <div class="hud"><div><div class="lbl">${esc(s.score)}</div><div class="score" id="demoScore">0</div></div><span class="tag">${esc(s.combo)}</span></div>
          <div class="board" id="demoBoard" aria-hidden="true"></div>
          <div class="burst" id="demoBurst" aria-hidden="true"><small>${esc(s.combo)}</small><b id="demoCombo">×2</b></div>
        </div>
        <div class="steps">
        ${steps}
        </div>
      </div>
    </div>
  </section>

  <section class="sec" id="features">
    <div class="wrap">
      <div class="sec-head reveal"><span class="kicker">${esc(s.tagline)}</span><h2>${esc(c.why)}</h2><p>${esc(c.short)}</p></div>
      <div class="features">
      ${features}
      </div>
      <div class="stats">
        <div class="card stat reveal" style="--i:0"><b>38</b><span>${esc(s.thStyle)}</span></div>
        <div class="card stat reveal" style="--i:1"><b>8</b><span>${esc(s.modes)}</span></div>
        <div class="card stat reveal" style="--i:2"><b>21</b><span>${esc(s.achTitle)}</span></div>
        <div class="card stat reveal" style="--i:3"><b>16</b><span>${esc(s.lang)}</span></div>
      </div>
    </div>
  </section>

  <section class="sec" id="screens">
    <div class="wrap">
      <div class="sec-head reveal"><span class="kicker">${esc(s.themes)}</span><h2>${esc(c.sub)}</h2></div>
      <div class="shots">
      ${shots}
      </div>
      <div class="shots-nav"><button class="iconbtn" data-shots="-1" aria-label="‹">${icon.left}</button><button class="iconbtn" data-shots="1" aria-label="›">${icon.right}</button></div>
    </div>
  </section>

  <section class="sec" id="faq">
    <div class="wrap">
      <div class="sec-head reveal"><h2>${esc(c.faqTitle)}</h2></div>
      <div class="faq">
    ${faq}
      </div>
    </div>
  </section>

  <section class="sec" id="download">
    <div class="wrap">
      <div class="card final reveal">
        <img class="icon" src="${u}assets/img/icon-192.png" alt="Blokido" width="96" height="96" loading="lazy">
        <h2>${esc(c.soonTitle)}</h2>
        <p>${esc(c.short)}</p>
        ${stores(l)}
      </div>
    </div>
  </section>
</main>
${footer(l)}`;
}

function legal(l, kind) {
  const s = STR[l], other = l === 'en' ? 'tr' : 'en';
  const otherName = LANGS.find(x => x[0] === other)[1];
  const title = `${s[kind]} – Blokido`;
  const body = withMail(s[kind + 'Text']);
  const desc = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 155);
  const alternates = [...LEGAL_LANGS].map(code => `<link rel="alternate" hreflang="${code}" href="${BASE}${dir(code)}${kind}.html">`);
  const sibling = kind === 'privacy' ? 'terms' : 'privacy';
  return head(l, { title, desc, canonical: `${BASE}${dir(l)}${kind}.html`, alternates, og: l }) + `
</head>
<body>
${topbar(l, kind)}
<main class="legal">
  ${rise()}
  <div class="wrap">
    <a class="btn btn-ghost btn-sm" href="${up(l)}${dir(l)}">${icon.back}Blokido</a>
    <h1>${esc(s[kind])}</h1>
    <div class="switch">
      <a class="btn btn-secondary btn-sm" href="${up(l)}${dir(other)}${kind}.html">${esc(otherName)}</a>
      <a class="btn btn-ghost btn-sm" href="${sibling}.html">${esc(s[sibling])}</a>
    </div>
    <article class="card doc">
      ${body}
    </article>
  </div>
</main>
${footer(l)}`;
}

function write(rel, html) {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html);
}

for (const [l] of LANGS) {
  write(dir(l) + 'index.html', home(l));
  if (LEGAL_LANGS.has(l)) for (const kind of ['privacy', 'terms']) write(dir(l) + kind + '.html', legal(l, kind));
}
const urls = LANGS.map(([l]) => BASE + dir(l)).concat([...LEGAL_LANGS].flatMap(l => ['privacy', 'terms'].map(k => `${BASE}${dir(l)}${k}.html`)));
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${BASE}sitemap.xml\n`);
write('404.html', `<!doctype html><meta charset="utf-8"><title>Blokido</title><meta http-equiv="refresh" content="0; url=${BASE}"><a href="${BASE}">Blokido</a>\n`);
write('.nojekyll', '');
console.log('Built', LANGS.length, 'home pages and', LEGAL_LANGS.size * 2, 'legal pages');
