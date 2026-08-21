# 01 Learning — gen-099-b9afc9

> Goal: carrier ID 에 hash8 을 붙인다 — slug 은 읽히고 hash 는 고유성을 보장한다
> (+ `list-carriers.sh` 산문 오탐 제거)
> Milestone: `v018-지식-축-정리` (ms-002) · Source backlog: `bklog-76e909`

## Source Backlog

`bklog-76e909` (from `gen-098-99c09a`). 요지:

- carrier ID 는 지금 **손으로 정한 slug 뿐**이라 서로 다른 두 사실이 같은 slug 을 받으면
  `grep` 이 무관한 파일을 함께 반환하고 **어떤 검사도 그것을 잡지 못한다.**
- 사용자 결정: **`<slug>-<hash8>`** — 해시 단독이 아니다. slug 이 앞이어야 한다(표식의 유일한
  기능은 값 옆에서 읽히는 것). hash8 은 **생성 시 난수**여야 한다(slug 에서 파생시키면 이름을
  바꿀 때 정체성도 바뀐다).
- 판정해야 할 것 4가지: (1) 기존 ID 이관 방법 (2) 형식을 무엇이 강제하나 (3) 해시 오타 진단
  (4) 문서 예시 — 그리고 그 예시가 다시 스캐너에 잡히지 않을 것.
- 완료 조건: 이관 후 `--orphans` 가 비어 있을 것 · 형식 위반을 검사가 보고할 것(negative 로 red 확인).
- **`list-carriers.sh` 산문 오탐 건을 같은 세대에서 함께 처리하라** — 패턴을 고치는 김에 형식이
  바뀌므로 따로 하면 같은 파일을 두 번 만진다.

함께 처리할 잔여 backlog: `.reap/vision/design/backlogs_v0.17_residual/list-carrierssh-가-산문-속-…md`
— `RELEASE_NOTES.md:35` 의 자리표시자 `` `reap:carrier(id)` `` 가 orphan 으로 보고된다.

## Project Overview

REAP 은 `.reap/` 파일 기반 상태 + TypeScript CLI. 이 세대가 만지는 것은 **저장소 자기 정합성 도구**
한 개(`scripts/list-carriers.sh`)와 그 도구가 읽는 **표식 사이트 전수**, 그리고 그 문법을 설명하는
문서들이다. 런타임 코드 경로는 건드리지 않는다.

## Key Findings — 실측

### F1. 표식 사이트 전수 (lineage/life/dist/node_modules 제외, 2026-08-21)

`grep -rn "reap:carrier(" .` 기준 **in-scope 84줄 / 14개 ID**. `list-carriers.sh` 가 세는 것은
그중 ID charclass `[a-z0-9-]*` 에 맞는 것뿐이다 — `<id>` · `<사실-id>` 처럼 꺾쇠를 쓴 산문은
**이미 안 잡힌다**(그래서 오탐이 `id` 하나로 좁혀져 있었다).

현재 orphan **3개**:
- `evidence-tagging` — `src/templates/migration/v0.17.7.md:59` 단독
- `gate-writing-discipline` — `src/templates/migration/v0.17.7.md:11` 단독
- (`id` 는 3파일이라 orphan 이 아니지만 **전부 가짜다**)

### F2. 오탐의 실제 구조 — 두 종류다

backlog 는 "산문 속 언급"으로 한 종류로 봤지만 실측하면 둘이다:

**(a) 자리표시자 언급** — `reap:carrier(id)`. `RELEASE_NOTES.md:35` · 잔여 backlog 본문 ·
그 README. ID 가 `id` 라는 가짜 carrier 를 만든다.

**(b) 문법 설명용 예시 — 진짜 ID 를 쓴다.** 이쪽이 더 나쁘다. 예:

| 파일 | 줄 | 무엇 |
|---|---|---|
| `.reap/genome/application.md` | 138 · 143 | ```` ```ts ```` / ```` ```markdown ```` 펜스 안 예시 |
| `.reap/reap-guide.md` · `src/templates/reap-guide.md` | 120 · 125 · 131 | 펜스 안 예시 + `grep` 예시 |

**그 결과 `claude-code-commands-path` 의 12파일 중 3파일(genome/application.md · reap-guide ×2)이
예시일 뿐 값을 모른다.** 세 파일 다 그 값을 **다른 절에서 실제로 서술한다** — application.md
§ Adapter Layer, reap-guide § AI Client Support 표. 즉 **표식이 값 옆이 아니라 예시 옆에 붙어 있다.**
이건 오탐인 동시에 genome 이 금지한 상태다("표식은 값 바로 옆에 있으므로 그 값을 다루는 사람이 본다").

### F3. 반대로, 예시가 아닌데 예시처럼 보이는 것들 — 건드리면 안 된다

`docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts:175~178` 의 `// reap:carrier(...)` 는
**TS 문자열 안이지만 진짜 carrier 다** — 바로 아래 줄이 `~/.claude/commands/` 를 문자 그대로 쓴다.
`:906~909` 의 memory-tier 표도 같다. **"코드 펜스/문자열 안이면 예시"라는 규칙은 여기서 틀린다.**

### F4. gen-098 이 만든 것 중 무엇이 재사용되나

`src/core/sequence.ts` — `makeHashedId()` 는 **난수 3바이트 → hex 6자**, 레지스트리 없음.
설계 근거(난수여야 하는 이유 · 소비/폐기되는 유형에 영구 번호를 쓰지 않는 이유)가 그대로 적용된다.
다만 **carrier 는 `SequenceType` 이 아니다** — prefix 도 없고(`<slug>-<hash>`), 폭도 8자다.

**carrier 에 레지스트리가 필요한가 — 필요 없다.** 근거:
- 레지스트리의 기능은 "지워진 항목의 번호를 다시 내주지 않는 것"이다. carrier ID 를 **가리키는
  것이 아무것도 없으므로**(backlog 판단 메모와 일치) 재사용해도 낡은 참조가 다른 것을 가리키는
  일이 없다.
- 중복 탐지는 레지스트리 없이 **스캔 자체에서** 나온다 — 같은 hash 가 다른 slug 에 붙었는지,
  같은 slug 이 다른 hash 를 갖는지는 표식 전수만 보면 판정된다.
- 레지스트리를 두면 **파일과 따로 관리되는 목록**이 생긴다. gen-078 이 폐기한 바로 그 형태다.

### F5. `list-carriers.sh` 에는 테스트가 없다

`grep -rn "list-carriers" tests/ src/ .github/ scripts/` → 참조는 `src/templates/reap-guide.md`
2줄뿐. **자동 회귀 검사 0.** 잔여 backlog `층2-게이트-판정부에-자동-회귀-검사가-없다` 가 말한
"bash 게이트용 하네스 부재"가 이 스크립트에도 그대로 적용된다.

→ 형식 위반 탐지의 negative 를 **재현 가능하게** 하려면 스크립트가 **임의 디렉토리를 스캔할 수
있어야 한다.** 현재는 `ROOT` 를 자기 위치에서 계산해 `cd` 한다.

### F6. backlog 의 주장 중 하나는 사실과 다르다

backlog Files to Change 는 `src/templates/evolution.md` 를 "문법 설명과 예시" 대상으로 든다.
실측: 그 파일에는 표식 3개만 있고 **문법 설명도 예시도 없다**(`grep -n carrier src/templates/evolution.md`).
문법을 설명하는 shipped 문서는 `src/templates/reap-guide.md` § Carrier Markers 하나다.

### F7. 사용자 프로젝트에는 `list-carriers.sh` 가 없다 (범위 밖, hint 로 남김)

shipped `reap-guide.md:132` 가 `bash scripts/list-carriers.sh` 를 지시하지만 그 스크립트는
`dist/` 에도 `reap init` 산출물에도 없다. **shipped 지시가 존재하지 않는 파일을 가리킨다.**
이 세대의 goal 은 형식이지 배포가 아니므로 손대지 않고 다음 세대 hint 로 남긴다.

## Backlog

- 소비: `bklog-76e909` (이 세대의 근거)
- 함께 해소: `backlogs_v0.17_residual/list-carrierssh-가-산문-속-…md` (F2-a)
- `.reap/life/backlog/` 의 나머지 pending: 없음

## Context

- 직전 세대 `gen-098-99c09a` — 참조 ID 체계. fitness: "fitness good. proceed"
- 테스트 baseline (environment/summary.md): unit 773 / e2e 379 / scenario 62, 0 fail
- genome 여유: `evolution.md` 298/300 · `application.md` 249/250 — **거의 없다.**
  이 세대의 genome 변경은 **줄 수 중립 이하**여야 한다(embryo 라 수정 자체는 허용).
- 미푸시 6 커밋. `tests/` submodule pointer = `caf0a84`

## Clarity Level

**HIGH**

- 사용자 결정(`<slug>-<hash8>`)이 형식을 이미 확정했다
- backlog 가 판정 항목 4개와 완료 조건 2개를 명시한다
- 표식 전수가 84줄/14 ID 로 유한하고 기계적으로 열거된다

남은 판정은 셋뿐이고 전부 이 artifact 에서 근거를 확보했다 — 레지스트리 여부(F4: 불필요),
오탐 배제 방식(F2/F3: 모양으로 가르되 예시는 구조적으로 무효한 자리표시자를 쓴다),
해시 생성 주체(F5 와 함께 planning 에서 결정).
