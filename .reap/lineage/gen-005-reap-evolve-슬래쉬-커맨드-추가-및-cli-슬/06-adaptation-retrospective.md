# Gen-005 Adaptation (회고)

## 교훈

### 잘된 점
- 병렬 에이전트로 Phase 1(커맨드/템플릿)과 Phase 2(CLI 명령어)를 동시 구현하여 효율적
- 기존 패턴(COMMAND_NAMES 배열, 템플릿 복사 구조)을 그대로 따라 일관성 유지
- 4개 누적 backlog를 한 세대에서 모두 해소
- update 명령은 파일 내용 비교 방식으로 불필요한 덮어쓰기 방지

### 개선할 점
- 테스트의 하드코딩된 매직 넘버(`toHaveLength(7)`)가 커맨드 추가 시 깨짐 → 동적 검증 필요
- 프리셋 목록이 에러 메시지에 하드코딩됨 → 동적 목록 생성 고려
- **Validation 판정 기준이 너무 이분법적** — 테스트 통과 + 완료 조건 충족이면 무조건 pass. 코드 품질 minor fix가 필요한 경우 partial로 판정하여 Growth 회귀할 수 있어야 함. 현재는 Adaptation에서 발견해도 코드를 고칠 수 없어서 backlog으로만 넘기는 비효율 발생

## Genome 변경 제안

| 대상 파일 | 변경 내용 | 사유 |
|-----------|-----------|------|
| conventions.md | Git Conventions에 커밋 타이밍 규칙 추가 | Growth 진입 시 uncommitted 변경 대량 발견 방지 (backlog-03) |

## 기술 부채

없음.

## Deferred 태스크 인계

없음 (14/14 태스크 완료).

## 다음 세대 Backlog
- `01-dynamic-test-assertions.md` — 테스트 매직 넘버 제거, COMMAND_NAMES 동적 참조
- `02-validation-partial-for-minor-fix.md` — Validation 판정에 minor fix용 Growth 회귀 경로 추가
