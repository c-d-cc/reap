---
id: gen-063-fa6a5d
type: normal
parents:
  - gen-062-b81b66
goal: reap init adoption/migration 시 자동 genome sync
genomeHash: e0722b95f18f
startedAt: 2026-03-20T06:48:41Z
completedAt: 2026-03-20T06:51:40Z
---

# gen-063-fa6a5d
- **Goal**: reap init adoption/migration 시 자동 genome sync
- **Result**: PASS
- **Key Changes**: genome-sync.ts 모듈 추가, init에서 adoption/migration 시 자동 호출

## Objective
reap init adoption/migration 시 자동 genome sync

## Completion Conditions
1. `reap init --entry adoption`에서 기존 코드를 스캔하여 genome 파일을 자동 생성한다
2. `package.json`, `tsconfig.json`, lint 설정, 디렉토리 구조 등에서 tech stack/conventions/constraints를 추론한다
3. greenfield 모드에서는 기존 동작 유지 (빈 템플릿)
4. `bun test` 통과, `bunx tsc --noEmit` 통과, `npm run build` 성공
