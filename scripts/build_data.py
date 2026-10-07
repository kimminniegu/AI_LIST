"""AI_워크플로우.xlsx를 읽어 js/data.js를 만듭니다.

실행: python scripts/build_data.py  (파이썬 기본 모듈만 사용)
"""
import re, json, zipfile, xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'AI_워크플로우.xlsx'
OUT = ROOT / 'js' / 'data.js'
M = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
z = zipfile.ZipFile(SRC)
ss = ET.fromstring(z.read('xl/sharedStrings.xml'))
strs = [''.join(t.text or '' for t in si.iter(M+'t')) for si in ss.findall(M+'si')]
sh = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
rows = []
for row in sh.find(M+'sheetData'):
    cells = {}
    for c in row:
        v = c.find(M+'v')
        if v is None: continue
        col = re.match(r'[A-Z]+', c.get('r')).group()
        cells[col] = strs[int(v.text)] if c.get('t') == 's' else v.text
    if cells: rows.append(cells)
rows = rows[1:]  # skip header

CATS = {
  '워크플로우 자동화': ('workflow', '워크플로우 자동화', '반복 업무를 노드로 연결해 자동으로 돌리는 도구'),
  '웹/UI/UX 디자인': ('design', '웹/UI/UX 디자인', '프롬프트나 직접 편집으로 화면을 설계하는 도구'),
  '바이브 코딩': ('vibe', '바이브 코딩', '말로 설명하면 동작하는 웹앱을 만들어 주는 도구'),
  'LLM / 글쓰기 및 전반적인 작업': ('llm', 'LLM / 글쓰기', '글 작성·수정·요약 등 전반적인 작업을 돕는 대화형 AI'),
  'AI 아바타 및 영상 제작': ('video', 'AI 아바타·영상', '대본과 사진으로 아바타가 말하는 영상을 만드는 도구'),
  '시각화 & 프레젠테이션': ('slides', '시각화 & 프레젠테이션', '자료를 정리해 발표 슬라이드로 만드는 도구'),
}
ICONS = {'n8n':'n8n.png','Dify':'dify.svg','Figma':'figma.png','V0':'v0.png','Google Stitch':'google-stitch.jpg',
  'Claude Design':'claude.png','Lovable':'lovable.jpg','Cursor':'cursor.png','Bolt.new':'bolt.png','ChatGPT':'chatgpt.png',
  'Claude':'claude.png','Gemini':'gemini.png','Vidnoz AI':'vidnoz.png','DeeVid AI':'deevid.svg','Hey Gen':'heygen.png','Gamma':'gamma.jpg'}
# 요금 구분: 엑셀의 사용요금·아쉬운점 내용을 보고 정한 값입니다. (분야id/이름)
#   free     = 무료       freemium = 무료 플랜 있음
#   trial    = 무료 체험  paid     = 유료
PLANS = {
  'workflow/n8n': 'trial',           # 클라우드 14일 무료 체험 후 유료 (로컬 설치는 무료)
  'workflow/Dify': 'freemium',       # 무료 200 메시지 크레딧
  'design/Figma': 'freemium',        # 무료 플랜 (파일 수·크레딧 제한)
  'design/V0': 'freemium',           # 무료 크레딧 월 $5
  'design/Google Stitch': 'free',    # 완전 무료
  'design/Claude Design': 'paid',    # 무료로는 못 씀
  'vibe/Lovable': 'freemium',
  'vibe/Cursor': 'freemium',
  'vibe/Bolt.new': 'freemium',
  'llm/ChatGPT': 'freemium',
  'llm/Claude': 'freemium',
  'llm/Gemini': 'freemium',
  'video/Vidnoz AI': 'freemium',     # 무료 30 크레딧
  'video/DeeVid AI': 'paid',         # 공식 요금표에 무료 플랜 없음 (가입 시 20 크레딧만 지급)
  'video/HeyGen': 'freemium',        # 무료 월 3개 영상
  'slides/Claude': 'freemium',       # LLM 분야의 Claude와 같게
  'slides/Gamma': 'freemium',        # 가입 시 400 크레딧 1회 지급
}

# 엑셀 사용요금 칸에 빠진 무료 플랜을 맨 앞에 덧붙입니다. (분야id/이름)
EXTRA_PRICING = {
  'slides/Claude': ['Free: $0/월'],
  'slides/Gamma': ['Free: $0 (가입 시 400 크레딧 1회 지급, 매월 충전 없음)'],
}

# 엑셀 원문의 오타와, 엑셀에서 \로 저장된 원화 기호를 바로잡습니다.
FIXES = [('드을', '등을'), (chr(92), chr(0x20A9))]

def clean(s):
    s = s or ''
    for a, b in FIXES: s = s.replace(a, b)
    return s
def lines(s):
    out = []
    for ln in clean(s).split('\n'):
        ln = re.sub(r'^(`-\s*|•\s*|-\s*)', '', ln.strip()).strip()
        if ln: out.append(ln)
    return out
def steps(s):
    ls = lines(s)
    numbered = sum(bool(re.match(r'^\d+[.)]\s*', l)) for l in ls)
    return {'ordered': numbered >= 2, 'items': [re.sub(r'^\d+[.)]\s*', '', l) for l in ls]}
def pricing(s, extra=()):
    p = {'items': list(extra), 'checked': None, 'sources': []}
    for l in lines(s):
        if l.startswith('http'): p['sources'].append(l)
        elif l.startswith('확인일'): p['checked'] = l.split(':', 1)[1].strip()
        else: p['items'].append(l)
    return p
def slug(s): return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

cats = {}
for r in rows:
    cid, cname, cdesc = CATS[r['A']]
    cat = cats.setdefault(cid, {'id': cid, 'name': cname, 'desc': cdesc, 'tools': []})
    m = re.match(r'^(.*?)\s*\((.*)\)$', r['B'].strip())
    name, ko = (m.group(1), m.group(2)) if m else (r['B'].strip(), None)
    display = {'Hey Gen': 'HeyGen'}.get(name, name)  # 공식 표기로 통일
    url = r.get('J', '').strip()
    official = not re.search(r'/share/|/docs/', url)
    cat['tools'].append({
        'id': slug(display), 'name': display, 'ko': ko,
        'icon': 'icons/' + ICONS[name],
        'plan': PLANS[f'{cid}/{display}'],
        'oneLiner': ' '.join(lines(r.get('C'))),
        'howTo': steps(r.get('D')),
        'pricing': pricing(r.get('E'), EXTRA_PRICING.get(f'{cid}/{display}', [])),
        'pros': lines(r.get('F')),
        'cons': lines(r.get('G')),
        'review': lines(r.get('H')),
        'url': url, 'urlLabel': '공식 사이트' if official else '체험 결과 보기',
    })
data = list(cats.values())
js = ('// AI_워크플로우.xlsx에서 자동 생성한 데이터입니다. 엑셀을 고친 뒤 다시 생성하세요.\n'
      'const CATEGORIES = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n')
open(OUT, 'w', encoding='utf-8').write(js)
print(len(data), 'categories', sum(len(c['tools']) for c in data), 'tools')
