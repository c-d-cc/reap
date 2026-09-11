---
id: gen-0116-exec
slug: drop-vitepress-cache
type: exec
backlog: bk-0ec03e
title: VitePress 캐시 14개를 추적에서 뺀다
startedAt: 2026-09-11T21:59:21Z
startCommit: 036c707
status: closed
closedAt: 2026-09-11T22:00:29Z
endCommit: ccf384e
---

## Intent

`bk-0ec03e`. 기각된 도구가 남긴 빌드 캐시 14개가 커밋돼 있다. 추적에서 빼고 다시 들어오지 못하게 한다.

끝나는 조건 — `git ls-files site/.vitepress`가 아무것도 내지 않고, 그 경로가 `.gitignore`에 있고, 사이트 빌드와 배포가 그대로 돈다.

## References

- `gen-0093-exec-site-port` — *"VitePress 골격(`.vitepress/`·산출물용 `bun.lock`·`package.json`) 제거"*. 골격은 뺐는데 `cache/`가 추적된 채 남았다
- `.github/workflows/docs.yml:61` — 배포가 올리는 것은 `site/dist/public`이다. `.vitepress/dist`가 아니다
- `package.json:23` — `site:build`는 Vite를 부른다

## 지우기 전에 확인한 것

- 추적된 14개는 전부 `cache/deps/` 아래 의존성 번들과 소스맵이다. `_metadata.json`이 `node_modules/vue`를 가리킨다
- `vitepress`는 루트에도 `site/`에도 의존성으로 없다
- 워크플로·빌드 스크립트·소스 어디도 `.vitepress`를 참조하지 않는다. 참조는 `.reap/` 기록(역사)과 내가 쓴 backlog·게이트뿐이다
- 마지막으로 손댄 커밋은 `666fa90`(2026-09-04), 이식 세대를 닫은 커밋이다 — 남겨진 것이지 쓰이는 것이 아니다

## Outcome

`git ls-files site/.vitepress`가 0을 낸다. `.gitignore`에 `site/.vitepress/`를 넣어 다시 들어오지 못하게 했고, 디렉토리 자체도 지웠다.

사이트 빌드 29쪽과 prerender 검사 여섯이 그대로 통과한다 — 배포가 올리는 것은 `site/dist/public`이므로 영향이 없었다.

낱말 게이트에서 vitepress 예외를 뺐다. 그 경로가 이제 없으므로 예외도 없어야 한다 — 예외가 근거보다 오래 살면 게이트가 헐거워진다.

summary.md: 해당 없음. genome: 해당 없음.

검증 생략 — 추적에서 빼는 것 하나이고, 지우기 전 확인을 위 절에 남겼다.
