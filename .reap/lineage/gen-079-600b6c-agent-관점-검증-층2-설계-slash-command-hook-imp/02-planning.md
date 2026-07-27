# Planning

## Goal

**agent 가 REAP 설치물을 실제로 읽고 동작하는지** 확인하는 검증을 만든다. 헤드리스 agent 를 격리 환경에서 실행하고 **부수 효과(파일 시스템 상태)로 판정**한다. 0.17.3 묶음 3/3.

## Completion Criteria

1. `scripts/check-agent-integration.sh` — 격리 환경에서 헤드리스 agent 로 REAP 을 구동하고 **부수 효과로 판정**
2. **gen-063 재현 시 fail** — slash command 를 제거한 상태에서 검사가 잡아야 한다 (backlog Acceptance 1, 설계 평가 기준)
3. 정상 상태에서 pass
4. 사용자 `~/.claude/`·전역 node_modules **미접촉**
5. 자연어 매칭 **0** — 판정이 전부 파일 상태 기반
6. `claude` 부재·인증 실패 시 **명확히 skip** (조용한 통과 금지)
7. 비용·시간이 문서에 명시되고 CI 상시가 아님이 명확
8. 회귀 없음 (470-0 / 272-0 / 44-0)

## Background

01-learning.md 실측 참조:
- `claude -p ... --output-format json` 으로 slash command 인식 + hook 발화 확인됨
- `/reap.start` 실행 후 `current.yml` 생성으로 **결정적 판정** 가능
- 1회 $0.23~0.24, 수십 초 → **릴리즈 전에만**

## Approach

### 검증 시나리오 — 한 번의 호출로 3층을 본다

```
격리 HOME + tarball 설치 + git 프로젝트 init
  ↓
claude -p "use /reap.start to create a generation with goal X, --no-backlog"
  ↓
판정: .reap/life/current.yml 이 존재하고 goal 이 일치하는가
```

이 하나가 동시에 증명하는 것:

| 검증 | 근거 |
|---|---|
| slash command 인식 | `/reap.start` 를 몰랐다면 실행하지 못함 |
| `@` import 로드 | CLAUDE.md 의 genome 참조를 읽어야 REAP 맥락을 이해 |
| SessionStart hook | 실측에서 agent 가 hook 주입 context(pending migration)를 언급 |
| CLI 동작 | generation 이 실제로 생성됨 |

**gen-063 이 놓친 것이 정확히 이것이다** — 파일은 올바른 위치에 있었지만 클라이언트가 slash command 로 인식하지 않았다.

### 판정은 부수 효과만

```bash
# 자연어를 파싱하지 않는다
[ -f "$PROJ/.reap/life/current.yml" ] || fail
grep -q "goal: $PROBE_GOAL" "$PROJ/.reap/life/current.yml" || fail
```

agent 응답은 언어·표현·길이가 매번 다르다. 문자열 매칭은 flaky 를 만들고, flaky 한 검사는 결국 무시된다(gen-075).

`--output-format json` 의 `is_error` / `subtype` 은 **agent 실행 자체의 성공 여부**로만 쓴다 — 그건 결정적이다.

### 실행 위치 — CI 아님

| | 층 1 (gen-078) | 층 2 (본 세대) |
|---|---|---|
| 비용 | 무료 | **$0.24/회** |
| 시간 | 수초 | 수십 초 |
| 결정성 | 완전 | agent 응답 시간 비결정적 |
| 위치 | CI 매 push + release | **릴리즈 전 수동/반자동** |

`reapdev.versionBump` skill 의 릴리즈 절차에 넣는다. CI 에 넣으면 push 마다 과금되고 느려진다.

### skip 조건 — 조용한 통과 금지

`claude` 가 없거나 인증이 안 되면 **skip 하되 명확히 알린다.** 조용히 exit 0 하면 "검사가 돌았다"고 오인한다.

```
SKIP: claude CLI not found — layer-2 verification did not run
```

exit code 는 0(차단하지 않음)이되 출력에서 분명히 구분한다. 이 검사는 환경 의존이 크므로 하드 게이트로 만들면 릴리즈가 막힌다.

## Risk Assessment

| 리스크 | 대응 |
|---|---|
| agent 가 지시를 다르게 해석 | 프롬프트를 최소·명시적으로. 실패 시 agent 응답을 출력해 진단 가능하게 |
| 비용 누적 | 릴리즈 전 1회. 문서에 명시 |
| flaky | 판정을 파일 상태로 한정. agent 응답 미파싱 |
| 사용자 환경 오염 | HOME/prefix override (gen-078 검증된 패턴) |
| `claude` 버전 차이로 옵션 변경 | `--output-format json` 파싱 실패 시 명확히 보고 |

## Scope

**변경 대상**
- `scripts/check-agent-integration.sh` (신규)
- `.claude/commands/reapdev.versionBump.md` — 릴리즈 절차에 추가
- `src/templates/reap-guide.md` (+ `.reap/`, `~/.reap/`) — 두 층 검증 설명
- `.reap/environment/summary.md` — scripts 절 (reflect)

**out of scope**
- CI 통합 (비용·비결정성)
- OpenCode adapter 검증 — 같은 방식으로 확장 가능하나 `opencode` CLI 의 헤드리스 지원 여부 미확인. 별도 판단
- OpenShell (learning §4 판정)

## Tasks

- [ ] T001 `scripts/check-agent-integration.sh` — 격리 + 설치 + agent 실행 + 부수효과 판정
- [ ] T002 정상 상태 **pass 확인**
- [ ] T003 **gen-063 재현 → fail 확인** (slash command 제거 상태)
- [ ] T004 `claude` 부재 시 skip 동작 확인
- [ ] T005 HOME 미오염 확인
- [ ] T006 `reapdev.versionBump.md` 릴리즈 절차에 추가
- [ ] T007 `reap-guide.md` ×3 — 층1/층2 구분 설명
- [ ] T008 회귀 확인 + 자기진단/docs 게이트 유지
- [ ] T009 0.17.3 릴리즈 노트 **3세대분 일괄 보강** (gen-077/078/079)

## Dependencies

T001 → T002 → T003~T005 → T006~T007 → T008 → T009
