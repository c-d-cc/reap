# 1 — node 호환

## 손댈 곳

| 파일 | 무엇 |
|---|---|
| `src/plan.ts` | `Bun.YAML.parse(text)` → sources.yml 전용 손 파서. 쓰기 형식(같은 파일의 `writeSources`)이 내는 모양만 읽으면 된다: `sources:` 아래 `  - id:` 블록, 필드 4개(id·root·role·convention), 값은 한 줄 스칼라 |
| `src/orch.ts` | `Bun.sleepSync(10)` → `Atomics.wait`(SharedArrayBuffer) 또는 busy-wait 없는 대안; `await Bun.sleep(ms)` → `new Promise(r => setTimeout(r, ms))` |
| `src/index/languages.ts` · `parser.ts` | `with { type: "file" }` 임포트 경로가 node 번들에서 cwd 상대로 풀린다. 번들 파일 위치(`import.meta.url` 또는 `__dirname`) 기준 절대 경로로 바꾼다. Bun 컴파일 바이너리에서도 같은 코드가 돌아야 한다 — 두 런타임에서 그 값이 무엇인지 probe로 확인하고 테스트에 고정 |

## 함정

- `bun build --target=node`의 출력이 ESM인지 CJS인지에 따라 `import.meta.url`/`__dirname` 중 하나만 있다. probe 보고가 답한다
- `tests/`가 Bun 런타임이라 node 경로는 `bun test`가 못 본다 — node 번들을 만들어 실제로 `node dist/cli.js doctor`를 도는 스크립트 검사(`tests/node-bundle.test.sh` 또는 `bun test` 안에서 `spawnSync("node", ...)`)를 둔다
- 손 파서가 못 읽는 sources.yml(사람이 손으로 고친 것)은 **에러로 말한다** — 조용히 빈 목록을 내면 `--ref` 검증이 전부 실패한다

## 완료 판정

- node로 `plan sources`·`orch claim x && orch release x`·`index update && index status`가 리포 복사본에서 성공
- `bun test` 초록, 새 테스트가 손 파서의 왕복(쓰기→읽기 동일)과 깨진 파일의 에러를 덮는다
