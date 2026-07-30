# Planning

## Goal

REAP 이 OpenCode 에 쓴 agent 정의를 **OpenCode 가 실제로 읽을 수 있는지**를 게이트로 만든다.

완료 시 달라지는 것: gen-080 은 사용자가 자기 환경에서 겪고 나서야 드러났다. 이후에는 같은 결함이 **커밋 시점에** red 로 잡힌다.

## Background

OpenCode 의 설정 검증은 all-or-nothing 이다. REAP 이 쓴 파일 하나가 스키마에 맞지 않으면 **`opencode` 명령 전체가 실패**한다. gen-080 이 정확히 그 상태였고, 기존 게이트 둘 다 그것을 볼 수 없었다:

- 층1 은 파일이 올바른 위치에 올바른 내용으로 놓였는지만 본다 — 놓여 있었다
- 층2 는 claude-code 만 대상이다

그리고 층1 은 `reap init` 기본값(claude-code)으로만 진단한다. **agentClient 를 바꾼 경로는 어느 게이트도 지나지 않는다.**

## Approach

### 배치 — `check-self-diagnosis.sh` 를 확장한다

세 후보를 놓고 판단했다:

| 후보 | 판정 |
|---|---|
| 별도 스크립트 (자체 pack + install) | **기각** — `npm pack` → 격리 HOME/prefix 설치가 ~40줄 중복. genome 의 no-duplication 위배 |
| 공통 helper 를 두 스크립트가 source | 중복은 없으나 파일이 셋으로 늘고, 두 검사가 묻는 것이 사실상 같다 |
| **기존 스크립트 확장** | **채택** |

핵심 근거: 이 게이트의 질문은 원래 **"갓 설치한 REAP 이 스스로에 대해 아무 문제도 보고하지 않는가"** 였다. 여기에 클라이언트 축을 더하는 것이지 다른 질문을 만드는 게 아니다. 확장 후 질문은 **"REAP 이 지원한다고 말하는 모든 클라이언트에 대해"** 로 자연스럽게 넓어진다.

이미 만들어 둔 tarball 과 prefix 를 재사용하므로 추가 비용은 `install-skills` 1회 + `opencode agent list` 1회다.

### 판정 — exit code 만으로는 부족하다

`opencode agent list` 는 **agent 가 하나도 없어도 exit 0** 이다 (내장 agent 만 나열). exit code 만 보면 "REAP 이 아무것도 설치하지 않음"이 통과한다.

gen-079 의 층2 초안이 slash command 를 전부 지워도 통과했던 것과 같은 함정이다. 따라서 두 가지를 함께 요구한다:

1. `opencode agent list` 가 **exit 0**
2. 출력에 **`reap-evolve`** 와 **`reap-evaluate`** 가 있을 것

### 격리 — `HOME` 하나로 양방향

- REAP 의 `opencodeAgentsDir(home = homedir())` → `$HOME/.config/opencode/agent`. `reap` 은 node 로 돌아 `homedir()` 가 `$HOME` 을 따른다
- **opencode 바이너리도 `HOME` 을 따른다** (실측 확인). `XDG_CONFIG_HOME` 불필요

genome longterm 에 "bun 의 `os.homedir()` 는 in-process `$HOME` 을 무시한다"가 있어 확인했는데, 별도 프로세스라 해당 없다.

claude-code 진단과 섞이지 않도록 **별도 FAKE_HOME 을 쓴다.**

### `opencode` 부재 시 — amber SKIP, 조용히 넘어가지 않는다

`check-agent-integration.sh` 가 `claude` 부재에 쓰는 패턴을 따른다. 조용한 exit 0 은 릴리즈 전에 읽는 사람에게 **"검사했고 깨끗하다"** 로 읽힌다.

claude-code 진단은 이 SKIP 과 무관하게 계속 must-pass 다.

### CI 편입 — opencode 를 설치한다

`opencode-ai` (npm, bin `opencode`, MIT) 로 러너에 설치할 수 있다. **버전을 고정하지 않는다.**

고정하지 않는 이유가 곧 이 검사의 목적이다 — 묻는 것이 "우리가 쓴 것을 **현재의** OpenCode 가 받아들이는가"이기 때문이다. upstream 이 스키마를 바꿔 red 가 되면 **그것이 우리가 원하는 신호**다. gen-080 과 같은 실패를 사용자 대신 우리가 먼저 보는 것이다.

대가: 우리 커밋과 무관하게 red 가 될 수 있다. 실패 메시지에 "upstream 이 바뀌었을 수 있다"를 명시해 오진을 줄인다.

**기록해 둘 것**: 개발자 로컬은 1.3.16(curl 설치), npm latest 는 1.18.9 다. CI 는 최신을 보고 로컬은 구버전을 보므로 **판정이 갈릴 수 있다.**

## Completion Criteria

1. 정상 설치에서 통과하고, 목록에 `reap-evolve` / `reap-evaluate` 가 있음을 확인한다
2. **agent frontmatter 를 gen-080 이전 스키마(`tools:` 문자열)로 되돌리면 실패** — negative test
3. **agent 를 하나도 설치하지 않아도 실패** — exit code 만 보지 않는다는 증거
4. `opencode` 미설치 환경에서 **amber SKIP 을 출력**하고 claude-code 진단은 계속 통과
5. 사용자의 `~/.config/opencode/` 를 **읽지도 쓰지도 않음**
6. CI 에서 실제로 실행된다 (SKIP 이 아니라)

## Risk Assessment

| 위험 | 대응 |
|---|---|
| CI 의 opencode 버전 ≠ 로컬 버전 | 스크립트가 검사한 버전을 출력. 판정이 갈리면 근거가 남는다 |
| upstream 스키마 변경으로 무관한 red | 실패 메시지에 가능성 명시. 미고정은 의도된 선택 |
| `opencode-ai` 설치가 CI 를 느리게 함 | 측정 후 판단. 과하면 CI 에서 빼고 릴리즈 전으로 옮긴다 |
| 확장으로 스크립트가 길어짐 | 절 구분 + 주석. 200줄을 넘으면 분리 재검토 |

## Scope

- `scripts/check-self-diagnosis.sh` — opencode 절 추가
- `.github/workflows/ci.yml` / `release.yml` — opencode 설치 단계
- `.reap/environment/summary.md` — 게이트 표 갱신

범위 밖:
- **(b) agent 구동 검증** — opencode 헤드리스 모드 미확인 + 유료. 별건
- OpenShell 샌드박스 — (a) 에 불필요
- adapter 코드 변경 — gen-080 이 이미 고쳤다. 본 세대는 **검사만** 추가한다

## Tasks

- [ ] T001 `scripts/check-self-diagnosis.sh` — opencode 절 추가. 별도 FAKE_HOME → 프로젝트 생성 → `agentClient: opencode` → `install-skills` → `opencode agent list` 검증
- [ ] T002 `opencode` 부재 시 amber SKIP + 검사한 버전 출력
- [ ] T003 **negative test 1** — frontmatter 를 `tools:` 문자열로 되돌려 실패 확인 후 복원
- [ ] T004 **negative test 2** — agent 를 지우고 실패 확인 (exit 0 통과 함정 방지)
- [ ] T005 `.github/workflows/ci.yml` + `release.yml` — `opencode-ai` 설치 단계 추가
- [ ] T006 CI 에서 SKIP 이 아니라 실제 실행됨을 확인 (완료 기준 6)
- [ ] T007 사용자 `~/.config/opencode/` 미접근 확인 (완료 기준 5)
- [ ] T008 `.reap/environment/summary.md` 게이트 표 갱신

## Dependencies

- T003·T004 는 T001 이후. **검사가 실제로 무엇을 잡는지 증명하는 단계이므로 생략 불가**
- T005 → T006 순차
- T003 실패 시 T005 로 진행하지 않는다 — 잡지 못하는 검사를 CI 에 넣으면 초록불만 늘어난다
