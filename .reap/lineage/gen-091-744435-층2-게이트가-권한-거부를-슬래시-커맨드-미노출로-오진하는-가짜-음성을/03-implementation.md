# Implementation

## Completed Tasks

| # | Task | 상태 | 비고 |
|---|---|---|---|
| T001 | § 1 임시 프로젝트에 `.claude/settings.local.json` | done | `Bash(reap:*)` 만. 임시 디렉토리 안에만 쓴다 |
| T002 | § 2 호출에 `--allowedTools "Bash(reap:*)"` | done | 설정 파일과 **쌍**으로 — 실측된 조합 |
| T003 | § 2 프롬프트에 `PERMISSION_BLOCKED` 토큰 지시 | done | 기존 sentinel 과 같은 형태 |
| T004 | § 2 파서가 `permission_denials` 개수도 뽑고, `subtype !== "success"` 도 FAIL | done | 4번째 필드 `DENIALS` |
| T005 | § 3 판정 재구성 — 부재 분기 안에서 원인 분류 | done | SKIP 경로 신설, 단정 삭제 |
| T006 | 헤더 주석의 틀린 전제 교체 | done | "역은 성립하지 않는다"를 그 자리에 |
| T007 | `.reap/environment/summary.md` | done | 층2 서술 + 게이트 표 |
| T008 | reap-guide 쌍 (`src/templates/` + `.reap/`) | done | 바이트 동일 유지 |
| T009 | `reapdev.versionBump` Step 5-2 | done | 새 SKIP 사유를 읽는 법 |
| T010 | 검증 실행 + 비용 기록 | done | 아래 |
| T011 | 스코프 밖 발견 backlog 등록 | done | 1건 |

## 무엇을 바꿨나 — 판정 순서가 본체다

```
1. agent 실행 자체가 성공했는가        → 아니면 FAIL     (subtype + is_error + 파싱)
2. SLASH_COMMAND_UNAVAILABLE 토큰      → 있으면 FAIL     ← 디스크 검사보다 앞
3. current.yml 존재?
   ├ 있음 → goal 일치? → PASS / FAIL(잘못된 goal)
   └ 없음 → permission_denials > 0  또는  PERMISSION_BLOCKED → SKIP/amber, exit 0
            그 외 → FAIL, 원인 4개 열거 + agent 응답 (단정 없음)
```

**이 중 새것은 하나다.** evaluator 지적 — `2번이 3번보다 앞`은 **`HEAD` 에 이미 있었다**
(sentinel grep 116행, 파일 검사 133행). 02-planning D2 가 둘 다 이번 결정처럼 적은 것은 **틀렸다.**

- **2번이 3번보다 앞** — *(기존)* agent 가 "커맨드가 없다"고 말했는데 파일이 생겼다면 통과가 아니라
  **우회**다. gen-079 1차에서 실제로 일어났고(`$0.26 → $0.45` 로 오른 비용이 우회의 흔적).
  권한을 열면 그 우회가 더 쉬워지므로 **이 순서를 보존하는 것**이 이번 세대의 몫이었고,
  V2/V3 이 그것이 여전히 잡히는지를 확인했다. 순서 자체를 만든 것은 gen-079 다.
- **거부 판정이 3번 안쪽** — *(신규)* 밖에 두면 "거부는 있었지만 결국 성공한" 실행이 SKIP 으로 샌다.
  그리고 **이번 세대의 어떤 negative 도 앞 순서를 지나지 않았다** — 모든 fixture 가 파일 부재
  상태이므로 "sentinel + 파일 존재" 조합은 한 번도 구성되지 않았다.

## 라운드 2 — evaluator 가 blocker 를 잡았다

초안의 조건은 `[ "${DENIALS:-0}" -gt 0 ]` 였다. **길이만 봤고, 거부된 도구가 REAP 과
관계있어야 한다는 조건이 없었다.** evaluator 가 fixture 로 재현했다 — `WebFetch` 거부 1건,
sentinel 없음, agent 는 산문으로 *"I could not find a /reap.start command"* → **SKIP exit 0.**
`HEAD` 에서는 같은 상태가 무조건 exit 1 이었으므로 **이 diff 가 만든 회귀**다.

**그리고 그것은 내가 없애려던 결함과 같은 모양이었다, 한 단계 아래에서** — 게이트가 증거가
뒷받침하지 않는 원인을 단정하고, 그것을 반박하는 agent 의 말을 두 줄 아래에 출력한다.

내가 쓴 정당화는 **토큰 경로만** 다뤘다. `DENIALS` 경로는 base rate 가 다르다 — allow-list 가
`Bash(reap:*)` 뿐이라 skill 이 유발하는 다른 Bash 는 전부 분류기 영역이고, 이 분기의 전제 자체가
"권한이 제한적인 세션"이다. **fail-open 이 둘인데 하나만 분석했다.**

수정:
- 파서가 `REAP_DENIALS` 를 따로 센다 — `JSON.stringify(항목)` 에 `reap` 이 들어간 것만.
  **필드명이 아니라 직렬화 문자열을 본다** — 실제 거부를 캡처한 적이 없어 원소 모양을 모르기 때문이고,
  그것이 애초에 개수만 세던 이유였다. 직렬화 검색은 어느 필드명에도 의존하지 않는다.
- 분기 조건이 `REAP_DENIALS` 를 쓴다. `DENIALS` 는 보고용으로만 남는다.
- SKIP 은 **무엇이 거부됐는지** 최대 5건 출력한다. 숫자 하나는 사람이 행동할 근거가 못 된다.
- FAIL 분기는 REAP 무관 거부가 있으면 **그 사실을 적되 변명으로 쓰지 않는다** —
  *"a refusal unrelated to REAP does not mean REAP was never reached."*

**남은 fail-open 은 하나다** — `PERMISSION_BLOCKED` 토큰. *(라운드 3 에서 이 문장도 틀렸음이 드러난다.)*

## 라운드 3 — evaluator 가 더 날카로운 blocker 를 잡았다

`reap` 부분문자열이 **역선택한다.** evaluator 의 관찰:

> 슬래시 커맨드를 못 찾은 agent 는 reap 을 **덜** 말하는 게 아니라 **더** 말한다.

fixture 둘이 SKIP exit 0 을 냈다:
- `eval-r2-diagnostic-denial` — 거부된 명령이 `ls ~/.claude/commands | grep reap`.
  **슬래시 커맨드를 못 찾은 agent 의 가장 자연스러운 첫 수**이고, 두 줄 아래 산문은
  *"There is no /reap.start command available in this session."*
- `eval-r2-webfetch-reapcc` — `https://reap.cc/docs`. **프로젝트 자신의 도메인.**

**이 게이트가 존재하는 바로 그 시나리오에서 가장 나타나기 쉬운 문자열이, 그 시나리오를
용서하는 문자열이 될 뻔했다.** 그리고 파서 주석은 옳은 규칙을 적어두고 있었다 —
*"It may downgrade a verdict; it may never reach one"* — 그런데 `||` 가 `REAP_DENIALS` 단독으로
결론에 닿게 하고 있었다.

수정: **`reap run`** 으로 좁혔다. `/reap.start` 가 시키는 명령이자 0.17.6 사고에서 실제로
거부된 것이며, 설치 상태를 들여다보는 진단성 명령에는 들어가지 않는다. 여전히 필드명 비의존.

**그리고 "fail-open 이 하나"라는 문장도 지웠다.** 둘이다:
- agent 가 차단되지 않았는데 토큰을 뱉는다
- `reap run` 을 지목한 거부가, **슬래시 커맨드도 없었고 agent 가 그것을 말하지 않은** 실행에서 난다

둘 다 agent 의 지시 이탈을 요구한다 — 게이트 전체가 이미 기대고 있는 가정과 같다.
**잔여 위험과 이미 알려진 구멍이 같은 구멍이라는 것**이 이 라운드의 결론이다.

### concern (a) — 반대 방향의 실패가 조용했다

거부 항목에 명령문이 없으면(`{"tool_name":"Bash","tool_use_id":"..."}`) 진짜 REAP 차단이어도
필드 leg 가 발화하지 않는다. 원소 모양을 모른다고 **인정한** 이상 이 leg 는 프로덕션에서
한 번도 안 터질 수 있는데, 출력에는 "거부가 없었다"와 구분되는 것이 없었다.

수정: **FAIL 분기도 거부 항목을 원문으로 출력한다** (`printDenials` 를 두 분기가 공유).
그리고 문구가 *"this is also what a refusal the client recorded without its command text
looks like, and that one WOULD be REAP's"* 라고 지목한다. 숫자만으로는 사람이 행동할 수 없고,
`eval-r2-diagnostic-denial` 은 **항목을 보는 순간 오분류가 드러난다.** `slice(0,5)` 에
`... and N more` 도 붙였다.

### concern (b) — 좁힌 주장이 아직 절반 과하다

`slash command recognised — /reap.start would not run otherwise` 는 **역 오류다.**
헤더가 역 오류를 지적하는 문단 **한 칸 위에서** 같은 오류를 저지르고 있었다 —
CLI 우회는 **바이트 동일한 파일**을 만들고, 그것이 gen-079 가 측정한 것이며 sentinel 이
존재하는 이유다.

수정: 두 절반의 **근거가 다름**을 명시했다.
- `CLI reachable and working` — 파일이 그 자체로 증명한다
- `slash command recognised` — **agent 가 우회하지 말라는 지시를 지켰을 때만** 성립한다

스크립트 헤더 / 종료 문구 / reap-guide 쌍 / versionBump 넷 다.

## 라운드 4 — 표식을 심은 세대 안에서 표식이 어긋났다

evaluator 라운드3(severity **low** — blocker chain 은 닫혔다)이 세 문장을 잡았다.
**셋 다 같은 기전이다: 라운드3 에서 값을 바꾸고 그 주변 산문을 다시 읽지 않았다.**

### (1) carrier drift — 가장 강한 지적

`agent-integration-gate-verdicts` 표식을 단 **4개 파일 전부**가 여전히
*"a permission refusal **naming reap**"* 라고 말하는데 코드는 `reap run` 을 본다.
표식은 **라운드2 에 옛 값으로 심었고, 라운드3 에서 좁힌 뒤 다시 grep 하지 않았다.**

**#21/#22 가, 그것을 막으려고 표식을 심은 바로 그 세대 안에서 재발했다.**
그리고 그 드리프트는 **amber 를 과잉 약속한다** — 거부된 `reap status` 는 "reap 을 지목한
거부"지만 이제 FAIL 이다 (evaluator 가 `eval-r3-reap-status` 로 확인).
네 곳 다 고쳤다. 표식은 값 옆에 있었지만 **값을 바꾼 사람이 표식을 보고도 다시 grep 하지
않으면 소용없다** — 이것이 이 세대가 배운 것이다.

### (2) 인접성 가정

파서 주석이 *"Searching the serialised entry depends on none of it"* 라고 적었다.
**한 토큰일 때는 참이었고 두 토큰이 되면서 거짓이 됐다** — 직렬화에서 두 단어가 **붙어 있다**고
가정한다. `{command:"reap",args:["run","start"]}` 도, 단어 사이에서 줄바꿈된 것도, `reap status` 도 놓친다.
라운드2 의 *"it is the only one"* 과 **같은 종류**다.

주석을 고치면서 그 이상을 적었다 — **놓치는 것은 전부 FAIL 로 가고 토큰 leg 가 덮으므로,
필드 leg 의 고유 사정거리는 이제 "토큰 규칙을 어긴 agent 의 거부가 `reap run` 을 한 문자열로
담고 있을 때" 뿐이다.** 좁다. 0.17.6 사고의 정확한 모양이고 비용이 0 이라 유지하지만,
**나중에 이것을 지울지 판단할 사람이 "load-bearing 이겠거니" 하지 않도록** 적어두었다.

그리고 "conservative direction = safe" 라는 틀도 고쳤다 — 놓친 거부는 **red 가 되고,
REAP 잘못이 아닌 red 는 바로 위 amber 가 막으려던 것**이다. FAIL 문구의 항목 출력이
완화책이지 해결책이 아니라고 적었다.

### (3) `printDenials` 가 필터보다 먼저 자른다

거부가 5건을 넘으면 **판정을 결정한 그 항목이 잘려나가면서 카운트 줄은 "1 naming `reap run`"
이라고 말한다.** `[negative]` 로 확인했다 — 거부 7건에 `reap run` 을 마지막에 둔 fixture
(`eval-r3-buried-hit`)에서, 순서 정렬을 빼면 그 항목이 목록에서 사라진다.
수정: `reap run` 을 지목한 항목을 **먼저** 놓고 자른다.

## 라운드 5 — 같은 모양이 한 단계 더 아래에 있었다

evaluator 라운드4(severity **low**, "no fail-open, no regression, no wrong verdict")가
**라운드4 수정 자신의 주제 안에서** 네 번째 사례를 찾았다.

### (1) 잘림이 판정 근거를 감춘다 — 순서 수정과 **정확히 같은 모양**

`eval-r4-truncated-hit` — 거부된 명령이 현실적인 접두사를 갖는다
(`cd … && export PATH=… && reap run start …`). match 가 **165번째 문자**에 있어
`slice(0, 160)` 이 `… && r` 에서 자른다. **표시도 없다.**
카운트 줄은 `1 naming \`reap run\`` 이라고 말하는데 **그 근거가 줄에 없다.**

순서 수정은 "항목이 목록에 있음"을 보장했고, 잘림은 **그 항목의 결정적 내용이 줄에 없게** 한다.
**같은 문장이 다시 참이 된다, 한 단계 아래에서.**

수정: hit 항목은 **match 주변으로 창을 옮기고**, 모든 잘림에 `…` 를 붙인다.
`[negative]` 확인 — 윈도잉만 뺀 변형에서 `&& r` 로 끊기고 표시가 없다.

### (2) 술어가 코드 대 코드로 중복됐다 — #22 의 모양

`reap run` 리터럴이 **파서(카운트)와 `printDenials`(순서) 두 곳에 실행 가능한 형태로** 있었다.
한쪽만 좁히면 **카운트 줄과 목록이 어긋난다 — 순서 수정이 막으려던 바로 그 실패다.**

genome: *"같은 값을 두 코드가 알면 표식보다 공유가 낫다."*
→ `export REAP_CMD_MATCH="reap run"` 하나가 소유하고 두 node 블록이 `process.env` 로 읽는다.

### (3) 그 외

- `printDenials` 가 `Array.isArray` 없이 `catch {}` 에 기대고 있었다 — 결과는 같지만
  **설계가 아니라 우연히 조용했다.** 명시 가드로 바꿨다 (`eval-r4-nonarray` 확인).
- *"Every one of those misses lands on FAIL, and the token leg still covers them"* 이 무조건형으로
  읽힌다. **token leg 는 agent 가 그것을 지킬 때만 덮고, 그때가 아닌 것이 바로 이 miss 들이
  문제가 되는 실행이다.** 한정어를 넣었다.
- 4라운드에 걸친 in-place 치환으로 주석 한 줄이 78열을 넘어 있었다. 다시 감쌌다.
- `versionBump` 헤드라인만 "둘뿐"이라 하고 나머지 셋은 "하나 반"이라 했다 — 실질은 같으나
  **틀이 문서마다 달랐다.** 맞췄다.

## 의도적으로 남긴 fail-open — 정당화

`PERMISSION_BLOCKED` 토큰은 **FAIL 이어야 할 것을 SKIP 으로 바꿀 수 있다** (agent 가 차단되지
않았는데 토큰을 뱉는 경우). 받아들인 이유:

- 그 분기는 **`current.yml` 부재일 때만** 도달한다. 성공한 실행은 절대 지나가지 않는다.
- SKIP 은 amber 이고 문구가 기존 SKIP 2종과 **같은 말**("agent integration was NOT verified")을 한다.
- 대가로 없애는 것은 **auto 세션에서 매번 나오던 틀린 FAIL** 이다. 사람이 스크롤로 넘기기
  시작한 검사는 아무것도 잡지 못한다(genome).

`permission_denials` 하나에 얹지 않은 이유는 **그 필드를 신뢰할 수 없다고 측정했기 때문**이다
(01-learning.md P1~P3). 코드 주석에 그대로 적었다 — *"a zero here means 'nothing seen',
never 'nothing happened'. It is used only to downgrade a verdict, never to reach one."*

## 게이트가 주장하던 것을 좁혔다 (evaluator concern a)

`~/.claude/commands/reap.start.md` 전문은 이렇다:

> Run `reap run start` first to scan pending backlog and show options. Then follow the stdout instructions.

**그것을 따르는 agent 는 `@` import 도 SessionStart hook 도 필요하지 않다.** `current.yml` 이
증명하는 것은 **커맨드 노출 + CLI 동작** 둘뿐인데, 헤더 주석과 종료 문구가 여섯 세대 동안 넷을
주장해왔다. 나머지 둘을 "같은 installer 가 놓았으니까"로 미루는 것은 **층1 의 추론**이고,
두 층은 서로를 추론하지 못한다(genome) — 그것이 층2 가 존재하는 이유 그 자체다.

**이번 세대가 바로 그 헤더 블록을 다시 쓰면서 그 주장을 남겨두었다.** 좁혔다:
스크립트 헤더 / 종료 green 줄 / reap-guide 쌍 / versionBump.

## 비대칭을 적었다 (evaluator concern b)

네 문서가 "검사 실패 ≠ 측정 실패"를 **일반 원칙**으로 말하는데 코드는 그보다 좁다 —
`error_max_turns` / `unparseable` 도 REAP 을 측정하지 못했지만 exit 1 이다. 이유는 있다:
**권한 거부는 auto 세션에서 매번 재발하므로 red 로 두면 사람이 이 게이트를 스크롤로 넘기게 되고,
나머지는 드물어 멈춰 설 값이 있다.** 그 이유가 어디에도 없었다. 헤더 주석에 적었다 —
*"Amber is reserved for what would otherwise cry wolf, not granted to everything that failed to measure."*

## carrier 표식 (evaluator note)

"답이 셋" 사실이 4개 파일에 흩어졌는데 표식이 없었다. `reap:carrier(agent-integration-gate-verdicts)`
를 심었다 — `bash scripts/list-carriers.sh` 가 4 파일로 보고한다
(reflect 에서 `environment/summary.md` 가 다섯 번째가 된다).

## `environment/summary.md` 는 되돌렸다 (evaluator note)

T007 로 implementation 에서 고쳤는데 **환경 변경은 reflect phase 소관**이다
(reap-guide § Principles). `git checkout` 으로 되돌리고 reflect 에서 적용한다.
계획(02-planning)이 그것을 implementation 파일 목록에 넣은 것이 원인이다.

## 배포 문서의 숫자를 맞췄다 (evaluator note)

reap-guide 쌍에 *"spent a day and half a dollar"* 라고 썼다 — **"a day" 는 어떤 근거에도 없고**
versionBump 은 `$0.26`, backlog 는 총 $0.534 중 $0.258 낭비라고 적는다. 배포되는 문서 둘이 같은
사건에 다른 숫자를 주고 있었다. 둘 다 **"$0.53 중 $0.26"** 으로 통일했다.

## 검증 — 무엇을 어떻게 깨뜨렸는가

### fixture 주입 방식 (N0~N5, $0)

`AGENT_JSON=$(cd "$PROJECT" && claude -p ... --output-format json < /dev/null 2>&1)`
**한 줄을** `AGENT_JSON=$(cat "$FIXTURE")` 로 치환한 사본을 scratchpad 에 만들어 돌렸다.
치환은 `mkfixture.py` 가 정규식 1회 치환(`assert n == 1`)으로 수행하므로 원본과 어긋날 수 없다.
**원본 `scripts/check-agent-integration.sh` 는 한 글자도 건드리지 않았다.**

fixture 는 **합성이다 — 실제 거부 실행에서 캡처한 것이 아니다.** 거부를 on-demand 로
재현할 방법을 찾지 못했기 때문이며(P1~P3), 그래서 코드가 `permission_denials` 의 **원소 모양에
의존하지 않도록**(길이만 본다) 썼다. 원소 필드명을 잘못 추측해도 깨지지 않는다.

| # | 입력 | 결과 | exit |
|---|---|---|---|
| **N0** | **수정 전 코드** + `denied.json` | **FAIL "This is the gen-063 failure exactly"** — 틀린 답 재현 | 1 |
| N1 | `denied.json` (`permission_denials` 1건) | SKIP/amber, "Refused tool calls recorded by the client: 1" | **0** |
| N2 | `blocked-token.json` (result = `PERMISSION_BLOCKED`) | SKIP/amber, denials 0 | **0** |
| N3 | `slash-unavailable.json` | FAIL — gen-063 경로 유지 | 1 |
| N4 | `agent-error.json` (`is_error`, `error_max_turns`) | FAIL "the agent run itself failed" | 1 |
| N5 | `silent.json` (성공·거부 0·토큰 없음) | FAIL + **원인 4개 열거**, 단정 없음 | 1 |
| N6 | `unparseable.json` (JSON 아님) | FAIL "unparseable" | 1 |

**N0 이 이 세대의 근거다.** 같은 입력에 수정 전은 red 로 gen-063 을 지목하고, 수정 후는
amber 로 "측정하지 못했다"고 말한다. 검사가 실패한 것과 검사가 아무것도 측정하지 못한 것의 구분이
코드로 존재함을 이 한 쌍이 보인다.

### 라이브 실행 (V1~V3)

세 번 다 **실제 headless agent** 를 띄웠다. 지목 가능한 명령을 그대로 적는다.

| # | 명령 | 조건 | 결과 | exit | 비용 |
|---|---|---|---|---|---|
| **V1** | `bash scripts/check-agent-integration.sh` | 무수정 | **PASS** — `generation created: gen-001-ff9355` | 0 | **$0.2609** |
| **V2** | `bash $SP/repo/scripts/v2-gate.sh` | 원본 + `--disable-slash-commands` **한 줄만** 추가 | **FAIL** — `the client does not expose /reap.start` | 1 | **$0.2420** |
| **V3** | `bash $SP/v3.sh` | `~/.claude/commands/reap.*.md` **19개 실제 이동** 후 무수정 게이트 실행 | **FAIL** — 같은 gen-063 경로 | 1 | **$0.2236** |

**V1 이 결함의 소멸을 증명한다.** 같은 머신·같은 auto 세션에서 0.17.6 릴리즈 직전에는 FAIL 이
났다. 지금은 통과하고 generation id 를 출력한다.

**V2/V3 가 이 세대의 유일한 위험을 제거한다.** 권한을 열면 agent 가 슬래시 커맨드 없이도
CLI 로 우회해 같은 파일을 만들 수 있고, 그러면 게이트는 진짜 gen-063 결함에도 통과한다 —
**gen-079 1차에서 실제로 일어난 일**이다. 두 조건 모두에서 agent 는 우회하지 않고
`SLASH_COMMAND_UNAVAILABLE` 을 반환했고 게이트는 exit 1 했다. **검출력은 살아 있다.**

V2 와 V3 를 둘 다 돌린 이유: V2 는 클라이언트가 skill 을 끄는 조건이고, V3 는 **파일이 실제로
없는** 조건이다. gen-079 의 실측은 V3 쪽에서 났으므로 그것을 재현하지 않으면 "내 변형이 그
결함이 아니다"를 배제할 수 없다(genome).

V3 안전장치: `trap restore EXIT INT TERM` 으로 무조건 복구. 창은 약 40초.
**복구 후 19개 전부 제자리, stash 디렉토리 삭제 확인** (`ls ~/.claude/commands | grep -c '^reap\.'` → 19).
`reap install-skills` 재설치에 의존하지 않았다 — 전역 바이너리가 0.17.5 라 내용이 달라질 수 있다.

## 비용 총계

| 항목 | 금액 |
|---|---|
| 탐색 P1~P3 (`permission_denials` 필드 실측) | $0.4229 |
| V1 정상 통과 (라운드1) | $0.2609 |
| V2 슬래시 커맨드 비활성 | $0.2420 |
| V3 슬래시 커맨드 실삭제 | $0.2236 |
| V1 재실행 (문구 수정 후) | $0.2660 |
| V1 재실행 (blocker 수정 후, 라운드2) | $0.2617 |
| V1 재실행 (역선택 수정 후, 라운드3) | $0.2627 |
| V1 재실행 (표식·순서 수정 후, 라운드4) | $0.2600 |
| V1 재실행 (윈도잉·공유 수정 후, 라운드5) | 아래 04-validation.md |
| fixture (R1 7 + R2 8 + R3 10 + R4 15 + R5 18) | $0 |

유료 검사이므로 몇 번 돌렸는지가 정보다 — **최종 합계는 04-validation.md § 비용.**
탐색 3회는 설계를 바꿨다(`permission_denials` 를 단독 신호로 쓰지 않기로 한 근거).
V1 을 세 번 돌린 것은 코드가 두 번 바뀌었기 때문이다 — 그때마다 재실행했다.
**fixture 가 $0 인 것이 라운드2·3 을 가능하게 했다**: 매 수정 후 전 분기를 다시 확인하는 데
라이브 실행 1회($0.26)씩만 들었다. evaluator 가 만든 fixture 3개가 그 자산에 그대로 합류했다 —
`eval-unrelated-denial` / `eval-r2-diagnostic-denial` / `eval-r2-webfetch-reapcc` /
`eval-r2-opaque-denial`. **이 세대의 결정적 결함 둘을 전부 evaluator 의 fixture 가 잡았다.**

## 스코프 밖 발견 → backlog 1건

`층2-게이트-판정부에-자동-회귀-검사가-없다-bash-게이트용-하네스-부재.md` (`reap make backlog`).

판정부가 이제 7개 분기를 갖는데 **자동으로 재검증되는 것은 하나도 없다.** 이번에 쓴 fixture 6개는
scratchpad 에 있고 커밋하지 않았다 — 커밋하면 아무도 돌리지 않는 자산이 되기 때문이다.
저장소에 bash 게이트용 테스트 하네스가 없다는 것이 근본 원인이며, 다른 게이트 3종도 같은 상태다.
그 backlog 에 남아 있는 진짜 구멍(agent 준수 의존, `stream-json` 으로 구조적 판정 가능성)도 함께 적었다.

## Discovered Tasks

없음. 계획한 T001~T011 외에 새로 발견해 구현한 것은 없다.

다만 **계획을 한 곳 수정했다**: SKIP 의 amber 헤드라인 문구를 기존 SKIP 2종과 **같은 말**
(`agent integration was NOT verified`)로 맞췄다. 처음에는 그 문구가 dim 줄에만 있었는데,
`reapdev.versionBump` 에 "셋 다 같은 문구를 낸다"고 쓰려다 그것이 사실이 아님을 발견했다.
문서가 코드를 고친 셈이다. 변경 후 N1/N2 를 다시 돌려 확인했다.

