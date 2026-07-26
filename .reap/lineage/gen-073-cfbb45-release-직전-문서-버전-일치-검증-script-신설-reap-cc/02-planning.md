# Planning

## Goal

0.17.2 를 깨끗이 릴리즈 가능한 상태로 만들고, 문서 누락이 재발하지 않도록 **검증 장치를 릴리즈 경로에 심는다.**

세 축:
1. **소급 반영** — docs changelog 에 0.17.1 + 0.17.2 추가, 로케일 drift(0.16.5) 보정, `RELEASE_NOTES.md` 승격
2. **오도 제거** — reap.cc 가 가르치는 폐기된 lifespan 분류를 content-type + pruning 으로 교체 (5 로케일 × 2 위치)
3. **재발 방지** — `scripts/check-docs-version.sh` + release 게이트 + skill 체크리스트

## Completion Criteria

1. `bash scripts/check-docs-version.sh` — 현재 상태에서 **fail**, 수정 후 **pass** (양방향 확인)
2. 로케일 하나를 일부러 되돌리면 **집합 불일치로 fail**
3. 5개 로케일 changelog 최신 항목이 `0.17.2`, 항목 수가 전부 동일(20)
4. 5개 로케일의 memory 설명에서 "Lifespan" 축이 사라지고 content-type + pruning 이 들어감
5. `RELEASE_NOTES.md` — What's New = 0.17.2 내용, `## v0.17.1` 아카이브 존재
6. `npx vite build` (docs) 성공 + 루트 `npm run build` / `typecheck` / unit·e2e 회귀 없음
7. release.yml 이 publish **전에** 검증을 실행

## Background

01-learning.md 참조. 핵심 3가지:

- **backlog 사실 오류 정정**: `RELEASE_NOTES.md` 는 `## What's New` 가 현재 릴리즈 내용이며 v0.17.1 이 이미 있다. 누락이 아니라 **승격 필요** 상태
- **docs 가 폐기 규칙을 가르친다**: `memoryHeaders: ["Tier", "Lifespan", ...]` 가 2곳 × 5 로케일. issue #21 의 문서판 재현
- **`What's New` 에 버전 번호가 없다** → 검증 스크립트가 이 파일에서 버전을 파싱 불가. 대안 설계 필요

## Approach

### 검증 스크립트 설계

`scripts/check-docs-version.sh` — bash, `scripts/` 의 기존 관례(`build.sh`) 따름. 사람이 읽는 출력 + non-zero exit.

| # | 검사 | 방법 |
|---|---|---|
| 1 | `RELEASE_NOTICE.md` 최상단 `## vX.Y.Z` == package version | 직접 비교 |
| 2 | `RELEASE_NOTES.md` **최상단 아카이브 헤더**가 **직전** 버전인지 | `What's New` 에 버전이 없으므로 "승격이 됐는가"로 간접 검증. 최상단 `## vX.Y.Z` 가 package version 과 **같으면** 승격 오류 → fail |
| 3 | 5개 로케일 changelog 최신 == package version | `releaseNotes` 블록 내 첫 `version: "..."` 추출 |
| 4 | 로케일 간 changelog 버전 **집합** 동일 | 각 로케일 전체 목록을 정렬 후 비교 |
| 5 | `src/templates/migration/` 최신 note <= package version | 초과 시 `detectPendingMigrations` 범위 밖이라 영원히 노출 안 되는 죽은 파일 |

**파싱**: `releaseNotes: {` ~ 블록 한정 후 `version: "X.Y.Z"` 정규식. TS 파서 도입은 과잉 (조사도 이 방식으로 했고 충분).

**검사 2의 논리**: 0.17.2 릴리즈 시 What's New 는 0.17.2 내용, 최상단 아카이브는 `## v0.17.1` 이어야 정상. 최상단 아카이브가 `## v0.17.2` 면 승격이 잘못된 것.

### 파이프라인 연결

- **release.yml**: `npm ci` 다음, `npm publish` **앞**에 검증 단계 삽입 (강제 게이트)
- **ci.yml**: 넣지 않음 — 개발 중 package.json 이 문서보다 앞서는 것은 정상인데 fail 처리하면 상시 red
- **`reapdev.versionBump` skill**: 문서 갱신 대상 목록을 명시

### 문서 본문 교체 방침

`memoryHeaders` 의 축을 **Lifespan → Role/Decision rule** 로 바꾸고 pruning 을 추가한다. `~/.reap/reap-guide.md` § Memory 의 표를 기준 텍스트로 삼아 각 로케일로 번역 — gen-072 와 같은 원칙(창작 금지, 한 곳 기준 복제).

## Risk Assessment

| 리스크 | 대응 |
|---|---|
| TS 배열 구문 오류로 docs 빌드 실패 | 5개 파일 수정 후 `npx vite build` 필수 (T016) |
| 잘못된 내용이 main push 즉시 reap.cc 에 공개 | 빌드 확인 후 커밋. docs.yml 은 `docs/**` 변경 시 자동 배포 |
| 번역 품질 | 기존 17개 항목의 어투·용어를 따름. 기술 용어는 원문 유지 |
| 검사 2 로직 오탐 | 정상/승격누락 상태를 수동 테스트 |
| release.yml 실패 시 태그가 이미 밀린 상태 | 의도된 트레이드오프. skill 사전 실행으로 조기 발견 |

## Scope

**변경 대상**
- `RELEASE_NOTES.md`
- `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` — changelog + memory 본문
- `scripts/check-docs-version.sh` (신규)
- `.github/workflows/release.yml`
- `reapdev.versionBump` skill 소스

**out of scope**
- `ci.yml` (위 근거)
- reap.cc 의 memory 외 다른 페이지 전면 감사 — 발견 시 backlog
- daemon 관련 일체

## Tasks

**A — 검증 스크립트 (먼저 만들어 현재 상태를 fail 로 확인)**
- [ ] T001 `scripts/check-docs-version.sh` 신규 — 검사 1~5 구현
- [ ] T002 현재 상태에서 실행 → **fail 확인**

**B — changelog 소급 반영**
- [ ] T003 `en.ts` — 0.17.2 + 0.17.1 항목 추가
- [ ] T004 `ko.ts` — 동일
- [ ] T005 `ja.ts` — 0.17.2 + 0.17.1 + **0.16.5 보정**
- [ ] T006 `de.ts` — 동일
- [ ] T007 `zh-CN.ts` — 동일

**C — memory 본문 오도 제거**
- [ ] T008 `en.ts` — Core Concepts + Vision 두 곳의 memory 표를 content-type + pruning 으로
- [ ] T009 `ko.ts` — 동일
- [ ] T010 `ja.ts` — 동일
- [ ] T011 `de.ts` — 동일
- [ ] T012 `zh-CN.ts` — 동일

**D — RELEASE_NOTES + 파이프라인**
- [ ] T013 `RELEASE_NOTES.md` — What's New 를 0.17.2 로, 기존을 `## v0.17.1` 로 승격
- [ ] T014 `.github/workflows/release.yml` — publish 전 검증 단계
- [ ] T015 `reapdev.versionBump` skill — 문서 갱신 체크리스트

**검증**
- [ ] T016 `npx vite build` (docs) + 루트 `npm run build` / `typecheck`
- [ ] T017 `check-docs-version.sh` **pass** + 로케일 되돌림 테스트
- [ ] T018 unit/e2e 회귀 확인 (baseline: unit 454-0, e2e 263-1)

## Dependencies

- T001 → T002 (fail 확인이 스크립트 유효성의 근거)
- T003~T007, T013 → T017
- T001 → T014
- 전부 → T016 → T018

## Additional Findings

- `RELEASE_NOTICE.md`(CLI 터미널 표시, `notice.ts` 소비) 와 `RELEASE_NOTES.md`(GitHub release body, `release.yml` 소비)는 **별개 파일**이다. 이름이 비슷해 혼동하기 쉬우므로 스크립트 출력에서 명확히 구분한다.
- gen-072 가 genome 에 넣은 "규칙 변경 시 carrier 3중 확인"(guide/genome/prompt)에 **docs 사이트가 빠져 있다.** 본 세대가 그 4번째 carrier 를 실증하므로 adapt 에서 목록 확장을 제안한다.
