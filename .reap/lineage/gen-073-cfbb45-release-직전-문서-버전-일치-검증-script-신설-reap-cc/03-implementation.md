# Implementation Log

## Completed Tasks

| # | 파일 | 내용 |
|---|---|---|
| T001 | `scripts/check-docs-version.sh` | 신규. 검사 5종 — NOTICE 버전 / NOTES 승격 / 로케일별 최신 / **로케일 집합 동일성** / migration note 상한 |
| T002 | — | 현재 상태에서 실행 → **8건 fail 확인** (로케일 최신 5 + 집합 불일치 3). 스크립트가 실제 결함을 잡는다는 근거 |
| T003~T007 | `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` | changelog 에 0.17.2 + 0.17.1 추가, ja/de/zh-CN 의 **0.16.5 누락 보정**. 5개 로케일 모두 20 항목으로 정렬 |
| T008~T012 | 동 5개 파일 | memory 표 2곳(Core Concepts / Vision)의 축을 **Lifespan → Role + Decision rule + Pruning** 으로 교체. `memoryRules` 5줄도 content-type 기준으로 재작성 |
| T013 | `RELEASE_NOTES.md` | What's New 를 0.17.2 내용으로 교체, 기존 v0.17.1 내용을 `## v0.17.1` 로 **승격** |
| T014 | `.github/workflows/release.yml` | `npm ci` 후 `npm publish` **앞**에 검증 단계 삽입 |
| T015 | `.claude/commands/reapdev.versionBump.md` | Step 5-1 신설(검증 스크립트 실행) + RELEASE_NOTES 지시를 실제 승격 구조로 정정 |
| T016 | — | `npx vite build` (docs) 성공 / `npm run build` 0.77MB / typecheck pass |
| T017 | — | 스크립트 **pass** + negative test 로 집합 검사 동작 확인 |
| T018 | — | unit 454-0 / e2e 263-1 — baseline 대비 회귀 없음 |

## Verification Results

| 기준 | 결과 |
|---|---|
| 1. 스크립트 fail → pass 양방향 | **pass** — 수정 전 8 fail, 수정 후 전건 통과 |
| 2. 로케일 되돌림 시 집합 불일치 감지 | **pass** — ja 에서 0.16.5 제거 → `FAIL ja.ts differs from en.ts / missing: 0.16.5` |
| 3. 5개 로케일 최신 0.17.2, 항목 수 동일 | **pass** — 전부 20 항목 |
| 4. 5개 로케일에서 Lifespan 축 제거 | **pass** — `grep "Lifespan\|수명\|寿命\|Lebensdauer\|生命周期"` memoryHeaders/Rows 매치 0 |
| 5. RELEASE_NOTES 승격 | **pass** — What's New = 0.17.2, `## v0.17.1` 아카이브 존재 |
| 6. docs 빌드 + 루트 빌드/타입체크 | **pass** |
| 7. release.yml 이 publish 전 검증 | **pass** — `npm ci` → 검증 → `npm run build` → `npm publish` |

## Discovered Issues

### 1. backlog 의 사실 오류 — `RELEASE_NOTES.md` 는 누락 상태가 아니었다

backlog Problem §1 표에 "RELEASE_NOTES.md 최신 = 0.17.0 ❌" 로 적혀 있었으나 **틀렸다.** `grep -n "^## "` 로 헤더만 확인하고 `## What's New` 의 의미를 놓친 결과다.

실제 구조는 `What's New`(버전 번호 없음, GitHub release body 로 발행) + 그 아래 `## vX.Y.Z` 아카이브이며, v0.17.1 내용이 What's New 에 정상적으로 있었다. 따라서 할 일은 "0.17.1 추가"가 아니라 **"What's New 를 0.17.2 로 교체 + 0.17.1 승격"** 이었다.

**설계에 미친 영향**: `What's New` 에 버전 번호가 없으므로 "package.json 과 직접 비교"가 불가능하다. 대신 **"직전 버전이 아카이브로 승격됐는가"** 로 간접 검증하도록 검사 2를 설계했다. 최상단 아카이브 헤더가 현재 버전과 같으면 What's New 가 갱신되지 않은 것이므로 fail.

### 2. skill 에 지시가 이미 있었는데도 누락됐다 — 대책의 방향이 바뀜

backlog S4 는 "규칙이 사람의 기억에만 존재하고 어떤 carrier 에도 명문화돼 있지 않다"고 진단했으나 **사실이 아니다.** `reapdev.versionBump.md` Step 5 는 이미 다음을 명시하고 있었다:

```
- docs release notes 페이지 업데이트:
  a. `docs/src/i18n/translations/` 아래 5개 파일 (en, ko, ja, de, zh-CN)
  b. 각 파일의 `releaseNotes.versions` 배열 맨 앞에 새 엔트리 추가
```

**지시가 있었고, 5개 파일을 명시했고, 그럼에도 0.17.1 에서 누락됐다.** 그 전에는 en/ko 만 갱신하고 3개를 빠뜨린 적도 있다.

→ 따라서 대책은 "skill 에 지시 추가"가 아니다. 지시문 강화는 이미 실패한 방법이다. **실행 가능한 검사로 대체**하는 것이 맞고, 그래서 T014(release 게이트)와 T015(skill 의 Step 5-1 에 스크립트 실행)를 넣었다. skill 에는 이 판단의 근거도 함께 적어, 다음에 누가 "지시를 더 자세히 쓰자"고 생각하지 않도록 했다.

### 3. skill 의 RELEASE_NOTES 형식 지시가 실제와 달랐다

skill 은 `## What's New` + `## Generations` + `## Breaking Changes` 형식을 지시했으나, 실제 파일에는 `## Generations` 섹션이 없고 승격 구조도 반영돼 있지 않았다. 지시대로 따르면 파일 구조가 깨진다. 실제 구조에 맞게 정정했다.

### 4. reap.cc 가 폐기된 규칙을 가르치고 있었다 (본 세대 주요 성과)

`memoryHeaders: ["Tier", "Lifespan", ...]` 가 2곳 × 5 로케일 = **10개 위치**에 있었다. v0.17.1/0.17.2 가 정확히 이 휴리스틱을 root cause 로 지목해 폐기했는데, 공식 문서는 계속 가르치고 있었다.

`memoryRules` 에는 `"Place content in the tier matching its expected lifespan"` 이라는, 새 정책과 **정면으로 배치되는 지시**까지 있었다. 신규 사용자는 reap.cc 로 배우므로 이것이 가장 직접적인 오도 경로였다.

## Architecture Decisions

### 검증 스크립트를 먼저 만들고 fail 을 확인한 뒤 수정했다

T001 → T002(fail 확인) → T003~T013(수정) → T017(pass) 순서로 진행했다. 수정을 먼저 하면 스크립트가 **실제로 결함을 잡는지 알 수 없다** — 통과하는 것만 보고는 검사가 동작하는지, 검사 자체가 무력한지 구분되지 않는다.

집합 동일성 검사도 같은 이유로 negative test 를 수행했다(ja 에서 0.16.5 를 일부러 제거 → fail 확인 → 복원).

### ci.yml 에는 넣지 않았다

개발 중에는 `package.json` 이 문서보다 앞서는 것이 **정상 상태**다. 이를 CI 에서 fail 로 처리하면 상시 red 가 되어 신호 가치를 잃는다. release 시점에만 강제하는 것이 맞다.

### 번역은 직접 작성했다

기존 17개 항목이 모두 번역돼 있어 en 혼입은 일관성을 깬다. 각 로케일의 기존 어투·용어(예: ja 의 "〜します" 체, zh-CN 의 "代" 표기)를 따르고 기술 용어는 원문 유지했다.

### 문서 텍스트도 `reap-guide.md` 를 기준으로 복제

gen-072 와 같은 원칙이다. memory 표의 문구는 `~/.reap/reap-guide.md` § Memory 의 1-line decision rule 을 그대로 옮기고 각 언어로 번역했다. 문서만의 새로운 표현을 만들면 다음 규칙 변경 때 또 drift 가 생긴다.

## Deferred Items

- **genome 의 carrier 목록에 docs 사이트 추가** — gen-072 가 넣은 "규칙 변경 시 carrier 3중 확인"(guide / genome 템플릿 / phase prompt)에 **docs 사이트가 없다.** 본 세대가 그 4번째 carrier 를 실증했으므로 adapt phase 에서 목록을 확장한다. genome 수정이므로 adapt 가 정위치
- **reap.cc 의 memory 외 페이지 전면 감사** — 본 세대는 memory 관련 10개 위치만 처리했다. 다른 페이지에도 낡은 서술이 있을 수 있으나 범위가 커서 별도 판단 필요
