# Completion

## Summary

**Goal**: source-map 을 읽는 규칙을 배포 템플릿에 전파하고, greenfield 로 init 한 프로젝트에서도
정상 동작하게 만든다.

**결과**: 달성. 소스 2 / 템플릿 2 / 게이트 1 / 테스트 3 / 릴리즈 문서 8 파일.
버전 **0.17.6 유지** (bump 없음). 사용자 지시대로 **S2** 를 채택했다.

**세대 안에서 한 번 되돌아왔다.** fitness 직전에 "읽기 의무만 있고 쓰기 의무가 없다"를 발견해
판단을 올렸고, 사용자가 **B**(회귀 후 최소 문구 수정)를 선택했다. `reap run back` 으로
implementation 까지 두 번 내려가 `02-planning.md` 에 수정 절을 추가하고, 고치고, 다시 올라왔다.
**scope 는 못박았다 — 모순만 멈추고 소유 모델은 정하지 않는다.**

### 무엇이 결함이었나

gen-089 직후 `environment/summary.md` 가 335줄로 커져 코드 구조 서술을
`environment/source-map.md` 로 분리하고, 그 파일을 열게 하는 행동 규칙을 REAP 자신의 genome 에
넣었다. **그런데 그 규칙이 배포 템플릿에는 없었고, 그대로 옮기면 더 나빠질 상황이었다** —
`adoption` 은 source-map 을 만들지만 `greenfield` 는 만들지 않으므로, 신규 greenfield 프로젝트의
agent 는 **매 작업마다 존재하지 않는 파일을 찾게** 된다.

이 프로젝트가 반복해서 잡아온 형태다: **규칙이 자기가 전제하는 것의 존재를 확인하지 않는다.**

### 무엇을 만들었나

- **`src/templates/evolution.md`** — `## Code Quality Principles` 첫 항목으로 규칙.
  명령형이 먼저 오고, 부재는 예외로 다루되 그 답이 "괜찮다"가 아니라 행동이다.
- **`greenfield.ts`** — `buildSourceMapStub()`. `generateSourceMap(scan)` 은 쓸 수 없다
  (스캔할 것이 없다). **서술하지 않고 가르치는 스텁**이며, 트리에 대해 아무것도 주장하지 않는다 —
  `--mode greenfield` 는 코드가 있는 디렉토리에 강제될 수 있다.
- **`migration/v0.17.6.md` §6** — 기존 프로젝트 도달 채널. 3분기 판정 + 대조용 원본 전문 +
  "규칙이 가리키는 파일이 실제로 있는가" 확인 지시.
- **검사 3층**: e2e(소스 트리) / unit(carrier 동일성) / 자기진단 게이트(**배포 tarball**).

### 규칙 문구의 강도는 채널마다 다르다 — 의도한 것이다

배포 genome 의 부재 절은 **조건부**다 ("없으면 summary.md 가 갖고 있고, 그것이 커지면 만들어라").
막 init 한 빈 프로젝트에 "지금 만들어라"는 쓸 내용이 없어 공허하기 때문이다.
**무조건형은 migration note 가 갖는다** — 그쪽 대상은 코드가 이미 있는 프로젝트다.

그래서 `fix --check` 에 "source-map 없음" 경고를 **넣지 않았다**. 규칙이 부재를 견디는데 checker 가
부재를 문제로 보고하면 REAP 이 자기모순에 빠진다 — issue #22 가 정확히 그 형태였다.
backlog 로 남기고 재개 조건 2가지를 적었다.

## Lessons Learned

### L1. "기존 테스트에 영향 없다"는 grep 하기 전까지는 추측이다

02-planning.md 은 *"기존 케이스의 기대값은 바뀌지 않는다"* 라고 단언했다. **틀렸다.**
`legacy-init.test.ts` 가 *"Greenfield override should not create source-map"* 을 **명시적으로**
검사하고 있었고, 전체 e2e 를 돌려서야 드러났다. `init-basic.test.ts` 만 보고
`grep -rn source-map tests/` 를 하지 않은 결과다.

**그 실패가 유용했다.** 그 테스트의 시나리오(`--mode greenfield` 를 코드 있는 디렉토리에 강제)가
스텁 초안의 첫 문장 *"This project has no source files yet"* 이 **거짓이 되는 경우**를 지목했다.
테스트가 없었다면 그 거짓말을 배포했을 것이다.

### L2. containment 로 두 문서를 묶으면 위치가 사라진다

migration note 는 같은 절의 **두 가지 형태**(원본 / 설치본)를 싣는다.
초안 검사는 `expect(note).toContain(templateSection)` 이었고, evaluator 가 이것을 공격했다 —
현재 텍스트를 **원본 블록**에 붙여넣으면 설치 블록이 낡고 대조 블록도 틀린 채 **초록**이다.

**두 개 이상의 형태를 담는 문서를 검사할 때 containment 는 위치를 버린다.**
블록을 추출해 **인덱스로 지목하고 equality** 로 비교해야 한다.
그리고 그 순간 "블록이 정확히 둘"이 load-bearing 이 되므로, `>= 2` 가 아니라 `toBe(2)` 여야 한다 —
세 번째 블록이 끼면 red 가 나서 **산문 기준 재식별로 다시 쓰게** 만드는 것이 목적이다.

### L3. 검사를 fail-closed 로 만든 뒤, **무엇이 그것을 닫고 있는지** 물어라

`fencedMarkdown` 이 닫는 fence 없는 입력에서 `slice(0, -1)` 로 **마지막 글자만 버리고 그럴듯한
블록을 반환**하고 있었다 (측정: `"line one\nline two"` → `"line one\nline tw"`). 고쳐서 `""` 를
반환하게 했다.

**그것만으로는 닫히지 않았다.** evaluator 가 지적했듯, 빈 문자열을 거부한 것은 다른 테스트의
`toContain("- **Pattern-first**")` 루프 **하나뿐**이었다 — 블록 수 검사도 equality 검사도 빈
블록에서 통과했다. 그 루프를 "중복"으로 지우는 순간 구멍이 다시 열린다.

**교훈**: fail-open 을 고친 뒤 **그 구멍을 지금 닫고 있는 assertion 을 지목**하고, 그것을 지웠다고
가정하고 공격을 다시 돌려라. 각 assertion 이 스스로 닫도록 만드는 것이 주석보다 낫다.

### L4. 문자열 guard 는 대개 성질의 대리일 뿐이다

`not.toContain("no source files yet")` 은 **내가 생각해낸 그 문장 하나**만 잡는다.
다른 문구로 트리를 주장하면 통과한다. 대리하던 성질은 *"스텁이 트리를 보지 않고 쓰인다"* 였고,
그것은 직접 표현할 수 있었다 — **스텁이 그 디렉토리에 실재하는 이름(`package.json`, `src/`,
`index.ts`)을 담지 않을 것.** 표현이 바뀌어도 걸린다.

### L5-b. 읽기 의무를 만들면 **누가 언제 쓰는지**도 같은 세대에서 답해야 한다

이 세대는 *"코드를 고치기 전에 `source-map.md` 를 읽어라"* 를 만들었다. 그런데 **그 파일을 누가
갱신하는지는 아무 데도 없었고**, 같은 genome 이 한 절 아래에서 *"구조는 `summary.md` 에 갱신하라"*
고 말하고 있었다. 신규 프로젝트의 스텁은 영원히 `(not recorded yet)` 로 남을 수 있었다 —
**내가 쓴 migration note 가 스스로 "부재보다 나쁘다"고 부르는 상태**를 내가 만든 installer 가
만드는 구조다.

**읽기 의무는 쓰기 의무 없이 성립하지 않는다.** 새 문서를 참조하게 만들 때 자문할 것:
*"이 문서는 누가, 언제, 무엇을 계기로 갱신하는가?"* 답이 없으면 규칙은 빈 파일을 가리키게 된다.

그리고 **그 결함이 왜 살아남았는지**가 더 중요하다 — 나는 규칙을 넣을 자리(`Code Quality
Principles`)만 보고 **같은 파일의 다른 절이 같은 사실을 다르게 말하는지 확인하지 않았다.**
`grep -rn "Source Structure"` 한 번이면 나왔다. #21 이 정확히 그렇게 생겼다.

### L5. 보고한 fail 개수는 **어디를 깨뜨렸는지**에 달렸다 — 위치를 적지 않으면 검사를 과대평가한다

N8("세 번째 markdown 블록 추가")을 `2개 red` 로 적었다. 내가 넣은 위치(두 블록보다 **앞**)에서는
맞다. 그런데 **파일 끝에 덧붙이면 1개만 red 다** — 인덱스 0·1 이 그대로라 equality 와 원본 검사가
둘 다 통과한다. 그리고 **끝에 덧붙이는 쪽이 다음 세대가 실제로 할 일**이다.

즉 가장 그럴듯한 변형에서는 판별하는 단언이 **하나뿐**인데, artifact 는 둘이라고 읽히게 썼다.

**교훈**: negative test 를 적을 때 개수만 적으면 안 된다. **변형을 어디에 넣었는지**가 개수를
결정하고, 실제 위험은 *내가 고른 위치*가 아니라 *다음 사람이 고를 위치*에 있다.

이것이 **L2 의 위치 구멍과 같은 종류의 실수**라는 점이 핵심이다 — 나는 그 구멍을 고치면서
그 구멍을 다시 팠다. longterm 의 *"결함을 고치는 세대가 그것을 반복할 가능성이 가장 높다"* 가
이번에도 맞았고, 이번에는 **evaluator 가 잡았다.**

### L6. 독립 검토의 가치는 라운드 2 를 못 받았을 때 가장 선명하다

라운드 1 은 concern 6건을 냈고 4건이 실제 수정으로 이어졌다 — 그중 L2 의 공격은 **내가 스스로
찾지 못했을 것**이다. 라운드 2 는 서면 답신을 받지 못해 **자기 검토로 대체**했고, 5건 중 2건이
실제 결함이었다(L3 의 fail-soft, `dir2` 필터 실행 불능). 자기 검토로도 결함은 나온다.

**그러나 자기 검토는 내가 상상한 공격만 덮는다.** 라운드 1 이 위치 구멍(L2)을 찾았고,
뒤늦게 도착한 라운드 2·3 이 **L5** 를 찾았다 — 둘 다 자기 검토로는 나오지 않았을 것이다.
근거 없이 "라운드 2 통과"라고 쓰지 않고 한계로 기록해 둔 것이, 실제 판정이 도착했을 때
그것을 정정으로 받아들일 수 있게 했다.

**끊긴 곳은 evaluator 가 아니라 agent 간 반환 경로다 — 진단을 정정한다.**

초안은 이것을 "evaluator 호출 신뢰성"이라고 적었다. **틀렸고, 이 세대가 잡고 있는 바로 그 종류의
실수다** — 측정하지 않은 원인에 이름을 붙였다. 나는 "응답이 오지 않았다"만 관찰했고 거기서
"evaluator 가 응답하지 않는다"를 추론했다.

실제로는 evaluator 가 라운드 2 서면 리뷰를 **세 번** 냈다 (N8 개수 지적 / `toContain` 루프를 지운 채
돌린 재측정 / fixture 이름 열거의 잔여 한계). 매번 스스로 *"이 세션에 SendMessage 가 없어 응답으로
돌려준다"* 고 적었다. **evaluator 는 정상 동작했고, 나에게 돌아오는 경로가 없었다.**
팀 리드가 전문을 전달해 준 것이 유일하게 작동한 채널이다.

따라서 Evaluator 트랙의 Vision/Goal 위임 착수 조건은 "evaluator 신뢰성 확인"이 아니라
**"agent 간 반환 경로 확인"** 이다. 사용자 지시로 그 자체는 **본 세대에서 고치지 않는다**
(코드리뷰에서도 나온 별개 사안).

### L7. `report-evaluator` 채널은 validation 에서만 쓸 수 있다 — fitness 에 도착한 판정은 담지 못한다

라운드 2·3 의 판정이 **completion 단계에 도착**했고, 그것을 채널에 append 하려 하자
`Current stage is 'completion', not 'validation'` 로 거부됐다.

채널의 선언된 목적은 *"미해결이 아니라 **fitness 를 보는 사람이 알아야 할 것**을 나른다"* 인데,
**fitness 에 도달한 뒤에는 더 쓸 수 없다.** validation 에서 기록한 1건은 남아 있고 fitness prompt 에
정상 표시되므로 이번엔 손실이 없었지만, 늦게 도착한 판정은 artifact 본문에만 남는다.

`report-evaluator` 가 transition graph **밖**의 side-channel 인데도 stage guard 를 갖는 것은
설계 의도일 수 있다(validation 단계의 신호라는 뜻). 다만 그렇다면 **fitness 단계에도 같은 채널이
필요하다** — fitness evaluator 가 내놓는 concern 을 담을 곳이 지금은 없다.
다음 세대 후보로 남긴다.

## Next Generation Hints

인간이 판단할 후보다. **backlog 로 만들지 않았다** (adapt phase 규칙).

1. **`check-agent-integration.sh` 에 migration 시나리오가 없다.** 층2 는 slash command 가 노출되는지
   묻지만, **migration note 를 받은 agent 가 사용자 genome 을 실제로 올바르게 고치는지**는 어느
   층도 묻지 않는다. 본 세대의 §6 은 내용만 검증됐다. 0.17.6 이후 note 가 계속 늘어날 것이므로
   한 번은 실제 수행을 검증할 가치가 있다.
2. **`summary.md` ↔ `source-map.md` 의 *소유 모델* 이 아직 규범화되지 않았다.** 본 세대는
   모순만 멈췄다 — *"갖고 있는 쪽을 갱신하라"* 까지만 말하고 **어느 쪽이 소유해야 하는가**는
   정하지 않았다 (사용자가 못박은 scope). 판단 기준(크기? 로드 빈도? 내용 종류?)이 genome 에
   없으므로 다음에 summary 가 커지면 같은 판단을 처음부터 다시 하게 된다.
3. **pending backlog 9건은 전부 0.18 브랜치 또는 indexer 재설계다.** midterm 이 정한 순서대로면
   다음은 **plugin 전환 리서치·설계**다. 0.17.6 릴리즈가 먼저다.
4. 본 세대가 남긴 backlog 2건 — `fix --check` 의 source-map 경고(재개 조건 명시),
   `list-carriers.sh` 의 산문 오탐. 둘 다 low.
5. **`report-evaluator` 에 fitness 단계 채널이 없다** (L7). fitness evaluator 의 concern 을 담을
   곳이 없고, 늦게 도착한 판정도 담지 못한다.
6. **스텁의 tree-agnostic 성질을 구조로 고정할 수 있다** — `buildSourceMapStub` 이 `projectName`
   하나만 받으므로, **이름을 제외한 두 스텁의 동등성**을 걸면 문구 열거 없이 고정된다
   (04-validation.md 한계 5).
7. **agent 간 반환 경로**를 Vision/Goal 위임 착수 전에 확인할 것 (L6). evaluator 자체는 정상
   동작했다 — 별개 사안으로 처리하기로 사용자가 지시했다.

## Fitness

**사용자가 orchestrating agent 에게 위임했다** ("fitness 는 니가 보기에 적당하게 채워도 돼").
피드백 본문 첫 줄에 그 사실이 박혀 있다 — genome 의 self-fitness 금지 때문에, 다음에 읽는 사람이
**인간의 직접 판단으로 오해하면 안 된다.** 원문은 `current.yml` 의 `fitness` 필드에 있다.

요지: 목표 달성. **문구가 아니라 검사로 고정한 것**이 이 세대의 값. 가장 값진 것은 코드가 아니라
두 발견 — evaluator 가 잡은 `includes()` 구멍, 그리고 write duty 부재를 스스로 찾아 **adapt 에서
조용히 닫지 않고 판단을 올린 것**. `fix --check` 에 경고를 넣지 않은 판단(#22 의 모양을 알아본 것)
도 좋게 봤다.

지적: N8 의 fail 개수를 위치 없이 적은 것(L5), 라운드2 미수신을 "evaluator 신뢰성"으로 진단한 것
— **측정하지 않은 원인에 이름을 붙였다** (05 § L6 에서 정정).

caveat: 전부 macOS, 층2 미실행.

## Adapt

### genome 수정 (embryo — 직접 수정 허용)

**1. FR5 / T106 — `.reap/genome/evolution.md` 를 배포본과 같은 의미로 정렬했다.**

- `## Code Quality Principles` 의 `Read source-map first` 에 **부재 절**을 추가 (배포본과 같은
  조건형: 파일이 없으면 `summary.md` 의 구조 서술을 읽고, 코드의 형태를 서술할 필요가 처음 생길 때
  source-map 을 쓴다).
- `## Completion 시 환경 갱신` 의 *"Tech Stack, **Source Structure**, Tests 섹션이 주요 갱신 대상"*
  한 줄을 **두 파일을 각각 지목하는 두 줄**로 — 이것이 fitness 직전에 발견한 모순의 한국어 쪽이다.
- `## genome vs environment 경계` 의 environment 를 `summary.md` **와** `source-map.md` 둘로.
- 표식 2종을 심었다.

**carrier 집합이 완성됐다** `[실행]`:

```
source-map-read-rule          (4 files)  .reap/genome/evolution.md · src/templates/evolution.md
                                         · src/templates/migration/v0.17.6.md · tests/unit/…
environment-refresh-targets   (5 files)  위 + src/cli/commands/run/completion.ts
```

C8 충족. **adapt 전에는 한국어 genome 이 표식 없는 carrier 였고, `--orphans` 는 그것을 볼 수 없었다**
— 표시되지 않은 carrier 는 원리상 탐지 불가다. 04-validation.md 의 체크리스트만이 그것을 추적했고,
그 체크리스트가 실제로 작동했다.

**2. 302줄 초과 경고를 해소했다 — 삭제가 아니라 이동으로.**

guide 는 *"genome bloat 는 잘못 놓인 내용을 옮겨서 해소하고, 경고를 끄려고 손으로 지우지 마라"*
고 못박는다. 두 곳을 옮겼다:

| 옮긴 것 | 어디로 | 왜 |
|---|---|---|
| e2e 격리에서 **닿지 않는 축의 사실 목록** (bun 의 `os.homedir()` 가 `$HOME` 을 무시한다 / macOS `/var` symlink) | `environment/summary.md` § Tests | **런타임·플랫폼 사실**이다. genome 에는 "닿지 않는 축은 값을 주입하라"는 규칙만 남겼다 — 목록을 genome 에 두면 그 목록이 곧 낡는다 |
| early-close 의 **명령 동작 서술** (`--defer-tasks` 의 기본값, 어느 stage 에서 쓸 수 있는지) | 제거하고 `~/.reap/reap-guide.md` § Termination Paths 를 지목 | guide 가 이미 전부 갖고 있었다. **같은 사실의 두 번째 사본**이며 #21 이 정확히 그렇게 생겼다. 판단 기준만 genome 에 남겼다 |

결과: `fix --check` **0 error / 2 warning** (302줄 경고 소멸). 남은 2건은 lineage gen-052 의
parent 미발견으로, 압축 epoch 관련 상속분이며 본 세대 범위 밖이다.

**3. dogfooding 동기화 확인** `[실행]`

`grep -n "early-close" src/templates/evolution.md` → **0건.** early-close 절은 REAP 자신에게만
쌓인 내용이었으므로 템플릿 동기화 대상이 아니다. source-map 관련 3개 절은 **템플릿이 원본이고
genome 이 그것을 따라간 것**이라 이미 일치한다 (unit 검사가 강제).

### Embryo → Normal 전환 판단

세대 수 90 — hard check(6+)는 오래전 충족. 그러나 **이번 세대에서만 genome 을 5곳 고쳤다**
(규칙 문구 2, 갱신 대상 2, 경계 1) + 2곳을 environment 로 이관. 직전 gen-089 도 genome 을 건드렸다.

| 항목 | 판단 |
|---|---|
| genome 수정 빈도 추세 | **감소하지 않았다.** 최근 2세대 연속 수정 |
| application.md 안정성 | 안정적 — 이번 세대는 evolution.md 만 건드렸다 |
| abort 빈도 | 낮음. 다만 **본 세대는 fitness 이후 회귀를 두 번 했다** (abort 는 아니지만 genome 이 흔들릴 수 있는 신호) |
| vision/goals.md 명료성 | 항목은 구체적이나 **여러 세대째 전진이 없다** — backlog 구동으로 일해 왔다 |

**전환을 제안하지 않는다.** 사용자의 2026-03-26 판단(REAP 자신은 self-evolving 중이라 보수적으로
embryo 유지)이 지금도 유효하다 — 본 세대가 그 근거를 하나 더 만들었다. **읽기 규칙을 넣자마자
같은 파일의 다른 절과 모순됐고, 그것을 고치려 genome 을 다시 열어야 했다.** normal 이었다면 그
모순이 다음 세대까지 배포된 채 살아있었을 것이다.

다음 판단 시점: 사용자가 명시 검토할 때, 또는 genome 을 건드리지 않는 세대가 연속으로 나올 때.

### backlog 를 만들지 않았다

adapt 규칙대로다 — 다음 세대 후보는 위 § Next Generation Hints 의 **텍스트로만** 남겼다.
어느 것이 backlog 가 될지는 인간이 정한다.

(implementation 단계에서 만든 backlog 2건은 별개다: `fix --check` 의 source-map 경고 판단,
`list-carriers.sh` 의 산문 오탐. 둘 다 그 단계에서 발견한 out-of-scope 항목이며 strictEdit 규약대로
등록했다.)
