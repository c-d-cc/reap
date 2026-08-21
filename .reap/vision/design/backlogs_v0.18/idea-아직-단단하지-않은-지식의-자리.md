---
type: task
status: pending
priority: medium
createdAt: 2026-08-18T23:36:41.598Z
---

# idea — 아직 단단하지 않은 지식의 자리

## Problem

REAP 의 지식 저장소는 **전부 단단한 지식을 위해 설계돼 있다.**

| 위치 | 성격 | 요구 |
|---|---|---|
| `genome/` | 처방적 — "이렇게 해야 한다" | 확정된 원칙. normal 에서 immutable |
| `environment/` | 서술적 — "현재 이렇다" | 사실. 낡은 서술은 삭제 대상 |
| `vision/goals.md` | 방향 | 달성 여부를 판정할 목표 |
| `vision/design/` | 설계 문서 | **구체적 scope** 를 가진 독립 주제 |
| `vision/memory/` | 맥락 3-tier | 각 tier 가 "지금 필요한가 / 살아있는 트랙인가 / 행동을 바꾸는 교훈인가"를 통과해야 함 |

그런데 프로젝트를 진행하다 보면 **아직 단단하지 않은 지식**이 생긴다. 미완결이고, 결론이 없고, 언젠가 쓸지도 모르는 것들. 대표적인 것이 **research** 다 — 조사해서 만든 문서는 지금 당장 무엇을 바꾸지 않지만, 나중에 그 주제를 다시 열 때 처음부터 다시 찾지 않게 해준다. 성격상 **엿보기 문서**이고 모호하다.

지금 REAP 에는 이것을 둘 자리가 없다. 그래서 셋 중 하나가 일어난다:

1. **memory 에 밀어넣는다** — longterm 은 "혹시 쓸모 있을지도 같은 추측으로 쌓지 마라"라고 명시적으로 금지한다. 규칙을 어기거나, 규칙을 지키느라 버리거나 둘 중 하나다
2. **design 으로 승격시킨다** — 아직 설계가 아닌 것을 설계 문서로 만들면, 다음 세대가 그것을 결정된 것으로 읽는다. **모호한 것을 단단한 자리에 두면 단단해 보인다**
3. **그냥 버린다** — 조사에 든 비용이 사라지고, 다음에 같은 질문이 오면 처음부터 다시 한다

실제로 본 repo 에서 관측된다. SCIP backlog 는 조사 결과를 backlog 본문에 통째로 담고 있다 — 그것이 유일하게 허용된 자리였기 때문이다. backlog 는 "다음에 할 일"인데 조사 자료를 지고 있으니, 그 backlog 가 소비되면 조사도 함께 consumed 로 사라진다.

**즉 지금 구조는 "확정하거나 버리거나"만 허용한다.** 확정되기 전 단계가 없다.

## Solution

`.reap/idea/` 를 신설한다. **아직 단단하지 않은 지식의 자리**이며, 인간과 agent 가 **모두** 자유롭게 쓴다.

### S1. 구조 — 3개 하위 디렉토리 (확정)

```
.reap/idea/
├── research/    조사 결과 — 지금 결론은 없지만 다시 찾지 않게 해주는 것
├── freememo/    자유 메모 — 형식 없음. 떠오른 것, 미완결 관찰, 판단 보류
└── files/       참고자료 — 외부에서 가져온 것 (발췌, 링크 모음, 스펙 조각)
```

| 하위 | 무엇이 오는가 | 요구 형식 | 졸업하면 어디로 |
|---|---|---|---|
| `research/` | 조사·비교·선행사례 검토 | **출처 + 확인 날짜 + 1차/2차 구분 필수** | `vision/design/` (결론이 서면) · backlog (할 일이 되면) |
| `freememo/` | 형식 없는 메모, "이상한데 아직 모르겠다" | 없음. 진입 장벽 최소 | 어디로든, 또는 **삭제** |
| `files/` | 외부 자료 원문·발췌 | 출처 + 가져온 날짜 | `environment/resources/` (실제로 채택되면) |

`freememo/` 만 형식 요구가 없다. **아무 요구도 없는 자리가 하나는 있어야** 사람이 쓴다 — 형식을 요구하면 안 쓰고, 안 쓰면 이 기능은 없는 것과 같다.

### S2. `idea/files/` 와 `environment/resources/` 의 경계

`environment/resources/` 가 이미 "External reference documents — API docs, SDK specs (on-demand)" 로 존재한다. **이름을 `files` 로 정해 이름 충돌은 없앴지만, 둘 다 외부 자료를 담는다는 사실은 그대로**이므로 어디에 넣을지의 기준은 여전히 필요하다.

**판단 기준: 채택 여부.**

| | `environment/resources/` | `idea/files/` |
|---|---|---|
| 성격 | **지금 이 프로젝트가 쓰고 있는** 것의 스펙 | 아직 쓰지 않는, **쓸지도 모르는** 것의 자료 |
| 지식 층위 | 서술적 사실 (environment) | 미확정 (idea) |
| 낡으면 | **갱신하거나 삭제** (사실이 아니게 되므로) | 그대로 둬도 됨 (원래 참고용) |

채택되는 순간 `idea/files/` → `environment/resources/` 로 **이동**한다. 이것이 이 하위 디렉토리의 졸업 경로다.

이 기준을 reap-guide 와 genome 에 **한 문장으로 명시**한다. 명시하지 않으면 판단이 매번 흔들리고 자료가 양쪽에 흩어진다.

### S3. 다른 저장소와의 경계 — 이 작업의 실질적 난이도

새 폴더를 만드는 것은 쉽고, **기존 자리들과의 경계를 다시 그리는 것이 어렵다.**

- **`vision/design/` 과의 경계** — genome 은 "하나의 독립된 주제로 문서화할 만한가 → Yes 면 Design"이라고만 말한다. 이 기준으로는 research 문서도 Design 이 된다. **판단 기준을 "주제성"에서 "확정성"으로 바꿔야 한다**: 결론이 있으면 design, 없으면 `idea/research/`
- **`memory/` 와의 경계** — memory decision tree 4번("완료됐고 특별한 교훈도 없으면 기록하지 않는다")이 지금은 곧 삭제를 뜻한다. idea 가 생기면 **그 4번에 세 번째 출구가 생긴다.** decision tree 를 개정해야 한다
- **`freememo/` 가 memory 의 우회로가 되어선 안 된다** — "핸드오프인데 shortterm 이 좁으니 freememo 에" 같은 사용은 memory pruning 정책을 무력화한다. 다음 세션에 **필요한** 것은 shortterm, 필요할지 **모르는** 것이 freememo 다
- **`environment/resources/` 와의 경계** — S2

**중요**: 이 경계 규칙은 genome(application/evolution) + `reap-guide.md` + 5개 로케일 문서가 함께 아는 사실이다 → **`memory-tier-classification` carrier 와 같은 계열**. 표식 대상인지 확인할 것.

### S4. 쓰레기통이 되지 않게 하는 장치

idea 의 실패 모드는 명확하다: **아무 제약이 없으면 무한히 쌓이고, 쌓이면 아무도 안 읽고, 안 읽으면 없는 것과 같다.** memory 가 비대화를 실패 신호로 삼는 것과 같은 문제이며, idea 는 진입 장벽이 더 낮으므로 더 빨리 온다.

- **각 문서가 자기 졸업 조건을 갖는다** (`freememo/` 제외) — frontmatter 또는 첫 절에 두 줄:
  - `왜 아직 단단하지 않은가` — 무엇이 미정인지
  - `무엇이 정해지면 졸업하는가` — design / genome / environment / backlog 중 어디로
  "언젠가 쓸지도"는 **영원히 남을 핑계**가 된다. 나가는 문을 문서가 스스로 갖고 있어야 한다 (milestone 의 exit criteria 와 같은 사고)
- **`research/` 와 `files/` 에는 출처와 확인 날짜를 남긴다** — 조사 자료는 시간이 지나면 낡는다. 날짜 없는 조사는 재확인 비용이 처음 조사와 같아진다. 1차 소스인지 2차 정보인지도 표시 (SCIP backlog 가 "벤더 수치는 인용하지 말 것"이라고 적은 것과 같은 규율)
- **`freememo/` 는 예외** — 형식을 요구하지 않는 대신 **가장 먼저 정리 대상**이 된다
- **주기적 정리** — reflect phase 의 memory pruning 처럼 강제할 것인가, 느슨하게 둘 것인가. **강제하면 부담이고, 안 하면 쌓인다.** 결정 필요 (Open Decisions)

### S5. 로딩 모델 — 자동 로드하지 않는다

genome / environment summary / vision goals / memory 3종은 static knowledge 로 **매 세션 자동 로드**된다 (claude-code 는 `@` import, opencode 는 `instructions`).

**idea 는 여기에 넣지 않는다.** 미완결 자료가 매 세션 context 를 차지하면, 확정된 지식의 자리를 밀어낸다. `environment/domain/`, `environment/resources/`, `source-map.md` 가 이미 on-demand 인 것과 같은 취급이다.

그런데 **자동 로드하지 않으면 agent 가 존재를 모른다.** 이 갭을 메울 방법을 정해야 한다:

- (a) **목록만 노출** — 제목 한 줄씩. 본문은 agent 가 필요할 때 읽는다. 비용이 작고 발견 가능성이 생긴다. **유력**
- (b) `reap idea list` CLI — agent 가 알아서 부를 이유가 없으면 무용
- (c) 안내만 — reap-guide 에 "필요하면 `.reap/idea/` 를 뒤져라". 가장 싸지만 실효가 가장 낮다

(a)를 택한다면 **목록이 static 인가 dynamic 인가**를 판정해야 한다. 파일 목록은 generation state 에 의존하지 않으므로 **static 자격**이며, 그렇다면 `@` import 로는 표현할 수 없다(디렉토리 전체를 import 할 수 없음) — index 파일을 두고 그것을 import 하는 형태가 된다. **index 를 누가 갱신하는가**가 곧바로 문제가 된다. 수기 갱신은 반드시 어긋난다.

### S6. 저장소 취급

- **git 커밋 대상인가** — agent 와 다른 사람이 공유하려면 커밋해야 한다. 반면 `freememo/` 는 개인 낙서 성격이라 제외하고 싶을 수 있다. **하위별로 다르게 취급할 것인지** 결정 필요
- **lineage 압축 대상이 아니다** — idea 는 세대에 속하지 않는다. archive 가 건드리지 않도록 확인
- **`reap clean` 의 대상인가** — `--lineage/--life/--backlog/--hooks` 옆에 `--idea` 를 둘 것인가

### S7. 세션 임시 디렉토리와의 구분

Claude Code 세션에는 임시 파일용 scratchpad 디렉토리가 따로 있다. `idea` 라는 이름을 쓰기로 하면서 이름 충돌은 사라졌지만, **성격 구분은 문서에 남겨야 한다**:

| | 세션 임시 디렉토리 | `.reap/idea/` |
|---|---|---|
| 수명 | 세션 | 프로젝트 |
| 목적 | 중간 산출물, 임시 스크립트 | 미완결 **지식** |
| 커밋 | 안 함 | S6 |

## Files to Change

**구조**
- `src/core/paths.ts` — `idea` + 3개 하위 경로 추가 (`ReapPaths` 인터페이스)
- `src/core/integrity.ts` — 디렉토리 존재 검증. **빈 상태가 정상임을 보장** (memory 가 빈 것이 정상인 것과 같음)
- `src/cli/commands/init/common.ts` — 신규 프로젝트에 디렉토리 생성 (+ 각 하위의 용도 안내 파일 여부)
- `src/cli/commands/update.ts` — **기존 프로젝트에 디렉토리 보충**. 이것이 없으면 기존 사용자에게 도달하지 않는다
- `src/templates/migration/vX.Y.Z.md` — 경계 재정의를 기존 프로젝트에 전달. **템플릿만 고치면 신규 프로젝트에만 반영된다** (gen-072 교훈)

**로딩**
- `src/templates/claude-md-section.md` — S5-(a) 채택 시 index import 추가
- `src/adapters/opencode/install.ts` — `REAP_INSTRUCTIONS` 배열 (현재 9개) 동기화
- `src/core/prompt.ts` — `buildBasePrompt` 에 idea 안내 (on-demand 자산 안내 패턴)
- `src/cli/commands/load-context.ts` + `src/core/dump-state-sync.ts` — dynamic 으로 판정될 경우에만. **양쪽 byte-identical 규약 준수**

**CLI**
- `src/cli/commands/make/` — `reap make idea --kind <research|freememo|file> --title` (졸업 조건 필드를 템플릿으로 강제 가능. backlog/hook 과 같은 패턴)
- `src/cli/index.ts` — `reap idea list` (S5-(b) 채택 시)
- `src/cli/commands/clean.ts` — `--idea` (S6)

**문서·genome**
- `src/templates/reap-guide.md` ↔ `~/.reap/reap-guide.md` — `.reap/` 구조도 + idea 절 + **memory decision tree 개정** + `environment/resources/` 와의 경계(S2)
- `src/templates/evolution.md` ↔ `.reap/genome/evolution.md` — Vision 활용 원칙에 idea 경계 추가, memory decision tree 4번 개정
- `.reap/genome/application.md` — 지식 계층 서술 갱신
- `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` — **5개 로케일 전부**
- carrier 표식 검토 — `bash scripts/list-carriers.sh` 로 `memory-tier-classification` 의 현재 carrier 를 확인하고, 경계 규칙이 그 셋에 포함되는지 판단

**테스트**
- scenario — `reap init` 후 3개 하위 디렉토리(`research/` `freememo/` `files/`) 존재, `reap update` 로 기존 프로젝트에 보충, 빈 상태에서 `fix --check` 경고 0

## Verification

1. **신규 프로젝트** — `reap init` 후 `.reap/idea/{research,freememo,files}/` 존재, **빈 상태에서 `fix --check` 경고 0**
2. **기존 프로젝트** — `reap update` 후 디렉토리 보충됨. 이것이 실패하면 기능이 기존 사용자에게 도달하지 않는다
3. **자동 로드 비용** — idea 에 파일이 여러 개 있어도 세션 context 증가가 **목록 수준**에 머무는가. 본문이 통째로 로드되면 S5 설계 실패
4. **발견 가능성** — agent 가 "이 주제에 대해 전에 조사한 게 있나?"에 답할 수 있는가. 실제로 파일을 하나 두고 새 세션에서 확인
5. **index 를 두는 경우** — 갱신 주체가 정해졌고 어긋나지 않는가. **수기 갱신이면 반드시 어긋난다** (REAP 가 carrier 목록에서 이미 겪음)
6. **`files` 경계가 실제로 판정 가능한가** — 임의의 외부 자료 3건을 `idea/files/` 와 `environment/resources/` 중 하나로 분류해본다. 판정이 갈리면 S2 기준이 모호한 것이다
7. **경계 규칙 전반이 적용 가능한가** — 기존 `vision/design/`, `memory/` 항목 중 idea 로 옮겨야 할 것이 있는지 실제로 판정
8. **자기 dog-fooding** — 본 기능 구현 세대에서 나온 조사 자료를 `idea/research/` 에 실제로 넣어본다 (gen-066 self-dogfooding timing 패턴)
9. `npm run typecheck` + unit/e2e/scenario 회귀 없음

## Open Decisions

- [ ] **`idea/files/` 판단 기준의 최종 문구** — "채택 여부"(S2)를 reap-guide·genome 에 어떤 한 문장으로 적을 것인가. 문구가 모호하면 자료가 두 자리로 흩어진다
- [ ] **git 커밋 대상** — 전체 커밋 vs `freememo/` 만 제외 (S6)
- [ ] **로딩 모델** — 목록 노출(a) / CLI(b) / 안내만(c) 중 무엇인가 (S5). (a) 라면 index 갱신 주체
- [ ] **졸업 조건을 강제할 것인가** — `reap make idea` 템플릿에서 빈칸이면 생성 거부할 것인가, 권고만 할 것인가 (`freememo/` 는 제외)
- [ ] **정리를 reflect 에서 강제할 것인가** — memory pruning 처럼 의무화 vs 느슨하게
- [ ] **`fix --check` 크기 warning 대상인가** — 대상이면 기준이 파일 수인가 총량인가
- [ ] **`freememo` 표기** — 한 단어 유지 vs `free-memo` (기존 파일명 규약은 kebab-case)

## Related

- `milestone-goal-과-generation-사이의-계획-단위.md` — **둘 다 지식 계층의 경계를 다시 그린다.** milestone 은 goal↔generation 사이, idea 는 확정↔미확정 사이. 같은 세대에서 하면 경계 재정의가 겹쳐 혼란스러우므로 **순서를 정할 것**. 다만 두 작업이 함께 건드리는 문서(genome, reap-guide, 5 로케일)가 같으므로 **연속 세대로 붙이는 것이 문서 작업 중복을 줄인다**
- `interview-skill-신설-...md` — interview 산출물 중 결론이 안 난 것의 자연스러운 착지점이 `idea/` 다. interview 의 "미해결 모호성을 버리지 않는다"가 실현되려면 둘 자리가 필요하다
