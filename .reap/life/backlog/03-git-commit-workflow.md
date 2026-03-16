# Git 커밋 타이밍 규칙 정의

## 배경
Growth 진입 시 uncommitted 변경이 대량으로 쌓여있는 상황 발생.
현재 reap-wf에는 커밋 메시지/단위 규칙(conventions.md)만 있고,
"언제 커밋해야 하는가"에 대한 워크플로우 규칙이 없음.

## 필요한 규칙

### Growth 진입 전
- working tree에 uncommitted 변경이 있으면 먼저 커밋 후 진행
- clean state에서 시작해야 rollback 가능

### Growth 중
- 태스크 또는 Phase 완료 시 커밋
- 커밋 단위는 conventions.md의 "한 커밋 = 한 논리적 변경" 준수

### Stage 전환 시
- stage advance 전 반드시 커밋

## 반영 대상
- `src/templates/commands/reap.growth.md` — Growth Gate에 git 상태 확인 추가
- `genome/conventions.md` — 커밋 타이밍 규칙 추가

## 출처
selfview gen-001 Growth 진입 시 발견 (2026-03-17)
