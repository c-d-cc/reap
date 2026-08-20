# Learning

## Goal

source-map 을 읽는 규칙을 배포 템플릿에 전파하고, greenfield 로 init 한 프로젝트에서도 정상 동작하게 만든다.

## Source Backlog

`source-map-규칙을-템플릿에-전파한다-greenfield-는-source-map-을-만들지-않는다.md` (type: genome-change, consumed by gen-090)

### 요지

gen-089 직후 `environment/summary.md` 가 335줄로 250 가이드라인을 넘겨, 코드 구조 서술 153줄을
`environment/source-map.md` 로 분리했다 (커밋 `3c8acde`). source-map 은 **on-demand** 라 자동 로드되지
않으므로, 포인터만으로는 열리지 않는다 — 그래서 `.reap/genome/evolution.md` 의
`## Code Quality Principles` 에 **Read source-map first** 행동 규칙을 넣었다 (사용자 승인).

**그 규칙이 배포 템플릿 `src/templates/evolution.md` 에는 없다.** dogfooding 규약
(`application.md` § Dog-fooding)상 동기화돼야 하지만, 그대로 옮기면 결함이 생긴다:

| init mode | source-map.md 생성 | 규칙을 그대로 옮기면 |
|---|---|---|
| `adoption` | 생성함 (`adoption.ts:89-90`) | 정상 |
| `greenfield` | **생성 안 함** | **없는 파일을 열라고 지시** |

backlog 는 S1(조건부 문구) / S2(greenfield 도 생성) / S3(전파 안 함) 세 갈래를 제시하고 저자 판단을
요구했다. **사용자 지시는 명시적이다 — "greenfield 일때도 정상동작 해야 한다."** → S3 배제, S2 채택.
S1 의 방어적 문구를 함께 둘지는 planning 에서 판단한다.

## Key Findings

### F1. greenfield 가 source-map 을 만들지 않는 것을 실측 확인했다 `[실행]`

격리 HOME 으로 빈 git 디렉토리에 `reap init probe` 실행 →
`.reap/environment/` 에 `docs/ domain/ resources/ summary.md` 만 존재. **source-map.md 없음.**
같은 프로젝트의 `fix --check` 는 `errors: []`,
`warnings: ["genome/application.md: appears to be placeholder-only"]` 하나뿐이다
(대화로 채워지는 부분이라 자기진단 게이트가 채운 뒤 진단한다 — 정상 동작).

### F2. placeholder 검사는 genome 3파일에만 적용된다 — 스텁은 충돌하지 않는다 `[독해]`

`src/core/integrity.ts:540-581` 의 placeholder 검사 대상은
`paths.application` / `paths.evolution` / `paths.invariants` **뿐**이다. environment 쪽은
`checkMemorySize` 가 `summary.md` 의 **줄 수**만 본다 (`integrity.ts:620`). 즉 backlog 가 우려한
"빈 파일이 하나 더 생긴다 → placeholder 검사와 충돌" 은 현재 코드에서 **발생하지 않는다.**

다만 검사가 나중에 environment 로 확장될 여지가 있으므로, 스텁은 heading·blockquote·HTML 주석
이외의 **실질 라인을 갖도록** 쓴다 (그 검사가 실질 라인 0을 placeholder 로 본다).

### F3. `reap update` 는 파일을 보충하지 않는다 — 디렉토리만 만든다 `[독해]`

`update.ts:177 ensureDirectories` 는 `getRequiredDirs(paths)` 의 **디렉토리**만 생성한다.
누락된 environment 파일을 만들어주는 경로는 없다. 따라서 **이미 존재하는 greenfield 프로젝트에
source-map 을 도달시키는 채널은 migration note 뿐이다** (gen-072 교훈과 정확히 같은 구조).

### F4. 템플릿의 `## Code Quality Principles` 는 v0.16.0 이래 byte-identical 이다 `[실행]`

```
git show <ref>:src/templates/evolution.md | sed -n '/## Code Quality Principles/,/^## Testing/p' | md5
```
을 41c142c / 52340b3 / 8328a91 / efcd90f / 7ce6444 / v0.17.0 / v0.16.5 / v0.16.0 / 현재에 대해 실행 →
**전부 `c8a76323ab132e83b4ed163886491e45`.**

이것이 중요한 이유: migration note 의 3분기 판정 중 "배포 원본과 정확 일치 → silent edit" 분기가
**거의 모든 기존 프로젝트에서 성립한다.** note 안에 대조용 원본 전문을 실으면 판정이 확실해진다.

(zsh 는 `$c:path` 를 bad substitution 으로 거부한다. 위 반복은 bash 스크립트로 실행했다.)

### F5. 방어적 태도는 코드에 이미 선례가 있다 `[독해]`

`src/cli/commands/run/knowledge.ts:90` 이 이미 `${paths.sourceMap} (if exists)` 로 쓴다.
source-map 부재를 전제하지 않는 문구는 이 코드베이스에서 새로운 것이 아니다.

### F6. 자기진단 게이트가 greenfield 경로를 실제로 지나간다 `[독해]`

`scripts/check-self-diagnosis.sh:144-215` 의 §3 은 빈 git 디렉토리에 `reap init selftest` 를 돌린다
— **auto-detect 결과는 greenfield 다** (F1 의 실측과 같은 조건). 이어 §4 가 `fix --check` 의
findings 0 을 요구한다. 즉 스텁이 어떤 경고도 유발하지 않아야 게이트가 통과한다.

### F7. 문서 게이트는 버전 집합만 본다 — 문장 추가는 안전하다 `[독해]`

`scripts/check-docs-version.sh` 는 (1) RELEASE_NOTICE 최신 `## v` == package version,
(2) RELEASE_NOTES 의 최상단 archive 가 **직전** 버전, (3) 5개 로케일 최신 == package version,
(4) 로케일 간 **버전 집합** 동일, (5) migration note 가 패키지 버전을 넘지 않을 것 — 5가지를 본다.
**본문 텍스트를 비교하지 않는다.** 따라서 기존 0.17.6 항목에 문장을 덧붙이는 것은 게이트를 건드리지
않는다. 새 버전 섹션을 만들면 (1)(3) 이 깨진다 — 팀 리드 지시대로 **0.17.6 을 확장**한다.

### F8. v0.17.6 migration note 는 이미 존재하고 5개 절을 갖는다 `[독해]`

`src/templates/migration/v0.17.6.md` — daemon 폐기(1~3) / 대체(4) / 인덱스 성질(5).
본 세대는 **§6 을 덧붙인다.** 이 프로젝트 자신의 `config.yml` 은 `lastMigratedVersion: 0.17.6` 이라
확장된 note 가 여기서 다시 뜨지 않는다 — **그것이 맞다.** REAP 자신은 규칙을 이미 갖고 있다.

### F9. 테스트 자리

- `tests/e2e/init-basic.test.ts` — greenfield init 의 파일 존재 검사가 모여 있는 곳. source-map
  존재·내용 검사를 여기에 붙인다.
- `tests/unit/shipped-docs-no-daemon.test.ts` — **배포되는 `src/templates/` 를 읽어 검사하는 선례.**
  "self-proving" 패턴(부재 assertion 앞에 대상이 실재함을 먼저 요구)을 그대로 차용한다.

## Backlog Review

pending 9건. **본 세대와 무관하다** — 6건은 0.18 브랜치 트랙(plugin 전환 / idea / plan / milestone /
interview skill / `/reap.plan`), 2건은 indexer 재설계(community detection / process tracing),
1건은 auto-update 버전 판정. 어느 것도 source-map 규칙 전파의 선행 조건이 아니다.

## Context

- Generation type: **embryo** (genome 직접 수정 허용). 단 evolution.md 가 301줄로 300 가이드라인을
  이미 2줄 초과한 상태다 — 여기에 더 쓰면 경고가 커진다. adapt 에서 **잘못 놓인 내용을 옮겨** 해소한다.
  손으로 지워 경고를 끄는 것은 guide 가 금한다.
- strictEdit / strictMerge 활성. evaluator 활성.
- 버전 **0.17.6** (gen-089 가 bump 함). 재bump 금지, 0.17.6 문서 항목을 확장한다.
- 테스트 baseline: **unit 575 / e2e 326 / scenario 44**, 전부 0 fail.
- 상속 경고: `fix --check` 0 error / 3 warning (lineage parent 2 + evolution.md 302줄).
- 개발 중 CLI 는 전역 `reap`(0.17.5) 가 아니라 **`node dist/cli/index.js`(0.17.6+dev)** 를 쓴다.
  전역은 아직 0.17.6 이 발행되지 않아 뒤처져 있다.

## Clarity Level

**High.**

근거: (a) 사용자가 어려운 판단(S2)을 이미 내렸다, (b) backlog 가 변경 대상 파일을 지목한다,
(c) 결함이 실측으로 재현된다(F1), (d) 기존 프로젝트 도달 채널이 확정적이다(F3, F8).

남은 판단은 두 개뿐이며 planning 에서 닫는다:
1. S1 의 방어적 문구를 S2 와 함께 둘 것인가
2. greenfield 스텁이 무엇을 담을 것인가 (코드가 없는 프로젝트의 source-map)
