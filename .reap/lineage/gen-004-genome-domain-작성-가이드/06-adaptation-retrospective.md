# Gen-004 Adaptation (회고)

## 교훈

### 잘된 점
- 실제 프로젝트(selfview)에서 먼저 domain 파일을 작성하고, 그 경험을 추상화하는 bottom-up 접근이 효과적이었음
- 3개 domain 파일 작성으로 충분한 패턴 추출 가능 (interview-protocol, article-generation, moderation-policy)

### 개선할 점
- domain/README.md가 init 시 자동 복사되지 않는 것을 뒤늦게 발견 — 새 템플릿 추가 시 init 코드 동기화 체크리스트 필요
- 기존 3개 세대에서 domain/이 항상 비어있었던 건 가이드 부재가 원인. 가이드만 있어도 에이전트가 판단할 수 있음

## Genome 변경 제안

| 대상 파일 | 변경 내용 | 사유 |
|-----------|-----------|------|
| principles.md | domain/ 관련 Core Belief 추가 | 이미 Growth에서 반영 완료 |
| conventions.md | 템플릿 추가 시 init 동기화 규칙 | 새 템플릿이 init 복사 누락되는 문제 방지 |

## 기술 부채

없음.

## 다음 세대 Backlog

- 부트스트랩 프리셋 (`--preset` 옵션) — 기존 backlog 유지
