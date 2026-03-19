---
type: task
priority: high
title: "REAP hooks에 prompt 타입 지원 추가 + 문서 자동 업데이트 hook 등록"
---

## 현재 동작
- hooks는 `command: string` (shell command)만 지원
- AI 에이전트가 판단해야 하는 작업(문서 동기화 등)은 hook으로 처리 불가

## 개선 방향

### 1. hooks에 prompt 타입 추가
- `ReapHookCommand` 타입 확장:
  ```typescript
  interface ReapHookCommand {
    command?: string;   // shell command 실행
    prompt?: string;    // AI 에이전트에게 지시
  }
  ```
- command와 prompt 중 하나만 사용 (둘 다 있으면 에러)
- prompt 타입 hook은 AI 에이전트가 해당 지시를 읽고 실행
- slash command 프롬프트(reap.next.md 등)에서 hook 실행 시 prompt 타입 처리 지시 추가

### 2. reap 프로젝트에 문서 업데이트 hook 등록
- `.reap/config.yml`에 onGenerationComplete hook 추가:
  ```yaml
  hooks:
    onGenerationComplete:
      - command: "~/.bun/bin/bun run src/cli/index.ts -- update"
      - prompt: |
          이번 Generation에서 변경된 기능/CLI/slash commands를 파악하고,
          README.md, README.ko.md, src/templates/hooks/reap-guide.md,
          docs/src/pages/ 의 관련 문서 페이지를 업데이트하라.
          변경 없으면 skip.
  ```

## 변경 파일
- `src/types/index.ts` — ReapHookCommand에 prompt 필드 추가
- `src/templates/commands/reap.next.md` — hook 실행 시 prompt 타입 처리 지시
- `src/templates/commands/reap.start.md` — 동일
- `src/templates/commands/reap.back.md` — 동일
- `src/templates/hooks/reap-guide.md` — hooks 설명에 prompt 타입 추가
- `.reap/config.yml` — 문서 업데이트 prompt hook 등록

## 문서 업데이트
- `README.md` / `README.ko.md` — hooks 섹션에 prompt 타입 예시 추가
- `docs/src/pages/WorkflowPage.tsx` — hooks 설명에 prompt 타입 추가
