# Planning

## Summary
session-start.sh에서 config.yml의 strict 설정을 읽고, strict=true이면 stage별 코드 수정 제한 규칙을 AI 컨텍스트에 주입한다. implementation stage에서도 02-planning.md의 task 범위 내에서만 수정을 허용한다.

## Technical Context
- **Tech Stack**: bash (session-start.sh), markdown (reap-guide.md)
- **Constraints**: YAML 파싱은 grep/sed만 사용, 외부 의존성 없음

## Tasks

### Phase 1: session-start.sh strict 감지 + 주입 (FR-001~004)
- [ ] T001 `src/templates/hooks/session-start.sh` — config.yml에서 `strict:` 값 파싱
- [ ] T002 `src/templates/hooks/session-start.sh` — strict=true일 때 stage별 분기:
  - implementation: planning 범위 내 수정만 허용 (HARD-GATE)
  - no generation / 다른 stage: 코드 수정 완전 거부 (HARD-GATE)
- [ ] T003 `src/templates/hooks/session-start.sh` — strict_section을 reap_context 출력 문자열에 포함

### Phase 2: 문서 (FR-005~006)
- [ ] T004 `src/templates/hooks/reap-guide.md` — Strict Mode 섹션 추가 (규칙 설명, escape hatch)

### Phase 3: 검증
- [ ] T005 `bun test`, `bunx tsc --noEmit`, 빌드 검증
- [ ] T006 session-start.sh 실행 테스트 (strict=true/false 양쪽)

## Dependencies
T001 → T002 → T003 (순차)
T004 독립
T005, T006은 모든 변경 후
