# 명령 표면과 기록

## 명령 표면


REAP의 CLI는 두 종류의 일만 한다: **만들기(`make`)와 표시하기(`mark`)**. 둘 다 메타데이터만 건드린다. 나머지는 조회·조립·검증·원자적 선점이며, 어느 것도 흐름을 제어하지 않는다.

```bash
reap --version
reap init [--force] | reap init --check     # --check: 씨앗 그대로인 지식 파일을 보고만 한다

reap make <kind> [options]        # generation | loop | milestone | backlog | idea | hook | plan-source
reap mark <kind> <id> [flags]     # frontmatter의 확정적 필드 갱신

reap seq [type|id]                # id 레지스트리 조회
reap bind <gen-id>                # 열린 세대에 이 세션을 다시 묶는다 — abort나 다른 세션이 .session을 비웠을 때
reap ctx [--milestone <ms-id>] [--hook]   # 읽을 것을 조립해 출력
reap index [update|status|impact|search|callers|callees]   # 코드 인덱스 질의
reap doctor                       # 사후 검증 — 보고만, 고치지 않음
reap carrier new <slug> | list [--orphans|--check]   # 미사용 해시로 표식 발급, 그리고 조회
reap plan sources | convention <ps-id>
reap orch claim | release | barrier | roster | status
```

**여기에 `start`도 `close`도 `gate`도 없다.** 세대를 열고 닫는 것은 흐름이며, 흐름은 skill이 소유한다.

### make

```bash
reap make generation --milestone <ms-id> --title "<t>" [--slug <s>]
reap make generation --backlog  <bk-id> --title "<t>" [--slug <s>]
reap make generation --fix  --title "<t>" [--slug <s>]
reap make loop --type plan|design|uiux|idea --title "<t>" [--slug <s>] [--from <id|ps-id:path>] [--ref <ps-id>:<path>]
reap make milestone --title "<t>" [--slug <s>] [--from <loop-id>] [--ref <ps-id>:<path>] [--focus]
reap make backlog --type <t> --title "<t>" [--slug <s>] [--from <id>]
reap make idea --kind research|freememo|file --title "<t>" [--slug <s>]
reap make hook --event <e> --name <n> [--type md|sh] [--condition <c>] [--order <n>]
reap make plan-source --root <path> --role "<r>" [--slug <s>]
```

`make generation`이 받는 것은 **유형이거나 근거**다. `--fix`는 유형이고 **홀로 온다**. `--milestone`과 `--backlog`는 exec의 근거이고 **하나 이상이면 되며 둘을 함께 줄 수 있다** — milestone이 갈래를 주고 backlog 항목이 그 안의 구체적 일을 준다. 무엇을 고르는지는 `02-flow.md`의 "exec의 근거는 둘이다"가 정한다. 유형도 근거도 없으면 거부한다 — 짐작할 것이 아니다. **이미 `consumed`인 backlog는 거부한다.** `--plan`은 없다 — 새 의도를 만드는 일은 generation이 아니라 `make loop`다. 기존 `gen-NNNN-plan` 기록은 역사로 남고 형식만 인식한다.

**`make loop`는 유형이 필수이고 근거는 선택이다.** `--from`은 출처(generation·앞 loop·`<ps-id>:<path>`)이지 권한이 아니라 검사하지 않는다. `.reap/life/loops/<loop-id>-<slug>.md`에 놓고 `sequence/loop.md`에 행을 붙인다. 세션에 바인딩하지 않는다 — loop는 여럿이 나란히 열린다.

`--slug`를 주지 않으면 제목에서 만들어낸다. 제목이 없는 `plan-source`는 `--root`의 디렉토리 이름에서 만든다. slug는 이름표일 뿐이므로 나중에 디렉토리를 손으로 바꿔도 참조는 깨지지 않는다.

`make`가 하는 일은 네 가지뿐이다: 레지스트리에서 **id를 발급**하고, **템플릿을 복사**하고, 기계적 사실(생성 시각, 시작 커밋, 소속, 유형)을 **frontmatter에 찍고**, 올바른 경로에 **놓는다**. `make generation`은 추가로 `.session`에 바인딩을 쓴다.

본문은 비어 있다. 어떤 항목을 쓸지는 아래 **기록 어휘**가 안내하고 agent가 정한다.

### mark

```bash
reap mark generation <gen-id> --closed      # closedAt, endCommit(현재 HEAD), status
reap mark generation <gen-id> --aborted     # 기록 삭제
reap mark generation <gen-id> --archived    # archive/generations/로 이동 (status는 건드리지 않는다)
reap mark loop <loop-id> --closed [--milestone <ms-id>]...  # closedAt, milestones, status. 닫힌 loop가 10개를 넘으면 오래된 것부터 archive/loops/로
reap mark loop <loop-id> --aborted     # 기록 삭제
reap mark milestone <ms-id> --focus
reap mark milestone <ms-id> --closed        # closedAt, status; archive/milestones/로 이동
reap mark backlog <bk-id> --consumed [--by <gen-id>]  # status와 consumedBy만. 위치는 그대로
reap mark backlog <bk-id> --archived        # archive/backlog/로 이동 (status는 건드리지 않는다)
reap mark idea <idea-id> --archived         # archive/idea/<kind>/로 이동 (status는 건드리지 않는다)
```

`mark`는 **검사하지 않는다.** `--closed`는 커밋이 있는지 보지 않고 현재 HEAD를 찍을 뿐이다. 확인은 skill이 하고, 어긋난 것은 `doctor`가 사후에 잡는다.

frontmatter를 agent가 직접 고치지 않는 이유는 하나다. **id, 시각, 커밋 해시는 확률에 의존해서는 안 된다.** 한 번 틀리면 조용히 틀린 채로 남고, 그 위에 쌓인 참조까지 함께 무너진다.

### 템플릿

템플릿은 바이너리에 번들되고, `.reap/templates/`에 같은 이름의 파일이 있으면 그쪽이 이긴다. 프로젝트가 자기 기록 형식을 갖는 확장점이다.

### index

```bash
reap index                    # update — 기본값
reap index update [--full]    # 인덱스를 HEAD와 맞춘다
reap index status             # 개수, import 해석률, 인덱싱된 커밋
reap index impact <file>...   # 이 파일을 바꾸면 어디까지 닿는가
reap index search <query>     # 정의를 찾는다. file:line과 함께
reap index callers <symbolId> # 누가 이것을 부르는가
reap index callees <symbolId> # 이것이 무엇을 부르는가
```

`symbolId`는 `<파일>::<이름>`이다 — 예: `src/ctx.ts::assemble`. `search`가 그것을 낸다.

**무엇을 언제 쓰는지, 그리고 왜 이 모양인지는 [지식 레이어](05-knowledge.md)의 `코드를 아는 세 층`이 소유한다.** 여기 옮겨 적지 않는다.

**index를 쓰는 자리와 `grep`을 쓰는 자리가 갈린다.** 어디 정의됐나·누가 부르나·이 파일을 바꾸면 어디까지 닿나는 index다. 문자열·주석·설정 파일·문법이 없는 언어, **그리고 아직 커밋 안 한 것**은 `grep`이다. 둘은 보완 관계이고, index가 내는 `file:line`을 그다음에 읽는 것이 보통이다.

### doctor

흐름을 막지 않는 대신 사후에 확정적으로 검사한다. **보고만 하고 고치지 않는다** — 이 파일들은 사람과 agent가 쓴 것이고, 도구가 다시 쓰면 무엇이 사라졌는지 아무도 모른다.

검사 항목:
- frontmatter 모양 — 필수 필드 존재, 값의 형식
- id — 형식, 레지스트리와의 일치, 살아 있는 항목 간 중복
- 끊긴 참조 — `from`, `refs`, `milestone`이 가리키는 대상의 존재
- `status: closed`인데 `startCommit`과 `endCommit`이 같은 generation (커밋 없이 닫힌 것)
- 열린 채 방치된 generation, 두 개 이상의 `focus: true`
- idea — 졸업 조건이 빈 research·files 문서, 출처나 확인 날짜가 없는 문서, 오래 방치된 항목
- `map.md`가 번들 템플릿과 어긋났을 때 — 씨앗이므로 REAP가 레이아웃을 바꿔도 갱신되지 않는다. 고치지는 않는다
- 파일 크기 경고 — genome과 `environment/summary.md`가 안내선을 넘었을 때. **이들은 매 세션 주입되므로** 커지면 다른 지식의 자리를 밀어낸다
- carrier — 형식(`reap:carrier-<hash6>-<slug>`가 아닌 것 — slug가 없거나 해시가 6 hex가 아닌 것), 한 slug에 해시 둘, 한 해시에 slug 둘. **고아**(한 파일에만 있는 id)는 실패가 아니라 참고다 — 표식이 불필요하거나, 그 사실을 아는 나머지가 표식되지 않았거나 둘 중 하나다
- 누적 경고 — `vision/memory/lessons.md`의 항목 수나 크기가 안내선을 넘었을 때. 주입되지는 않지만 자라기만 하는 문서이며, 넘었다는 것은 **졸업시킬 때가 됐다**는 신호다. `milestone.md`도 세대마다 열리므로 같은 안내선을 둔다

**보고는 결함과 참고로 갈린다.** 결함은 확정적으로 틀린 것(끊긴 참조, 커밋 없이 닫힌 generation, focus 둘, 레지스트리에 없는 id, 깨진 상대 링크, carrier 충돌)이고 `doctor`가 실패로 끝난다. 참고는 사람이 볼 것(크기·누적 안내선, `map.md` 씨앗 불일치, 열린 채 바인딩 안 된 generation, 졸업 조건 없는 idea, carrier 고아)이다. 둘을 섞으면 참고가 결함을 묻는다.

**안내선 숫자는 이 리포의 실측에서 나왔다**(`src/doctor.ts`의 `GUIDE` — 2026-08-31, 세대 57 시점의 가장 큰 실물의 두 배 안팎). 넘었다는 것은 커졌다는 것이지 틀렸다는 것이 아니라 참고다.

**`--ref`는 두 번 검사된다** — `make`가 받을 때(그 시점의 실재)와 `doctor`가 사후에(그 뒤 파일이 사라졌는가). 시점이 다르므로 중복이 아니다.

자유 서식 본문은 검사하지 않는다. 고정 제목이 없으므로 검사할 수단이 없고, 억지로 하려면 제목을 다시 고정해야 한다.

## generation


### 기록 형식

```markdown
---
id: gen-0002-exec
slug: token-rotation
type: exec
milestone: ms-004                   # 근거. backlog가 근거면 대신 `backlog: bk-a1b2c3`
title: 세션 토큰 회전 구현
startedAt: 2026-08-22T10:00:00Z
closedAt: 2026-08-22T13:20:00Z
startCommit: 1a2b3c4
endCommit: 9f8e7d6
status: open | closed
---

(본문 — agent가 자유롭게 구성)
```

`type`은 `plan`·`exec`·`fix` 중 하나이고, **`milestone` 필드는 `exec`에만 있다.**

**소유권이 나뉜다.** frontmatter는 `make`와 `mark`가 쓴다. **본문에는 CLI가 아무것도 깔지 않는다.** 빈 제목을 미리 넣으면 그것이 곧 템플릿이 되고, 강제하지 않아도 강제처럼 읽힌다. REAP의 5단계가 그렇게 굳었다.

### 커밋 규칙

**커밋되지 않은 상태로 generation을 닫지 않는다.** 커밋은 여러 개로 나눌 수 있다.

이것은 게이트가 아니다. `complete` skill이 지시하고 agent가 확인한다.

- `git status --porcelain`이 비어 있어야 한다
- `startCommit` 이후 새 커밋이 1개 이상 있어야 한다
- plan generation이고 plan source root가 git 리포라면 그쪽도 같다. git이 아닌 소스에는 적용하지 않는다 — 검증할 수 없는 것을 검증한 척하지 않는다
- plan generation은 리포 또는 등록된 git plan source 중 **최소 한 곳**에서 새 커밋이 있으면 된다

REAP가 git을 감싸는 명령을 두지 않는 이유는 agent가 이미 git을 쓸 수 있기 때문이다. 감싸면 중복이고, 중복은 언젠가 어긋난다. 규칙이 깨진 기록은 `doctor`가 사후에 보고한다.

## milestone


### 형식

```markdown
---
id: ms-004
slug: auth-session             # 이름표. 참조 키가 아니다
title: 인증 세션 관리 개편
from: gen-0006-plan                 # 이것을 낳은 plan generation (없을 수 있음)
refs:
  - ps-a3f8c2:prd/auth.md#세션관리
status: open | closed
focus: true
openedAt: 2026-08-22T09:15:00Z
---

(본문 — agent가 자유롭게 구성)
```

generation 기록과 같은 규칙이다. frontmatter는 `make`와 `mark`가, 본문은 agent가 소유한다.

### frontmatter의 시간은 초 단위 ISO다

`startedAt`·`closedAt`·`openedAt`·`createdAt` — **종류를 가리지 않고 `YYYY-MM-DDTHH:MM:SSZ`다.** 같은 이름의 필드가 파일 종류마다 다른 정밀도를 가지면 읽는 쪽이 매번 "이건 어느 쪽이더라"를 물어야 하고, **두 기록의 순서를 시간으로 비교할 수 없다.**

**예외는 하나, sequence 레지스트리의 `createdAt` 칸이다.** 그것은 frontmatter가 아니라 사람이 읽는 마크다운 표이고, append-only라 형식을 바꾸면 한 표에 두 형식이 섞인다. 날짜만 쓴다.

이 규범이 늦게 선 이유가 기록해둘 만하다. spec이 시간 형식을 한 번도 정하지 않은 채 예시 둘(generation은 타임스탬프, milestone은 날짜)을 보여줬고, **규범을 적은 문장이 없으므로 그 예시가 사실상의 규범이 됐다.** 구현이 그것을 굳혔고, 스탬프하는 주체가 없던 backlog는 사람이 가장 가까운 예시를 베껴 세 번째 갈래가 됐다. **예시는 규범을 대신하지 못한다.**

### milestone.md는 작게 유지한다

`milestone.md`는 이 milestone에서 **가장 먼저 열리는 문서**다. 세대를 여는 agent가 무엇을 할지 정하려고 연다. 그러므로 여기 담는 것은 **안 읽고 일을 시작하면 조용히 잘못되는 것**뿐이다 — 경계, 종료 조건, 범위 밖, 제약, 작업 갈래의 한 줄 목록.

인터페이스·함정·완료 판정 같은 작업 상세는 `tasks/<n>-<slug>.md`로 간다. 그 task를 시작하는 세대만 그 파일을 연다. **한 task의 함정을 모르는 것은 그 task를 할 때 드러나지만, 종료 조건을 모르는 것은 milestone이 끝난 뒤에야 드러난다.**

나누는 이유는 주입량이 아니다 — `ctx`는 둘 다 싣지 않는다. **필요한 것만 열 수 있으려면 파일이 나뉘어 있어야 하기 때문이다.** 한 파일에 다 있으면 종료 조건을 확인하려는 agent가 끝난 task의 함정까지 함께 읽는다.

`tasks/`의 파일은 id를 갖지 않는다. milestone 안에서만 살고 밖에서 인용되지 않으므로 번호를 영구히 점유할 이유가 없다 — 이름은 사람이 읽기 위한 것이고, 순서를 드러내는 접두사(`1-2-`)면 충분하다.

### 생성과 종료

`make milestone`은 plan generation의 산출이 일반적인 경로지만 강제되지 않는다. 급한 수정은 milestone을 직접 만들어 시작할 수 있고, 이때 `refs`는 비어 있어도 된다.

**종료에는 사람의 fitness 피드백이 필요하다.** 이것도 게이트가 아니다 — `mark milestone --closed`는 피드백 존재를 검사하지 않는다. `complete` skill이 사람에게 묻고, 받은 피드백을 milestone 본문에 남긴다. **그다음 `mark`를 호출하기 전에 `cleanup` skill을 먼저 부른다** — `cleanup`이 `life/generations/`에서 참고 가치가 다한 세대를 `archive/generations/`로 내리고 그 목록을 `handoff.md`에 남긴 뒤에야 `mark milestone --closed`를 호출한다. 순서가 반대이면 `handoff.md`가 이미 옮겨진 뒤라 `cleanup`이 남긴 기록을 다음 세션이 못 찾는다. `mark`가 닫은 milestone은 `archive/milestones/<ms-id>-<slug>/`로 옮겨지며 `milestone.md`·`handoff.md`·`tasks/`가 함께 보존된다. **세대는 따라가지 않는다** — 그것은 `cleanup`이 이미 참고 가치를 보고 따로 내린 뒤다.

`focus`는 제한이 아니라 초점이다. 초점이 아닌 열린 milestone에서도 generation을 시작할 수 있다. `.session`에 milestone이 바인딩되어 있으면 그것이 `focus`보다 우선한다 — 병렬 세션이 각자 다른 milestone에서 일할 수 있어야 한다.

### REAP는 milestone 본문을 검사하지 않는다

REAP은 종료 조건과 범위 밖이 채워지지 않은 milestone을 main으로 삼기를 거부했다. REAP는 거부하지 않는다. 고정 제목을 없앤 이상 `## Exit Criteria`를 찾는 검사는 할 수 없고, 억지로 하려면 제목을 다시 고정해야 한다. 검사와 자유 중 자유를 고른다.

대신 `carve-milestone` skill이 경계 없는 milestone은 이름표일 뿐이라고 말하고, 사람은 종료 시 fitness로 그것을 판정한다.

## 기록 어휘


CLI가 본문에 아무것도 깔지 않는 대신, REAP는 **적을 만한 항목과 그 항목이 뜻하는 바**를 어휘로 제공한다. 플러그인의 `skills/shared/references/`에 있으며 여러 skill이 상대 경로로 함께 참조한다.

### generation 기록의 어휘

둘 다 플러그인의 `shared/references/record-vocabulary.md` 한 파일에 산다. **어휘가 둘이라고 파일을 둘로 나누지 않는다** — 세대를 여는 agent가 milestone 어휘까지 함께 읽어도 손해가 없을 만큼 작고, 파일이 나뉘면 어느 것을 링크할지가 skill마다 판단이 된다.

| 항목 | 무엇을 담나 |
|---|---|
| Intent | 왜 이 세대를 여는가, 무엇이 되면 끝인가 |
| Working Plan | 지금 시점의 접근. 바뀌면 덮어쓴다 |
| Tasks | 쪼갠 작업과 진행 상태. 작업이 여러 갈래거나 세션이 나뉠 때 값이 있다 |
| References | 근거로 삼은 것 — plan 인용, 코드 위치, 외부 문서, decision id |
| Open Questions | 아직 정하지 못한 것, 사람에게 물어야 할 것 |
| Dead Ends | 시도했다 접은 접근과 그 이유. 다음 세션이 같은 길을 다시 걷지 않게 한다 |
| Outcome | 무엇을 했고 무엇이 남았는가 |
| Notes | 위 어디에도 들어가지 않는 것 |

### milestone 기록의 어휘

| 항목 | 무엇을 담나 |
|---|---|
| Exit Criteria | 무엇이 되면 이 milestone이 끝나는가. 검증 가능한 사실로 쓴다 — 정량 지표가 아니라 사람이 판정할 수 있는 상태로 |
| Out of Scope | 이번에 하지 않기로 한 것. 경계는 안쪽만으로 정의되지 않는다 |
| Background | 왜 이 milestone이 필요한가. plan의 어느 대목에서 나왔는가 |
| Plan Items | 예상되는 작업 갈래. 계획이지 계약이 아니다. **한 줄씩 적고 상세는 `tasks/`로 보낸다** |
| Constraints | 이 milestone에만 걸리는 제약 |
| Open Questions | 자르는 시점에 정하지 못한 것 |
| Fitness | 종료 시 사람이 준 평가 |

### 어휘를 쓰는 규칙

**이것은 어휘지 템플릿이 아니다.** 쓸 것만 쓰고, 필요하면 여기 없는 항목을 만든다. 순서도 정해져 있지 않다. 빈 항목을 남기는 것은 아무것도 적지 않은 것보다 나쁘다 — 읽는 쪽에 "여기는 확인했는데 없더라"는 잘못된 신호를 준다.

### 기록이 세대가 도는 동안에도 쓸모 있어야 하는 이유

결과만 있는 기록은 닫히기 전까지 비어 있고, 그것은 **세대가 도는 동안 기록이 아무 쓸모가 없다**는 뜻이다. 세션이 중간에 죽거나 다른 세션으로 넘어갈 때 필요한 것이 정확히 "이 세대가 무엇을 하려던 중이었나"인데, `handoff.md`는 milestone 레벨이고 종료 시점에 쓰이므로 그 순간을 메우지 못한다. milestone의 계획 항목은 한 줄이라 접근법을 담지 못한다. Intent와 Working Plan이 어휘에 있는 이유는 계획을 요구하기 위해서가 아니라 이 구멍 때문이다.

REAP의 planning 스테이지가 부활하지 않도록 세 가지를 다르게 둔다.

1. **게이트가 아니다.** 무엇을 적었는지 아무도 검사하지 않는다.
2. **로그가 아니라 현재 상태다.** 계획이 바뀌면 덮어쓴다. 이력을 남기지 않는다 — 남길 가치가 있는 결정은 **그것이 규율할 자리**(spec·`genome/`·`map.md`)로 간다.
3. **강제되는 형태가 없다.** 항목도 순서도 개수도 agent가 정한다.
