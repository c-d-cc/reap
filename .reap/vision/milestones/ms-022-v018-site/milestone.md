---
id: ms-022
slug: v018-site
title: 문서 사이트 — VitePress, 한국어 먼저
from: loop-0004-plan
refs:
  - ps-5e948f:07-i18n-docs-delegate.md
status: open
openedAt: 2026-09-04T00:04:12Z
---
## Background

**2026-09-04 사람 검수: VitePress 사이트 기각 — 기존 reap.cc 디자인·톤 유지, 내용만 v0.18.** 아래 Exit Criteria의 VitePress 항목은 07 G10(갱신본)대로 v0.17 앱 이식으로 읽는다. gen-0093이 이식했다.

사람 Q1 답(2026-09-04): 새 문서 사이트, 한국어 먼저, 검수 뒤 확장. 규범은 [07-i18n-docs-delegate.md](../../../../docs/reap-plan/reap_v_0_18_release/07-i18n-docs-delegate.md)의 G10. v0.17 사이트(`~/cdws/reap_v17/docs/`, Vite+React 24쪽×5로케일)는 참고일 뿐 되살리지 않는다.

## Exit Criteria

- `site/`에 VitePress 프로젝트. `bun run site:dev`·`site:build`가 돌고 `site/.vitepress/dist`가 정적으로 나온다. 리포 루트 `package.json`의 `files`에 안 들어간다
- 한국어 문서 열두 쪽 안팎: 소개 · 설치 · 첫 사용 · 개념 · skill 10종(한 쪽에 표 + 각 skill 절) · CLI 레퍼런스 · hooks · 코드 인덱스 · orchestrate · v0.17에서 이주 · 릴리스 노트(`RELEASE_NOTES.md`를 include). 규범 복제 없이 링크
- `.github/workflows/docs.yml` — `main` push의 `site/**` 변경에서 빌드·Pages 배포. CNAME 승계. v0.18 브랜치에서는 돌지 않는다
- 로케일 구조가 en 확장을 받을 수 있게 `site/ko/`가 아니라 VitePress `locales` 설정으로 ko가 root 또는 `/ko/`
- 링크 검사(`vitepress build`의 dead link 검사)가 통과
- **사람 검수** — 이 milestone은 검수 전까지 닫지 않는다. handoff에 "검수 대기"로

## Out of Scope

- en·ja·zh-CN·de 확장 — 검수 뒤, ms-021 뒤
- 검색·다크모드 등 VitePress 기본값 밖의 꾸밈
- reap.cc 도메인 전환 시점 — 발행(사람)

## Plan Items

1. VitePress 골격·docs.yml·소개·설치·첫 사용·개념 (tasks/1)
2. skill·CLI·hooks·index·orchestrate·이주·릴리스 노트 (tasks/2)

## 이 milestone이 끝나면 물어볼 것

- README만으로 부족했던 것이 사이트에서 채워졌는가
- 사이트가 spec을 옮겨 적기 시작했는가 (그 신호는 spec이 바뀔 때 사이트도 바뀌어야 하는 문장의 수)

## Plan Items (재설정, 2026-09-04 사람 확정 목차)

3. 목차 골격(28라우트·사이드바 8묶음·자리 표시 페이지) + 홈 복원 + 시작하기 4쪽 (tasks/3)
4. 핵심 개념 3 + Plan 축 4 (tasks/4)
5. Execution 축 4 + 지식 4 (tasks/5)
6. 협업 3 + 레퍼런스 4 + 기타 3 (tasks/6)
각 task 뒤 사람 검수. en 확장은 전부 뒤.
