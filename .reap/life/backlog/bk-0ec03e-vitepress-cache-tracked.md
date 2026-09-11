---
id: bk-0ec03e
slug: vitepress-cache-tracked
type: fix
title: site/.vitepress/cache 14개가 커밋돼 있다 — VitePress는 기각된 도구다
createdAt: 2026-09-11T21:42:08Z
status: open
---

`git ls-files site/.vitepress` 가 14개를 낸다 — `cache/deps/` 아래 VitePress가 만든 의존성 번들과 소스맵이다.

**VitePress는 쓰지 않는다.** 사람이 2026-09-04에 기각했고 사이트는 Vite + 자체 라우팅으로 돌아간다. `site/package.json`·`package.json` 어디에도 vitepress가 없다. 즉 이것은 **기각된 도구가 남긴 빌드 캐시가 커밋된 것**이다.

2026-09-12 개명 작업에서 비워둔 낱말을 리포 전체로 훑다가 드러났다 — 저 번들 안의 자바스크립트가 그 낱말을 쓴다. 그것 자체는 무해하지만, **빌드 산출물이 추적되고 있다는 사실**이 본래 문제다.

할 일 — `git rm -r --cached site/.vitepress` 하고 `.gitignore`에 넣는다. 지우기 전에 정말 아무 데서도 안 쓰는지 한 번 더 본다(내가 만든 것이 아니라 지우는 것은 사람의 결정이다).
