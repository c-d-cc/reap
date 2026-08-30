---
id: gen-0001-exec
slug: 저장소-레이아웃과-init
type: exec
milestone: ms-001
title: 저장소 레이아웃과 reap init
startedAt: 2026-08-22T15:33:07Z
startCommit: bd5509d
status: closed
closedAt: 2026-08-22T15:39:44Z
endCommit: 6ec278b
---

## Intent

`src/`가 비어 있다. 이 세대는 REAP 바이너리의 바닥 — 프로젝트 뼈대(`package.json`·bun·tsconfig)와 Task 1.1의 다섯 모듈(`cli.ts`·`store.ts`·`git.ts`·`templates.ts`) — 을 세우고 `reap init`이 실제로 도는 데까지 간다.

**끝나는 지점:** `bun test` 통과 · `bun run typecheck` 오류 0 · `bun run build`로 만든 **바이너리**로 빈 git 리포에서 `init`을 돌렸을 때 [저장 구조](../../../docs/superpowers/specs/reap/03-storage.md)의 디렉토리가 전부 생기고 `genome/application.md`가 비어 있지 않다.

Task 1.2(`id`·`doc`·`make`·`mark`)와 1.3·1.4는 이 세대에 넣지 않는다. 템플릿 번들링이 컴파일된 바이너리에서 실제로 되는지가 이 증분 전체의 갈림길이고, 그것을 먼저 답한다.

## References

- ms-001 Task 1.1 — 공개 인터페이스, 증명해야 할 동작, 함정
- [저장 구조](../../../docs/superpowers/specs/reap/03-storage.md) — 디렉토리 레이아웃과 config
- [명령](../../../docs/superpowers/specs/reap/04-commands.md) — `init`의 계약

## Outcome

Task 1.1 완료. `bun test` 25개 통과 · `bun run typecheck` 오류 0 · 컴파일 바이너리로 빈 git 리포에서 `init`이 돌고 디렉토리 18개와 지식 씨앗 6개가 생긴다.

- 프로젝트 뼈대: `package.json`(test/typecheck/build) · `tsconfig.json` · `src/text-modules.d.ts`
- `git.ts` — 모든 git 호출을 null/false로 접어 부르는 쪽이 분기를 갖지 않는다
- `store.ts` — `findRoot` · `paths` · `workspaceId` · config · 세션 · `writeFileAtomic`, 그리고 `DIRS`/`SEEDS`
- `templates.ts` + `src/templates/` 9개 — 프로젝트 오버라이드가 번들을 이긴다
- `cli.ts` — `run(argv, cwd) → Result`, `init [--force]`

**해소된 질문 — 템플릿 번들링.** `import x from "./a.md" with { type: "text" }`가 `bun run`과 `bun build --compile` 양쪽에서 UTF-8 그대로 동작한다(probe). 문자열 상수로 둘 필요가 없어졌고, 증분 1의 갈림길이었던 부분이 닫혔다.

**남은 것:** Task 1.2(`id`·`doc`·`make`·`mark`) → 1.3(`ctx`) → 1.4(플러그인·훅).

## Notes

세션 바인딩 형식(`.session`)은 `store.ts`가 정했지만 아직 아무도 부르지 않는다 — `make generation`(Task 1.2)이 첫 호출자다.
