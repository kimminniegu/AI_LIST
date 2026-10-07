// 한 페이지에 컨트롤 타워와 6개 분야를 이어서 그리고,
// 주소(#/분야/도구)에 따라 해당 칸으로 스크롤합니다.
//   #/              → 맨 위 (컨트롤 타워)
//   #/vibe          → 바이브 코딩 칸
//   #/vibe/cursor   → 바이브 코딩 칸의 Cursor를 펼쳐서 이동

const main = document.getElementById('main');
const navCats = document.getElementById('nav-cats');
const menuBtn = document.getElementById('menu-btn');
const backdrop = document.getElementById('backdrop');

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));
const pad = (n) => String(n).padStart(2, '0');
const list = (items, ordered = false) => {
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${items.map((t) => `<li>${esc(t)}</li>`).join('')}</${tag}>`;
};
const iconTile = (tool, size = '') => `
  <span class="icon-tile ${size}"><img src="${esc(tool.icon)}" alt="" loading="lazy"></span>`;
const toolDomId = (cat, tool) => `t-${cat.id}-${tool.id}`;

const allTools = CATEGORIES.flatMap((c) => c.tools);

/* ---------- 사이드바 ---------- */
function renderNav() {
  navCats.innerHTML = CATEGORIES.map((c, i) => `
    <li>
      <a class="nav-link" href="#/${c.id}" data-route="${c.id}">
        <span class="nav-num">${pad(i + 1)}</span>
        <span class="nav-name">${esc(c.name)}</span>
        <span class="nav-count">${c.tools.length}</span>
      </a>
    </li>`).join('');
}

function markNav(route) {
  document.querySelectorAll('.nav-link').forEach((a) => {
    if (a.dataset.route === route) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
}

/* ---------- 컨트롤 타워 ---------- */
function towerHTML() {
  return `
    <section class="tower" id="tower" data-route="tower" aria-labelledby="tower-title">
      <header class="page-head">
        <p class="eyebrow">컨트롤 타워</p>
        <h1 id="tower-title">팀이 직접 써 본 AI 한눈에 보기</h1>
        <p class="page-desc">분야를 누르면 해당 칸으로, 아이콘을 누르면 그 AI의 세부 내용으로 바로 이동합니다.</p>
      </header>

      <div class="stats">
        <div class="stat"><div class="stat-value">${allTools.length}</div><div class="stat-label">써 본 AI</div></div>
        <div class="stat"><div class="stat-value">${CATEGORIES.length}</div><div class="stat-label">분야</div></div>
      </div>

      <div class="cat-grid">
        ${CATEGORIES.map((c, i) => `
          <article class="cat-card">
            <span class="cat-num">${pad(i + 1)}</span>
            <h2><a class="cat-link" href="#/${c.id}">${esc(c.name)}</a></h2>
            <p class="cat-desc">${esc(c.desc)}</p>
            <div class="cat-icons">
              ${c.tools.map((t) => `
                <a href="#/${c.id}/${t.id}" title="${esc(t.name)}" aria-label="${esc(t.name)} 세부 내용">${iconTile(t)}</a>`).join('')}
            </div>
            <div class="cat-meta">
              <span>AI ${c.tools.length}개</span>
              <span class="cat-go" aria-hidden="true">바로 가기 ↓</span>
            </div>
          </article>`).join('')}
      </div>
    </section>`;
}

/* ---------- 분야 칸 ---------- */
function categoryHTML(cat, idx) {
  return `
    <section class="cat-section" id="cat-${cat.id}" data-route="${cat.id}" aria-labelledby="cat-${cat.id}-title">
      <header class="section-head">
        <span class="section-num">${pad(idx + 1)}</span>
        <div>
          <h2 id="cat-${cat.id}-title">${esc(cat.name)}</h2>
          <p class="page-desc">${esc(cat.desc)}</p>
        </div>
      </header>
      <div class="tool-stack">
        ${cat.tools.map((t) => toolHTML(cat, t)).join('')}
      </div>
    </section>`;
}

function toolHTML(cat, t) {
  const p = t.pricing;
  const priceNote = [
    p.checked ? `확인일 ${esc(p.checked)}` : '',
    ...p.sources.map((u) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(u.replace(/^https?:\/\//, ''))}</a>`),
  ].filter(Boolean).join('<br>');

  return `
    <details class="tool" id="${toolDomId(cat, t)}">
      <summary class="tool-sum">
        ${iconTile(t, 'lg')}
        <span class="tool-sum-text">
          <span class="tool-name">${esc(t.name)}${t.ko ? `<span class="ko">${esc(t.ko)}</span>` : ''}</span>
          <span class="one-liner">${esc(t.oneLiner)}</span>
        </span>
        <span class="chevron" aria-hidden="true"></span>
      </summary>

      <div class="tool-body">
        <section class="section pro">
          <h3>장점</h3>
          ${list(t.pros)}
        </section>
        <section class="section con">
          <h3>아쉬운 점</h3>
          ${list(t.cons)}
        </section>
        <section class="section review full">
          <h3>직접 써 본 소감</h3>
          ${t.review.map((l) => `<p>${esc(l)}</p>`).join('')}
        </section>
        <section class="section">
          <h3>사용 방법</h3>
          ${list(t.howTo.items, t.howTo.ordered)}
        </section>
        <section class="section">
          <h3>사용 요금</h3>
          ${list(p.items)}
          ${priceNote ? `<p class="price-note">${priceNote}</p>` : ''}
        </section>
        ${t.url ? `
          <div class="tool-actions full">
            <a class="visit" href="${esc(t.url)}" target="_blank" rel="noopener">${esc(t.urlLabel)} ↗</a>
          </div>` : ''}
      </div>
    </details>`;
}

function render() {
  main.innerHTML = towerHTML() + CATEGORIES.map(categoryHTML).join('');
}

/* ---------- 이동 ---------- */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function navigate(hash, smooth = true) {
  const [catId, toolId] = hash.replace(/^#\/?/, '').split('/');
  const cat = CATEGORIES.find((c) => c.id === catId);
  const tool = cat?.tools.find((t) => t.id === toolId);

  let target = document.getElementById('tower');
  if (tool) {
    target = document.getElementById(toolDomId(cat, tool));
    target.open = true;
  } else if (cat) {
    target = document.getElementById(`cat-${cat.id}`);
  }

  if (target.id === 'tower') window.scrollTo({ top: 0, behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
  else target.scrollIntoView({ behavior: smooth && !reduceMotion ? 'smooth' : 'auto', block: 'start' });

  markNav(cat ? cat.id : 'tower');
  closeNav();
}

// 같은 링크를 다시 눌러도 이동하도록 해시 링크를 직접 처리
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#/"]');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  const hash = a.getAttribute('href');
  if (location.hash !== hash) history.pushState(null, '', hash);
  navigate(hash);
});
window.addEventListener('popstate', () => navigate(location.hash));

/* ---------- 스크롤 위치에 맞춰 사이드바 표시 ---------- */
function watchSections() {
  const sections = [...document.querySelectorAll('[data-route]')].filter((el) => el.tagName === 'SECTION');
  const visible = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => visible.set(en.target, en.isIntersecting));
    const current = sections.find((s) => visible.get(s));
    if (current) markNav(current.dataset.route);
  }, { rootMargin: '-30% 0px -60% 0px' });
  sections.forEach((s) => io.observe(s));
}

/* ---------- 모바일 메뉴 ---------- */
function openNav() {
  document.body.classList.add('nav-open');
  backdrop.hidden = false;
  menuBtn.setAttribute('aria-expanded', 'true');
}
function closeNav() {
  document.body.classList.remove('nav-open');
  backdrop.hidden = true;
  menuBtn.setAttribute('aria-expanded', 'false');
}
menuBtn.addEventListener('click', () => (
  document.body.classList.contains('nav-open') ? closeNav() : openNav()
));
backdrop.addEventListener('click', closeNav);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });

renderNav();
render();
watchSections();
if (location.hash) navigate(location.hash, false);
else markNav('tower');
