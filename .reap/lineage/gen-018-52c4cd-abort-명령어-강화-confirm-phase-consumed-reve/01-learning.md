# Learning — gen-018-52c4cd

## Source Backlog

**abort-명령어-강화-v015-패턴-복원.md** (priority: high)

v0.16 abort가 확인 없이 바로 삭제하는 문제. v0.15에서 있던 핵심 기능을 복원:
1. 사용자 확인 (confirm phase) 없음
2. abort reason 기록 없음
3. 소스 코드 처리 없음 (git diff 확인 → rollback/stash/hold)
4. 진행 상황 backlog 저장 없음
5. consumed backlog revert 없음 (revertBacklogConsumed)

## Project Overview

REAP는 생물학적 진화 모델 기반의 자기진화형 개발 파이프라인 CLI 도구. TypeScript + Bun 빌드, 단일 번들 배포. v0.16.0 브랜치에서 작업 중.

## Key Findings

### 현재 abort.ts 구조 (`src/cli/commands/run/abort.ts`)
- 33줄, 단일 phase. `execute(paths: ReapPaths)` 시그니처
- 확인 없이 바로 life/ 디렉토리 정리 (backlog만 보존)
- consumed backlog revert 없음

### run/index.ts handler 시스템
- `STAGE_HANDLERS` 타입: `(paths, phase?, extra?) => Promise<void>`
- abort는 현재 paths만 사용하지만 타입상 phase/extra도 받을 수 있음
- extra는 `options.feedback || options.reason || options.goal`로 전달됨
- abort에서 reason, source-action, save-backlog를 모두 받으려면 extra 전달 방식 확장 필요

### CLI 옵션 (cli/index.ts)
- `run <stage>` 커맨드에 `--phase`, `--goal`, `--type`, `--parents`, `--feedback`, `--reason`, `--backlog` 옵션 존재
- `--source-action`, `--save-backlog` 추가 필요

### backlog.ts
- `scanBacklog`, `consumeBacklog`, `createBacklog` 함수 존재
- `revertBacklogConsumed` 함수 없음 — 추가 필요
- consumed 상태: frontmatter에 `status: consumed`, `consumedBy: genId`, `consumedAt: timestamp`

### 참조 패턴: completion.ts
- 4-phase 구조, phase 분기는 if문
- `emitOutput({ status: "prompt" })` 으로 사용자에게 안내 후 다음 명령 제시

## Previous Generation Reference

gen-017-b9f06b에서 restart를 제거하고 abort로 통합 완료. 이번 세대에서 abort를 강화.

## Technical Deep-Dive

### extra 파라미터 전달 전략

run/index.ts의 extra는 단일 string (`options.feedback || options.reason || options.goal`). abort에서 여러 옵션이 필요하므로:

**방법**: abort 분기에서 options 전체를 JSON으로 extra에 전달. abort handler 내부에서 JSON.parse하여 사용. 기존 handler 시그니처 변경 불필요.

```
// run/index.ts
if (stage === "abort") {
  extra = JSON.stringify({ reason: options.reason, sourceAction: options.sourceAction, saveBacklog: options.saveBacklog });
}
```

### revertBacklogConsumed 구현 방향

scanBacklog로 전체 조회 → consumedBy === genId인 항목 필터 → frontmatter에서 consumedBy/consumedAt 제거, status를 pending으로 변경.

### save-backlog 구현 방향

abort 시 진행 상황을 `aborted-{genId}.md`로 backlog에 저장. createBacklog 패턴 활용.

## Context for This Generation

- **Clarity Level**: High — backlog가 매우 구체적이고 변경할 파일과 구현 방향이 명확
- **Generation Type**: embryo
- **변경 파일**: abort.ts, backlog.ts, run/index.ts, cli/index.ts, reap.abort.md, tests/e2e/abort.test.ts
- **Pending Backlog**: 2건 (claude-md-migration, npx-install-support) — 이번 goal과 무관
