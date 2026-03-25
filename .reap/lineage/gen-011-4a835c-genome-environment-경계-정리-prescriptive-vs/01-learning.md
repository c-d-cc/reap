# Learning — gen-011-4a835c

## Source Backlog
`genome-environment-boundary.md` — application.md에 descriptive 정보 섞여있음. prescriptive/descriptive 분리 필요.

## Key Findings

### application.md에서 이동할 것 (descriptive → environment)
- `Tech Stack` (line 88-96): 현재 사용 기술 목록. 기술이 바뀌면 여기만 업데이트해야 하는데, genome은 immutable (normal mode)
- `Testing` (line 116-119): 현재 테스트 구조. 테스트 추가/변경 시 environment만 업데이트
- Identity의 `Version`, `License` (line 9-10): 변하는 사실 정보

### application.md에 남을 것 (prescriptive)
- Identity 핵심 (이름, 설명)
- Architecture 전체 (메타포, layers, lifecycle, nonce, state management, maturity — 설계 결정)
- Conventions 전체 (Code Style, Enforced, File Naming, Genome Rules — 규칙)

### environment/summary.md 갱신 전략
현재 evolution.md에 "reflect에서 갱신"만 있음. 구체적으로:
- implementation에서 변경한 파일 목록 기반으로 영향받는 환경 정보만 업데이트
- 전체 재작성 아님 — 점진적 업데이트

## Clarity Level: High
