# Validation

> **라운드 1·2·3·4 가 각각 implementation 으로 회귀했다**
> (1·2 는 blocker, 3 은 산문·값 드리프트, 4 는 증거 표시 경로). evaluator 가 두 번 다
> severity **high** 를 냈고, **두 번 다 직전 라운드의 수정 안에** 결함이 있었다
> (genome § 독립 검토는 한 번으로 수렴하지 않는다 — gen-089 가 적어둔 그대로).
> 기록은 § 라운드 1 / § 라운드 2 에 남긴다. 아래 § 실행 결과와 § Completion Criteria 는
> **두 번째 회귀 후 수정된 코드에 대해 전부 다시 돌린 것**이다.

## 실행한 명령과 결과 (라운드 5 = 최종 코드, 전부 fresh)

| 명령 | 결과 |
|---|---|
| `npm run typecheck` | **통과** (출력 없음) |
| `npm run build` | **통과** — `index.js 0.63 MB`, grammars 15, `dist/templates` 동기화 확인 |
| `npm run test:unit` | **585 pass / 0 fail** (48 파일, 8.89s) |
| `npm run test:e2e` | **329 pass / 0 fail** (35 파일, 63.66s) |
| `npm run test:scenario` | **44 pass / 0 fail** (4 파일, 6.14s) |
| `reap fix --check` | **0 error / 2 warning** — 둘 다 gen-052 lineage parent 승계분 |
| `bash scripts/check-docs-version.sh` | **통과** (v0.17.6) |
| `bash scripts/check-self-diagnosis.sh` | **전 절 통과** — `Self-diagnosis passed for v0.17.6.` |
| `bash scripts/check-agent-integration.sh` | **통과** — `gen-001-85093e`, $0.2604 |
| `bash scripts/list-carriers.sh` | `agent-integration-gate-verdicts (4 files)`, 드리프트 grep **0건** |

baseline(585 / 329 / 44) **정확히 유지**. `src/**` 코드를 건드리지 않았으므로 예상된 결과지만
추측하지 않고 돌려서 확인했다.

층1 자기진단은 `src/templates/reap-guide.md`(배포 자산)를 건드렸으므로 돌렸다 —
pack / 격리 설치 / init / source-map / 진단 0건 / node 인덱서 / install script 차단 재현 /
OpenCode 1.3.16 / uninstall 26건, 전부 ok.

## Completion Criteria — 하나씩

`[실행]` = 이 세대에서 그 명령을 돌렸다 · `[negative]` = 일부러 깨뜨려 fail 을 봤다 · `[독해]` = 코드를 읽었다

### 1. 게이트를 그대로 돌리면 통과하고 generation id 를 출력한다 — **충족**

`[실행]` `bash scripts/check-agent-integration.sh` → `ok generation created: gen-001-85093e`.
**코드가 바뀔 때마다 재실행했다 — 총 5회** (R1 문구 / R2 blocker / R3 역선택 / R4 표식·순서 /
R5 윈도잉·공유). 마지막 실행이 **지금 커밋되는 코드**다.

같은 머신·같은 auto 세션에서 0.17.6 릴리즈 직전에는 이것이 FAIL 이었다. 결함이 사라졌다.

### 2. 슬래시 커맨드를 못 쓰게 만든 조건에서 FAIL 한다 (두 방식) — **충족**

`[negative]` V2 — 원본에 `--disable-slash-commands` **한 줄만** 추가한 사본.
→ `FAIL the client does not expose /reap.start`, exit 1, $0.2420.

`[negative]` V3 — `~/.claude/commands/reap.*.md` **19개를 실제로 옮기고** 무수정 게이트 실행
(`trap restore EXIT INT TERM`). → 같은 FAIL, exit 1, $0.2236.
복구 확인: `ls ~/.claude/commands | grep -c '^reap\.'` → **19**, stash 디렉토리 없음.

> **두 방식을 다 돌린 이유**: gen-079 의 실측(우회로 통과)은 **실삭제** 조건에서 났다.
> 비활성 플래그만으로 끝내면 "내 변형이 그 결함이 아니다"를 배제할 수 없다(genome).
>
> **재실행하지 않은 근거** — V2/V3 은 라운드 1 코드에서 돌았다. 이후 변경은 (i) SKIP 분기 문구,
> (ii) 파서의 5번째 필드와 `REAP_DENIALS` 분기다. **두 실행 모두 sentinel 에서 exit 1 하므로
> 두 곳 다 지나지 않는다.** 파서 자체의 5필드 변경은 `slash-unavailable` fixture 가
> **결정적으로** 같은 경로를 다시 지나 확인했다(라운드2 재실행, exit 1).
> evaluator 가 라운드1에서 `diff -u v2-gate.sh scripts/...` 로 이 논증을 독립 검증했다.

### 3. `reap run` 을 지목한 권한 거부에서 SKIP/amber, exit 0 — **충족**

`[negative]` N1 — `denied.json` (`tool_input.command` = `reap run start ...`)
→ `SKIP permission system stopped the agent — agent integration was NOT verified`,
``Refused tool calls recorded by the client: 1 (1 naming `reap run`)``, **거부된 항목 원문 출력**, exit 0.

`[negative]` N2 — `blocked-token.json` (result = `PERMISSION_BLOCKED`, denials 0) → 같은 SKIP, exit 0.
두 경로가 **독립적으로** 동작함을 보인다.

### 3-bis. `reap run` 을 지목하지 않은 거부는 SKIP 을 얻지 못한다 — **충족 (라운드2·3 신설)**

evaluator 가 만든 fixture 4개. **모두 내 코드가 먼저 틀린 답을 내는 것을 보인 뒤 고쳤다.**

| fixture | 무엇인가 | 수정 전 | 수정 후 |
|---|---|---|---|
| `eval-unrelated-denial` | `WebFetch example.com` 거부 + agent 는 *"I could not find a /reap.start command"* | **SKIP 0** | **FAIL 1** |
| `eval-r2-diagnostic-denial` | 거부된 명령이 `ls ~/.claude/commands \| grep reap` — **못 찾은 agent 의 가장 자연스러운 첫 수** | **SKIP 0** | **FAIL 1** |
| `eval-r2-webfetch-reapcc` | `https://reap.cc/docs` — **프로젝트 자신의 도메인** | **SKIP 0** | **FAIL 1** |
| `eval-r2-opaque-denial` | 진짜 REAP 차단이나 항목에 명령문이 없음 | FAIL 1 (조용히) | FAIL 1 + **항목 원문 + 그것이 무엇인지 지목** |

**`HEAD` 에서는 넷 다 무조건 exit 1 이었다** — 앞의 셋은 내 diff 가 만든 회귀였다.
셋째 줄이 특히 중요하다: **이 게이트가 존재하는 바로 그 시나리오에서 가장 나타나기 쉬운
문자열이 그 시나리오를 용서하는 문자열이 될 뻔했다.**

### 4. `is_error: true` 입력에서 FAIL 하고 gen-063 을 지목하지 않는다 — **충족**

`[negative]` N4 — `agent-error.json` → `FAIL the agent run itself failed (subtype: error_max_turns)`
+ `Nothing about REAP was measured — the agent never got that far.` gen-063 언급 없음.
`[negative]` N6 — `unparseable.json` → 같은 경로, `subtype: unparseable`.

### 5. 부재 FAIL 문구에 `gen-063 failure exactly` 가 없고 원인 열거가 있다 — **충족**

`[negative]` N5 — `silent.json` → FAIL + 원인 4개 열거 + agent 응답.
`[실행]` `grep -n "gen-063 failure exactly" scripts/check-agent-integration.sh` → **0건**.

### 6. 수정 전 코드가 같은 입력에 틀린 답을 내는 것을 먼저 보인다 — **충족**

`[negative]` N0 — `git show HEAD:scripts/check-agent-integration.sh` 에 같은 fixture 치환을
적용한 사본에 `denied.json` 투입 → **`FAIL ... This is the gen-063 failure exactly`**, exit 1.

**N0 ↔ N1 이 이 세대의 근거다.** 같은 입력, 같은 디스크 상태. 수정 전은 red 로 특정 결함을
지목하고, 수정 후는 amber 로 "측정하지 못했다"고 말한다.

### 7. baseline 유지 + `fix --check` 회귀 없음 — **충족**

위 표. 585 / 329 / 44, 0 error / 2 warning (승계분).

### 10. 목록이 카운트가 주장하는 근거를 실제로 보여준다 — **충족 (라운드5 신설)**

`[negative]` `eval-r4-truncated-hit` — 거부된 명령이 `cd … && export PATH=… && reap run start …`
라 match 가 **165번째 문자**에 있다. 수정 전에는 `… && r` 에서 표시 없이 잘려
**카운트 줄만 근거가 있다고 말했다**(윈도잉만 뺀 변형으로 확인). 수정 후 창이 match 로 이동한다.
`[negative]` `eval-r3-buried-hit` — 5건 초과 시 순서.
`[negative]` `eval-r4-nonarray` — `permission_denials` 가 배열이 아닐 때 출력 없음, 에러 없음
(이제 `catch {}` 가 아니라 `Array.isArray` 명시 가드).
`[실행]` `grep -n 'REAP_CMD_MATCH' scripts/check-agent-integration.sh` → 정의 1 + 읽기 2.
술어 리터럴이 **한 곳에만** 있다.

### 9. 표식이 가리키는 값과 표식이 하는 말이 일치한다 — **충족 (라운드4 신설)**

`[실행]` `bash scripts/list-carriers.sh` → `agent-integration-gate-verdicts (4 files)`.
`[실행]` `grep -rn "naming reap[^ ]" <4 파일>` → **0건** (수정 전에는 4건 전부가 옛 값을 말했다).
`[negative]` `eval-r3-buried-hit` — 거부 7건 중 `reap run` 이 마지막일 때 목록에 **나타난다**.
순서 정렬만 빼면 **사라지면서 카운트 줄은 "1 naming `reap run`" 이라고 말한다**(확인함).

### 8. 게이트가 주장하는 것이 실제로 증명되는 것과 일치한다 — **충족 (라운드3 신설)**

`[실행]` 통과 시 출력:

```
CLI reachable and working — the generation proves that much on its own.
/reap.start was surfaced — resting on the agent having obeyed the rule
not to bypass it, since a bypass leaves the same file behind.
@ imports and the SessionStart hook are NOT covered: /reap.start does
not need either to succeed.
```

`[독해]` `~/.claude/commands/reap.start.md` 전문이 *"Run `reap run start` first ... Then follow
the stdout instructions."* 뿐임을 확인했다 — `@` import 도 hook 도 필요 없다.
`[negative]` V3 에서 슬래시 커맨드를 실제로 지웠을 때 CLI 우회가 **같은 파일**을 만들 수 있음은
gen-079 의 실측이고, 그래서 두 절반의 근거를 분리했다.

## fixture 8종 × 2라운드 — 어디를 어떻게 깨뜨렸는가

`AGENT_JSON=$(cd "$PROJECT" && claude -p ... 2>&1)` **한 줄만** `AGENT_JSON=$(cat "$FIXTURE")` 로
치환한 사본을 돌린다. 치환은 `mkfixture.py` 의 정규식 1회 치환(`assert n == 1`)이므로 원본과
어긋날 수 없고, **원본 스크립트는 한 글자도 건드리지 않는다.** evaluator 가 사본이 최종
스크립트와 byte-identical 임을 독립 확인했다.

아래는 최종 코드 기준 **18종 전부 재실행**한 결과다. R1/R2/R3 열은 각 라운드에서 무엇이
어떻게 답했는지를 남긴 것이다 — 회귀가 언제 들어왔고 언제 닫혔는지가 이 표에 있다.

| fixture | R1 | R2 | R3 | 최종 | 무엇을 고정하는가 |
|---|---|---|---|---|---|
| `denied` (`reap run start` 거부) | SKIP 0 | SKIP 0 | SKIP 0 | **SKIP 0** | 거부 → 측정 실패 |
| `blocked-token` | SKIP 0 | SKIP 0 | SKIP 0 | **SKIP 0** | 토큰 경로 (필드와 독립) |
| `eval-unrelated-denial` | **SKIP 0 ← 회귀** | FAIL 1 | FAIL 1 | **FAIL 1** | 무관한 거부가 변명이 되지 않는다 |
| `eval-r2-diagnostic-denial` | — | **SKIP 0 ← 회귀** | FAIL 1 | **FAIL 1** | `grep reap` 이 gen-063 을 용서하지 않는다 |
| `eval-r2-webfetch-reapcc` | — | **SKIP 0 ← 회귀** | FAIL 1 | **FAIL 1** | `reap.cc` 가 gen-063 을 용서하지 않는다 |
| `eval-r2-opaque-denial` | — | FAIL 1 (조용히) | FAIL 1 + 항목 | **FAIL 1 + 항목** | 반대 방향 실패가 보인다 |
| `slash-unavailable` | FAIL 1 | FAIL 1 | FAIL 1 | **FAIL 1** | gen-063 경로 보존 |
| `agent-error` | FAIL 1 | FAIL 1 | FAIL 1 | **FAIL 1** | agent 실행 실패 선단언 |
| `silent` | FAIL 1 | FAIL 1 | FAIL 1 | **FAIL 1** | 원인 열거, 단정 없음 |
| `unparseable` | FAIL 1 | FAIL 1 | FAIL 1 | **FAIL 1** | 파싱 불가 |
| `eval-r3-reap-status` | — | — | — | **FAIL 1** | `reap status` 는 amber 를 얻지 못한다 |
| `eval-r3-argv-shape` | — | — | — | **FAIL 1** | argv 분할 항목은 발화하지 않는다 (보수적) |
| `eval-r3-linebreak-shape` | — | — | — | **FAIL 1** | 줄바꿈된 명령도 마찬가지 |
| `eval-r3-buried-hit` | — | — | — | **SKIP 0 + 항목 최상단** | 판정 항목이 잘려나가지 않는다 |
| `eval-r3-seven` | — | — | — | **SKIP 0** | `… and N more` 표기 |
| `eval-r4-truncated-hit` | — | — | — | **SKIP 0 + 창 이동** | 잘림이 근거를 감추지 않는다 |
| `eval-r4-buried` | — | — | — | **SKIP 0** | 순서 (독립 재현) |
| `eval-r4-nonarray` | — | — | — | **SKIP 0, 출력 없음** | 배열이 아닌 필드에서 안 깨진다 |
| `denied` **@ 수정 전 코드** | **FAIL 1, gen-063 단정** | — | — | — | 결함 재현 (N0) |

fixture 는 **합성이다 — 실제 거부 실행에서 캡처한 것이 아니다.** 거부를 on-demand 로 재현할
방법을 찾지 못했기 때문이며(P1~P3), 그래서 코드가 `permission_denials` 의 **원소 모양에
의존하지 않도록** 썼다 — 길이를 세고 `JSON.stringify(항목)` 에서 **`reap run`** 을 찾는다.
필드명을 잘못 추측해도 깨지지 않고, 명령문이 없는 항목에서는 **발화하지 않는다**(안전한 방향).

**fixture 18개 중 11개는 evaluator 가 만들었고, 이 세대의 결정적 결함 둘을 전부 그쪽이 잡았다.**

## 라운드 4 — 같은 모양이 한 단계 더 아래에 있었다 (severity low)

evaluator 가 *"no fail-open, no regression, no wrong verdict"* 를 명시하면서도
**라운드4 수정 자신의 주제 안에서** 네 번째 사례를 찾았다.

1. **잘림이 판정 근거를 감춘다.** 순서 수정은 "항목이 목록에 있음"을 보장했다.
   잘림은 **그 항목의 결정적 내용이 줄에 없게** 한다 — 카운트 줄은
   `1 naming \`reap run\`` 이라 하는데 줄은 `… && r` 에서 끝난다.
   **같은 문장이 다시 참이 된다, 한 단계 아래에서.** → hit 은 match 주변으로 창을 옮기고
   모든 잘림에 `…` 를 붙인다.
2. **술어가 코드 대 코드로 중복.** `reap run` 리터럴이 파서(카운트)와 `printDenials`(순서)
   양쪽에 실행 가능한 형태로 있었다 — 한쪽만 좁히면 **카운트와 목록이 어긋난다.**
   **#22 의 정확한 모양이고, 순서 수정이 막으려던 실패 그 자체다.**
   genome 대로 표식이 아니라 **공유**로 해결: `export REAP_CMD_MATCH` 하나가 소유한다.
3. `Array.isArray` 가드 부재(우연히 조용함) / 무조건형으로 읽히는 문장 / 78열 초과 주석 /
   `versionBump` 헤드라인 틀 불일치. 전부 처리.

## 라운드 3 — 표식을 심은 세대 안에서 표식이 어긋났다 (severity low)

blocker chain 은 닫혔다 — evaluator 가 fail-open·회귀·오판정을 **구성해보려다 실패했다.**
남은 것은 **코드에 대한 문장 셋이 거짓이 된 것**이고, 셋 다 같은 기전이다:
**라운드3 에서 값을 바꾸고 그 주변 산문을 다시 읽지 않았다.**

1. **carrier drift** — 4개 carrier 전부가 `naming reap` 이라고 말하는데 코드는 `reap run` 을 본다.
   표식을 **라운드2 에 옛 값으로 심고 좁힌 뒤 다시 grep 하지 않았다.**
   **#21/#22 가 그것을 막으려고 표식을 심은 세대 안에서 재발했다.** 게다가 amber 를 과잉 약속한다 —
   거부된 `reap status` 는 이제 FAIL 이다.
2. **인접성 가정** — *"depends on none of it"* 은 한 토큰일 때 참이고 두 토큰이면 거짓이다.
   `{command:"reap",args:["run","start"]}` / 줄바꿈 / `reap status` 가 전부 miss.
   라운드2 의 *"it is the only one"* 과 같은 종류.
3. **Verdict 의 환원이 커버리지까지 쓸어담았다** — fail-open 셋은 정말 agent 준수로 환원되지만
   `@` import·hook 미커버 / sentinel+파일 조합 미구성 / 자동 검사 부재 / 단일 머신은 아니다.

**note**: `printDenials` 가 **필터보다 먼저 자른다** — 5건 초과 시 판정을 결정한 항목이 사라지면서
카운트 줄은 그것이 있다고 말한다. / "conservative = safe" 와 "false red 가 스크롤을 부른다"가
문단마다 다른 틀을 골랐다. / n=2 vs n=1 표기 불일치.

**전부 처리했다.**

## 라운드 2 — evaluator 가 더 날카로운 blocker 를 잡았다

**blocker**: `reap` 부분문자열이 **역선택한다.** 슬래시 커맨드를 못 찾은 agent 는 reap 을
**덜** 말하는 게 아니라 **더** 말한다 — 첫 수가 `ls ~/.claude/commands | grep reap` 이고,
프로젝트 도메인이 `reap.cc` 다. 파서 주석은 옳은 규칙(*"It may downgrade a verdict; it may
never reach one"*)을 적어두고 `||` 가 그것을 위반하고 있었다.
→ **`reap run`** 으로 좁혔다. `/reap.start` 가 시키는 명령이자 0.17.6 사고에서 거부된 것이며,
진단성 명령에는 들어가지 않는다. **그리고 "fail-open 은 하나"라는 문장도 지웠다 — 둘이다.**

**concern (a)**: 항목에 명령문이 없으면 진짜 REAP 차단이어도 필드 leg 가 발화하지 않는데,
출력에 "거부가 없었다"와 구분되는 것이 없었다. → FAIL 분기도 항목을 원문 출력하고,
*"this is also what a refusal recorded without its command text looks like, and that one
WOULD be REAP's"* 라고 지목한다.

**concern (b)**: `slash command recognised — /reap.start would not run otherwise` 는 **역 오류**다.
**헤더가 역 오류를 지적하는 문단 한 칸 위에서** 같은 오류를 저지르고 있었다. CLI 우회는
바이트 동일한 파일을 만든다(gen-079 실측). → 두 절반의 **근거가 다름**을 넷 다 명시.

**note**: FAIL 분기가 숫자만 냈고 SKIP 만 항목을 냈다 — **사람에게 필요한 쪽은 FAIL 이다.**
`slice(0,5)` 에 `... and N more` 없음. → 둘 다 처리, `printDenials` 를 두 분기가 공유.

## 라운드 1 — evaluator 가 잡은 것

**blocker**: `[ "${DENIALS:-0}" -gt 0 ]` 가 길이만 봤다. REAP 과 무관한 도구 거부 1건이
진짜 gen-063 을 amber exit 0 으로 바꿨다 — **`HEAD` 대비 회귀**이고, **내가 없애려던 결함과
같은 모양**이었다(증거가 뒷받침하지 않는 원인 단정 + 두 줄 아래에 그것을 반박하는 agent 의 말).
내 정당화는 토큰 경로만 다뤘고 `DENIALS` 경로는 base rate 가 다르다 — allow-list 가
`Bash(reap:*)` 뿐이라 다른 Bash 는 전부 분류기 영역이다. **fail-open 이 둘인데 하나만 분석했다.**

**concern (a)**: 게이트가 `@` import 로드와 hook 발화를 주장하는데 `/reap.start` 는 둘 다 없이
성공한다. `current.yml` 이 증명하는 것은 둘뿐이다. **이번 세대가 그 헤더 블록을 다시 쓰면서
그 주장을 남겨두었다.** → 스크립트 헤더·종료 문구·reap-guide 쌍·versionBump 에서 좁혔다.

**concern (b)**: 네 문서가 "검사 실패 ≠ 측정 실패"를 일반 원칙으로 적었는데 코드는 그보다 좁다.
비대칭에 이유는 있으나 적혀 있지 않았다. → 헤더 주석에 적었다.

**concern (c)**: sentinel-before-filesystem 순서는 `HEAD` 에 **이미 있었다**(116행 vs 133행).
02-planning D2 와 03-implementation 이 그것을 이번 결정처럼 적은 것은 **틀렸다.** 새것은
거부 분류를 부재 분기 안쪽에 둔 것 하나다. → 03-implementation 에서 정정.
**그리고 이번 세대의 어떤 negative 도 그 앞 순서를 지나지 않았다** — 모든 fixture 가 파일 부재
상태이므로 "sentinel + 파일 존재" 조합은 구성된 적이 없다.

**note 4건** — 배포 문서 둘의 숫자 불일치(+ 근거 없는 "a day") / `environment/summary.md` 를
implementation 에서 고친 것(reflect 소관) / carrier 표식 부재 / 비용 합계 낡음 /
backlog 의 분기 수 오기. 전부 처리했다.

### evaluator 가 깨뜨려보고 서 있다고 확인한 것

- V2/V3 의 delta 논증이 **artifact 만으로 판정 가능**했고 실제로 판정됐다.
- V2 가 플래그 오인식으로 통과한 것이 아님 — 인식 못 했다면 `subtype != success` FAIL 로 갔을 것.
- 프롬프트에 든 sentinel 문자열이 `AGENT_JSON` 을 오염시키지 않는다는 것을 **V1 이 반증**한다.
- fixture 전부 재현, 사본이 최종 스크립트와 byte-identical.
- baseline · `fix --check` · docs 게이트 · reap-guide 쌍 동일성 · V3 복구(19개) 독립 재확인.
- artifact 의 타임스탬프를 스위트 실행 시간과 대조해 **날조된 `[실행]` 이 있는지 찾았고 없었다.**

## 검사가 못 잡는 것 — 통과는 "검사 범위 안에서 문제없음"일 뿐이다

- **게이트가 증명하는 것은 하나 반이다.** `CLI reachable and working` 은 파일이 증명한다.
  `slash command recognised` 는 **agent 가 우회하지 말라는 지시를 지켰을 때만** 성립한다 —
  슬래시 커맨드는 CLI 의 wrapper 라 우회가 바이트 동일한 파일을 남긴다(gen-079 실측).
  이번 세대의 확인은 **조건 2종 × 각 n=1** 이다 (V2 비활성 / V3 실삭제) — 같은 조건의 반복이 아니다.
  `@` import 로드와 SessionStart hook 발화는 **증명되지 않는다.**
  여섯 세대 동안 넷을 주장했고 이번에 좁혔다. 그 둘을 검증할 수단은 **아직 없다.**
- **`permission_denials` 의 실제 동작을 모른다.** 거부를 on-demand 로 재현할 방법을 찾지 못했다
  (P1 `--disallowedTools` 는 도구를 아예 안 준다 / P2 `--permission-mode manual` 은 헤드리스에서
  거부하지 않는다 / P3 auto + `reap run start` 는 그냥 실행됐다). N1/N7 의 입력은 **합성**이고,
  **오늘의 실제 거부 실행에서 그 필드가 채워졌는지는 여전히 모른다.**
  이 불확실성 때문에 `PERMISSION_BLOCKED` 토큰이 두 번째 경로로 있다.
- **fail-open 이 둘 남아 있다** (라운드2 에서 "하나"라고 쓴 것이 틀렸다):
  (i) agent 가 차단되지 않았는데 토큰을 뱉는다, (ii) `reap run` 을 지목한 거부가
  **슬래시 커맨드도 없었고 agent 가 그것을 말하지 않은** 실행에서 난다.
  **둘 다 agent 의 지시 이탈을 요구한다** — 아래 항목과 같은 구멍이다. 별개의 위험이 아니다.
- **반대 방향으로도 샌다.** 거부 항목에 명령문이 없으면 진짜 REAP 차단이어도 필드 leg 가
  발화하지 않고 FAIL 이 된다. **안전한 방향**이고 이제 항목이 출력되지만,
  **원소 모양을 모르므로 이 leg 가 프로덕션에서 한 번도 발화하지 않을 수 있다.**
  그 경우 실질적으로 동작하는 것은 `PERMISSION_BLOCKED` 토큰 하나다.
- **판정은 여전히 agent 의 준수에 의존한다.** sentinel 없이 CLI 로 우회하면 통과한다.
  V2/V3 에서 agent 는 준수했으나 **n=1 씩이고** 보장은 아니다.
  backlog 에 `stream-json` 으로 구조적 판정이 가능한지 조사 항목을 남겼다.
- **"sentinel + 파일 존재" 조합이 한 번도 구성되지 않았다.** sentinel-before-filesystem 순서가
  실제로 그 조합을 잡는지는 이 세대가 확인하지 못했다 — 보존만 했다.
- **자동 회귀 검사가 없다.** 8개 분기 중 라이브 실행이 지나는 것은 1~2개뿐이고,
  fixture 는 커밋하지 않았다. backlog 1건으로 등록.
- **macOS 단일 머신, `defaultMode: "auto"` 단일 조건.** 다른 기본 모드는 미측정이다.
- **`sources: v0.17.6 / installed: 0.17.5`.** 층2 가 검증한 조합은 "0.17.6 소스 + 0.17.5 설치본"이다.
  **발행 후 재실행이 더 정확한 검사**다.

## 비용

라이브 agent 실행 **총 11회 / $2.4602**:

| | |
|---|---|
| 탐색 P1~P3 (`permission_denials` 필드 실측) | $0.4229 |
| V1 (라운드1) / V2 / V3 | $0.2609 / $0.2420 / $0.2236 |
| V1 재실행 — 문구 / blocker / 역선택 / 표식·순서 / 윈도잉·공유 | $0.2660 / $0.2617 / $0.2627 / $0.2600 / $0.2604 |
| fixture 58회 (R1 7 + R2 8 + R3 10 + R4 15 + R5 18) | **$0** |

**fixture 가 $0 인 것이 라운드 2~5 를 가능하게 했다** — 매 수정 후 전 분기를 다시 확인하는 데
라이브 1회($0.26)씩만 들었다. 18종을 58번 돌리는 비용이 0 이 아니었다면 이 세대는
**첫 번째 blocker 에서 멈췄을 것이다.** 유료 검사에 무료 negative 자산을 붙이는 것의 값이 이것이다.

## Verdict

**pass.**

7개 완성 기준 + 라운드3 신설 1개 + 라운드4 신설 1개, 전부 충족. 세 스위트 baseline 유지, `fix --check` 회귀 없음,
층1 게이트 전 절 통과, 문서 게이트 통과. fixture 18종이 8개 분기를 전부 지나고,
**수정 전 코드가 같은 입력에 틀린 답을 내는 것**(N0)을 먼저 보였다.
evaluator 4라운드에서 high 2 + low 2, **네 번 다 직전 라운드의 수정 안에** 결함이 있었고
전부 재현 후 수정했다. 3라운드가 blocker chain 이 닫혔다고, 4라운드가 판정 로직이 옳고
남은 둘은 **사람이 읽는 증거 경로**라고 명시했다.

**남은 위험은 § 검사가 못 잡는 것에 전부 적었다.** 그중 **판정 로직의 위험**은 하나로 환원된다 —
**이 게이트의 절반은 agent 가 지시를 지킨다는 가정 위에 서 있고, 그것은 파일 검사로 대체할 수
없다.** fail-open 둘과 반대 방향 누출 하나가 전부 그 가정으로 돌아간다.
구조적으로 판정하는 길(`stream-json`)은 backlog 에 남겼다.

**그 환원은 판정 로직에만 해당하고 커버리지에는 해당하지 않는다.** 아래 넷은 별개다 —
`@` import 와 hook 미커버 / "sentinel + 파일 존재" 조합 미구성 / 자동 회귀 검사 부재 /
단일 머신·단일 `defaultMode`. **하나로 묶으면 그 넷이 해결된 것처럼 읽힌다.**

이 verdict 는 **라운드4 이후 수정한 코드**에 대한 것이다. 라운드5 검토는 받지 않았다 —
그 수정(윈도잉 / `REAP_CMD_MATCH` 공유 / `Array.isArray` 가드 / 한정어 / 재래핑 / 헤드라인)은
전부 라운드4 가 **지적한 그대로**이고, 윈도잉은 `[negative]` 로 직접 확인했다
(윈도잉만 뺀 변형에서 `… && r` 로 끊기고 표시가 없다).

**그러나 "지적대로 고쳤다"가 "새 결함이 없다"는 아니다** — 이 세대에서 그 추론이 **네 번** 틀렸고,
네 번째는 세 번째 수정 자신의 주제 안에 있었다. **라운드5 는 미검토 상태로 남는다.**
남은 것이 있다면 사람이 읽는 증거 경로일 가능성이 높다 — 판정 로직은 4라운드가 확인했다.
