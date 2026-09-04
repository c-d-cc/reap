# Handoff — ms-022 문서 사이트

## 사람 검수 대기

task 1·2가 모두 끝났다. worktree `../reap-wt-site`(브랜치 `ms-022-site`)에 열두 쪽이 있다.

- **시작하기(4)** — `introduction`·`install`·`quick-start`·`concepts`(task 1, `gen-0085-exec`)
- **레퍼런스(6)** — `skills`·`cli`·`hooks`·`code-index`·`orchestrate`·`migration`(task 2, `gen-0088-exec`)
- **릴리스 노트(1)** — `release-notes`(루트 `RELEASE_NOTES.md`를 빌드 전 복사해 include, task 2)
- `index.md`(홈)

`bun run site:build` dead link 0, `site/.vitepress/config.ts`의 nav·sidebar에 열두 쪽 전부(시작하기 넷 / 레퍼런스 여섯 / 릴리스 노트). `./dist/reap doctor` 결함 0.

**이 milestone은 사람 검수 전까지 닫지 않는다.** exit criteria의 "사람 검수" 항목이 이 handoff와 별도로 남아 있다.

## 검수 뒤

en 확장(ms-021 뒤) — 이 milestone 밖. `.github/workflows/docs.yml`은 `main` push의 `site/**` 변경에서만 돈다. v0.18 브랜치·`ms-022-site`에서는 돌지 않는다 — 발행은 사람이 `main`으로 병합한 뒤다.
