# Implementation Log

## Completed Tasks

| # | 내용 |
|---|---|
| T001 | `opencode/install.ts` — `toOpenCodeAgent()` frontmatter 변환 함수 + `OPENCODE_TOOL_PERMISSIONS` 매핑 |
| T002 | `installAgents` 가 `cp` 대신 변환 후 write |
| T003 | `src/templates/agents/*.md` — carrier 표식 (한 줄) |
| T004 | 실제 설치 확인 — `opencode agent list` 에서 `reap-evolve (subagent)` / `reap-evaluate (subagent)` |
| T005 | **negative test** — 구 형식 되돌리면 오류 재현, 복구하면 정상 |
| T006 | `tests/e2e/install-agents.test.ts` — 스키마 검증 6 case 추가 |
| T007 | claude-code 결과 불변 — 테스트로 고정 |
| T008 | **유저 환경 복구** — 올바른 형식으로 재설치됨 |
| T009 | typecheck 0 / unit 470-0 / e2e **278-0**(+6) / scenario 44-0 / 게이트 2종 pass |

## Verification Results

| 기준 | 결과 |
|---|---|
| 1. opencode 정상 인식 | **pass** — 두 agent 모두 `(subagent)` |
| 2. claude-code 무변경 | **pass** — 테스트로 고정 (`tools: Read` / `name:` 유지, `permission:` 없음) |
| 3. 필드 정리 | **pass** — `name`/`memory`/`model` 제거, `mode: subagent` + `permission` |
| 4. 깨뜨려 fail 확인 | **pass** — 아래 |
| 5. 본문 단일 소스 | **pass** — 템플릿 1개, frontmatter 만 변환 |
| 6. 유저 환경 복구 | **pass** |
| 7. 회귀 없음 | **pass** |

### 양방향 확인 (기준 4)

```
구 형식:  Error: Configuration is invalid at ~/.config/opencode/agent/reap-evolve.md
            ↳ Invalid input: expected record, received string  tools
신 형식:  reap-evaluate (subagent)
          reap-evolve (subagent)
```

### 변환 결과

```yaml
---
description: REAP generation lifecycle executor. Runs full generation from learning through completion.
mode: subagent
permission:
  read: allow
  edit: allow
  write: allow
  glob: allow
  grep: allow
  bash: allow
  task: allow
---
```

## Discovered Issues

### 1. backlog 의 원인 분석이 과했다 — 문서 대조 ≠ 실측

backlog 는 OpenCode 문서와 대조해 "5개 필드 중 4개가 틀렸다"고 썼다. 실측하니 **오류를 내는 것은 `tools` 하나**였다:

```
↳ Invalid input: expected record, received string  tools
```

`name` / `model: opus` / `memory: project` 를 남긴 채 `tools` 만 record 로 바꾸면 통과한다(probe-a). **문서에 없는 필드라고 해서 오류가 되는 것은 아니다.**

그래도 세 필드를 제거한 이유는 오류 때문이 아니라 다음 사람이 유효한 필드로 오해하지 않게 하기 위해서다. 이 구분을 코드 주석에 남겼다.

### 2. 재현 명령을 잘못 고르면 "버그 없음"으로 결론난다

| 명령 | agent 로드 | 결과 |
|---|---|---|
| `opencode auth list` | 안 함 | **정상** |
| `opencode agent list` | 함 | **오류** |

처음 `auth list` 로 확인하고 "재현 안 됨"이라 판단할 뻔했다. 유저는 `auth login` 에서 만났고 그 경로는 agent 를 로드한다.

**사용자가 실제로 실행한 명령을 재현해야 한다.** 비슷해 보이는 다른 명령으로는 버그가 숨는다.

### 3. carrier 주석이 사용자 파일에 노출됐다

처음엔 3줄 주석(내부 경로 포함)을 템플릿에 넣었는데, 변환된 파일 본문에 그대로 들어가 **사용자가 여는 파일에 `src/adapters/...` 가 보였다.**

표식은 한 줄로 줄이고 설명은 코드 쪽으로 옮겼다. **표식은 개발자용이지만 그 파일이 사용자에게 배포된다면 사용자 관점에서도 무해해야 한다.**

## Architecture Decisions

### 변환 계층 — claude-code 는 손대지 않는다

```
src/templates/agents/*.md  (claude-code 스키마)
   ├── claude-code → cp 그대로        ← 변경 없음, 회귀 위험 0
   └── opencode    → toOpenCodeAgent() 후 write
```

템플릿을 중립 형식으로 바꾸면 양쪽 다 변환이 필요해지고 동작 중인 쪽에 회귀 위험이 생긴다. **깨진 쪽만 고친다.**

별도 파일(클라이언트별 템플릿)을 택하지 않은 이유: 본문이 중복되면 한쪽만 갱신하는 사고가 생긴다 — 우리가 issue #21 에서 겪은 유형을 스스로 만드는 셈이다.

### `permission` 을 쓴다 (deprecated `tools` 대신)

`tools` 도 record 형식이면 동작한다(probe-a 확인). 그러나 OpenCode 문서가 deprecated 로 표기한다.

**deprecated 필드를 따라가는 것이 이번 사고의 원인과 같은 계열이다** — 클라이언트 스키마 변화를 안 따라간 결과였다. `permission` 은 현행이고 probe-c 로 검증했다.

### `model` 을 생략한다

OpenCode 는 `provider/model` 형식을 요구하고 사용자마다 구성한 provider 가 다르다. 특정 모델을 박으면 **그 provider 가 없는 사용자에게 "model not found" 라는 새 오류**를 만든다 — 이번 버그를 다른 버그로 바꾸는 셈이다. 생략하면 사용자 기본값이 쓰인다.

### 필드를 필터링하지 않고 명시 생성한다

변환은 "제거할 필드 목록"이 아니라 **"내보낼 필드 목록"** 으로 구현했다. 템플릿에 필드가 추가되어도 OpenCode 설정으로 새어나가 다시 깨뜨릴 수 없다.

## Deferred Items

- **설치 시 실제 파싱 검증** — planning 의 S2. `opencode agent list` 를 설치 후 호출해 확인하는 것을 검토했으나, opencode 가 없는 환경에서의 skip 처리와 설치 실패 시 동작 정의가 필요해 범위를 넘어선다. e2e 가 스키마를 고정하므로 실질 위험은 낮다
- **기존 피해자 잔재 정리** — `installAgents` 가 cleanup-then-copy 이므로 새 버전 설치 시 자동 교체된다. REAP 을 제거한 사용자의 잔재는 남지만 그 경우 `reap fix` 도 못 쓴다
