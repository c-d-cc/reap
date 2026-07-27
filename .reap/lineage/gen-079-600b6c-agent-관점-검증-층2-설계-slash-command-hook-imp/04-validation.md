# Validation Report

## Result

**pass**

모든 검증을 fresh 실행했다.

## Checks

### 게이트 4종

| 항목 | 결과 |
|---|---|
| TypeCheck | **pass** (error 0) |
| 자기진단 (층1) | **pass** (exit 0) |
| 문서 정합성 | **pass** (exit 0, v0.17.3) |
| carrier 고아 | **고아 0** |
| **agent 통합 (층2)** | **pass** (exit 0) |

### 테스트

| 스위트 | baseline (gen-078) | 현재 | 판정 |
|---|---|---|---|
| unit | 470 / 0 | **470 / 0** | pass |
| e2e | 272 / 0 | **272 / 0** | pass |
| scenario | 44 / 0 | **44 / 0** | pass |

본 세대는 스크립트·문서가 주 변경이고 `src/` 런타임 로직 변경이 없다. 수치 불변이 예상된 결과다.

### 완료 기준 (02-planning.md)

| # | 기준 | 결과 |
|---|---|---|
| 1 | 헤드리스 + 부수효과 판정 | **pass** |
| 2 | **gen-063 재현 시 fail** | **pass** — 아래 별도 |
| 3 | 정상 시 pass | **pass** |
| 4 | 사용자 환경 미접촉 | **pass** — `~/.claude/commands/` 19 → 19 |
| 5 | 자연어 매칭 0 | **pass** |
| 6 | 부재 시 명확한 SKIP | **pass** |
| 7 | 비용·CI 부적합 명시 | **pass** |
| 8 | 회귀 없음 | **pass** |

### 기준 2 — 설계 평가 기준

backlog Acceptance 1번은 *"gen-063 의 실패를 재현 상황에서 잡아낼 수 있는가"* 였다. **과거 사고를 못 잡는 검증은 만들 이유가 없다**는 판단이었고, 실제로 이 기준이 설계를 두 번 되돌렸다.

| 시도 | 재현 상태 결과 | 원인 |
|---|---|---|
| 1차 | **통과 (실패)** | agent 가 CLI 를 직접 실행해 우회 |
| 2차 | 파싱 오류 | `claude -p` 의 stdin 경고가 JSON 앞에 붙음 |
| **3차** | **exit 1 + 원인 메시지** | `< /dev/null` + sentinel |

정상 상태에서는 3차 모두 통과. **양방향 확인 완료.**

## Edge Cases

- **격리 불가**: Claude Code 의 로그인과 slash command 가 같은 `~/.claude/` 에 있어 HOME 격리 시 인증을 잃는다. 층 2 는 현재 설치를 읽기만 하므로 격리가 불필요 — 제약이 설계를 단순화했다
- **agent 우회**: slash command 가 없으면 CLI 를 직접 부른다. 프롬프트로 금지하고 sentinel 로 확인
- **stdin 대기**: `claude -p` 는 stdin 을 3초 기다린 뒤 경고를 출력한다. `< /dev/null` 필수
- **버전 불일치**: 소스가 0.17.3 인데 설치본이 0.17.2 일 수 있다. 스크립트가 양쪽 버전을 출력하고 `install-skills` 를 안내

## Issues

### 층 2 가 못 잡는 것

| 사고 | 잡는가 |
|---|---|
| gen-063 (slash command 미노출) | **잡음** (실증) |
| #22 / gen-074 (설치·패키징) | 층 1 담당 |
| #21 (규칙 텍스트 미갱신) | carrier 표식 담당 |
| OpenCode adapter 의 같은 유형 갭 | **못 잡음** — claude-code 만 검사. deferred |

세 검사가 서로 다른 층을 덮으며, 각각의 사각지대를 문서에 남겼다.

### 비용이 드는 검사의 위치

$0.25/회이므로 CI 상시는 부적합하다. `reapdev.versionBump` Step 5-2 에 넣었으나 **skill 은 사람이 따르는 절차**라 gen-073 이 지적한 "지시문은 실패한 방법"에 해당한다.

다만 여기서는 대안이 없다 — 자동화하면 push 마다 과금된다. **한계를 인지하고 배치**한 것이며, 이 트레이드오프를 skill 과 guide 양쪽에 적었다.

## Notes

`config.evaluator: true` 이나 부모 에이전트가 직접 검증했다. advisor 모델이므로 허용된다.
