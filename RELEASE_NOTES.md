## What's New

- **/reap.config**: 설정 확인 전용 커맨드 — AI 추론 없이 즉시 출력
- **auto-report on error**: `reap run` 중 예상치 못한 에러 시 자동 `gh issue create`
- **config backfill**: `reap init` 모든 필드 명시, `reap update` 시 누락 필드 자동 채우기
- **AI migration agent**: `reap update` 시 구조 gap 감지 → AI migration prompt
- **REAP MANAGED strip**: archiving 시 artifact의 관리 헤더 자동 제거
- **CLAUDE.md integration**: init/update 시 `.claude/CLAUDE.md`에 REAP 섹션 추가
- **help/config 개선**: status ok + formatted message (AI 추론 불필요), REAP 소개 문구, topic 목록 전체 표시

## Generations

- **gen-100-54bde0**: auto-report + /reap.config + config backfill
- **gen-101-c88beb**: AI migration agent + REAP MANAGED 헤더 strip
- **gen-102-95708b**: CLAUDE.md REAP 룰 + README/docs 갱신
