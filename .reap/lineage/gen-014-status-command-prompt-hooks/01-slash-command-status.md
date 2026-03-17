---
type: task
priority: medium
title: "/reap.status slash command 추가"
---

## 현재 동작
- `reap status` CLI 명령은 있지만 기본 정보만 표시 (project name, entry mode, generation id/goal/stage, completed count)
- AI 에이전트가 세션 중간에 현재 상태를 빠르게 확인할 방법이 없음

## 개선 방향
- `/reap.status` slash command 추가
- CLI `reap status`보다 더 풍부한 정보 제공 (AI 에이전트가 읽고 판단할 수 있도록):
  - 현재 Generation ID + goal
  - 현재 stage + 진행 상태
  - 작업 진행 내용 요약 (현재 stage artifact에서 추출)
  - backlog 항목 수 (genome-change / environment-change / task 각각)
  - timeline (stage 전환 이력, regression 포함)
  - 특이사항 (deferred tasks, regression 이력, genome health 경고 등)
  - Genome version
  - 완료된 generation 수

## 구현
- `src/templates/commands/reap.status.md` 프롬프트 파일 추가
- init.ts의 COMMAND_NAMES에 `reap.status` 추가
- 프롬프트 내용: current.yml 읽기 → 현재 stage artifact 읽기 → backlog 카운트 → timeline 출력 → 특이사항 플래그

## 변경 파일
- `src/templates/commands/reap.status.md` (신규)
- `src/cli/commands/init.ts` — COMMAND_NAMES에 추가

## 문서 업데이트
- `README.md` / `README.ko.md` — slash commands 테이블에 `/reap.status` 추가
- `docs/src/pages/WorkflowPage.tsx` — Stage Commands 테이블에 추가
- `docs/src/pages/HeroPage.tsx` — CLI Quick Reference 테이블에 추가
- `src/templates/hooks/reap-guide.md` — Execution Flow에 `/reap.status` 언급 추가
