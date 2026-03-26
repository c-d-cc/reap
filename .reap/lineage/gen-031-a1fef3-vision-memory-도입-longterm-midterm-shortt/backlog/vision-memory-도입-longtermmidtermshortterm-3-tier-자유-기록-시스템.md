---
type: task
status: consumed
consumedBy: gen-031-a1fef3
consumedAt: 2026-03-26T09:43:36.212Z
priority: high
createdAt: 2026-03-26T09:43:03.910Z
---

# Vision Memory 도입 — longterm/midterm/shortterm 3-tier 자유 기록 시스템

## Problem

현재 REAP에서 AI의 경험적 판단, 유저와의 논의 맥락, 세션 간 핸드오프 정보가 저장될 곳이 없음.
- Genome: 수정 제약이 많고 자유로운 기록 불가
- Lineage: 모든 기록을 담지만 나중엔 scan 부담 + 압축으로 소실
- Goals: 미래 목표만, 맥락/경험/판단을 적기엔 부적합
- notes/next-session-prompt.md: 임시방편, 구조화되지 않음

## Solution

`.reap/vision/memory/` 에 3-tier Memory 시스템 도입:

| Tier | 파일 | 수명 | 용도 |
|------|------|------|------|
| longterm | longterm.md | 프로젝트 전체 | 반복 참조할 교훈, 패턴, 결정 배경 |
| midterm | midterm.md | 수 generation | 현재 진행 중인 큰 작업 맥락, 멀티 gen 계획 |
| shortterm | shortterm.md | 1-2 session | 즉시 전달할 맥락, 다음 세션 핸드오프 |

핵심 원칙:
- AI가 언제든 자유롭게 읽기/쓰기 가능 (genome처럼 제약 없음)
- 규칙만 정의하고 내용은 AI 재량
- git에 커밋되어 어떤 agent든 접근 가능
- notes/next-session-prompt.md 를 shortterm memory가 대체

## Files to Change

- `src/core/paths.ts` — memory 경로 추가 (memoryDir, memoryLongterm, memoryMidterm, memoryShortterm)
- `src/core/prompt.ts` — subagent prompt에 shortterm + midterm 로딩
- `src/cli/commands/init/common.ts` — init 시 memory 디렉토리 + 빈 파일 생성
- `src/cli/commands/run/completion.ts` — reflect phase에서 memory 갱신 기회 제공
- `src/templates/reap-guide.md` — Memory 섹션 추가
- `src/adapters/claude-code/skills/reap.knowledge.md` — memory 관련 서브커맨드 추가 고려
- tests 추가
