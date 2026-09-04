# Handoff — ms-022 문서 사이트

## 지금 어디까지 왔는가

task 1(`tasks/1-skeleton-and-intro.md`, `gen-0085-exec`) 완료 — worktree `../reap-wt-site`(브랜치 `ms-022-site`)에 커밋 셋으로 남아 있다. `site/` VitePress 골격, 루트 `site:dev`·`site:build` 스크립트, `.github/workflows/docs.yml`, 한국어 네 쪽(`introduction`·`install`·`quick-start`·`concepts`) + `index.md`(홈). `bun run site:build` dead link 0 확인됨.

## 다음에 무엇부터

task 2(`tasks/2-reference-pages.md`) — 레퍼런스 일곱 쪽을 **같은 worktree**(`../reap-wt-site`, 브랜치 `ms-022-site`)에 이어 만든다.

- `skills.md` · `cli.md` · `hooks.md` · `code-index.md` · `orchestrate.md` · `migration.md` · `release-notes.md` — 각 쪽의 내용 범위는 task 2 본문에 있다
- `release-notes.md`는 `RELEASE_NOTES.md`를 include해야 하는데 VitePress의 `<!--@include:-->`는 리포 밖(사이트 소스 트리 밖)을 못 가리킨다 — 빌드 전에 루트 `RELEASE_NOTES.md`를 `site/`로 복사하는 스크립트가 필요하다(`site:build`에 앞서 돌게 배선)
- `site/.vitepress/config.ts`의 nav·sidebar에 이번에 늘어난 쪽을 추가한다. **지금은 task 1의 네 쪽만 들어 있다** — 없는 쪽을 sidebar에 먼저 넣으면 dead link로 빌드가 깨진다
- 끝나면 `bun run site:build` dead link 0, 열두 쪽 전부 sidebar에

## 걸려 있는 것

- **이 milestone은 사람 검수 전까지 닫지 않는다** — task 1·2가 다 끝나도 `mark milestone --closed`를 부르지 않는다. exit criteria의 "사람 검수" 항목이 별도로 남는다
- en·ja·zh-CN·de 확장은 이 milestone 밖(검수 뒤, ms-021 뒤)
