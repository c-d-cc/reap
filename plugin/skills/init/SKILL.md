---
name: init
description: Use once per project, at the very start, to set up the canonical knowledge REAP manages - in a new folder, in an existing codebase, or where .reap/ was created but left as seeds. Runs reap init, explores (brownfield), registers the plan source, fills environment/summary.md and genome/application.md·evolution.md, then hands the first milestone to carve-milestone. Owns the questionnaire; asking itself is interview's. Trigger on "reap 시작", "init", "REAP 셋업", "정본 지식 세우기", or when .reap/ is missing or its genome is still seed text.
---

# init — 정본 지식을 세운다

`reap init`(CLI)은 디렉토리와 씨앗을 놓을 뿐이고 씨앗은 **질문 문장**이다. `ctx`가 `genome/`을 매 세션 통째로 주입하므로 안 채우면 모든 세션이 빈 프롬프트를 받는다 — 그리고 자리를 만들어두면 나중에 채워진다는 가정은 이 리포에서 세 번 틀렸다. **첫날 채운다.** 규범은 `06-agent.md`의 `init` 절이 갖고, 여기는 절차다.

**이 skill은 상태 줄이 안내하지 못하는 유일한 skill이다.** `.reap/`가 없으면 훅이 침묵한다. 사람이 부른다.

## 이 skill이 갖는 것과 안 갖는 것

- **갖는 것** — 무엇을 어느 순서로 채우는가, 코드에서 답이 나오는 것과 사람에게 가야 하는 것의 구분, 답을 어느 파일 어느 자리에 쓰는가
- **안 갖는 것** — 묻는 법. 한 번에 하나·선택지·추천 같은 문장은 [interview](../interview/SKILL.md)의 것이다. **여기에 그런 문장을 적고 싶어지면 경계가 틀린 것이다**

## 0. 진입 조건을 가른다

```bash
ls .reap 2>/dev/null && reap init --check
```

| 상태 | 이 skill이 하는 일 |
|---|---|
| `.reap/` 없음, 코드 없음 — **새 폴더** | `reap init` 뒤 사람에게 묻는 것이 거의 전부 |
| `.reap/` 없음, 코드 있음 — **기존 코드베이스** | `reap init` 뒤 탐색(2)으로 초안을 쓰고 확인형으로 받는다 |
| `.reap/` 있음, `--check`가 씨앗을 보고 — **씨앗인 채 남음** | 보고된 파일만 채운다. 사람이 한 글자라도 쓴 파일은 건드리지 않는다 |
| `.reap/` 있음, 씨앗 없음 | 이 skill의 일이 아니다. 멈춘다 |

## 1. 첫 loop를 연다

```bash
reap init                                   # 없을 때만
reap make loop --type plan --title "정본 지식을 세운다" --slug init
```

**`init`은 첫 loop다.** 정본 지식을 세우다 첫 milestone을 자르면 닫힌다. 자를 것이 아직 없으면 열린 채 남고 그것이 정상이다. 중단되면 다음 세션이 이 loop의 `Question`·`Dialogue`를 읽고 잇는다 — [loop](../loop/SKILL.md).

## 2. 탐색한다 (기존 코드베이스일 때)

**소스 파일은 읽지 않는다.** 코드를 읽어 아는 일은 코드 인덱스의 것이다. 읽는 것은 여섯이다.

| 읽는 것 | 무엇을 채우나 |
|---|---|
| 매니페스트·락파일 (`package.json` · `pyproject.toml` · `go.mod` · `Cargo.toml` …) | 스택, 의존 |
| 빌드·테스트 진입점 (`Makefile` · `scripts` · CI 설정) | 빌드와 테스트 방법 |
| `README` | 무엇을 만드는가 |
| 디렉토리 트리 1~2단계 | 소스 구조 |
| `git log --oneline -50` | 커밋 관례, 활발한 영역 |
| **기존 AI 지침 파일** (`CLAUDE.md` · `AGENTS.md` · `.cursorrules` · `.github/copilot-instructions.md` …) | `evolution.md`의 유일한 직접 재료 |

**확인할 수 없는 것은 쓰지 않는다.** *"TDD를 한다"*고 쓰려면 테스트가 실재하고 돌아간다는 근거가 있어야 한다. 근거가 없으면 질문 목록으로 보낸다.

**기존 AI 지침 파일은 읽되 고치지 않는다.** `genome/`은 REAP 훅이, `CLAUDE.md`는 클라이언트가 각각 주입하므로 겹치면 같은 것이 두 번 실린다. **겹친다는 사실을 사람에게 보고하고** 옮길지는 사람이 정한다 — 남의 파일을 조용히 정리하면 어느 것이 정본인지가 사라진다.

탐색의 산출은 둘이다 — **초안**(근거가 있어 확정한 것)과 **질문 목록**(사람에게 가야 하는 것). **목록을 다 확정한 뒤에 묻는다.** `interview`가 남은 개수를 보여주려면 개수가 먼저 있어야 한다. 새 폴더에서는 초안이 거의 비고 목록이 거의 전부다 — 같은 절차의 양 끝이다.

## 3. 질문지 — 순서대로

**정본이 어디 있는지부터 정한다.** 그래서 plan source가 genome보다 먼저다 — `application.md`는 plan source에 있는 규범을 옮겨 적지 않으므로, plan source가 있는지 모르면 무엇을 쓸지가 안 정해진다.

### 3.1 plan source

| 물음 | 코드가 답하나 | 쓰는 자리 |
|---|---|---|
| 기획·설계 문서가 있는가, 어디에 | 후보는 탐색이 찾는다(`docs/` · `spec/` · `prd/` · `adr/`). **어느 것이 정본인지**는 사람 | `reap make plan-source --root <path> --role "<역할>"` |
| 그 소스를 어디부터 읽는가, 무엇이 authoritative인가 | 일부 — `README`나 색인이 있으면 | `plan/conventions/<ps-id>-<slug>.md` |

없으면 등록하지 않는다. **`application.md`가 기획을 담기 시작하면 그것이 plan source가 필요하다는 신호다** — 씨앗에 적혀 있다.

### 3.2 `environment/summary.md`

| 물음 | 코드가 답하나 |
|---|---|
| 스택·언어·런타임 버전 | 예 |
| 소스 구조 — 어디에 무엇이 | 예 (트리 2단) |
| 빌드·테스트·실행 명령 | 대개 예. 없으면 사람 |
| 다음 세션이 아무것도 모른 채 어디서부터 손대야 하는가 | 사람 |

### 3.3 `genome/application.md`

| 물음 | 코드가 답하나 |
|---|---|
| 이 프로젝트가 무엇인가 — 한 문단 | `README`가 있으면 초안. 확인은 사람 |
| 만드는 것이 몇 개인가 (바이너리·서비스·라이브러리…) | 대개 예 |
| 작업 규약 — 테스트 규칙, 언어, 커밋 메시지 | 흔적이 있으면 확인형. 없으면 사람 |
| 규범이 plan source에 있다면 **여기 옮겨 적지 않는다** | — |

### 3.4 `genome/evolution.md` — 마지막

앞의 셋을 채우는 동안 이 프로젝트를 이미 겪은 뒤에 쓴다.

| 물음 | 코드가 답하나 |
|---|---|
| 기존 AI 지침 파일이 있는가 — 그 내용 중 **행동 규칙**인 것 | 예. 옮길지는 사람 |
| 무엇을 사람에게 묻고 무엇을 스스로 정하는가 | 사람 |
| 반복하면 안 되는 실수가 이미 알려져 있는가 | 사람 |

### 건드리지 않는 것 둘 — 이유가 다르다

- **`genome/invariants.md`** — 사람만 수정한다. 영구 규칙. 후보를 제시하지도 않는다
- **`vision/memory/lessons.md`** — 겪은 것이 없다. 이 시점의 사실이고, 첫 milestone이 닫힐 때부터 쌓인다

## 4. 묻는다

질문 목록을 들고 [interview](../interview/SKILL.md)를 부른다. 답은 3의 자리에 쓰고, **갈린 지점은 이 loop의 `Dialogue`에 남긴다** — 어느 답이 사람의 것이고 어느 것이 추천 채택인지.

## 5. 첫 milestone을 판단한다

정본 지식이 섰으면 **지금 할 일이 있는가**를 본다. 있으면 [carve-milestone](../carve-milestone/SKILL.md)으로 자른다 — 이 loop가 `--from`이 된다. 자르면 loop를 닫는다:

```bash
reap mark loop <loop-id> --closed --milestone <ms-id>
```

없으면 loop를 열린 채 둔다. `Outcome`에 무엇을 채웠는지, `Open Questions`에 왜 아직 자를 것이 없는지를 적는다.

## 끝에 확인한다

```bash
reap init --check     # genome/application·evolution과 environment/summary가 보고되면 안 된다. invariants·lessons·map.md는 씨앗 그대로가 정상이다
reap ctx              # 다음 세션이 받을 것을 직접 본다
```

`ctx`의 출력이 질문 문장이 아니라 이 프로젝트의 사실이면 된 것이다. 커밋한다 — plan source가 별개 리포면 그쪽도.
