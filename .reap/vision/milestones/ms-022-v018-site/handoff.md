# Handoff — ms-022 문서 사이트

## 검수 대기: 핵심 개념·Plan 축 7쪽 / 다음 task 5

gen-0097-exec가 task 4(핵심 개념 세 쪽 + Plan 축 네 쪽)를 전부 마쳤다.
`git log --oneline -2`: 핵심 개념 3(두 축·판단확정사실·저장 구조) →
Plan 축 4(Loop·Plan·Idea와 Research·Milestone 자르기) 두 커밋. 세대는
닫지 않았다 — 사람 검수 대기.

**검수할 것**
- 두 축(`/docs/two-axes`) — 사이클 비교 표(세션 바인딩·동시 개수·닫히는
  조건·근거), 만나는 지점 다이어그램이 실제 관계를 정확히 그리는지
- 판단·확정·사실(`/docs/three-layers`) — 세 층 표, `reap doctor` 실물
  출력과 결함/참고 분류가 `04-commands.md`의 doctor 절과 어긋나지 않는지
- 저장 구조(`/docs/storage`) — 트리가 지금 리포 `.reap/`와 맞는지(세대가
  더 진행되면 gen 번호가 낡는다 — 정상. 구조 자체가 맞는지가 중요)
- Loop(`/docs/loop`) — 유형 넷 표, 실물 예시(loop-0001-plan-auth)
- Plan(`/docs/plan-source`, 제목 "Plan") — 등록부·규약·인용·소비 완료
  네 절이 tasks/4의 요구를 다 담는지, `sources.yml` 실물이 최신인지
- Idea와 Research(`/docs/idea`) — 실물 예시(idea-67a149)와 졸업 조건
- Milestone 자르기(`/docs/carve-milestone`) — 크기 기준·닫는 순서·실물
  예시(ms-001)가 carve-milestone skill과 어긋나지 않는지

세부는 `.reap/life/generations/gen-0097-exec-site-concepts-plan.md`의
Outcome에.

## 다음 task 5 — Execution 축 + 지식

tasks/에 5번 문서가 아직 없다 — milestone.md의 Plan Items 5번
("Execution 축 4 + 지식 4")를 보고 tasks/5-....md를 먼저 쓴 뒤 진행한다.
여덟 쪽: generation·위임 모드·backlog·Milestone 닫기와 Fitness·Genome·
Environment·Vision과 Memory·코드 인덱스(이미 `CodeIndexPage.tsx`로 존재 —
placeholder가 아니라 실제 페이지이므로 tasks/5 범위에서 제외인지 확인).

## 지난 task 4 이전 handoff (기록)

### 검수 대기: 홈+시작하기 4쪽 / 다음 task 4

gen-0096-exec가 task 3(목차 골격 30라우트, 홈 복원, 시작하기 4쪽)을 전부 마쳤다.
`git log --oneline -4`: 골격(라우트·사이드바·nav·placeholder) → 홈(구조 6장,
작업 흐름 표) → 시작하기 4쪽(소개·첫 사용·자율 진화 흐름·v018change 톤) 세 커밋.
세대는 닫지 않았다 — 사람 검수 대기.

**검수할 것**
- 홈 — `bun run --cwd site dev`(5174)로 `/` 확인. 구조 6장(Knowledge·Plan·
  Vision·Life·Archive·Civilization), 작업 흐름 표(단계·수행 내용·산출물).
- 소개(`/docs/introduction`) — 정의 문단·왜 REAP인가 표·구조 개요·프로젝트
  구조 트리·다음 쪽 링크.
- 첫 사용(`/docs/quick-start`) — 전제 조건 표·두 단계 설치(install 흡수)·
  init/evolve/complete 세 skill·실물 상태 줄 예시.
- 자율 진화 흐름(`/docs/autonomous-evolution`, 신설) — SessionStart 주입·
  실물 상태 줄·evolve의 세 판단·자율 구간·complete 커밋 규칙·milestone fitness.
- 목차 전체 — 사이드바 8묶음 30라우트가 `docs/reap-plan/reap_v_0_18_release/
  07-i18n-docs-delegate.md`의 G10 표와 맞는지. placeholder 18쪽은 "이 문서는
  준비 중입니다." 한 줄만 낸다 — 정상이다.

세부는 `.reap/life/generations/gen-0096-exec-site-toc-start.md`의 Outcome에.

## 다음 task 4 — 핵심 개념 + Plan 축

8쪽: two-axes·three-layers·storage·loop·plan-source·idea·carve-milestone
(+ carve-milestone은 Plan 축 소속이므로 4묶음 아님, tasks/4 문서로 범위 확정
필요). `concepts.tsx`가 이번에 지워졌지만 git 이력(커밋 `02d7457` 이전)에
layersTitle·unitsTitle·splitHeaders·storageTree 등 재사용 가능한 초안이
남아 있다 — 옮겨 적지 말고 근거로만 쓴다.

## 사람 검수 대기(디자인 비교·내용) → en 확장

첫 시도(VitePress 새 사이트, gen-0085·0088)는 사람 검수(2026-09-04)에서 기각됐다 —
"새 사이트"가 아니라 기존 reap.cc 디자인·톤에 내용만 v0.18로 바꾸는 것이 맞다는
판단이었다. gen-0093-exec이 다시 지었다: worktree `../reap-wt-site`(브랜치
`ms-022-site-port`)에 v0.17 `docs/` 앱(Vite+React+Tailwind+wouter)을 `site/`로
그대로 옮기고, 페이지 세트와 ko 번역만 v0.18로 바꿨다. 컴포넌트·CSS·테마·레이아웃은
손대지 않았다.

**검수할 것**
- 디자인이 reap.cc와 같은가 — `bun run --cwd site dev`(포트 5174)로 띄워 나란히 비교
- 내용이 맞는가 — 열두 쪽의 문구는 `site/*.md`(gen-0085·0088이 쓴 한국어 본문, 이번에
  옮기며 지웠다)와 `RELEASE_NOTES.md`가 원천

## 라우트 (지난 상태, gen-0096으로 대체됨)

아래 열세 라우트 표는 task 3 이전 상태다 — 지금은 30라우트다. 현재 표는
`site/src/routes.ts`와 `docs/reap-plan/reap_v_0_18_release/07-i18n-docs-delegate.md`의
G10 목차 표를 본다. 이 절은 기록으로만 남긴다.

## 검증됨 (지난 상태)

이 절도 task 3 이전(13라우트) 검증이다. 지금 검증은 위 "검수 대기" 절의
gen-0096-exec Outcome에 있다.

## en을 더하는 절차 (검수 뒤)

타입·경로 기제는 로케일이 늘어도 다시 손댈 필요가 없게 남겨뒀다.

1. `site/src/i18n/types.ts` — `Locale` 유니온에 `"en"` 추가, `LOCALES`에 넣는다
   (`DEFAULT_LOCALE`은 `"ko"`로 남긴다 — en을 bare URL로 만들 게 아니라면).
   `LOCALE_LABELS`에 라벨 추가
2. `site/src/i18n/translations/en.ts`를 새로 쓴다. `Translations` 타입은
   `ko.ts`가 기준이므로 `import type { Translations } from "./ko"`로 받는다
3. `site/src/i18n/index.ts`의 `translations` record에 `en` 추가
4. `site/src/i18n/locale-path.ts`의 `LOCALE_PREFIXES`에 `en: "/en"` 추가
   (또는 원하는 접두사)
5. `site/src/entry-server.tsx`의 `TRANSLATIONS`·`OG_LOCALES`에 `en` 추가
6. `LanguageSelector`는 `LOCALES.length > 1`이 되는 순간 자동으로 다시
   렌더링된다 — 손댈 필요 없다
7. `scripts/check-docs-prerender.{sh,mjs}`는 `LOCALES`·`DEFAULT_LOCALE`을
   `types.ts`에서 직접 읽으므로 그대로 통과해야 한다 — 로케일 하나일 때만
   건너뛰던 언어 셀렉터 검사(`badSelector`·`badActive`)와 cross-locale
   번역 비교가 다시 켜진다

## 발행

`.github/workflows/docs.yml`은 `main` push의 `site/**` 변경에서만 돈다.
`v0.18`·`ms-022-site-port`에서는 돌지 않는다 — 발행은 사람이 `main`으로
병합한 뒤다.

**이 milestone은 사람 검수 전까지 닫지 않는다.** exit criteria의 "사람 검수"
항목이 이 handoff와 별도로 남아 있다.

## 사람 검수 (2026-09-04) — 방향 재설정

1. VitePress 기각 → v0.17 앱 이식(gen-0093) ✔
2. 문체: spec식 "-한다"체·중점 나열은 "AI 같다" → 합니다체·완결 문장으로 교정(gen-0095) ✔. 기준은 `~/cdws/reap_v17/docs/src/i18n/translations/ko.ts`
3. **홈 구성·메시지는 v0.17 홈 그대로**(tagline "Recursive Evolutionary Autonomous Pipeline", 왜 REAP인가 5쌍, 구조, 작업 흐름, 설치, 핵심 개념, 문서 링크). spec 문장을 키워드로 쓰지 않는다. "무엇이 달라졌나"는 띠·v018change 몫 — **아직 미반영**
4. **목차를 다시 잡는다** — 내용이 너무 줄었다. v0.17(23쪽)을 참고하되 Plan과 Execution을 대등한 축으로, agent의 자율 evolve를 앞세우는 구성. 28쪽 안을 사람에게 올렸고 답 대기. 확정 뒤 홈부터 한 쪽씩 써서 검수
