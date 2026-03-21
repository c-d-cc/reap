---
type: task
status: pending
---

# completion: consume/archive/commit을 genome 이후 자동 실행

## 현상
- completion이 4개 phase로 분리: retrospective → genome → consume → archive
- consume, archive는 deterministic 작업인데 AI가 별도 호출해야 함
- 불필요한 phase 전환으로 UX 저하

## 기대 동작
- retrospective → AI가 artifact 작성 (creative)
- genome → AI가 genome 변경 검토 (creative)
- genome 완료 후 consume → archive → commit 자동 실행 (deterministic, 한번에)

## 관련 코드
- `src/cli/commands/run/completion.ts:97-160` — consume, archive phases
