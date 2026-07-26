---
type: task
status: pending
priority: high
createdAt: 2026-07-26T02:05:01.760Z
---

# release 직전 문서-버전 일치 검증 + reap.cc 문서 갱신

## Problem

### 1. reap.cc 문서가 배포 버전보다 뒤처져 있다 (확인됨)

`docs/` 는 별도 repo 가 아니라 **본 repo 에 포함된 Vite+React 사이트**이며 (`git rev-parse --show-toplevel` = repo 루트), `docs/public/CNAME` = `reap.cc`, `.github/workflows/docs.yml` 이 main push 시 배포한다.

문서의 changelog 는 `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` 안에 하드코딩된 배열이다. 현재 최신 항목:

| 소스 | 최신 버전 |
|---|---|
| `package.json` | **0.17.1** |
| `RELEASE_NOTICE.md` | **0.17.1** ✅ |
| `RELEASE_NOTES.md` | 0.17.0 ❌ |
| `docs/src/i18n/translations/*.ts` (5개 전부) | 0.17.0 ❌ |

→ **0.17.1 릴리즈 시 문서 갱신이 누락**됐다는 유저의 추정이 사실로 확인됨. 즉 v0.17.1 의 주요 기능(migration instruction layer, vision memory content-type 재분류 + pruning 정책)이 reap.cc 에 **전혀 반영돼 있지 않다**.

### 2. 로케일 간 drift 도 이미 존재 (추가 발견)

changelog 배열을 로케일별로 확인한 결과:

```
en.ts    : 0.17.0, 0.16.6, 0.16.5, ...
ko.ts    : 0.17.0, 0.16.6, 0.16.5, ...
de.ts    : 0.17.0, 0.16.6, 0.16.4, ...   ← 0.16.5 누락
ja.ts    : 0.17.0, 0.16.6, 0.16.4, ...   ← 0.16.5 누락
zh-CN.ts : 0.17.0, 0.16.6, 0.16.4, ...   ← 0.16.5 누락
```

en/ko 만 갱신하고 나머지 3개를 빠뜨린 전례가 이미 있다. **버전 일치만 검사하면 이 유형은 못 잡는다** — 로케일 간 항목 집합 동일성도 검사 대상이어야 한다.

### 3. 검증 장치가 없다

`.github/workflows/release.yml` 은 태그 push → `npm ci` → `npm run build` → `npm publish` 로 곧장 간다. 버전 일치를 확인하는 단계가 없다. `docs.yml` 도 main push 시 무조건 빌드/배포할 뿐 내용 검증이 없다.

즉 **문서 갱신을 잊어도 아무것도 막지 않으며, 실제로 0.17.1 에서 잊었다.**

## Solution

### S1. 누락분 소급 반영 (0.17.1) + 0.17.2 반영

- `RELEASE_NOTES.md` — v0.17.1 섹션 추가
- `docs/src/i18n/translations/*.ts` — **5개 로케일 전부**에 0.17.1 항목 추가. 내용은 `RELEASE_NOTICE.md` 의 v0.17.1 en/ko 를 기준으로 하고 ja/de/zh-CN 은 번역
- 0.16.5 누락분(de/ja/zh-CN)도 함께 보정 — 이번에 고치지 않으면 S3 검증이 즉시 red 로 뜬다
- 0.17.2 확정 후 같은 절차로 반영 (issue #21 backlog 와 연동)

**changelog 항목 추가에 그치지 말 것**: v0.17.1 은 memory tier 의미론과 migration layer 라는 **개념 변경**을 담고 있다. changelog 한 줄이 아니라 다음 문서 페이지들의 본문 갱신이 필요한지 확인:
- Vision / Memory 설명 페이지 — lifespan 분류가 남아있으면 reap.cc 가 폐기된 규칙을 가르치는 셈 (issue #21 과 동일한 유형의 결함)
- Configuration 페이지 — `lastMigratedVersion`, (issue #21 진행 시) `interview` 등 신규 config 필드
- Command reference — `reap update --mark-migrated`

### S2. 검증 스크립트 — `scripts/check-docs-version.sh` (또는 .ts)

release 직전에 돌려 불일치를 잡는다. **검사 항목**:

1. `package.json` version 과 `RELEASE_NOTICE.md` 최상단 `## vX.Y.Z` 일치
2. `package.json` version 과 `RELEASE_NOTES.md` 최신 섹션 일치
3. `package.json` version 과 `docs/src/i18n/translations/*.ts` changelog 최신 항목 일치 — **5개 로케일 각각**
4. **로케일 간 changelog 버전 집합 동일성** (문제 2 유형 차단)
5. (issue #21 진행 시) `src/templates/migration/` 의 최신 note 버전이 package.json 을 초과하지 않는지 — 초과하면 `detectPendingMigrations` 범위 밖이라 영원히 노출되지 않는 죽은 파일이 된다

**출력**: 불일치 항목을 사람이 읽을 수 있게 나열 + non-zero exit. REAP CLI 가 아니므로 `ReapOutput` JSON 규약 대상 아님 — `scripts/` 의 기존 shell script 관례(`build.sh`, `alpha-publish.sh`) 를 따른다.

**구현 주의**: changelog 가 TS 소스 안의 객체 배열이라 파싱이 필요하다. 정규식으로 `version: "X.Y.Z"` 첫 매치를 뽑는 방식이 가장 단순하고 충분하다 (실제로 본 조사도 그 방식으로 했다). TS 파서 도입은 과잉.

### S3. 파이프라인 연결 — 어디서 강제할 것인가

세 지점이 후보이며 **택일이 아니라 조합**을 검토한다:

| 지점 | 효과 | 비용 |
|---|---|---|
| `.github/workflows/release.yml` 의 publish **앞** 단계 | 태그 push 후 배포를 막음. 가장 확실 | 실패 시 태그를 이미 밀어놓은 상태라 되돌리기 번거로움 |
| `.github/workflows/ci.yml` (PR/push) | 조기 발견 | 릴리즈와 무관한 커밋에서도 red — package.json 이 앞서가는 정상 상태를 fail 로 오인. **조건부 실행 필요** |
| `reapdev.versionBump` skill / `npm run` 스크립트 | bump 시점에 바로 안내 | 강제력 없음 (사람이 건너뛸 수 있음) |

**권장**: release.yml 의 publish 전 게이트(강제) + versionBump skill 에서의 사전 실행(조기 발견). ci.yml 은 오탐 위험이 커서 보류.

### S4. 재발 방지 — 릴리즈 체크리스트의 carrier 문제

issue #21 과 **동일한 구조의 결함**이다: 규칙(문서를 갱신해야 한다)이 사람의 기억에만 존재하고 어떤 carrier 에도 명문화돼 있지 않다.

- `reapdev.versionBump` skill 에 문서 갱신 단계를 명시적으로 추가
- 갱신 대상 목록(`RELEASE_NOTES.md`, `RELEASE_NOTICE.md`, 5개 로케일, 영향받는 문서 페이지)을 skill 안에 열거 — "문서 갱신" 같은 추상 지시는 이번처럼 누락된다

## Files to Change

- `RELEASE_NOTES.md` — v0.17.1 섹션 추가 (+ 0.17.2)
- `docs/src/i18n/translations/en.ts` (L1048 인근) — changelog 배열
- `docs/src/i18n/translations/ko.ts` (L1051 인근)
- `docs/src/i18n/translations/ja.ts` (L1050 인근) — 0.17.1 + 0.16.5 보정
- `docs/src/i18n/translations/de.ts` (L1050 인근) — 동일
- `docs/src/i18n/translations/zh-CN.ts` (L1050 인근) — 동일
- 위 파일들의 Vision/Memory · Configuration · Command reference 관련 섹션 — S1 후반부 조사 결과에 따라
- `scripts/check-docs-version.sh` (신규)
- `.github/workflows/release.yml` — publish 전 검증 단계 추가
- `~/.claude/commands/reapdev.versionBump.md` 대응 소스 — 문서 갱신 단계 추가 (skill 원본 위치 확인 필요)

## Verification

1. `bash scripts/check-docs-version.sh` — 현재 상태(0.17.1 미반영)에서 **fail** 하는 것부터 확인. 그 다음 S1 반영 후 pass
2. 로케일 하나만 일부러 되돌려 놓고 실행 → **집합 불일치로 fail** (문제 2 유형 탐지 확인)
3. release.yml 에서 검증 실패 시 `npm publish` 가 실행되지 않는지 (workflow 문법 확인 또는 dry-run)
4. reap.cc 빌드(`npx vite build`)가 changelog 수정 후에도 정상 — TS 객체 배열이라 구문 오류 시 빌드가 깨진다
5. 배포 후 https://reap.cc 에서 0.17.1/0.17.2 항목이 **5개 언어 모두** 노출되는지 육안 확인

## Open Decisions

- [ ] ja/de/zh-CN 번역을 이번에 직접 작성할지, en 을 임시 노출할지 (기존 항목들은 번역돼 있으므로 일관성상 번역 권장)
- [ ] ci.yml 에도 검증을 넣을지 (오탐 위험 — package.json 이 문서보다 앞서는 개발 중 상태를 어떻게 허용할지 설계 필요)
- [ ] S1 후반부(개념 변경에 따른 문서 페이지 본문 갱신) 의 범위 — changelog 만 할지, Vision/Memory 페이지까지 이번에 손댈지. 후자는 작업량이 크므로 별도 세대 분리 후보
