# 2 — 패키지 모양

## 손댈 곳

| 파일 | 무엇 |
|---|---|
| `package.json` | name `@c-d-cc/reap` · version `0.18.0` · `private` 삭제 · `bin: { reap: "dist/cli.js" }`(shebang 필요 여부는 probe) · `files: ["dist/"]` · `engines: { node: ">=20" }`(fetch·`AbortSignal.timeout` 기준으로 실측) · scripts `build:node` · `reap.autoUpdateMinVersion` 유지 · `repository`·`homepage`·`license` |
| `plugin/.claude-plugin/plugin.json` | version 0.18.0 |
| `.gitignore` | dist/ 유지 |
| `.reap/environment/summary.md` | 빌드 절에 `bun run build:node`와 산출물 |

## 함정

- `bin`이 가리키는 파일에 실행 비트와 `#!/usr/bin/env node`가 필요하다. `bun build`가 shebang을 보존하는지 확인 — 안 하면 빌드 스크립트가 붙인다
- wasm 15개는 `files`에 들어가야 한다. `npm pack --dry-run`으로 목록·크기를 실측하고 summary.md에 적는다
- `web-tree-sitter`는 런타임 의존이다 — 번들에 인라인되는지, `dependencies`로 남겨야 하는지 probe가 답한다. 인라인되면 `dependencies`를 비운다

## 완료 판정

- `npm pack` → 임시 prefix에 `npm i -g <tgz>` → `PATH`에서 Bun을 뺀 채 `reap --version`이 `reap 0.18.0`
- `npm pack --dry-run` 목록에 `src/`·`tests/`·`plugin/`이 없다
