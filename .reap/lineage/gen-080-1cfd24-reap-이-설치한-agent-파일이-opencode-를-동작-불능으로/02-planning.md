# Planning

## Goal

REAP 이 설치한 agent 정의가 OpenCode 를 동작 불능으로 만드는 문제를 고친다. 템플릿은 하나로 두고 **adapter 가 자기 클라이언트의 스키마로 변환**해 쓴다.

## Completion Criteria

1. `reap install-skills` (agentClient: opencode) 후 **`opencode agent list` 가 오류 없이 REAP agent 를 나열**
2. claude-code 설치 결과는 **변경 없음** (회귀 0)
3. 설치된 opencode 파일에 `name`/`memory`/`model` 이 없고 `mode: subagent` + `permission` 이 있음
4. e2e 가 스키마 위반을 잡는다 — **의도적으로 깨뜨려 fail 확인**
5. agent 본문(프롬프트)이 **단일 소스**
6. 유저 환경 복구 — 올바른 형식으로 재설치
7. 회귀 없음 (470-0 / 272-0 / 44-0)

## Background

01-learning.md 참조. 확정 사실:
- 오류 원인은 **`tools` 필드 하나** (문자열 → record 기대). backlog 의 "4개 틀림"은 과잉 분석
- `auth list` 는 agent 를 로드하지 않아 재현 안 됨. **`agent list` 로 재현**
- 검증된 형태: `mode: subagent` + `permission` (probe-c), `model` 생략 가능

## Approach

### 변환 계층 — 별도 파일이 아니라

두 안 중 **변환 계층**을 택한다.

| | 별도 파일 | **변환 계층** |
|---|---|---|
| 본문 | 클라이언트마다 중복 | **단일 소스** |
| 위험 | 한쪽만 고치는 사고 (= issue #21 유형) | 변환 로직 유지 |

본문은 "REAP agent 가 무엇을 하는가"로 **클라이언트와 무관**하다. 다른 것은 frontmatter 뿐이다. 별도 파일로 두면 우리가 방금 고친 유형의 문제를 스스로 만드는 셈이다.

### 구현 — claude-code 는 손대지 않는다

```
src/templates/agents/*.md   (현행 유지 = claude-code 스키마)
        │
        ├── claude-code adapter → cp 그대로        (변경 없음, 회귀 0)
        └── opencode adapter    → frontmatter 변환 후 write
```

템플릿을 중립 형식으로 바꾸면 claude-code 쪽도 변환이 필요해지고 회귀 위험이 생긴다. **동작 중인 쪽은 건드리지 않는다.**

### frontmatter 변환 규칙

| 템플릿 (claude-code) | OpenCode |
|---|---|
| `name: reap-evolve` | **제거** — 파일명이 식별자 |
| `description: ...` | 그대로 |
| `tools: Read, Edit, Write, Glob, Grep, Bash, Agent` | **`permission:` 객체로 매핑** |
| `model: opus` | **제거** — `provider/model` 형식이 필요하고 사용자마다 provider 가 다르다. 박으면 그 provider 가 없는 사용자에게 새 오류가 된다 |
| `memory: project` | **제거** — 존재하지 않는 필드 |
| (없음) | **`mode: subagent` 추가** — REAP 은 이들을 subagent 로 호출. 생략 시 `all` |

**tool 이름 매핑**:

```
Read → read     Edit → edit     Write → write
Glob → glob     Grep → grep     Bash → bash
Agent → task
```

값은 `allow`. 템플릿에 없는 도구는 항목을 만들지 않는다(기본값 위임).

**`permission` 을 쓰는 이유**: `tools` 도 record 형식이면 동작하지만(probe-a 확인) OpenCode 문서가 deprecated 로 표기한다. deprecated 를 쓰면 다음 버전에서 또 깨진다 — 이번 사고가 정확히 "클라이언트 스키마 변화를 안 따라간" 것이다.

### 검증을 설치 경로에 넣는다

파일을 쓰고 끝내지 않는다. **`opencode agent list` 로 실제 파싱을 시도**해 오류가 없는지 확인한다. e2e 에서 이를 검사한다.

`opencode` 가 없는 환경에서는 skip (설치 자체를 막지 않는다).

### carrier 표식

"agent frontmatter 스키마는 클라이언트마다 다르다"는 사실에 `reap:carrier(agent-frontmatter-schema)` 를 단다. 다음에 agent 정의를 건드리는 사람이 양쪽을 보게 된다.

## Risk Assessment

| 리스크 | 대응 |
|---|---|
| claude-code 회귀 | 그쪽 코드를 건드리지 않음 + e2e 로 확인 |
| 변환 누락 (새 필드 추가 시) | 변환을 화이트리스트가 아닌 **명시적 생성**으로 — 템플릿에 필드가 늘어도 opencode 출력은 정의된 것만 나감 |
| OpenCode 스키마가 또 바뀜 | 설치 후 실제 파싱 검증 + carrier 표식 |
| `permission` 키 이름 오류 | probe 로 검증됨 (read/edit/bash/webfetch 확인). 매핑 대상만 사용 |

## Scope

**변경 대상**
- `src/adapters/opencode/install.ts` — `installAgents` 에 변환 추가
- `tests/e2e/install-agents.test.ts` — 스키마 검증 케이스
- `src/templates/agents/*.md` — carrier 표식만 (내용 변경 없음)
- `.reap/environment/summary.md` (reflect)

**out of scope**
- claude-code adapter — 동작 중, 무변경
- 템플릿 본문 — 변경 없음
- 릴리즈 노트 — (b) 완료 후 일괄

## Tasks

- [ ] T001 `opencode/install.ts` — frontmatter 파싱 + 변환 함수
- [ ] T002 `installAgents` 가 변환 결과를 write (cp → 변환+write)
- [ ] T003 `src/templates/agents/*.md` — carrier 표식
- [ ] T004 실제 설치 후 `opencode agent list` 통과 확인
- [ ] T005 **깨진 형식으로 되돌려 fail 확인** (negative test)
- [ ] T006 `tests/e2e/install-agents.test.ts` — opencode 스키마 검증 케이스 추가
- [ ] T007 claude-code 설치 결과 불변 확인
- [ ] T008 유저 환경 복구 (올바른 형식 재설치)
- [ ] T009 빌드 + typecheck + 회귀 + 게이트 4종

## Dependencies

T001 → T002 → T004 → T005 → T006, T003 병행, T008 은 T004 이후
