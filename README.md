# AI 워크플로우 도구 모음

팀원들이 직접 써 본 AI 서비스 18개를 분야별로 정리한 웹페이지입니다.
원본 데이터는 `AI_워크플로우.xlsx`이며, 이 내용을 HTML 페이지 하나로 만들어 한눈에 비교할 수 있게 합니다.

## 수록 도구

| 분야 | 도구 | 써본 사람 |
| --- | --- | --- |
| 워크플로우 자동화 | [n8n](https://n8n.io/), [Dify](https://dify.ai/ko) | 김 민 |
| 웹/UI/UX 디자인 | [Figma](https://www.figma.com/ko-kr/pricing/), [V0](https://v0.app/), [Google Stitch](https://stitch.withgoogle.com/), [Claude Design](https://claude.com/ko/product/design) | 홍은주 |
| 바이브 코딩 | [Lovable](https://lovable.dev), [Cursor](https://cursor.com), [Bolt.new](https://bolt.new) | 유정현 |
| LLM / 글쓰기 및 전반적인 작업 | [ChatGPT](https://chatgpt.com), [Claude](https://claude.ai), [Gemini](https://gemini.google.com) | 유정현 |
| AI 아바타 및 영상 제작 | [Vidnoz AI](https://www.vidnoz.com/), [DeeVid AI](https://deevid.ai/ko/agent), [HeyGen](https://app.heygen.com/onboarding) | 맹민지 |
| 시각화 & 프레젠테이션 | Claude, Gamma | 양효선 |

## 도구별 항목

엑셀의 열 구성을 그대로 따릅니다. 페이지의 도구 카드에도 이 항목이 들어갑니다.

| 항목 | 내용 |
| --- | --- |
| 분야 | 6개 카테고리 중 하나 |
| AI 서비스 이름 | 도구 이름 |
| 한줄소개 | 도구를 한 문장으로 설명 |
| 사용방법 | 시작부터 결과물까지의 단계 |
| 사용요금 | 요금제별 가격 (일부 항목은 확인일 2026-10-07 표기) |
| 장점 | 써 보고 느낀 강점 |
| 아쉬운점 | 한계와 불편한 점 |
| 직접써본소감 | 체험 후기 |
| 써본사람 | 작성자 |
| URL | 공식 사이트 또는 체험 결과 링크 |

## 페이지 구성 (계획)

- 상단: 제목, 소개 문구, 분야 필터 탭
- 본문: 분야별로 묶은 도구 카드. 카드에는 이름, 한줄소개, 요금이 보이고, 펼치면 사용방법·장점·아쉬운점·소감이 나옴
- 각 카드에 공식 사이트 링크와 작성자 표시
- 모바일에서도 볼 수 있는 반응형 레이아웃

## 파일 구조

```
AI_LIST/
├── README.md
├── AI_워크플로우.xlsx      # 원본 데이터
├── index.html              # 만들 페이지
└── font/                   # 나눔스퀘어 네오
    ├── nanum_square_neo_rg.otf   # Regular — 본문
    ├── nanum_square_neo_bd.otf   # Bold — 소제목
    └── nanum_square_neo_eb.otf   # ExtraBold — 제목
```

폰트는 `@font-face`로 `font/` 폴더의 파일을 불러옵니다.

## 보는 방법

`index.html`을 브라우저에서 열면 됩니다. 별도 설치나 서버가 필요 없습니다.

## 데이터 정리 시 확인할 점

- 15행 DeeVid AI의 작성자가 `맹맨지`로 되어 있음 → `맹민지` 오타로 보임
- 15행 한줄소개의 `드을` → `등을` 오타로 보임
- HeyGen 요금(33,000 / 60,967)에 통화 단위가 없음 → 원화 여부 확인 필요
- 요금 표기 방식이 도구마다 다름 (€, $, 원, 확인일 유무) → 페이지에서는 형식을 통일
- 시각화 & 프레젠테이션의 URL은 공식 사이트가 아니라 체험 결과 공유 링크임
