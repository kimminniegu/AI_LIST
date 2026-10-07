// 컨트롤 타워와 3개 묶음(분야 2개씩)을 한 화면씩 이어서 그리고,
// 주소에 따라 해당 화면으로 스크롤합니다.
//   #/              → 맨 위 (컨트롤 타워)
//   #/build         → '디자인 & 개발' 묶음 화면
//   #/vibe          → 바이브 코딩이 있는 묶음 화면 (카드 강조)
//   #/vibe/cursor   → 위 화면에서 Cursor 세부 내용 창을 연 상태

const main = document.getElementById('main');
const navCats = document.getElementById('nav-cats');
const menuBtn = document.getElementById('menu-btn');
const backdrop = document.getElementById('backdrop');
const sheet = document.getElementById('sheet');
const sheetInner = document.getElementById('sheet-inner');

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
const hueVar = (cat) => `--hue: var(--hue-${cat.id})`;
const PLAN_LABELS = { free: '무료', freemium: '무료 플랜 있음', trial: '무료 체험', paid: '유료' };
const planBadge = (tool) => `<span class="plan plan-${tool.plan}">${PLAN_LABELS[tool.plan]}</span>`;

const catById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const groupOf = (catId) => GROUPS.find((g) => g.cats.includes(catId));
const catNum = (cat) => pad(CATEGORIES.indexOf(cat) + 1);
const allTools = CATEGORIES.flatMap((c) => c.tools);

/* ---------- 사이드바 ---------- */
function renderNav() {
  navCats.innerHTML = GROUPS.map((g) => `
    <li class="nav-group">
      <a class="nav-link nav-group-link" href="#/${g.id}" data-route="${g.id}">${esc(g.name)}</a>
      <ul class="nav-sub">
        ${g.cats.map((id) => catById[id]).map((c) => `
          <li>
            <a class="nav-link nav-cat" href="#/${c.id}" style="${hueVar(c)}">
              <span class="nav-dot" aria-hidden="true"></span>
              <span class="nav-name">${esc(c.name)}</span>
              <span class="nav-count">${c.tools.length}</span>
            </a>
          </li>`).join('')}
      </ul>
    </li>`).join('');
}

function markNav(route) {
  document.querySelectorAll('[data-route].nav-link').forEach((a) => {
    if (a.dataset.route === route) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
  document.querySelectorAll('.nav-group').forEach((li) => {
    li.classList.toggle('is-current', li.querySelector('.nav-group-link').dataset.route === route);
  });
}

/* ---------- 컨트롤 타워 ---------- */
function towerHTML() {
  return `
    <section class="tower screen" id="tower" data-route="tower" aria-labelledby="tower-title">
      <header class="hero">
        <h1 id="tower-title">팀이 직접 써 본<br>AI 한눈에 보기</h1>
        <p>분야를 고르면 해당 화면으로, 아이콘을 누르면 그 AI의 세부 내용으로 이동합니다.</p>
        <div class="hero-stats">
          <span>분야 <b>${CATEGORIES.length}</b></span>
          <span>AI <b>${allTools.length}</b></span>
        </div>
      </header>

      <div class="tower-groups">
        ${GROUPS.map((g) => `
          <div class="tower-group">
            <h2 class="tower-group-name"><a href="#/${g.id}">${esc(g.name)}</a></h2>
            ${g.cats.map((id) => catById[id]).map((c) => `
              <article class="cat-card" style="${hueVar(c)}">
                <h3><a class="cat-link" href="#/${c.id}">${esc(c.name)}</a></h3>
                <div class="cat-icons">
                  ${c.tools.map((t) => `
                    <a href="#/${c.id}/${t.id}" title="${esc(t.name)}" aria-label="${esc(t.name)} 세부 내용">${iconTile(t)}</a>`).join('')}
                  <span class="cat-meta">AI ${c.tools.length}개</span>
                </div>
              </article>`).join('')}
          </div>`).join('')}
      </div>
    </section>`;
}

/* ---------- 묶음 화면 (분야 카드 2개) ---------- */
function groupHTML(g) {
  return `
    <section class="group screen" id="group-${g.id}" data-route="${g.id}" aria-labelledby="group-${g.id}-title">
      <header class="group-head">
        <h2 id="group-${g.id}-title">${esc(g.name)}</h2>
        <p>${esc(g.desc)}</p>
      </header>
      <div class="group-cards">
        ${g.cats.map((id) => categoryHTML(catById[id])).join('')}
      </div>
    </section>`;
}

function categoryHTML(cat) {
  return `
    <article class="impact" id="cat-${cat.id}" style="${hueVar(cat)}" aria-labelledby="cat-${cat.id}-title">
      <header class="impact-head">
        <span class="impact-num">${catNum(cat)}</span>
        <h3 id="cat-${cat.id}-title">${esc(cat.name)}</h3>
        <p class="impact-desc">${esc(cat.desc)}</p>
      </header>
      <ul class="pill-list" aria-label="${esc(cat.name)} AI 목록">
        ${cat.tools.map((t) => `
          <li>
            <button class="pill" type="button" data-cat="${cat.id}" data-tool="${t.id}" aria-haspopup="dialog">
              ${iconTile(t, 'sm')}
              <span class="pill-name">${esc(t.name)}${t.ko ? `<span class="ko">${esc(t.ko)}</span>` : ''}</span>
              ${planBadge(t)}
              <span class="pill-chevron" aria-hidden="true"></span>
            </button>
          </li>`).join('')}
      </ul>
    </article>`;
}

function detailHTML(t) {
  const p = t.pricing;
  const priceNote = [
    p.checked ? `확인일 ${esc(p.checked)}` : '',
    ...p.sources.map((u) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(u.replace(/^https?:\/\//, ''))}</a>`),
  ].filter(Boolean).join('<br>');

  return `
    <header class="sheet-head">
      ${iconTile(t)}
      <div class="sheet-title">
        <h3 id="sheet-title" tabindex="-1" autofocus>${esc(t.name)}${planBadge(t)}</h3>
        <p>${esc(t.oneLiner)}</p>
      </div>
      <button class="sheet-close" type="button" aria-label="닫기" data-close></button>
    </header>
    <div class="sheet-body">
      <section class="section pro">
        <h4>장점</h4>
        ${list(t.pros)}
      </section>
      <section class="section con">
        <h4>아쉬운 점</h4>
        ${list(t.cons)}
      </section>
      <section class="section review full">
        <h4>직접 써 본 소감</h4>
        ${t.review.map((l) => `<p>${esc(l)}</p>`).join('')}
      </section>
      <section class="section">
        <h4>사용 방법</h4>
        ${list(t.howTo.items, t.howTo.ordered)}
      </section>
      <section class="section">
        <h4>사용 요금</h4>
        ${list(p.items)}
        ${priceNote ? `<p class="price-note">${priceNote}</p>` : ''}
      </section>
    </div>
    ${t.url ? `
      <footer class="sheet-foot">
        <a class="visit" href="${esc(t.url)}" target="_blank" rel="noopener">${esc(t.urlLabel)} ↗</a>
      </footer>` : ''}`;
}

function render() {
  main.innerHTML = towerHTML() + GROUPS.map(groupHTML).join('');
}

/* ---------- 세부 내용 창 ---------- */
let sheetCat = null;

function openSheet(cat, tool) {
  sheetCat = cat;
  sheetInner.innerHTML = detailHTML(tool);
  if (!sheet.open) sheet.showModal();
  document.documentElement.classList.add('sheet-open');
  history.replaceState(null, '', `#/${cat.id}/${tool.id}`);
}

sheet.addEventListener('close', () => {
  if (sheet.open) return; // 닫자마자 다른 AI로 다시 연 경우
  document.documentElement.classList.remove('sheet-open');
  if (sheetCat) history.replaceState(null, '', `#/${sheetCat.id}`);
});
sheet.addEventListener('click', (e) => {
  // 닫기 버튼 또는 창 바깥(배경)을 누르면 닫기
  if (e.target === sheet || e.target.closest('[data-close]')) sheet.close();
});

main.addEventListener('click', (e) => {
  const pill = e.target.closest('.pill');
  if (!pill) return;
  const cat = CATEGORIES.find((c) => c.id === pill.dataset.cat);
  openSheet(cat, cat.tools.find((t) => t.id === pill.dataset.tool));
});

/* ---------- 이동 ---------- */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function navigate(hash, smooth = true) {
  const [id, toolId] = hash.replace(/^#\/?/, '').split('/');
  const cat = catById[id];
  const group = cat ? groupOf(cat.id) : GROUPS.find((g) => g.id === id);
  const tool = cat?.tools.find((t) => t.id === toolId);
  const behavior = smooth && !reduceMotion ? 'smooth' : 'auto';

  if (sheet.open) sheet.close();
  if (group) {
    // 휴대폰에서는 묶음 화면이 길어서 분야 카드로 바로 이동
    const target = cat && isNarrow.matches ? document.getElementById(`cat-${cat.id}`) : document.getElementById(`group-${group.id}`);
    target.scrollIntoView({ behavior, block: 'start' });
    if (cat && !tool) flash(document.getElementById(`cat-${cat.id}`));
    if (tool) openSheet(cat, tool);
  } else {
    window.scrollTo({ top: 0, behavior });
  }
  markNav(group ? group.id : 'tower');
  closeNav();
}

const isNarrow = window.matchMedia('(max-width: 900px)');

// 분야를 눌러 이동했을 때 해당 카드를 잠깐 강조
function flash(el) {
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
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
  const sections = [...document.querySelectorAll('section[data-route]')];
  const visible = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => visible.set(en.target, en.isIntersecting));
    const current = sections.find((sec) => visible.get(sec));
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
