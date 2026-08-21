# 05 Completion — gen-099-b9afc9

> Goal: carrier ID 에 hash8 을 붙인다 — slug 은 읽히고 hash 는 고유성을 보장한다
> (+ `list-carriers.sh` 산문 오탐 제거) · Milestone: ms-002 · Backlog: `bklog-76e909`

## Summary

carrier 표식의 ID 가 **`<slug>-<hash8>`** 가 됐고, 그 형식을 **검사가 강제한다.**

- `scripts/list-carriers.sh` 재작성 — 관대한 패턴으로 걷은 뒤 valid / malformed / mention 3분기.
  `--check`(exit 1, CI 배선) · `--root <dir>`(테스트용) · `--new <slug>`(고유 hash 발급) ·
  orphan 시 반쪽 일치 힌트 · 미종료 표식 · slug 분열 · hash 충돌.
- 저장소 표식 **13개를 39파일에서 이관**. 14번째였던 `id` 는 **처음부터 표식이 아니라
  산문의 자리표시자**였고 사라졌다 — gen-085·088·089 세 세대가 헷갈렸던 그 항목이다.
- orphan 2건 해소. **표식이 불필요했던 게 아니라 다른 곳을 안 표시한 것**이었다.
- `tests/unit/list-carriers.test.ts` 신규 18 케이스 — 이 스크립트의 **최초 테스트**.
- 잔여 backlog `list-carriers.sh 산문 오탐` 해소 (9건 → 8건).

## Lessons Learned

### 1. 형식을 강제하면 오탐이 사라지는 게 아니라 **더 시끄러워진다**

이관 전 `--check` 를 돌리자 가짜 `id` 가 orphan 이 아니라 **형식 위반**으로 잡혔다. 형식 검사만
넣었다면 "항상 뜨는 가짜 항목"이 경고에서 에러로 승격됐을 뿐이다. 두 backlog 를 같은 세대에서
처리하라는 판단이 옳았고, 그 이유는 "같은 파일을 두 번 만진다"보다 강하다 — **따로 했으면
첫 번째가 두 번째를 악화시켰다.**

### 2. 표식이 **값 옆이 아니라 예시 옆**에 붙어 있었다

`claude-code-commands-path` 의 12파일 중 3개가 그 값을 **예시로만** 갖고 있었다. genome 이 목록
대신 표식을 택한 이유가 "값 바로 옆에 있으므로 그 값을 다루는 사람이 본다"인데, 예시 옆에 붙은
표식은 그 성질을 갖지 않는다 — **목록으로 되돌아간 것과 같다.** 그것을 드러낸 것은 형식 변경
자체가 아니라 **"이 파일은 이 사실을 아는가"를 파일마다 다시 물은 것**이다.
`memory-tier-classification` 이 12 → 11 로 **줄어든 것**이 그 답이다.

### 3. 로케일이 문자 클래스의 의미를 바꾼다

`case "$id" in *[!a-z0-9-]*)` 는 UTF-8 로케일에서 `a-z` 가 collation 범위라 `A` 를 포함한다.
대문자 해시가 **정상 ID 로 집계됐다.** 눈으로 볼 수 없고, 코드를 읽어서도 안 보인다 —
테스트가 "4건"을 기대했는데 3건이 나와서 발견됐다. bash 로 검사를 쓸 때 `LC_ALL=C` 는
스타일이 아니라 **정확성**이다.

### 4. "어떤 입력이 검사를 fail-open 시키는가"는 **초록인 상태에서 따로 물어야 한다**

18 케이스가 전부 초록인 뒤에 그 질문만 던져 둘을 더 찾았다 — 닫는 괄호가 없으면 표식이
**아예 안 보이고**, 같은 slug 에 hash 가 둘이면 **아무도 보고하지 않았다**(`--new` 는 그 상태를
만들기를 거부하는데). 테스트를 통과시키는 것과 fail-open 을 없애는 것은 다른 작업이다.

### 5. **그 수정 안에 또 결함이 있었다** — genome 이 예고한 그대로

미종료 표식 판정의 첫 구현이 줄 **집합**을 비교했다. 한 줄에 닫힌 표식과 안 닫힌 표식이 함께
있으면 그 줄이 양쪽에 다 나타나 "정산됨"으로 읽힌다. 그리고 그 검사의 **첫 버전은 오탐도 냈다** —
괄호 없이 `reap:carrier` 를 부르는 산문을 오타로 잡았다. genome longterm 의 *"직전 라운드의
수정 안에 다음 결함이 있다"* 가 이 세대에서 **두 번** 성립했다.

### 6. artifact 가 주장한 규칙이 정작 문서에 없었다

04-validation 에 "표식을 손으로 짓지 말고 `--new` 를 쓰라가 그래서 규칙이다"라고 적고 나서
확인하니 guide 도 genome 도 그 말을 **하지 않고 있었다.** 명령을 *보여주는* 것과 규칙을
*말하는* 것은 다르다. artifact 를 쓰다가 발견한 것이라, **쓰는 행위 자체가 검사**였다.

### 7. 검사가 reflect 중에 **이 세대가 방금 쓴 산문**을 잡았다

`environment/summary.md` 에 스크립트를 서술하며 스캐너의 정규식을 그대로 인용했고,
스캐너가 그 안의 `[^` 를 ID 로 읽어 형식 위반으로 보고했다. 고치고 나서 memory 에 그 사실을
적었더니 **이번엔 잘린 토큰이 미종료 표식으로 잡혔다** — 같은 실수를 기록하는 문장이 같은
실수를 저질렀다.

**이 검사가 실전에서 red 를 낸 사례는 이 둘뿐이고, 둘 다 검사를 만든 세대의 문서다.**
꺾쇠 규칙(`<`·`>`·공백이면 언급)이 **모든** 산문을 덮지는 않는다는 뜻이다 — 여는 괄호만 붙은
조각이나 정규식 인용은 규칙 밖이다. 산문에서 표식 토큰을 인용할 때는 **닫힌 형태 + 꺾쇠
자리표시자**로 쓴다.

`.reap/life/` 는 스캔에서 제외되므로 **이 artifact 는 red 를 내지 않았다** — 그러니 여기서
같은 실수를 해도 아무도 안 잡는다. 그래서 손으로 고쳤다.

## Milestone Progress

`ms-002` (`v018-지식-축-정리`) 의 `## Generations` 에서 **`carrier ID 에 hash8 을 붙인다`** 를 완료.

**Exit Criteria 는 아직 하나도 충족되지 않았다.** 이 milestone 의 5개 조건은 milestone→goal ·
memory `from`/`to` · idea 졸업 경로 · memory flat · `/reap.interview` 에 대한 것이고, carrier 는
그중 어디에도 속하지 않는다 — **carrier 는 참조 체계가 아니라 표식이며 아무것도 그것을
가리키지 않는다**(backlog 판단 메모). 이 항목은 앞 세대(gen-098)가 만든 해시 설계를 재사용하기
위해 인접 배치된 것이고, 그 목적은 달성됐다. 남은 4개 generation 이 exit criteria 를 담당한다.

## Fitness — 인간 판정

> **승인. 이대로 commit 하라.** (2026-08-22)

받은 피드백의 요지:

- 형식이 검사로 강제되고, 이관이 **스크립트 출력과 무관하게 HEAD 대조로** 확인됐고,
  negative 13회가 붙은 것을 받아들인다.
- **가장 값어치 있는 것은 `id` 가 애초에 표식이 아니었다는 판정** — 세 세대가 헷갈렸던 것을
  실측으로 끝낸 것.
- 초록인 뒤에 결함 일곱을 스스로 잡은 것도 옳게 했다. 특히 로케일 collation 은 눈으로도
  독해로도 안 보이는 종류이고, "수정 안에 또 결함"은 genome 이 반복 관측한 것의 또 한 번의 실증.
- **지적 하나 — evaluator 무응답은 이 세대에서 되돌리지 않고 다음 세대가 조사한다.**
  opt-in 한 evaluator 가 조용히 아무것도 하지 않았고, 남은 6세대가 전부 자기검토만 받는 것을
  막으려면 원인부터 봐야 한다. genome 의 *Subagent calls as lifecycle gates* 가 advisor + fallback
  을 요구하는데, **fallback 이 조용하면 그것은 fallback 이 아니라 침묵이다.**

## Project Diagnosis

> 정량 점수를 쓰지 않는다 (genome: Human Judges Fitness). 이 세대가 만진 표면 위주로 서술한다.

- **Core functionality** — 라이프사이클·nonce·adapter·indexer 모두 동작한다. 이 세대는 런타임
  코드 경로를 건드리지 않았고 저장소 자기 정합성 도구 하나를 고쳤다.
- **Architecture stability** — 안정적이다. genome `application.md` 는 249/250 줄로 포화에
  가깝고, 그것이 "더 쌓지 말고 옮겨라"의 신호로 이미 작동하고 있다.
- **Modularity** — CLI/core/adapter 3층은 유지된다. 다만 **게이트 스크립트 5종은 서로 아무것도
  공유하지 않는다** — 이번에 `--root` 를 넣어 하나만 테스트 가능해졌고 나머지 4종은 그대로다.
- **Error handling** — CLI 는 JSON 으로 일관되게 낸다. bash 게이트 쪽은 이번 세대가 `--check` 에
  **exit 1 + 원인 열거**를 넣어 한 칸 나아졌다.
- **Test coverage** — unit 791 / e2e 379 / scenario 62. **`src/indexer/` 의 이식 모듈에는 여전히
  unit test 가 없고**, bash 게이트 4종에도 없다. 후자는 이번 세대가 패턴을 제시했다.
- **Documentation** — 문서 사이트 115 페이지 · 5 로케일 · 게이트 2층. 이번 세대에서 shipped
  reap-guide 가 **없는 스크립트를 가리키던 문장**을 정직하게 고쳤으나 근본 갭은 남아 있다.
- **Security** — 해당 사항이 제한적이다(로컬 CLI). `reap uninstall` 의 allowlist 방식 유지.
- **Observability** — `--check` 가 성공 시에도 **무엇을 몇 개 셌는지** 말한다. 침묵을 통과로
  읽지 않게 하는 것이 이 세대의 작은 기여다.
- **Visual verification** — 해당 없음 (CLI). 문서 사이트는 별도 게이트가 담당.

## Embryo → Normal 전환 판단

**이번에도 전환을 제안하지 않는다.** 사용자 판단(2026-03-26)의 embryo 유지가 여전히 유효하다.

1. **genome 수정 빈도** — 줄지 않았다. gen-097(milestone) 이 genome 3파일, gen-098(참조 ID) 가
   evolution.md, 그리고 **이 세대가 application.md 의 carrier 절을 통째로 다시 썼다.**
2. **application.md 안정성** — 정체성·아키텍처는 안정적이나 **249/250 줄**로 포화다. 안정이
   아니라 압력 상태에 가깝다.
3. **abort 빈도** — 최근 세대에 abort 없음. 이 지표만 전환에 우호적이다.
4. **vision/goals 명확성** — milestone 도입 이후 명확하다. 다음 4세대의 계획이 파일로 있다.

**(1)이 결정적이다.** v0.18 의 남은 4세대가 memory 재설계 · idea 자리 신설 · 3축 경계 설계로
**genome 을 직접 고치는 작업**이다. normal 로 바꾸면 그 전부가 backlog → adapt 우회로를 거쳐야
하고, 한 세대 안에서 규칙과 그 규칙의 소비자를 함께 고칠 수 없게 된다. **v0.18 이 끝난 뒤
다시 판단하는 것이 맞다.**

## Genome 변경 (adapt) — embryo 라 직접 수정

1. **`evolution.md` § 독립 검토** — 항목 하나 추가: *"evaluator 가 회신하지 않으면 그 사실을
   `report-evaluator` 로 남겨라. **fallback 이 조용하면 그것은 fallback 이 아니라 침묵이다** —
   아무 흔적이 없으면 다음 사람은 검토를 받은 세대와 구분하지 못한다."* fitness 지적을 규칙으로
   고정한 것이다. 이번 세대는 손으로 `--severity low` 를 쳤고, **잊는 세대는 흔적을 안 남긴다.**

2. **`### Clarity 판단 기준` 을 소유자 지시로 교체** — genome 이 적어 둔 목록이 **코드와
   어긋나 있었다**: genome 은 *"backlog 에 명확한 task 있음 → high"*, 코드
   (`src/core/clarity.ts::calculateClarity`)는 **high-priority 2건 이상**을 요구한다.
   이 세대가 하루 종일 다룬 바로 그 결함 class 이며(같은 사실을 두 곳이 알고 한쪽만 갱신됨),
   genome 자신의 처방(**공유 가능하면 표식보다 공유**)이 답이다 — 목록을 지우고 소유자를 가리킨다.

   **`src/templates/evolution.md` 에도 같은 목록이 같은 내용으로 배포되고 있었다.** dog-fooding
   규칙대로 함께 고쳤다. 즉 **모든 신규 프로젝트가 코드와 모순되는 genome 을 받고 있었다.**
   기존 프로젝트에는 migration note 로만 도달하며 그것은 v0.18 릴리즈 세대의 몫이다(아래 hints 4).

   > 이 항목은 계획에 없었다. `evolution.md` 가 301줄이 되어 줄을 줄이려 훑다가 발견했다 —
   > **크기 경고가 내용 검토를 강제한 사례**다. 손으로 지워 경고를 끄지 말라는 규칙이
   > 실제로 결함 하나를 잡아냈다.

3. **하지 않은 것**: (1)의 규칙은 `src/templates/evolution.md` 에 넣지 않았다. 그 파일에는
   독립 검토 절 자체가 없어 새 절을 만들어야 하고, 그것은 이 세대의 goal 밖이다.
   evaluator 원인 조사(hints 1)와 함께 판단하는 것이 맞다.

**adapt 후 줄 수**: `evolution.md` **297**/300 (validation 시점 298 → 규칙 1줄 +3, clarity 목록 −4),
`application.md` **249**/250 (변동 없음), `src/templates/evolution.md` **236** (−4).
`fix --check` 는 error 0 / warning 2(gen-052 상속분)로 baseline 그대로다.
**04-validation.md 에 적힌 298 은 validation 시점의 값이며 지금은 297 이다** — adapt 가 genome 을
고치는 것은 설계된 순서이므로 그 artifact 를 고치지 않고 여기에 최신값을 남긴다.

## Next Generation Hints

> genome Critical Rule 6 — 여기 적힌 것 중 무엇이 backlog 가 될지는 인간이 정한다.
> adapt phase 에서 `reap make backlog` 를 실행하지 않았다.

### 1. (최우선) evaluator 가 왜 조용히 아무것도 하지 않았는가

fitness 지적이 이것을 최우선으로 지목했다. **`evaluator: true` 인데 `reap-evaluate` 가 응답 없이
idle 로 전환됐고** (14:17·14:27 두 번 관측), 이 세대의 적대적 검토는 전부 builder 자신이 했다.
**남은 4~6세대가 전부 자기검토만 받는 것을 막으려면 원인부터 봐야 한다.**

조사 방향 셋:

- **agent 정의가 설치돼 있는가** — `~/.claude/agents/reap-evaluate.md` 가 실제로 있는지,
  `src/templates/agents/reap-evaluate.md` 와 같은 버전인지. `registerSessionIntegration` 과
  `installSkills` 양쪽이 이것을 갱신하는지(gen-064 의 그 갭과 같은 형태인지).
- **validation 에서 호출되는 코드 경로가 무엇인가** — `evaluator.prompt` 를 만들어 stdout 으로
  넘기는 것까지가 REAP 이 하는 전부이고, **실제 호출은 agent 가 한다.** 즉 REAP 쪽에는
  "호출됐는지"를 아는 수단이 없다. 그것 자체가 결함 후보다.
- **Agent(Task) 도구 부재 fallback 이 조용히 삼키는가** — longterm 이 "advisor + fallback,
  never gate" 를 규정하는데, **fallback 이 조용하면 그것은 fallback 이 아니라 침묵이다.**
  최소한 "evaluator 를 띄웠으나 회신이 없었다"가 `EvaluatorConcern` 으로 **자동** 기록돼야 한다 —
  이번엔 builder 가 손으로 `report-evaluator --severity low` 를 쳤고, 그것을 잊는 세대는
  아무 흔적도 남기지 않는다.

### 2. e2e 1 fail 미재현 — **실패한 테스트 이름을 잡는 방법**

재현이 안 됐다고 넘기지 않는다. **이번에 이름을 못 잡은 것은 flake 때문이 아니라 내 명령 때문이다** —
`npm run test:e2e | grep -E "^ [0-9]+ (pass|fail)"` 가 개수 줄만 남기고 `(fail)` 줄을 버렸다.
bun 은 실패한 테스트 이름을 `(fail) <describe> > <test>` 로 **이미 출력하고 있었다.**

다음에 쓸 것 (`npx bun test --help` 로 존재 확인함):

```bash
npm run test:e2e 2>&1 | tee /tmp/e2e.log        # 항상 tee. grep 은 로그에 대고 한다
grep -E '^\(fail\)' /tmp/e2e.log

npx bun test tests/e2e/ --rerun-each 5          # 각 파일을 5회 반복 — flake 유도
npx bun test tests/e2e/ --reporter=junit --reporter-outfile=/tmp/e2e.xml   # 기계 판독
```

`--rerun-each` 와 `--reporter=junit` 은 bun 이 실제로 갖고 있다. **파이프로 개수만 거르는 습관
자체가 결함**이었다 — 관측을 버리는 명령을 기본값으로 쓰면 flake 는 영원히 익명으로 남는다.

### 3. shipped `reap-guide.md` 가 사용자에게 없는 스크립트를 가리킨다 (01-learning F7)

`list-carriers.sh` 는 `dist/` 에도 `reap init` 산출물에도 없다. 이번 세대는 **문장만** 정직하게
고쳤다("REAP 저장소에 있으니 복사해 쓰라, grep 은 어디서나 된다"). 진짜 선택지 셋 —
(a) `reap carriers` 로 CLI 에 넣는다, (b) `reap init` 이 스크립트를 심는다,
(c) 규칙을 REAP 저장소 전용으로 명시하고 shipped genome 템플릿에서 뺀다.
**plugin 전환이 배포 표면을 바꾸므로 그 뒤에 판단하는 것이 맞다.**

### 4. carrier 형식 변경이 기존 사용자 프로젝트에 도달하지 않았다

migration note 가 유일한 채널이고 버전 bump 를 동반해야 한다. 사용자 프로젝트에는 검사가 없어
낡은 형식이 아무것도 깨뜨리지 않으므로 긴급하지 않다. **gen-098 의 ID 경고와 같은 note 에 함께**
넣는 것이 맞다 — v0.18 릴리즈 세대.

### 5. bash 게이트용 테스트 하네스 — `--root` 패턴이 나머지 4종에 적용되는가

이 세대가 `list-carriers.sh` 에 `--root <dir>` 를 넣어 임의 픽스처 트리를 스캔시킬 수 있게 했고,
그것이 이 스크립트의 최초 테스트를 가능하게 했다. `check-self-diagnosis.sh` ·
`check-version-floors.sh` · `check-docs-version.sh` · `check-agent-integration.sh` 는 여전히
테스트가 없다(잔여 backlog `층2-게이트-판정부에-자동-회귀-검사가-없다`).
**"주입 가능한 루트"가 그 4종에도 통하는지**가 그 backlog 를 재검토할 때의 구체적 질문이다.

### 6. milestone 의 다음 항목

`지식 축 경계 통합 설계 — milestone · idea · memory 3축을 한 세대에서 닫는다`.
seed 는 `.reap/vision/design/backlogs_v0.18/`. **milestone 의 Exit Criteria 는 아직 하나도
충족되지 않았다** — carrier 는 참조 체계가 아니라 표식이고 아무것도 그것을 가리키지 않는다.
