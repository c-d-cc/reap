---
id: ms-022
slug: v018-site
title: 문서 사이트 — VitePress, 한국어 먼저
from: flux-0004-plan
refs:
  - ps-5e948f:07-i18n-docs-delegate.md
status: open
openedAt: 2026-09-04T00:04:12Z
focus: true
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
- **사람 검수** — 이 milestone은 검수 전까지 닫지 않는다. 남은 검수는 아래 **검수 대기**에 있다

## 검수 대기 (2026-09-21)

28쪽 전부 작성됐고 placeholder는 0이다(`grep -c PlaceholderPage site/src/routes.ts`).
마지막 여덟 쪽의 사람 검수만 남았다. 사이트는 `npm run dev --prefix site`(5174).

**검수할 것**
- Claim과 Barrier(`/docs/claim-barrier`) — orchestrate에서 옮겨온 claim·
  barrier 상세가 실물 출력과 맞는지, orchestrate 쪽 요약+링크가 자연스러운지
- 설정(`/docs/configuration`) — config.yml 세 필드 설명, 언어 해석 순서가
  `src/i18n.ts`의 `resolveLanguage`와 일치하는지
- Doctor(`/docs/doctor`) — `src/doctor.ts`의 결함 11종·참고 7종 표가
  실제 kind와 어긋나지 않는지, GUIDE 안내선 다섯 값이 최신인지, 실물
  출력(결함 1·참고 2)이 읽기에 자연스러운지
- 비교(`/docs/comparison`) — 다섯 항목이 규범을 옮겨 적지 않고 REAP
  자신의 관찰로 읽히는지, "vs" 구성이 과장되지 않았는지
- orchestrate(`/docs/orchestrate`) — claim/barrier를 들어낸 뒤에도 절
  흐름이 자연스러운지, submodule `--force` 한 줄의 위치
- skill 10종(`/docs/skill-reference`) — evolve 항목에 더한 위임 문장이
  `/docs/delegation`과 중복되지 않으면서도 정확한지
- CLI 레퍼런스(`/docs/cli-reference`) — `ctx` usage 수정이 실제 usage와
  맞는지
- v0.17에서 이주(`/docs/migration`) — selfview 실물 이주에서 배운 세
  항목(기록 파일 실례·backlog 판단 기준·design 하위 문서 링크)이 옮겨
  적기가 아니라 요약으로 읽히는지

세부는 `.reap/life/generations/gen-0099-exec-site-collab-ref.md`의
Outcome·Dead Ends·판단이 갈렸던 곳에. 특히 Dead Ends의 두 번째 항목 —
이 세대 도중 다른 milestone(ms-024)이 같은 작업 트리에서 동시에 진행돼
`07ad883` 커밋이 이 세대의 미커밋 편집분(ko.ts 인터페이스)을 함께 실어간
사실을 확인할 것. 콘텐츠는 최종 diff로 의도와 같음을 확인했지만 커밋
이력이 지저분하다 — 정리(reword 등) 여부는 사람 판단.

**여기 둔 이유** — 이 상태는 milestone이 열려 있는 동안 계속 참인 것이고, 세션을 넘겨야
할 작업 내용이 아니다. 인계(`life/handoff.md`)는 **이번 세션이 한 일 중 다음 세션이
이어서 일하는 데 필요한 것**만 갖는다(`ps-4f2a91`의 `03-storage.md`).

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
