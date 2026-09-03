---
id: gen-0076-exec
slug: hooks-runner
type: exec
milestone: ms-017
title: 훅 실행기와 make hook — 파싱·조건·실행·템플릿
startedAt: 2026-09-03T14:44:37Z
startCommit: 1a3ba0c
status: open
---
## Intent

ms-017 task 1 — `src/hooks.ts`(listHooks·runHooks), `make hook`(여섯 이벤트만), 템플릿 셋(hook-md·hook-sh·condition-always). 끝은 tasks/1-runner-and-make.md의 완료 판정: 파싱·정렬·조건·실행·실패 비throw·이벤트 거부를 테스트가 덮고 `bun test` 전체 초록. 발화(task 2)는 이 세대가 아니다.

수행: worktree `../reap-wt-hooks`(브랜치 `ms-017-hooks`)에서 subagent가 한다. 주 세션은 조율만.

## Outcome

- `src/hooks.ts`: `HOOK_EVENTS`(여섯)·`isHookEvent` · `listHooks(root, event)` · `runHooks(root, event, ctx, options)`.
  `.md`는 `doc.ts`의 `parseDoc`을 그대로 재사용해 frontmatter를 읽는다(YAML 파서를 새로 안 만든다).
  `.sh`는 첫 줄부터 `# condition:` · `# order:` 주석을 정규식으로 훑는다. 둘 다 없으면 `always`·50.
  order 오름차순, 동률은 `file.localeCompare`.
- `runHooks`는 조건 판정(`always`는 스크립트 없이 통과, 그 외엔 `hooks/conditions/<c>.sh`의 종료 코드 0) →
  `.sh`는 `spawnSync("bash", [file], { cwd: root, timeout, env })`로 stdout 수집, `.md`는 frontmatter를
  벗긴 본문 그대로. 실패(조건 스크립트 없음·조건 비0·훅 exit≠0·timeout)는 전부 `failures`로 가고
  **throw하지 않는다** — `spawnSync`의 `result.error.code === "ETIMEDOUT"`을 timeout 판정에 쓴다(probe로 확인,
  `/tmp/probe_timeout.ts`, Bun 1.3.10에서 실측). 타임아웃·조건타임아웃 둘 다 `options`로 주입 가능.
- `src/entries.ts`의 `makeHook`: 이벤트를 `isHookEvent`로 거부, `--name`은 `/^[a-zA-Z0-9_-]+$/`,
  `--type`은 `md`(기본)·`sh`, 파일이 이미 있으면 거부, `.sh`는 `chmodSync(0o755)`.
  템플릿은 `templates.ts`의 `render`로 `{{condition}}`·`{{order}}`를 채운다 — 프로젝트 오버라이드
  (`.reap/templates/hook-md.md`)가 자동으로 먹힌다(기존 `template()` 함수 그대로 재사용).
- `src/cli.ts`: usage에 `make hook` 줄, `make()`에서 `--title` 검사보다 앞서 `hook` kind를 가로챈다
  (plan-source와 같은 자리 — hook은 제목이 아니라 event·name으로 조립된다).
- 템플릿 셋: `src/templates/hook-md.md`(빈 frontmatter+본문) · `hook-sh.sh`(`set -u`) · `condition-always.sh`
  (`exit 0`). `templates.ts`의 BUNDLED에 세 개 추가, `text-modules.d.ts`에 `*.sh` 선언 추가.
  기존 `tests/templates.test.ts`의 `REQUIRED` 목록이 `BUNDLED` 키와 정확히 일치해야 해서 세 이름을 더했다.
- 테스트 `tests/hooks.test.ts` 17개: 파싱(md·sh 양쪽, 기본값), order 정렬(동률 파일명순), 다른 이벤트
  파일 안 섞임, 조건 참/거짓/스크립트없음, `.sh` stdout·env(`REAP_HOOK_EVENT`·`REAP_HOOK_ID`) 전달,
  `.md` 본문 반환, exit 1·timeout이 failures로 가고 안 던짐, 여러 훅의 order 순서 실행, `make hook`의
  모르는 이벤트 거부·중복 파일 거부·기본 type=md·`--type sh`+실행비트·프로젝트 템플릿 오버라이드.
- 검증: `bun test` 189 pass(기존 172 + 신규 17), `bun run typecheck` 0, `bun run build` 후
  `./dist/reap make hook`(인자 없음·모르는 이벤트) 둘 다 한국어 오류로 거부, 임시 프로젝트에서
  `make hook --event gen.made --name review`와 `--type sh --condition has-changes --order 5` 둘 다
  실제로 파일을 놓고 실행 비트가 서는 것 확인.

## Dead Ends

- 없음.
