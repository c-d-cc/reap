---
id: gen-0058-exec
slug: index-파서
type: exec
milestone: ms-009
title: 파서를 싣는다 — WASM probe와 스캔
startedAt: 2026-08-30T17:01:18Z
startCommit: 1727399
status: closed
closedAt: 2026-08-30T17:06:49Z
endCommit: 23abc87
---
## Intent

`ms-009` 9.1~9.5 — WASM probe, 파서 싣기, 스캔·그래프, 커밋 단위 갱신, 질의 다섯, 이 리포에 돌린다.

## Outcome

- **probe(9.1)** — `import x from "….wasm" with { type: "file" }`이 `bun build --compile`에 실리고 런타임에 `/$bunfs/…` 경로를 준다. web-tree-sitter 0.22.6 `Parser.init({locateFile})` + `Language.load(path)`. 코드는 버리고 답은 `05-knowledge.md`에
- **`src/index/`** 여섯 — `languages`(문법 15 + scm 질의 번들, 확장자 맵) · `parser`(Extractor, 로드 실패는 기록해 `status`가 냄) · `graph` · `resolve`(JS/TS `./x.js`→`x.ts`, Python 상대 import, 이름 기반 호출 해석 — 재현 가능한 우선순위) · `store`(`.reap/.index/` manifest+gz, refs·specifiers도 저장) · `indexer`(스캔=`git ls-files`, 증분=`git diff --no-renames`, 해석은 항상 전체 패스로 바꿔 끼움, `ready()`가 HEAD 비교 뒤 갱신, impact BFS)
- `reap index [update [--full]|status|impact|search|callers|callees]`. `init`이 `.reap/.index/`를 gitignore에. 테스트 7(증분==전체 재빌드를 고침·삭제·이름변경으로 확인), 163 통과
- **이 리포에 돌렸다** — 파일 26 · 심볼 173 · IMPORTS 72 · CALLS 417 · **해석률 78/79(99%)**. 미해석 하나는 아직 커밋 안 된 `src/index/`를 가리키는 import — 설계대로("커밋 안 된 것은 없다"). `impact src/store.ts` 직접 13·간접 7
- **바이너리 61MB → 89MB.** 언어 15개 전부. Open Question 셋 답함(싣는 방식·15개 다·`ctx`는 안 알림)

## Dead Ends

REAP의 커뮤니티 탐지·프로세스 추적·`EXTENDS`/`IMPLEMENTS` 간선 — spec이 이미 접었다. 여기서도 안 만들었다.

## Notes

REAP 구현을 가져오지 않았다 — 개념(추출/해석 분리, 전체 패스 바꿔 끼우기, `--no-renames`, 해석률 화면에)은 그 리포의 실증에서 왔고 코드는 REAP 크기(약 450줄)로 다시 썼다.
