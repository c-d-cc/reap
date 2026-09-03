# 1 — 훅 실행기와 make hook

## 손댈 곳

| 파일 | 무엇 |
|---|---|
| `src/hooks.ts` (신규) | `listHooks(root, event)` — `.reap/hooks/`에서 `{event}.{name}.{md|sh}` 파싱(frontmatter/주석의 condition·order) · `runHooks(root, event, ctx)` — 조건 판정 → order 정렬 → `.sh` 실행(`spawnSync("bash", [file], { cwd: root, timeout: 60_000, env: {...process.env, REAP_HOOK_EVENT, REAP_HOOK_ID} })`) / `.md` 본문 반환 → `{ outputs: string[], failures: {file, reason}[] }` |
| `src/entries.ts` 또는 신규 | `makeHook(opts)` — 이벤트 검증(여섯), 파일명 조립, 템플릿(`src/templates/hook-md.md`·`hook-sh.sh`) 복사, `--condition`·`--order`를 머리에 기록 |
| `src/cli.ts` | usage에 `make hook` 줄, 디스패치 |
| `src/templates/` | `hook-md.md`(frontmatter `condition: always` / `order: 50` + 빈 본문) · `hook-sh.sh`(`# condition:` `# order:` 주석 + `set -u`) · `condition-always.sh` |
| `src/templates.ts` | BUNDLED에 추가 |

v0.17 참고: `~/cdws/reap_v17/src/core/hooks.ts` (파싱·조건·실행 구조), `src/templates/hooks/conditions/*.sh`. 옮겨 적지 말고 v0.18의 파일 규약(spec 07)대로 다시 쓴다.

## 함정

- `.md` 메타는 YAML frontmatter, `.sh`는 `# condition:`·`# order:` 주석 — 둘의 기본값(`always`·50)이 같아야 한다
- 조건 스크립트 경로는 `hooks/conditions/<name>.sh`. 없으면 **그 훅을 건너뛰고 failures에 적는다** (doctor가 결함으로 잡는 것과 별개)
- 타임아웃으로 죽은 `.sh`는 failures에 "timeout"으로

## 완료 판정

- 테스트: 파싱(양쪽 메타), order 정렬·동률 파일명순, 조건 0/비0, `.sh` stdout 수집, `.md` 본문 반환, `exit 1`·timeout이 failures로 가고 throw하지 않음, `make hook`이 모르는 이벤트를 거부
