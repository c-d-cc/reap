# G1 — npm(node) 배포 패키지

실측은 2026-09-03 probe(scratchpad 복사본, 원본 무수정). 아래 수치는 전부 그 실측이다.

## 결정 — npm이 0.18.0의 1차 채널이다

ps-4f2a91 `08-delivery.md`는 단일 바이너리(brew/curl)를 배포 형태로 정하고 "npm 배포는 선택"이라 했다. 0.17.8 다리와 upgrade agent는 `npm i -g @c-d-cc/reap@next`를 전제한다. 둘 다 참이려면 **0.18.0은 npm으로 나가고, 바이너리(brew/curl)는 그 뒤의 채널**이다. 이것은 방향 전환이 아니라 순서다 — spec이 npm을 배제하지 않았고, npm 문제의 원인(설치 스크립트)은 postinstall 없는 순수 JS 번들에는 없다.

- 패키지 이름 `@c-d-cc/reap`, 버전 `0.18.0`, `private` 제거, `reap.autoUpdateMinVersion: "0.18.0"` 유지
- 엔트리는 `bun build --target=node`가 낸 번들. Bun 전용 API(`Bun.YAML`·`Bun.sleep`)를 node에서도 도는 것으로 바꾼다 — 소스는 하나이고 Bun 컴파일 바이너리도 같은 소스에서 나온다
- tree-sitter wasm 15개(약 28MB)는 패키지에 싣고 번들 위치 기준으로 찾는다
- `postinstall` 없음. 설치는 파일 복사뿐이다
- `plugin/`은 패키지에 싣지 않는다 — 플러그인은 마켓플레이스가 설치한다. `--plugin-dir` 개발용은 리포에서 한다

## 실측 — 무엇을 고치면 node에서 도는가

세 파일뿐이다. 그 밖의 `Bun.` 참조는 리포에 없다(grep). `with { type: "text" }` 템플릿 임포트는 node 번들에 문자열로 인라인된다.

| 파일 | 막던 것 | 실측한 대체 |
|---|---|---|
| `src/plan.ts` | `Bun.YAML.parse` | sources.yml 전용 손 파서 — `writeSources`가 내는 고정 형식(`  - id:` / `    root:` / `    role:` / `    convention:`)만 읽는다. 기존 `plan.test.ts`의 손으로 쓴 파일 케이스도 통과. **의존 추가 없음** |
| `src/orch.ts` | `Bun.sleepSync` · `Bun.sleep` | `Atomics.wait`(SharedArrayBuffer, node 메인 스레드에서 200ms→204ms 실측) · `setTimeout` Promise |
| `src/index/languages.ts` | `type: "file"` wasm 경로가 node 번들에서 cwd 상대 문자열 | `import.meta.url` 기준 `resolveWasm()` — Bun 컴파일은 이미 절대 가상 경로(`/$bunfs/…`)라 `isAbsolute` 분기로 둘 다. 리포 밖 cwd에서 `index update` 35파일·해석률 100% |

수정 뒤 `bun test` 172 통과 · `bun build --compile` 89.5MB 그대로.

## 번들과 패키지

- `bun build --target=node --banner="#!/usr/bin/env node"` → **ESM** 234KB + wasm 15개 27MB. shebang은 banner로 들어간다(후처리 불필요). ESM이므로 `package.json`에 `"type": "module"`
- `npm pack`: 18파일, **tarball 2.7MB · unpacked 28.3MB**. 임시 prefix에 `npm i -g <tgz>` 후 `reap --version`·`doctor` 정상 — `npm i -g @c-d-cc/reap@next` 흐름 재현
- 산출물 위치는 `dist/node/`(리포 gitignore 안) — bin `dist/node/reap.js`, wasm이 같은 디렉토리에 있어야 한다
- `engines.node`는 실측 API(node:fs·path·url·Atomics.wait)로는 낮아도 되지만 검증한 것은 현재 node뿐 — **`>=20`**으로 적는다(upgrade agent가 `fetch`를 쓰는 0.17.8과 같은 선)

```json
{ "name": "@c-d-cc/reap", "version": "0.18.0", "type": "module",
  "bin": { "reap": "dist/node/reap.js" }, "files": ["dist/node"],
  "engines": { "node": ">=20" }, "reap": { "autoUpdateMinVersion": "0.18.0" } }
```

## 남은 위험 (이 milestone 밖)

- wasm 27MB가 항상 실린다. 언어별 지연 로드는 별도 설계 — 필요 신호가 오면 backlog
- `plugin/`은 npm에 싣지 않는다 — 플러그인은 `reap setup`이 `claude` CLI로 설치한다(Q6, gen-0104). postinstall은 쓰지 않는다
