# Implementation Log

## Completed Tasks

| # | 내용 |
|---|---|
| T001 | `scripts/check-agent-integration.sh` 신규 — 헤드리스 agent 구동 + **부수 효과 판정** |
| T002 | 정상 상태 **pass** 확인 (generation 생성됨) |
| T003 | **gen-063 재현 → fail 확인** (3차 시도 끝에. 아래 상세) |
| T004 | `claude`/`reap` 부재 시 **명시적 SKIP** (조용한 통과 금지) |
| T005 | 사용자 `~/.claude/commands/` 19 → 19 불변 |
| T006 | `reapdev.versionBump.md` — Step 5-2 추가 |
| T007 | `reap-guide.md` ×3 — § Verifying a Release (층1/층2 구분) |
| T008 | typecheck 0 / 자기진단 pass / docs gate pass / unit 470-0 / e2e 272-0 / scenario 44-0 / 고아 0 |
| T009 | 0.17.3 릴리즈 노트 **3세대분(gen-077/078/079) 일괄 보강** — NOTICE / NOTES / docs 5로케일 |

## Verification Results

| 기준 | 결과 |
|---|---|
| 1. 헤드리스 + 부수효과 판정 | **pass** |
| 2. **gen-063 재현 시 fail** | **pass** — 설계 평가 기준 충족 |
| 3. 정상 상태 pass | **pass** |
| 4. 사용자 환경 미접촉 | **pass** — 19 → 19 |
| 5. 자연어 매칭 0 | **pass** — 판정은 `current.yml` 존재 + goal 일치. sentinel 은 보조 설명용 |
| 6. 부재 시 명확한 SKIP | **pass** |
| 7. 비용·CI 부적합 문서화 | **pass** — 스크립트 헤더 + guide + skill |
| 8. 회귀 없음 | **pass** |

## Discovered Issues

### 1. 격리와 인증이 충돌한다 — 설계를 바꿨다

planning 은 gen-078 처럼 격리 HOME 에 tarball 을 설치하는 구조였다. 실행하니:

```
FAIL  the agent run itself failed
      "result": "Not logged in · Please run /login"
```

**Claude Code 는 로그인 상태를 `~/.claude/` 에 두는데, slash command 도 같은 곳에 있다.** 하나를 격리하면 다른 하나를 잃는다. `~/.claude.json` 복사도, `CLAUDE_CONFIG_DIR` 도 통하지 않았다.

이 제약이 오히려 더 나은 구조를 알려줬다:

| 층 | 묻는 것 | 필요한 것 |
|---|---|---|
| 1 (gen-078) | tarball 이 올바른 파일을 올바른 위치에 놓는가 | **격리 설치** |
| **2** | **그 위치의 파일을 클라이언트가 읽는가** | **현재 설치 상태 + 임시 프로젝트** |

층 2 는 tarball 설치가 애초에 불필요하다. 사용자 환경을 **읽기만** 하고 임시 프로젝트에만 쓴다. 결과적으로 스크립트가 단순해지고 안전해졌다.

### 2. 첫 설계가 gen-063 을 못 잡았다 — 3차 시도

**1차**: slash command 를 전부 지웠는데 **통과**했다.

원인: agent 가 `/reap.start` 를 못 찾자 **`reap run start` CLI 를 직접 실행**해 같은 부수 효과를 만들었다. 비용이 $0.26 → $0.45 로 오른 것이 우회 시도의 흔적이었다.

**즉 `current.yml` 생성은 slash command 인식을 증명하지 못한다.** slash command 는 결국 CLI 를 부르는 wrapper 이므로 부수 효과가 같다.

**2차**: 프롬프트로 우회로를 막았다 — *"slash command 만 써라. CLI 를 직접 부르지 마라. 없으면 `SLASH_COMMAND_UNAVAILABLE` 이라고만 답하라."* agent 가 정확히 그 토큰을 반환했으나, `claude -p` 가 stdin 을 기다리며 출력한 경고가 JSON 앞에 붙어 파싱이 깨졌다.

**3차**: `< /dev/null` 로 stdin 을 닫고 sentinel 감지를 추가. **재현 시 exit 1, 정상 시 exit 0.**

sentinel 매칭은 자연어 파싱이 아니다 — 우리가 지시한 고정 토큰이며 결정적이다. 다만 **주 판정은 여전히 파일 상태**로 두었다. agent 가 sentinel 을 쓰지 않아도 `current.yml` 부재로 잡힌다.

## Architecture Decisions

### 판정은 부수 효과로, 설명은 sentinel 로

agent 응답은 언어·표현·길이가 매번 다르다. 문자열 매칭은 flaky 를 만들고 flaky 한 검사는 무시된다(gen-075).

- **판정**: `current.yml` 존재 + goal 일치 — 완전히 결정적
- **설명**: `SLASH_COMMAND_UNAVAILABLE` sentinel 로 실패 원인을 구분 — 없어도 판정은 성립

### CI 에 넣지 않았다

| | 층 1 | 층 2 |
|---|---|---|
| 비용 | 무료 | **$0.25/회** |
| 시간 | 수초 | 수십 초 |
| 결정성 | 완전 | agent 응답 시간 비결정적 |

push 마다 과금되고 느려진다. `reapdev.versionBump` 의 릴리즈 절차(Step 5-2)에 넣었다.

### SKIP 을 조용히 하지 않는다

`claude` 나 `reap` 이 없으면 exit 0 이되 **`SKIP` 을 명시 출력**한다. 조용한 exit 0 은 "검사했고 깨끗하다"로 읽힌다 — 릴리즈 직전에 그 오해는 비싸다.

하드 게이트로 만들지 않은 이유: 환경 의존이 커서 릴리즈 자체가 막히면 안 된다.

## Deferred Items

- **OpenCode adapter 검증** — 같은 구조로 확장 가능하나 `opencode` CLI 의 헤드리스 지원 여부를 확인하지 않았다. adapter 가 둘이므로 갭도 둘이다
- **CI 통합** — 비용·비결정성으로 보류. API key secret + 예산 정책이 정리되면 재검토
