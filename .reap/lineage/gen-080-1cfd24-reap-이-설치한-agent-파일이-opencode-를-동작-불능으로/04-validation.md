# Validation Report

## Result

**pass**

모든 검증을 fresh 실행했다.

## Checks

### 게이트 / 빌드

| 항목 | 결과 |
|---|---|
| TypeCheck | **pass** (error 0) |
| 자기진단 (층1) | **pass** (exit 0) |
| 문서 정합성 | **pass** (exit 0) |
| carrier 고아 | **고아 0** |

### 테스트

| 스위트 | baseline (gen-079) | 현재 | 판정 |
|---|---|---|---|
| unit | 470 / 0 | **470 / 0** | pass |
| e2e | 272 / 0 | **278 / 0** | pass — 신규 6 (opencode 스키마) |
| scenario | 44 / 0 | **44 / 0** | pass |

### 실환경 확인

```
$ opencode agent list
reap-evaluate (subagent)
reap-evolve (subagent)
```

유저의 실제 `~/.config/opencode/agent/` 에 새 형식이 설치돼 있고 오류가 없다. **버그 발생 이전 상태로 복구됨.**

### 완료 기준 (02-planning.md)

| # | 기준 | 결과 |
|---|---|---|
| 1 | opencode 정상 인식 | **pass** |
| 2 | claude-code 무변경 | **pass** — e2e 로 고정 |
| 3 | 필드 정리 | **pass** |
| 4 | 깨뜨려 fail 확인 | **pass** — 아래 |
| 5 | 본문 단일 소스 | **pass** |
| 6 | 유저 환경 복구 | **pass** |
| 7 | 회귀 없음 | **pass** |

### 기준 4 — 양방향 실증

| 상태 | 결과 |
|---|---|
| 구 형식(`tools: Read, ...`) | `Error: Configuration is invalid ... expected record, received string tools` |
| 신 형식(`permission:` record) | `reap-evolve (subagent)` |

**같은 파일 경로에서 형식만 바꿔 확인**했으므로 다른 변수가 없다.

## Edge Cases

- **`tools` 도 record 면 동작함**(probe-a): 오류는 형식 문제이지 필드 선택 문제가 아니다. 그럼에도 `permission` 을 쓴 이유는 `tools` 가 deprecated 이기 때문 — deprecated 를 따르는 것이 이번 사고와 같은 계열이다
- **`model` 생략**(probe-b): 값을 박으면 그 provider 가 없는 사용자에게 새 오류가 된다. 생략 시 사용자 기본값
- **`mode` 생략 시 `all`**: REAP 은 subagent 로 호출하므로 명시가 맞다
- **frontmatter 없는 파일**: `toOpenCodeAgent` 가 원본을 그대로 반환 — 변환 실패로 파일을 잃지 않는다
- **carrier 주석**: 한 줄로 줄여 사용자 파일에 노출돼도 무해

## Issues

### 1. 원인 분석에서 문서 대조와 실측이 갈렸다

backlog 는 문서 대조로 "4개 필드가 틀렸다"고 했으나 실제 오류는 `tools` 하나였다. 나머지는 OpenCode 가 무시한다.

**수정 자체는 같았지만**(어차피 정리했으므로) 심각도 판단이 달라질 수 있었다. 문서에 없는 필드가 곧 오류는 아니다.

### 2. 재현 명령 선택이 결론을 바꿀 뻔했다

`opencode auth list` 로는 재현되지 않는다(agent 미로드). `agent list` 라야 드러난다. 처음 `auth list` 결과만 보고 "재현 불가"로 판단할 뻔했다 — 그랬다면 유저가 겪은 실제 버그를 없는 것으로 결론냈을 것이다.

### 3. 층2 커버리지가 여전히 claude-code 뿐

본 세대는 e2e 로 opencode 스키마를 고정했으나, **agent 를 실제로 띄워 검증하는 층2 는 claude-code 만 대상**이다. 이번 버그가 정확히 그 갭에서 나왔다.

다음 세대(b, opencode 샌드박스 검증)가 이 갭을 메운다.

## Notes

`config.evaluator: true` 이나 부모 에이전트가 직접 검증했다. advisor 모델이므로 허용된다.
