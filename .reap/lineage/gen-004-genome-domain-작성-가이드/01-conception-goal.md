# Gen-004: genome/domain 작성 가이드 체계화

## 목표

genome/domain/ 디렉토리의 작성 가이드를 체계화한다.
현재 domain/은 "상세 내용을 분리하라"는 언급만 있고, 구체적인 작성 규칙·구조·네이밍·판단 기준이 없다.
selfview 프로젝트에서 실제 domain 파일 작성 경험을 바탕으로 범용 가이드를 확립한다.

## 완료 조건

- [ ] `src/templates/genome/domain/README.md` — domain 작성 가이드 템플릿 존재
- [ ] 슬래시 커맨드(conception, formation, birth)에서 domain/ 가이드 참조 업데이트
- [ ] genome principles.md에 domain/ 작성 원칙 반영
- [ ] 테스트 통과 (`bun test`)
- [ ] 타입체크 통과 (`bunx tsc --noEmit`)

## 범위

- **관련 Genome 영역**: principles.md (domain 관련 원칙 추가), domain/ 자체
- **예상 변경 범위**:
  - `src/templates/genome/domain/README.md` (신규)
  - `src/templates/commands/reap.conception.md` (domain health check 보강)
  - `src/templates/commands/reap.birth.md` (domain 작성 규칙 참조 추가)
  - `src/templates/commands/reap.formation.md` (domain 갭 분석 보강)
  - `.reap/genome/principles.md` (domain 관련 원칙)
- **제외 사항**: CLI 코드 변경 없음 (문서/템플릿만), 부트스트랩 프리셋 (backlog 유지)

## 배경

- selfview 프로젝트에서 domain/ 파일(interview-protocol.md, article-generation.md, moderation-policy.md) 작성 시 가이드 부재로 판단 기준이 불명확했음
- 3개 세대를 거치면서 domain/은 항상 비어있었음 — "도메인 규칙 미정의" 플래그만 반복
- 실전 작성 경험에서 도출된 패턴: 비즈니스 도메인 단위 분리, 코드에서 읽을 수 없는 지식 기록, 에이전트 즉시 행동 가능 수준
