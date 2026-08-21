# 03 Implementation — gen-099-b9afc9

> 02-planning.md 의 T001~T013. 승인된 계획 그대로 진행.

## Genome / Environment 직접 수정에 대한 기록

이 세대는 **embryo** 이므로 genome 수정이 허용된다(`reap-guide` § Generation types).
`environment/` 도 직접 만졌는데 이는 **표식 ID 개명이 원자적이어야 하기 때문**이다 —
같은 rename 이 20개 파일에 걸쳐 있고 절반만 적용된 상태는 `--check` 가 red 인 상태다.
**서술 갱신**(`summary.md` 의 `list-carriers.sh` 설명)은 규칙대로 reflect 로 미룬다.
02-planning.md 에 명시했고 인간 승인을 받았다.

## Completed Tasks

| # | Task | 결과 |
|---|---|---|
| T001 | `scripts/list-carriers.sh` 재작성 | 3분기 판정 · `--check`/`--root`/`--new` · orphan 힌트 · hash 충돌 |
| T002 | `[negative]` 이관 전 `--check` | **14개 위반 + exit 1** 관측 (아래 § negative) |
| T003 | hash8 13개 생성 | `--root <빈 디렉토리> --new <slug>` 로 뽑음. 전부 고유 |
| T004 | 표식 39파일 일괄 치환 | `--check` 가 `id` 하나만 남기고 통과 |
| T005 | 예시 3파일 정리 | 예시 → 꺾쇠 자리표시자, 진짜 표식은 값 옆으로 이동 |
| T006 | orphan 2건 해소 | `gate-writing-discipline` · `evidence-tagging` 의 나머지 carrier 를 표시 |
| T007 | `RELEASE_NOTES.md` | `reap:carrier(id)` → `reap:carrier(<id>)` |
| T008 | 잔여 backlog 해소 | 파일 삭제 + README 에 "해소됨" 절 + 건수 9→8 |
| T009 | 문법 서술 갱신 | reap-guide ×2 § Carrier Markers, genome/application.md |

### T002 `[negative]` — 이관 전 상태

```
$ bash scripts/list-carriers.sh --check ; echo "EXIT=$?"
Malformed carrier ids (14) — expected <slug>-<hash8>:
    agent-frontmatter-schema
        src/adapters/opencode/install.ts:425
        ... (전 14개 ID, 85개 사이트를 파일:줄과 함께 나열)
EXIT=1
```

**검사를 만든 직후 통과하는 것을 보지 않았다** — 저장소 전체가 구 형식이던 상태에서
먼저 red 를 관측했다. 이것이 이 검사의 유효성 근거다(genome § 검사를 만들 때 — 먼저 실패시켜라).

부수 관측: 이 red 안에 **`id` 라는 가짜 carrier 4 사이트**가 함께 잡혔다. 잔여 backlog 가
"orphan 으로 보고된다"고 적은 그 항목이며, 새 판정에서는 orphan 이 아니라 **형식 위반**으로
분류된다 — 즉 형식 검사를 넣는 것만으로는 오탐이 사라지지 않고 **더 시끄러워진다.**
꺾쇠 규칙(T007)이 그것을 닫는다.

### T003 — 부여된 ID

| slug | id |
|---|---|
| agent-frontmatter-schema | `agent-frontmatter-schema-3a4d53e6` |
| agent-integration-gate-verdicts | `agent-integration-gate-verdicts-e1fafca9` |
| claude-code-commands-path | `claude-code-commands-path-4bd29da9` |
| environment-refresh-targets | `environment-refresh-targets-b4a95f5d` |
| evidence-tagging | `evidence-tagging-ab1eb844` |
| gate-writing-discipline | `gate-writing-discipline-af52f991` |
| memory-tier-classification | `memory-tier-classification-fa69f636` |
| opencode-config-path | `opencode-config-path-203454f8` |
| reap-home-asset-set | `reap-home-asset-set-94949259` |
| self-diagnosis-covered-incidents | `self-diagnosis-covered-incidents-a8c5d58c` |
| source-map-read-rule | `source-map-read-rule-a227a34e` |
| user-level-asset-set | `user-level-asset-set-b7a3fef9` |
| zero-native-dependency | `zero-native-dependency-0ca719d7` |

**14 → 13.** 사라진 것은 `id` — 처음부터 사실이 아니라 산문의 자리표시자였다.

### T005 에서 드러난 것 — 표식 3개가 값 옆이 아니라 예시 옆에 있었다

`claude-code-commands-path` 의 12파일 중 `genome/application.md` · `reap-guide.md` ×2 는
**그 값을 예시로만 갖고 있었다.** 세 파일 다 값 자체는 다른 절에 있다. 표식을 그리로 옮겼다:

- `application.md` § Adapter Layer — `~/.claude/commands/*.md` 를 쓰는 줄 바로 위
- `reap-guide.md` ×2 § AI Client Support — 클라이언트 표 바로 위

**`memory-tier-classification` 은 12 → 11 로 줄었다.** `application.md` 가 빠졌는데, 그 파일은
tier 분류 규칙을 서술하지 않는다(예시로만 인용했다). **줄어든 것이 맞다** — 표식이 사실을
모르는 파일에 붙어 있었던 것이다.

### T006 — orphan 은 "불필요"가 아니라 "다른 곳을 안 표시한 것"이었다

`gate-writing-discipline` / `evidence-tagging` 둘 다 `src/templates/migration/v0.17.7.md` 단독이었다.
그 note 가 **사용자 genome 에 추가하라고 지시하는 규칙**이므로, 같은 규칙을 이미 갖고 있는
`.reap/genome/evolution.md` 와 `src/templates/evolution.md` 의 해당 절이 나머지 carrier 다.
표식을 그 두 곳에 심어 1 → 3 파일이 되었다. 도구가 안내하는 두 해석 중 **두 번째가 맞았다**.

| T010 | `tests/unit/list-carriers.test.ts` 신규 | 18 test / 62 assertion. 이 스크립트의 **최초 테스트**다 |
| T011 | `shipped-source-map-rule.test.ts` 리터럴 | T004 의 일괄 치환이 함께 처리 (그 파일도 in-scope) |
| T012 | `.github/workflows/ci.yml` | `Carrier markers` 스텝 — `npm run build` 뒤, 자기진단 앞 |
| T013 | 전체 검증 | 04-validation.md |

## Discovered Tasks — 계획에 없던 것 다섯

전부 **테스트를 쓰는 과정에서** 드러났다. 넷은 결함이고 하나는 테스트 자신의 결함이다.

### D1. 로케일 collation 때문에 대문자 해시가 **유효로 판정됐다**

`case "$id" in *[!a-z0-9-]*)` 는 UTF-8 로케일에서 `a-z` 가 **collation 범위**라 `A` 를 포함한다.
`fact-c-0A1B2C3D` 가 malformed 로도, mention 으로도 잡히지 않고 **정상 ID 로 집계됐다.**

- 발견 경로: 테스트가 "위반 4건"을 기대했는데 3건이 나왔다. **눈으로는 절대 못 본다.**
- 처방: `export LC_ALL=C`. `sort` 의 결정성도 함께 얻는다.
- `[negative]` N8 — `LC_ALL=en_US.UTF-8` 로 되돌리면 해당 케이스만 red.

### D2. 통과 문구가 **언급까지 세고 있었다**

`--check` 의 성공 줄이 `wc -l < "$SCAN"` 을 썼는데 그것은 **자리표시자를 포함한 전체 매치**다.
산문만 있는 문서 파일이 "5 marker(s)" 로 보고되어, **"언급은 표식이 아니다"라는 이 세대의 주장과
성공 문구가 서로 모순**됐다. `valid + malformed` 만 세도록 고쳤다. `[negative]` N7.

### D3. `--help` 가 줄 번호(`sed -n '2,45p'`)에 묶여 있었다

헤더 주석을 다시 쓴 뒤 `--help` 가 `set -uo pipefail` 을 **문서로 출력**했다.
줄 번호는 "내가 방금 바꾼 것을 측정한 값"의 전형이다. `awk` 로 **주석 블록이 끝날 때까지**
출력하도록 바꿔 길이에 무관하게 만들었다.

### D4. 검사가 **자기 테스트의 픽스처를 저장소 표식으로 셌다**

빌드 후 저장소 `--check` 가 red 였다 — 원인은 새 테스트 파일 안의 의도적으로 깨진 ID 6개와
같은 hash 를 공유하는 픽스처였다. 스크립트는 이미 `--exclude=list-carriers.sh` 로 **자기 자신**을
제외하고 있었고, 테스트는 정확히 같은 사유(표식 텍스트가 선언이 아니라 입력)에 해당한다.

- 처방: `--exclude='list-carriers.*'` — **항목 둘이 아니라 glob 하나**. 사유가 하나이기 때문이다.
- `tests/` 전체를 제외하지 **않았다**: `shipped-source-map-rule.test.ts` 는 진짜 carrier 2개를
  들고 있어서, 제외하면 그 둘이 orphan 이 된다.
- 테스트가 문자열을 런타임 조립하게 하는 방법도 있었으나 **택하지 않았다** — 픽스처를 난독화하면
  테스트가 읽히지 않는다.

### D5. orphan 힌트 테스트의 픽스처가 **너무 깔끔했다**

"형제가 없으면 힌트도 없다" 케이스가 트리에 ID 하나만 두고 있었다. 그러면 **"다른 ID 를 전부
출력"하는 잘못된 구현도 통과한다** — 출력할 다른 ID 가 없으므로. 무관한 carrier 한 쌍을 넣어
그 구현이 red 가 되게 했다 (`[negative]` N9 로 확인). gen-098 이 `nextId` 에서 겪은 것과 같은 형태다.

### D6. `--check` 가 **fail-open** 하는 입력 둘 — 스스로 물어서 찾았다

genome § "어떤 입력이 검사를 fail-open 시키는가를 따로 물어라". 테스트가 모두 초록인 상태에서
그 질문만 던져 둘을 찾았다.

**(a) 닫는 괄호가 없는 표식은 *보이지 않는다*.** `scan` 은 `reap:carrier([^)]*)` 로 ID 를 잡으므로
`// reap:carrier(some-fact` 는 valid 도 malformed 도 아닌 **부재**가 된다 — 형식 검사가 절대
내면 안 되는 결과다. 여는 괄호까지 포함한 두 번째 스캔(`scan_words`)과 대조해 보고한다.

이 검사의 **첫 버전이 곧바로 오탐을 냈다**: `reap:carrier` 를 괄호 없이 부르는 산문
(`each place carries a \`reap:carrier\` marker`, `shipped-source-map-rule.test.ts:12`)을
"괄호 빠뜨림"으로 잡았다. **여는 괄호를 패턴에 넣어** 문장과 오타를 갈랐다.

**(b) 같은 slug 에 다른 hash 둘은 아무도 보고하지 않았다.** 힌트는 **orphan 일 때만** 나온다.
양쪽이 각각 2파일 이상이면 그냥 별개 carrier 두 개로 조용히 집계됐다 — **`--new` 는 바로 그
상태를 만들기를 거부하는데**, 트리는 그것을 담을 수 있었다. `--check` 가 에러로 보고하게 했다.
해시 오타의 전형적 형태이기도 하다.

둘 다 저장소에서 실제로 red 를 관측했다 (`_probe_unterm.ts` / `zero-native-dependency-deadbeef`).

**(a) 의 첫 구현도 틀렸다.** 줄 **집합**을 비교했는데, 한 줄에 닫힌 표식과 안 닫힌 표식이 함께
있으면 그 줄이 양쪽 집합에 다 나타나 "정산됨"으로 읽힌다. **줄당 개수 비교**로 바꿨다 (`[negative]` N13).
이것이 D6 의 수정 안에서 나온 결함이며 — genome 이 반복 관측한 그 패턴이다.

## `[negative]` 전수 — 13회, 각각 red 확인

| # | 무엇을 깨뜨렸나 | red 가 된 테스트 |
|---|---|---|
| N1 | 스캔 패턴을 well-formed ID 만 매치하도록 | 형식 위반 3케이스 전부 |
| N2 | mention 규칙 제거 | 자리표시자 케이스 |
| N3 | hash 폭 검사 제거 | 형식 위반 2케이스 |
| N4 | orphan 힌트 제거 | 오타 진단 2케이스 |
| N5 | hash 충돌 보고 제거 | 충돌 케이스 |
| N6 | `--new` 의 slug 중복 거부 제거 | `--new` 거부 케이스 |
| N7 | 통과 문구가 전체 매치를 세도록 | 자리표시자 케이스 |
| N8 | `LC_ALL=C` 되돌리기 | 대문자 해시 케이스 |
| N9 | 힌트가 다른 ID 를 전부 출력하도록 | "형제 없음" 케이스 |
| N10 | 미종료 표식 보고 제거 | 괄호 없는 표식 케이스 |
| N11 | `scan_words` 에서 여는 괄호 제거 | "산문은 오타가 아니다" 케이스 |
| N12 | slug 분열 보고 제거 | "한 slug 에 hash 둘" 케이스 |
| N13 | 미종료 판정을 줄 **집합** 비교로 (개수 대신) | "한 줄에 닫힌 것 + 안 닫힌 것" 케이스 |

**N1 이 가장 중요하다.** 해시 없는 표식은 좁힌 패턴에서 *아예 매치되지 않으므로*, 관대한 패턴이
없으면 이 검사는 **정확히 자기가 잡으려는 실패에 침묵한다.** 그 성질을 관측하는 것은 N1 뿐이다.

## 검사가 못 잡는 것

- **`--new` 의 고유성 보장은 관측되지 않는다.** 난수 draw 이므로 검사가 아예 없는 구현도
  1 − 2⁻³² 확률로 통과한다. 난수원 주입은 얻는 것에 비해 기계장치가 크다 — 충돌 자체는
  `--check` 가 잡고 그쪽은 테스트된다. 테스트 docblock 에 그대로 적었다.
- **`--exclude='list-carriers.*'` 가 가린 파일 안의 진짜 표식은 영원히 안 잡힌다.** 지금 둘 다
  진짜 표식이 없다. 셋째 파일이 그 이름으로 생기면 이 판단을 다시 해야 한다.
- **사용자 프로젝트에는 이 검사가 없다** — `list-carriers.sh` 는 배포되지 않는다(01-learning F7).
