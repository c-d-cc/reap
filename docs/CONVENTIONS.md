# Docs Conventions

## 1. title / sidebar name / URL path 일치

문서의 **title**, **sidebar menu name**, **URL path**는 letter casing이 다를 수 있지만, 항상 같은 이름이어야 한다.

- URL path는 항상 영어 기준 (kebab-case)
- title과 sidebar name은 언어별로 번역 가능하지만, URL path와 의미가 일치해야 함

예시:
- title: "Merge Generation", sidebar: "Merge Generation", URL: `/docs/merge-generation` ✅
- title: "Merge Generation", sidebar: "개요", URL: `/docs/merge-lifecycle` ❌

### 적용 대상
- `src/i18n/translations/*.ts`의 `nav.items.*` (sidebar name)
- `src/i18n/translations/*.ts`의 각 페이지 `title` (문서 제목)
- `src/components/AppSidebar.tsx`의 `href` (URL path)
- `src/App.tsx`의 `Route path` (URL path)

## 2. 언어별 영어/로컬 단어 선택

title과 sidebar name에서 영어를 유지할지, 로컬 언어로 번역할지는 **가독성 기준으로 케이스별 판단**한다.

판단 기준:
- 해당 용어가 로컬 언어로 번역했을 때 **자연스럽고 직관적**이면 → 로컬 단어 사용 (예: "Introduction" → "소개")
- 해당 용어가 **고유 명사**이거나, 로컬 번역이 **어색하거나 의미가 흐려지면** → 영어 유지 (예: "Merge Generation", "Merge Commands")
- 같은 프로젝트 내에서 **일관성** 유지 — 비슷한 성격의 용어는 같은 방식으로 처리

예시 (한국어):
- "Introduction" → "소개" ✅ (자연스러움)
- "Quick Start" → "빠른 시작" ✅ (자연스러움)
- "Merge Generation" → "Merge Generation" ✅ (번역하면 "병합 세대"인데 어색)
- "Merge Commands" → "Merge Commands" ✅ (영어가 더 읽기 편함)
