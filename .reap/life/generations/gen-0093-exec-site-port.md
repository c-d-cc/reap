---
id: gen-0093-exec
slug: site-port
type: exec
milestone: ms-022
title: 사이트 재구축 — v0.17 문서 앱 디자인 그대로, 내용만 v0.18 (ko)
startedAt: 2026-09-04T02:04:58Z
startCommit: 8e3c344
status: closed
closedAt: 2026-09-04T02:31:31Z
endCommit: c3320ef
---
## Intent

사람 검수(2026-09-04): VitePress 사이트 기각 — 기존 reap.cc 디자인·톤 유지, 내용만 v0.18. `~/cdws/reap_v17/docs/` 앱을 `site/`로 옮기고(VitePress 산출물 제거), 페이지를 v0.18 열둘로, 번역은 ko 하나(검수 전). 기존 `site/*.md`(gen-0085·0088의 한국어 본문)를 내용의 원천으로 쓴다. `docs.yml`은 v0.17 것 승계. 끝은 `bun run site:build`(prerender 포함)가 ko 열두 라우트를 내고, `site:dev`로 띄웠을 때 디자인이 reap.cc와 같다.

## Delegation

brief로 subagent에게. worktree `../reap-wt-site`(브랜치 `ms-022-site-port`).

## Outcome

세 커밋.

- `08052c7` — v0.17 `docs/`(Vite+React+Tailwind+wouter, DocLayout·DocPage·AppSidebar·prerender)를 `site/`로 이식. VitePress 골격(`.vitepress/`·산출물용 `bun.lock`·`package.json`) 제거. 컴포넌트·CSS·테마·레이아웃은 그대로. i18n 기제만 5로케일(en·ko·zh-CN·de·ja)에서 ko 하나로 좁혔다 — `types.ts`의 `LOCALES`·`DEFAULT_LOCALE`, `LanguageSelector`(로케일 하나면 렌더링 안 함), `entry-server.tsx`의 `"en"` 하드코딩 세 곳을 `DEFAULT_LOCALE` 참조로. `attached_assets/favicon_1773735683357.png`(로고, `@assets` 별칭이 참조)도 함께 옮겼다 — 브리핑 목록엔 없었지만 컴포넌트 네 곳이 참조해 못 뺐다.
- `acbf001` — 페이지 열둘(Hero·소개·설치·첫 사용·개념·skill 10종·CLI·hooks·코드 인덱스·orchestrate·v0.17에서 이주·릴리스 노트). 내용은 `site/*.md`(gen-0085·0088, 사람 검수 거친 한국어 본문)와 `RELEASE_NOTES.md`. `routes.ts`·`AppSidebar`를 새 세트로, `i18n/translations/ko.ts`를 `Translations` 타입 기준으로 새로 씀. v0.17 전용 열한 페이지(Lifecycle·Genome·Vision·Environment·Lineage·Backlog·Advanced·DistributedOverview·MergeLifecycle·MergeCommands·SelfEvolving·CommandReference·HookReference·Configuration·Comparison)와 en·zh-CN·de·ja 번역 삭제.
- `4b67cee` — `docs.yml`을 `site/` 경로·bun·ko·열둘에 맞춰 재작성(`main`에서만, `site/**` 변경 트리거). `scripts/check-docs-prerender.{sh,mjs}`를 v0.17에서 가져와 같은 방향으로 조정 — 로케일 하나일 때 언어 셀렉터 검사(`badSelector`·`badActive`)를 건너뛰고, hreflang `x-default`는 `types.ts`의 `DEFAULT_LOCALE`을 읽는다(코드와 검사 스크립트가 같은 파일을 읽어, 하나가 틀리면 둘 다 동의하는 함정을 피했다). README 링크 검사(3b)는 아직 `reap.cc/docs/*`를 링크하는 README가 없어 정보성으로 낮췄다(0건이면 실패가 아니라 건너뜀 로그).

검증: `bun run site:build`(client+SSR+prerender)가 ko 열두 라우트를 `site/dist/public/<route>/index.html`로 냄. `bash scripts/check-docs-prerender.sh` 통과(글로벌 22개 ok, 실패 0). `bun run site:dev`를 5174에서 띄워 `curl /`·`/docs/quick-start` 200 확인(dev는 client-rendered SPA라 본문은 안 실린다 — 한국어 본문 확인은 prerender 산출물에서). `./dist/reap doctor` 결함 0(참고 1, `map.md` 관련— 이 세대와 무관, 기존 상태). `git status --porcelain` 빈 채로 끝남.

`npm ci` 대신 `bun install`이 그대로 됐다 — `site/bun.lock` 생성, `site/package-lock.json`은 아예 만들어지지 않았다(v0.17 `docs/`에 있던 것은 이식 목록에서 뺐다).

## Dead Ends

- 없음. `bun install`이 첫 시도에 됐고, 타입체크 오류 두 건(`detect-locale.ts`의 zh-CN 특수 케이스, `locale-path.ts`의 `LOCALE_PREFIXES` 5로케일 리터럴)은 ko 단일화의 당연한 귀결이라 바로 고쳤다 — 막다른 길이 아니라 예정된 후속 수정.
