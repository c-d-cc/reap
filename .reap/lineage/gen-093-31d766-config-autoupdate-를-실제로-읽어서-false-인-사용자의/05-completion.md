# Completion

> gen-093 — `config.autoUpdate` 를 실제로 읽어서 false 인 사용자의 설치가 바뀌지 않게 하고,
> 그 값이 어디서 읽히는지 검사로 고정한다.

## Summary

**보여주고 · 보존하고 · 심어주면서 · 읽지 않던 스위치를 배선했다.** `.reap/config.yml` 의
`autoUpdate` 는 v0.16 부터 존재했고 `reap init` 이 만들고 `reap update` 가 보존하고
`reap config` 가 보여주고 `/reap.config` skill 이 문서화하고 `integrity.ts` 가 타입까지
검사했지만 — **어디에서도 값이 읽히지 않았다.** `false` 로 둔 사용자는 `false` 를 보면서
전역 설치가 계속 갈아치워졌다.

0.17.6 의 주제가 *"당신이 말하지 않은 설치가 바뀐다"* 이고 gen-092 가 **어디에** 설치하는가를
좁혔다면, 이 세대는 **할 것인가를 끄는 수단**을 실제로 만들었다. 그것이 이 릴리즈의 마지막
조각이다.

### 바뀐 것

| 파일 | 무엇 |
|---|---|
| `src/cli/commands/check-version.ts` | `readAutoUpdateSetting(root)` 신설 · `AutoUpdateDeps.autoUpdateEnabled` seam · `performAutoUpdate` 6단계 신설 · 주석 5곳 재작성 |
| `tests/unit/check-version.test.ts` | +7 |
| `tests/e2e/check-version.test.ts` | +2 |
| `RELEASE_NOTES.md` / `RELEASE_NOTICE.md`(en·ko) / 5 로케일 | 기존 **0.17.6 항목 보강**. bump 없음 |

`package.json` **0.17.6 그대로**. 0.17.5 이하 문서 무변경. push·tag 없음.

### 위임받은 판단 셋과 그 결론

**1. 어디서 읽는가 → `performAutoUpdate` 안, floor 경고(5단계) 뒤 / 전역 설치 검사 앞.**

`autoUpdate: false` 를 **"내 설치를 바꾸지 마라"** 로 읽었다. 5단계는 설치가 아니라 **메시지**다
— *"당신 사본이 하한 미만이고 REAP 이 자동으로 못 고치니 직접 올리세요"*. 자동 수정을 거절한
사람이야말로 그것을 들어야 한다. 호출부(`execute()`)를 게이트하면 조기 반환이라 5단계에 도달할
수 없고, 경고만 살리려면 floor 판정이 두 곳에 생긴다 — **그 모양의 함수가 이미 같은 파일에
죽은 채로 있다**(`checkAutoUpdateGuard`).

**포기한 것을 적어둔다**: 끈 사용자도 `npm view` 를 계속 부른다. 3단계 앞에 놓으면 네트워크를
아끼지만 경고가 사라진다. 회귀는 아니다 — 지금 전원이 내는 비용 그대로다.

**2. config 를 못 읽으면 → fail open.** 명시적 boolean `false` 만 끈다.

**도달 범위와 그 이유는 같은 사실이다.** fail open 을 고른 근거가 *"postinstall 의 cwd 에는
프로젝트 config 가 없다"* 인데, 그 문장을 뒤집으면 **이 플래그는 postinstall 경로에서 아예
발화하지 않는다**가 된다.

```
SessionStart  cwd = 프로젝트   → config 있음 → 플래그 작동   ← 이 릴리즈의 주제인 경로
postinstall   cwd = 패키지     → config 없음 → 플래그 무시
```

**결함이 아니라 설계의 도달 범위다** — 방금 `npm install` 을 친 사람에게 그 설치는 *"말하지
않은 설치"* 가 아니다. 그러나 **말하지 않으면 안 된다**: 릴리즈 문서에 *"`autoUpdate: false`
로 끌 수 있다"* 라고만 쓰면 **90%만 참**이다. 그래서 `RELEASE_NOTICE`(en·ko)와 5개 로케일
**전부**에 도달 범위 한 절을 넣었다 — *"다스리는 것은 되풀이되는 경로(매 세션 시작)이며 방금
직접 친 설치의 postinstall 은 아니다"*. 문장을 쓸 때의 물음은 **"이 문장이 참이 아닌 사용자가
있는가"** 였다 (gen-092 의 1라운드 blocker 가 정확히 그 물음을 건너뛴 결과였다 — 한 릴리즈
건너 같은 함정이다).

결정적 근거는 하나다: `execute()` 는 `process.cwd()` 를 넘기고 **npm 은 postinstall 을 패키지
디렉토리에서 돌린다** — 거기엔 `.reap/config.yml` 이 없다. fail closed 는 보수적으로 보이지만
**설치 경로 전체를 끄는**, 이 세대에서 가장 큰 동작 변경이었을 것이다. 기본값이 이미 `true`
이므로 "설정 없음 = 기본값"도 일관된다. 비-boolean 값은 `integrity.ts` 가 이미 경고하므로
조용히 끄지 않는다.

**3. `reap update` → 코드 변경 없음.** `performAutoUpdate` 의 호출자는 `check-version.ts` 한
곳이고 `reap update` 는 그것을 부르지 않는다. **이 플래그가 끄는 것은 REAP 이 스스로 하는
설치 하나뿐**이며 사용자가 명시적으로 요청하는 경로는 어느 것도 막지 않는다 — 그 문장을
`execute()` 주석에 남겼다.

### gen-092 가 남긴 숙제 둘

- **주석**: `check-version.ts` 의 *"Attempted unconditionally — `config.autoUpdate` is never
  read"* 를 **같은 편집에서** 재작성했다. 동작 5곳을 바꾸고 그것을 서술하는 문장 5곳을 함께
  고쳤다 (`03` 의 표).
- **상시 검사**: *"설치된 사본에서 버전을 읽는 상시 검사가 없다"* — gen-092 가 두 번 쟀지만
  둘 다 1회성이었다. e2e 2케이스로 자산화했다: `dist/` 를 임시 디렉토리로 옮기고
  `package.json` 에 이 저장소에 없는 버전(`3.2.1`)을 준 뒤 `--version` 을 묻는다. 저장소
  안에서만 재면 *"런타임에 읽는다"* 와 *"빌드 시점에 경로가 박혔다"* 가 구분되지 않는다.

## Lessons Learned

### L1. 순서가 곧 설계일 때, 그 순서를 지키는 검사는 하나다

이 세대의 실질적 결정 전부가 **"6단계를 5단계 뒤에 둔다"** 한 줄이다. 그리고 negative N2 가
그것을 정확히 보여줬다 — 블록을 5단계 **앞으로** 옮기자 **다른 36개가 전부 초록인 채로 하나만
red 가 됐다.**

값은 두 겹이다. (a) 그 검사가 유효하다는 것, (b) **그것 말고는 아무것도 이 결정을 지키지
않는다**는 것. 호출부 게이트를 골랐다면 N1·N3 만 존재했을 것이고, 경고를 잃은 것을 아무도
몰랐을 것이다 — 기능은 "auto-update 를 끈다"로 정상이었을 테니까.

**배치가 곧 동작인 변경에는 배치를 단언하는 검사를 따로 만들어라.** "기능이 되는가"를 묻는
검사는 배치를 묻지 않는다.

### L2. 근거는 재사용되므로, 근거의 오류는 코드의 오류보다 멀리 간다

evaluator 가 유일하게 올린 concern 이 **코드가 아니라 문장**이었다. 내가 `execute()` doc 에
*"미수신 인구는 step 4 가 반환하는 사람 — 이미 최신인 설치"* 라고 적었는데 두 방향으로 틀렸다:

- step 4 의 인구는 **들을 것이 없다** — floor 가 발행된 버전을 지목하도록 게이트되므로
  `installed >= latest >= floor` 다.
- standalone guard 가 **유일하게 봉사할 수 있는** 인구는 **하한 미달 `-alpha` 빌드**다.
  `performAutoUpdate` 는 `+dev`·`-alpha` 둘 다 거르지만 `checkAutoUpdateGuard` 는 `+dev` 만
  거른다.

런타임 결함이 아니다. 그런데 **그 문장은 인접 backlog 를 소비할 세대가 재사용하라고 쓴
근거**였고, 그대로 읽으면 "미수신 인구는 아무것도 필요 없는 사람뿐 → 지워도 된다"로 이어진다.
증거는 정반대를 가리킨다.

longterm 이 이미 *"검토되지 않은 근거에 기댄 결론이 위험한 종류다 — 재사용되는 것이
근거이기 때문"* 이라고 적고 있었다. **내가 그 문장을 읽은 상태로 그 실수를 했다.**

### L3. "자기 수정의 옆" 이 세 세대 연속 맞았다 — 이제 확인이 아니라 절차다

gen-091, gen-092, 그리고 이 세대. 세 번 모두 1라운드 blocker 가 **그 세대의 수정이 만든
것**이었고, 세 번 모두 **바꾼 코드의 바로 옆**이었다.

이 세대의 형태가 특히 말이 된다: 나는 gen-092 의 진단(*"동작 6개를 바꾸고 그것을 서술하는
문장 6개를 뒤에 남겼다"*)을 읽고, 그 실수를 피하려고 주석을 5곳 고쳤으며, **그 과정에서 새로
쓴 문장 하나가 틀렸다.** 낡은 문장을 없애는 작업이 새 틀린 문장을 만들었다.

**"고쳤다" 는 "검증했다" 가 아니다. 특히 산문은 타입 검사도 테스트도 없다.**

**그리고 한 번 더 났다.** Concern 1 을 고치면서 unit docblock 에 *"`execute` 로 옮기거나
5단계 위로 옮기면 첫 테스트는 통과하고 두 번째가 red 가 된다"* 라고 적었는데, evaluator 가
fitness 라운드에서 **`execute` 변형은 첫 테스트도 red 다** 라고 지적했다. 확인하려고 실제로
그 변형을 만들어 돌렸더니 — evaluator 가 맞았고, **그가 말하지 않은 것도 나왔다**:
`execute` 변형에서 **두 번째 테스트는 초록으로 남는다.** 그 테스트는 `performAutoUpdate` 를
직접 부르므로 경고가 여전히 출력되고, 정작 잃는 것(`execute` 가 함수에 도달하지 않음)은
**어떤 unit 도 보지 못한다.** 재작성한 docblock 이 그것을 적는다.

거짓 검증 주장을 고치면서 또 다른 검증 주장을 **재지 않고** 썼다 — 같은 모양의 **네 번째**다.
돌려보는 데 30초 걸렸다.

### L4. evaluator 가 세 번째로 값을 냈다 — 전부 초록인 상태에서

typecheck·build·세 스위트·자기진단 게이트·문서 게이트·carrier·`fix --check` **전부 초록인
상태**로 검토를 요청했고, evaluator 는 새 검사를 하나도 만들지 않고 **negative 3종을 직접
재도출**하고 **각 검사의 통과가 무엇을 관측하는지**를 물어 concern 3건을 찾았다. 그중 하나는
같은 파일 8번째 줄의 기존 주석과의 모순이었다 — grep 한 번이면 나오는 것을 내가 안 했다.

### L5. evaluator 를 두 번 부른 값 — 두 라운드가 서로 다른 것을 잡았다

validation 라운드는 **근거의 오류**(L2)를 잡았고, fitness 라운드는 그 **수정이 만든 새 오류**와
릴리즈 문구가 약속하는 것의 경계를 잡았다. 두 번째 라운드가 없었다면 (a) 위 docblock 이 틀린
채로, (b) *"이제 실제로 끕니다"* 가 **postinstall 경로에는 도달하지 않는다**는 사실 없이
나갔을 것이다.

**전부 초록인 상태에서 두 번 다 뭔가를 찾았다.** longterm 의 *"독립 검토자는 모든 검사가 이미
초록일 때 값을 낸다"* 가 이 세대에서 두 라운드 연속 확인됐다.

## Verification 요약

- unit **627** (620→) / e2e **331** (329→) / scenario **44** — 전부 0 fail. 신규 9개 전부
  이 세대 것이고 **기존 테스트 본문 무변경**.
- `check-self-diagnosis.sh` 전 절 통과 (opencode 1.3.16) · `check-docs-version.sh` 전 항목 ·
  `vite build` · `list-carriers.sh --orphans` 기존 1건 · `fix --check` **0 error / 2 warning**
  (기준선 gen-052 쌍 그대로).
- negative **4종 전부 먼저 red 확인**, 그중 **3종을 evaluator 가 독립 재현**.
- 상세와 근거 종류(`[실행]`/`[negative]`/`[독해]`)는 `03`·`04` 참조.

**이 통과가 말하지 않는 것 10가지**를 `04` 에 적었다. 가장 중요한 것: **자기진단 게이트는 이
세대가 추가한 6단계를 한 번도 실행하지 않는다** (로컬 tarball 이 `dist/.dev-build` 를 갖고
있어 2단계에서 반환). `autoUpdate` 판정은 **unit 으로만** 덮인다.

## Next Generation Hints

> **backlog 를 만들지 않는다** (adapt 규칙). 아래는 텍스트 제안이며 인간이 고른다.

1. **`checkautoupdateguard-…` backlog** — 이 세대가 재료를 더했고 **그 재료를 validation 에서
   정정했다.** 이제 판단에 필요한 사실이 갖춰져 있다: guard 가 유일하게 봉사할 수 있는 인구는
   **하한 미달 `-alpha` 빌드**이고, 그 인구에게 매 SessionStart 에 `npm view` 를 한 번 더
   붙일 값이 있는가가 곧 질문이다. **L2 의 교훈대로, 그 세대는 이 근거를 그대로 받지 말고
   직접 확인할 것.**
2. **"REAP 이 자기 설치를 바꿀지 말지를 *어디서* 묻는가"** — 한 질문의 두 얼굴이다.
   (a) `readAutoUpdateSetting` 이 cwd 에서 위로 올라가지 않아 `autoUpdate: false` 는 cwd 가
   정확히 프로젝트 루트일 때만 존중된다. (b) **npm postinstall 경로에는 원리상 도달하지
   않는다** — cwd 가 패키지 디렉토리다. 즉 낮은 버전을 고정한 사용자가 `autoUpdate: false` 를
   둬도 그 설치의 postinstall 은 최신으로 갈아치운다 (gen-043 부터의 동작, 이 세대의 회귀
   아님). 둘 다 프로젝트 config 로는 닿을 수 없고 **사용자 레벨 설정이나 env 가 있어야
   풀린다.** 고칠지·검사로 고정할지·그대로 둘지가 열려 있다.
3. **명시한 버전은 여전히 존중되지 않는다** (team lead 관찰, 2026-08-20 — **backlog 만들지
   말 것. 이 hint 에만 둔다**). postinstall 이 `npm install -g @c-d-cc/reap@latest` 를 부르므로,
   `npm i -g @c-d-cc/reap@0.17.5` 처럼 **버전을 명시해 설치한 사용자**도 그 자리에서 latest 로
   올라간다. gen-092 가 *어느 설치*를 바꾸는가는 전역으로 좁혔지만 **어느 버전으로 가는가는
   그대로**다. 이 세대의 플래그로도 안 덮인다 — 위 2번의 도달 범위 때문이다(postinstall 은
   프로젝트 config 를 못 본다). **같은 계열이지만 별개 판단**이라 이 세대에서 다루면 scope 가
   흐려진다.
4. **0.17.6 릴리즈** — 이 세대가 마지막 조각이었다. 남은 것은 층2 게이트
   (`check-agent-integration.sh`) 재실행 → 태그 → 발행. **orchestrating agent 의 일이다.**
5. **0.18 브랜치** — midterm 의 순서 그대로 (plugin 리서치·전환 → 지식 축 경계 통합 설계 →
   `.reap/plan/`·`.reap/idea/` → milestone → interview skill → `/reap.plan` → 문서).

## Fitness

### 인간 피드백 (원문)

> 일단 이번 작업 승인할게

**위임이 아니라 사용자 본인의 말이다.** (직전 세대들의 피드백 일부는 사용자의 명시적 승인으로
orchestrating agent 가 작성한 것이었다 — 이번은 다르다.)

### 이 승인이 무엇에 대한 승인인가

**"일단"이 실려 있다 — 무조건 승인이 아니라 잠정 승인이다.** 그리고 무엇을 읽고 나온
말인지가 기록될 값이 있다.

사용자는 직전에 **이 세대의 존재 이유 자체를 의심했다**:

> 곧 plugin 으로 바꾸는데 autoupdate 관련 기능을 넣는 게 맞나? plugin 형태로 가면
> auto update 가 어려울 텐데

orchestrating agent 가 `vision/design/plugin-distribution.md` § 4 를 근거로 답했다. 요지:
plugin 은 갱신 **알림**만 자동이고 실행은 수동이라 그대로면 어긋남이 일상이 되는데,
**`command` source** (`{"source":"command","command":"reap plugin-root"}`,
Claude Code ≥ v2.1.229 · 이 머신 2.1.237) 를 쓰면 명령이 세션마다 재실행되어
**`npm i -g` 한 번으로 CLI 와 plugin 이 동시에 갱신된다.** 즉 auto-update 는 사라지지 않고
**plugin 갱신의 유일한 경로가 된다.** 그리고 이 세대가 고친 것은 auto-update 의 *존재*가
아니라 **동의**이므로, plugin 이 되면 오히려 더 중요해진다 — 그때는 CLI 만이 아니라 slash
command 와 agent 정의까지 갈아치우기 때문이다.

**그 설명 뒤에 나온 승인이다. 따라서 이 승인은 "검토 결과를 받아들이되 plugin 전환 시
재검토 여지를 남긴 승인"으로 읽어야 한다.** 그 이상은 적지 않는다.

## Adapt

### Genome — 한 줄도 바꾸지 않았다

embryo 라 자유 수정이 가능하지만 이 세대의 교훈 셋은 **이미 genome 이나 longterm 에 있는
것의 재확인**이다:

- L1(순서를 지키는 검사) → longterm 의 *"검사의 통과가 무엇을 관측하는가"* bullet 에 넣었다.
  독립 항목으로 세울 만큼 새롭지 않고, genome 의 "검사를 만들 때 먼저 실패시켜라" 절과
  같은 주제의 각론이다.
- L2(근거의 오류) → longterm 에 **이미 그 문장이 있었고 내가 그것을 읽은 상태로 어겼다.**
  규칙을 더 자세히 쓰는 것은 genome 이 명시적으로 *"이미 실패한 방법"* 이라 부르는 것이다.
- L3/L5(자기 수정의 이웃 · evaluator 2라운드) → 둘 다 longterm 의 기존 항목 보강으로
  처리했다. **새 줄을 추가하지 않았다** — longterm 이 49줄이고 가이드라인이 ~50 이다.

**genome 승격 후보가 하나 있고 인간의 자리로 남긴다**: L1 의 *"배치가 곧 동작인 변경에는
배치를 단언하는 검사를 따로 만들어라"*. `evolution.md` 의 *"반복 누락은 지시가 아니라 검사로
막는다"* 절 옆에 놓일 수 있는 모양이지만, 그 절의 주제는 *"사람이 기억해야 하는 절차"* 이고
L1 은 *"검사가 무엇을 붙들고 있는가"* 라 주제가 다르다. **longterm 에 두었다.**

### Embryo → Normal 전환 — 이번에도 제안하지 않는다

의무 점검이므로 네 항목을 다 본다:

| 항목 | 관측 |
|---|---|
| genome 수정 빈도 추세 | **gen-090~093 네 세대 연속 genome 무변경.** 안정 신호가 계속 쌓인다 |
| `application.md` 안정성 | 핵심 정체성·아키텍처 서술이 확립돼 있고, 최근 변경은 전부 `environment/` 쪽이었다 |
| abort 빈도 | 최근 세대에 abort 없음 |
| vision/goals 명확성 | Self-Hosting·Distribution·Evaluator·Tree·Client 확장 축이 살아 있고 항목이 실행 가능하다 |

**조건은 충족된다.** 그럼에도 제안하지 않는 이유는 midterm 에 있는 그대로다 — 사용자 판단
(2026-03-26)으로 REAP 자신은 self-evolving 중이라 보수적으로 embryo 를 유지한다. **다만
0.18 의 plugin 전환이 `.reap/` 구조와 배포 형태를 동시에 바꿀 예정**이므로, 그 전환이 끝나기
전에 normal 로 굳히는 것은 특히 이르다. 전환 이후가 자연스러운 재검토 시점이다.

### Project Diagnosis — 16 기준

정량 점수 없이 현재 상태를 서술한다. 이 세대가 바꾼 것이 아니라 **지금의 프로젝트**에 대한 진단이다.

| # | 기준 | 상태 |
|---|---|---|
| 1 | Core functionality | lifecycle·nonce·backlog·lineage·adapter·indexer 가 모두 동작하며 세 스위트와 두 게이트가 그것을 상시 확인한다. 이 세대가 닫은 `autoUpdate` 는 마지막 남은 "설정과 동작의 불일치"였다 |
| 2 | Architecture stability | transition graph + nonce, adapter dispatcher, 파일 기반 상태가 여러 세대에 걸쳐 흔들리지 않았다. 최근 변화는 daemon 폐기처럼 **덜어내는** 쪽이었다 |
| 3 | Modularity | `core` 가 `cli`·`adapters` 를 import 하지 않는 방향성이 지켜진다. 이 세대도 판정을 `cli` 쪽에 두어 그 경계를 넘지 않았다 |
| 4 | Error handling | hook 경로(postinstall/SessionStart)는 전부 silent-fail 로 감싸여 있고, **그 침묵이 결함을 숨긴 사례**(gen-087 stamp, gen-092 `0.0.0`)를 겪은 뒤로 "삼키되 계약으로 보고한다"가 자리 잡았다 |
| 5 | Test coverage | unit 627 / e2e 331 / scenario 44. 다만 **네트워크·실제 `npm i -g`·실제 postinstall 은 원리상 닿지 않는다** — 이 세대의 6단계가 그 사각에 들어간다 |
| 6 | Documentation | reap-guide·genome·environment·source-map·5 로케일 문서 사이트가 있고 게이트가 정합성을 검사한다. **로케일 drift 검사가 있는 것이 강점** |
| 7 | Security | 자격증명을 다루지 않는다. 다만 **사용자 머신에 전역 설치를 수행하는 코드**가 있어 그 동의 경로가 곧 보안 표면이고, 이 세대가 그것을 좁혔다 |
| 8 | Performance | `reap` 콜드 스타트 40~70ms, 전체 인덱싱 ~0.3s. daemon 폐기가 성능이 아니라 **복잡도** 때문이었다는 것이 이 항목의 현재 상태를 말해준다 |
| 9 | Deployment readiness | 0.17.6 은 **내용이 닫혔고 미발행**이다. 남은 것은 층2 게이트 재실행 → 태그 → publish 이며 OIDC 발행 첫 시도다 |
| 10 | Code quality | Pattern-first·중복 금지·carrier 표식이 실제로 지켜진다. 이 세대는 seam 패턴과 거절 반환 shape 을 기존 8개/3개에 맞췄다 |
| 11 | User experience | slash command·SessionStart·자동 복구가 갖춰져 있다. **최근 여섯 세대가 전부 "사용자가 눈치채지 못하는 실패"를 없애는 데 들었다** — npm 12 차단, uninstall 잔여물, 남의 설치 변경, 그리고 이번 스위치 |
| 12 | Visual verification | 해당 없음 (CLI). 문서 사이트는 `vite build` 로만 검증한다 |
| 13 | Integration layer | npm registry·git·Claude Code·OpenCode 통합이 있고, **층1/층2 두 게이트가 "파일이 놓였는가"와 "클라이언트가 읽는가"를 나눠 묻는다** |
| 14 | Domain maturity | genome·environment·source-map 이 분리돼 있고 각각의 소유 범위가 명문화돼 있다 |
| 15 | Governance compliance | strictEdit/strictMerge·invariants·backlog-only 규칙이 이 세대에서 전부 지켜졌다. **adapt 에서 backlog 를 만들지 않았다** |
| 16 | Genome stability | **네 세대 연속 무변경.** 위 전환 점검 참조 |

### 다음 세대 — 사용자가 검토 중

`05` 의 Next Generation Hints 다섯 항목이 후보이며, **backlog 는 만들지 않았다** (adapt 규칙).
사용자가 **0.18 최우선을 plugin 전환으로 둘지 검토 중**이고, 근거는 최근 12세대 중 6세대가
사용자 레벨 자산 관리에 들어갔는데 **전환과 함께 그 코드의 상당 부분이 사라진다**는 것이다.

## Change Proposals

없음. genome·invariants·goals 를 한 줄도 건드리지 않았다.
