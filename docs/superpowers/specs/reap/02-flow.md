# 사용 흐름

## 사용 흐름


앞의 원칙들이 실제 세션에서 어떻게 만나는지를 적는다. 뒤 절들이 각 부품을 정의하고, 이 절은 그 부품들이 움직이는 순서를 정의한다.

### 세 개의 층

REAP에서 일어나는 모든 일은 셋 중 하나에 속한다. **어떤 동작이 어느 층의 것인지 헷갈리면 그 동작은 잘못 설계된 것이다.**

| 층 | 누가 | 무엇을 | 예 |
|---|---|---|---|
| **판단** | skill을 읽는 agent | 무엇을 할지, 언제 할지, 됐는지 | 축을 고른다, 닫을 준비가 됐는지 본다, 무엇을 맥락에 남길지 정한다 |
| **확정** | `reap` CLI | 확률에 맡길 수 없는 사실을 못 박는다 | id 발급, frontmatter 스탬프, 원자적 선점, 파일 조립 |
| **사실** | git, 파일시스템 | 실제로 무슨 일이 있었는가 | 커밋 유무, 작업 트리 상태, 어떤 파일이 있는가 |

agent는 판단하고, CLI에게 확정을 요청하고, 사실은 git에게 직접 묻는다. **CLI가 사실을 감싸지 않는다** — agent가 이미 `git status`를 쓸 수 있으므로 감싸면 중복이고, 중복은 언젠가 어긋난다.

### 한 세션의 흐름

```
(처음 한 번) /reap:init --> reap init, 정본 지식을 세운다 (plan source · summary · genome)
   |                          첫 loop다. .reap/가 없으면 훅이 침묵하므로 사람이 부른다. 묻는 법은 /reap:interview
   v
사람이 세션을 연다
   |
   v
[SessionStart 훅] --> reap ctx --> 맥락이 주입된다
   |                                 genome 본문 · environment/summary.md 본문
   |                                 상태 줄 — 열린 milestone과 세대, 읽을 파일의 경로와 이름
   |                                 그 외에는 싣지 않는다. 무엇을 열지는 agent가 정한다
   v
사람이 무언가를 하자고 한다
   |
   v
새 의도를 만드는 일인가? --> /reap:loop  (plan 축 — 아래 `두 축이 만나는 지점`)
   |
   v
/reap:evolve
   |
   +-- 축을 고른다 ------------------> 애매하면 /reap:interview
   |     새 의도를 실현하나? exec (근거 필수 — milestone 또는 backlog 항목)
   |     이미 있는 의도로 되돌리나? fix
   |
   +-- reap make generation ---------> id 발급, 시작 커밋 기록, 세션 바인딩
   |
   +-- 기록에 의도를 적는다 (agent가 직접)
   |
   v
=== 자율 구간 ===  REAP는 여기에 관여하지 않는다
   |
   |  탐색하고, 계획하고, 짜고, 고치고, 되돌린다. 순서도 횟수도 정해져 있지 않다.
   |  중간에 필요하면:
   |    reap make backlog ...      지금 안 할 것을 적어둔다
   |    reap make idea ...         아직 단단하지 않은 것을 둔다
   |    git commit                  나눠서, 원하는 만큼
   |
   v
/reap:complete
   |
   +-- 커밋 규칙을 확인한다 (agent가 git에게 직접 묻는다)
   |     git status --porcelain 이 비어 있는가
   |     시작 커밋 이후 새 커밋이 있는가
   |     -> 아니면 여기서 멈추고 사람과 정리한다
   |
   +-- 기록을 마무리하고 handoff.md를 갱신한다 (agent가 직접)
   |
   +-- reap mark generation --closed --> 종료 시각과 현재 HEAD를 찍는다
   |
   v
다음 세션이 같은 milestone에서 이어받는다
```

**주입 목록의 규범은 이 절이 소유하지 않는다.** 무엇을 싣고 무엇을 이름만 내는지, 그리고 그 등급을 무엇이 가르는지는 [agent 층](06-agent.md)에 있다. 여기 그린 것은 순서지 목록이 아니다 — 두 곳에 목록을 두면 어긋나고, 실제로 한 번 어긋났다.

### 각 지점에서 무엇이 개입하는가

| 지점 | 판단 | 확정 | 남는 것 |
|---|---|---|---|
| 정본 지식 세우기 (처음 한 번) | `init` + `interview` | `reap init` · `make loop` · `make plan-source` | 씨앗 대신 채워진 `genome/`·`environment/summary.md`·`plan/`, 첫 loop |
| loop 열기 | `loop` | `make loop` | `life/loops/`의 기록, 레지스트리 행 |
| loop 닫기 | `loop` | `mark loop --closed` | plan source에 쓴 것, 낳은 milestone. 닫힌 loop가 10개를 넘으면 오래된 것이 `archive/loops/`로 |
| 세션 시작 | — | `reap ctx` | (없음. 읽기만) |
| 축 고르기 (exec·fix) | `evolve` | — | 기록의 의도 |
| 세대 열기 | `evolve` | `make generation` | 기록 파일, 레지스트리 행, 세션 바인딩 |
| 이월 | agent | `make backlog` | backlog 항목 |
| 미확정 지식 | agent | `make idea` | `idea/` 항목 |
| 세대 닫기 | `complete` | `mark generation --closed` | 커밋, 마무리된 기록, `handoff.md` |
| milestone 자르기 | `carve-milestone` | `make milestone` | milestone 디렉토리 |
| 정리 | `cleanup` | `mark generation --archived` | 참고 가치가 다한 세대가 `archive/generations/`로 이동 |
| milestone 닫기 | `carve-milestone` + **사람** | `mark milestone --closed` | `archive/milestones/`로 이동, fitness 기록 |
| 점검 | — | `doctor` | (없음. 보고만) |

### 사람이 반드시 개입하는 곳

자율이 기본값이지만 넷은 사람의 것이다.

1. **무엇을 할지 정하는 순간** — 세션은 사람의 요청에서 시작한다.
2. **모호할 때의 답** — `interview`가 묻는 것은 코드로 답할 수 없는 것들뿐이다. 코드·문서로 확정 가능한 사실은 agent가 스스로 확정한다.
3. **milestone을 닫을 때의 fitness** — 정량 지표가 없으므로 사람의 자연어 평가가 유일한 적합도 신호다.
4. **`genome/invariants.md`** — 사람만 수정한다.

그 외에는 묻지 않는다. **매 세대 사람이 막아서는 마찰이 자율성과 충돌한다**는 것이 REAP에서 배운 것이고, 그래서 fitness가 generation이 아니라 milestone으로 올라갔다.

### 두 축이 만나는 지점

```
plan source (여러 곳, 리포 밖 가능)  <-- reap make plan-source 로 등록. loop가 쓴다
   ^
   |  쓴다 (conventions/ 에 맞춰)
   |
   +-- loop (plan|design|uiux|idea) --+   life/loops/ 에 산다. 여럿이 나란히 열린다
   +-- loop --------------------------+   근거는 선택: plan source · generation · 앞 loop
   |
   |  산출물이 자리를 찾으면 닫힌다 — milestone을 자르거나(carve-milestone),
   |  plan source에 쓰거나, idea/ 에 남기거나. 닫힌 loop는 life/loops/ 에 남고
   |  닫힌 것이 10개를 넘으면 오래된 것부터 archive/loops/ 로
   v
milestone  ---- reap make milestone ---> from: loop-NNNN, refs: <ps-id>:<경로>
   |
   +-- exec generation --+
   +-- exec generation --+--> 소스코드
                         |
backlog 항목 -- exec generation --+

   fix generation (근거 없음) ------> 소스코드
```

plan 축과 execute 축은 **milestone에서 만난다.** loop는 exec의 경계에 속하지 않고, exec generation은 **반드시 근거를 갖는다.** 이 비대칭이 "기획은 실행 단위에 갇히지 않고, 실행은 경계 없이 떠돌지 않는다"를 만든다.

### plan 축의 단위는 loop다

**"실행 단위에 갇히지 않는다"는 "경계가 없다"가 아니다.** exec 축의 단위는 generation이고 그 경계를 milestone이 준다. **plan 축의 단위는 loop이고, 그 경계는 산출물이다** — 무엇이 자리를 찾으면 끝나는가를 유형이 정한다.

| 유형 | 산출물이 찾는 자리 |
|---|---|
| `plan` | plan source의 기획 문서, 그리고 거기서 잘린 milestone |
| `design` | plan source의 설계 문서, milestone |
| `uiux` | 화면·흐름 문서, milestone |
| `idea` | `idea/research/`, 또는 다른 유형의 loop로 졸업 |

**generation과 다른 사이클이다.** generation은 세션에 바인딩되고 대개 한 세션에 닫히며 하나만 열린다. loop는 **여러 세션에 걸치는 것이 정상**이고 **여럿이 나란히 열리며** 세션에 바인딩되지 않는다 — 사람이 말한 *"복합적인 관점, 다양한 탐색, 사고실험과 취소"*가 loop 하나의 안쪽에서 일어난다. milestone을 아직 못 낳은 loop는 **열린 채 둔다**; 방향 자체가 죽었으면 `--aborted`로 지운다.

**닫힌 loop는 `life/loops/`에 남는다.** 방금 닫힌 loop가 가장 자주 읽히는 loop다 — 그것이 낳은 milestone을 실행하는 세대가 `Dialogue`와 `Dead Ends`를 본다. 처음에는 닫히면 바로 archive로 보내기로 했는데 첫 loop를 닫자마자 찾기 어려워졌다(`loop-0001`). 그래서 **닫힌 loop가 10개를 넘으면 오래된 것부터** `archive/loops/`로 내린다. 판단이 아니라 개수이므로 `mark loop --closed`가 닫는 김에 한다 — generation의 `cleanup`과 다른 점이다. 열린 loop는 개수와 무관하게 옮기지 않는다.

**같은 자리를 세 번 잘못 채웠다.** `gen-0040`은 `track`(milestone을 plan 축에 복사한 *묶음*)으로, `ms-005`는 `author-plan`(generation 안의 skill)으로, `gen-0045`는 `reap-plan`(플러그인 경계 밖으로 내보냄)으로. 셋 다 같은 오독이다 — 빈칸은 *"plan을 누가·어떻게 묶는가"*가 아니라 **"plan을 만드는 일이 어떤 사이클로 도는가"**였고, 답은 generation과 다른 사이클을 하나 더 두는 것이었다. **loop는 묶음이 아니다** — track이 틀린 이유가 여기 걸리지 않는다. loop는 generation과 같은 급의 기록 단위이고, 묶는 것이 아니라 도는 것이다.

**loop는 근거를 요구하지 않는다.** `from:`에 plan source 경로·generation(계획 부족으로 막힌 exec)·앞 loop를 적을 수 있고 없어도 된다. exec의 근거가 *권한*인 것과 달리 loop의 근거는 *출처*라 거부 조건이 아니다.

**loop 기록은 논의의 흐름을 담는다.** `Dialogue` — 무엇이 갈렸고 선택지가 무엇이었고 사람이 무엇을 골랐는가. 전사가 아니라 갈린 지점이다. `interview`가 *"추천이 채택됐는지 다른 답을 냈는지를 기록에 남긴다"*고 한 것이 가는 자리가 이것이다.

### exec의 근거는 둘이다 — milestone 또는 backlog 항목

**규칙이 요구하는 것은 milestone이 아니라 경계다.** 처음에는 경계를 주는 것이 milestone뿐이라고 전제했는데 그것이 좁았다. **backlog 항목도 경계다** — 하나의 항목이 하나의 일을 정의하고, 그것을 소비하면 끝난다.

가르는 기준은 크기가 아니라 **경계가 이미 적혀 있는가**다.

| 이 일은 | 근거 |
|---|---|
| 아직 아무 데도 안 적혀 있다. 무엇이 끝인지를 지금 정해야 한다 | **milestone** — `carve-milestone`이 경계·종료 조건·범위 밖을 정한다 |
| backlog 항목에 이미 적혀 있다. 그 항목을 소비하면 끝난다 | **backlog** — `make generation --backlog <bk-id>` |
| 여러 갈래로 나뉘고 세션이 여러 번 걸린다 | **milestone.** 항목 하나로는 갈래를 담지 못한다 |
| milestone의 한 갈래인데, 그 갈래가 할 일이 backlog 항목에 적혀 있다 | **둘 다** — `--milestone`과 `--backlog`를 함께 준다 |

**근거 둘은 배타가 아니다.** milestone이 갈래를 주고 backlog 항목이 그 갈래 안의 구체적 일을 준다. 실제로 그런 세대가 먼저 있었다 — `ms-003`의 한 task가 `bk-c3321b`(frontmatter 시간 형식)를 소비했는데, 그 항목이 스스로 *"형식 통일은 `make backlog`와 같이 와야 한다"*고 적어 그 task를 규정하고 있었다. **둘 중 하나만 적으면 나머지 연결이 산문에만 남는다.**

**다만 backlog 항목을 소비하려고 milestone을 만들지는 않는다.** 그러면 경계가 두 곳에 적히고, 두 곳에 있으면 어긋난다.

**이미 `consumed`인 항목은 근거가 되지 못한다.** 끝났다고 표시된 것 위에 다시 일하면 다음 사람이 왜 다시 했는지 모른다. 소비가 불완전했다면 **무엇이 남았는지를 담은 새 항목**을 만든다. `make generation --backlog`가 이것을 검사한다 — 흐름을 막는 게이트가 아니라 가리키는 것이 근거가 못 되는 경우다.

generation은 `exec`·`fix` 둘뿐이다. 새 의도를 만드는 일은 generation이 아니라 loop다(위 `plan 축의 단위는 loop다`).

### fix는 예외가 아니다

fix generation은 소스코드를 진화시키면서 근거를 갖지 않는다. 바로 위의 "실행은 경계 없이 떠돌지 않는다"를 어기는 것처럼 보이지만 그렇지 않다.

**milestone은 새 의도에 경계를 주는 장치다.** fix는 새 의도를 만들지 않는다 — 이미 확정된 의도로 되돌릴 뿐이므로, 그 일의 경계는 되돌릴 대상 자체다. 떠도는 것이 아니라 되돌아가는 것이고, **되돌아갈 곳이 없으면 그것은 fix가 아니다.**

그래서 fix 기록은 **무엇의 의도로 되돌리는지를 `References`에 적는다.** frontmatter 필드로 못 박지 않는 이유는 되돌릴 대상이 항상 id를 갖지 않기 때문이다 — 깨진 빌드나 낡은 의존성은 가리킬 generation이 없다. 필수 필드로 만들면 못 채울 때 거짓 id가 들어가고, 선택 필드로 만들면 `doctor`가 검사할 수 없다. **검증할 수 없는 것을 검증한 척하지 않는다**(원칙 6)가 산문 쪽을 가리킨다.

**리팩터링은 fix가 아니다.** 동작이 이미 의도대로 도는데 구조만 바꾸는 것은 되돌릴 것이 없다. 그것은 새 의도이고, exec이고, 근거가 필요하다.

경계를 지키는 것은 `evolve`이고, 새는 곳은 하나다 — **작다는 이유로 새 기능을 fix로 짓는 것.** 크기는 기준이 아니다.

### 무엇이 강제되지 않는가

REAP과의 차이는 이 목록이 전부다. 아래 어느 것도 도구가 막지 않는다.

- 세대 안에서 무엇을 어떤 순서로 하는지 — **단계가 없다**
- 기록에 무엇을 적는지 — 어휘는 제공하되 항목도 순서도 개수도 정하지 않는다
- milestone 본문에 경계를 적었는지 — 고정 제목을 없앤 이상 검사할 수단이 없고, 억지로 하면 제목을 다시 고정해야 한다
- 커밋 없이 닫는 것 — `mark`는 검사하지 않는다. `doctor`가 사후에 보고할 뿐이다
- 세대를 열지 않고 일하는 것 — 기록이 안 남을 뿐이다

**막지 않는 대신 `doctor`가 사후에 본다.** 이것이 REAP의 근본 거래다. 흐름을 막는 게이트는 하나도 없고, 대신 확정적으로 검사할 수 있는 것을 나중에 전부 검사한다.

거래가 성립하는지는 측정된다. `doctor`가 "커밋 없이 닫힌 generation"을 얼마나 자주 보고하느냐가 성적표이고, 자주 보고된다면 그 지점만 게이트로 되돌린다.

### 병렬 세션 (orchestrate 완성 이후)

```
사람이 worktree 세 개에 세션을 띄운다
  claude -n reap-authms-builder  -w wt-builder
  claude -n reap-authms-reviewer -w wt-reviewer

각 세션: SessionStart --> reap ctx  (워크트리마다 자기 .session)
  |
  +-- reap orch claim src/auth/**     충돌할 자원을 선점
  |
  +-- SendMessage (Claude Code 네이티브)  서로에게 알린다
  |
  +-- reap orch barrier integrate --expect 2   합류 지점
  |
  +-- reap orch release src/auth/**
```

세션마다 `.reap/`가 별개 사본이므로 공유 상태는 `~/.reap/orch/<workspace-id>/`에 산다. 메시징은 REAP가 만들지 않고 클라이언트의 것을 그대로 쓴다 — 만들면 두 개의 메시지함이 생기고, 둘 중 하나는 아무도 안 읽는다.
