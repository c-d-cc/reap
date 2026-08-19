---
type: task
status: pending
priority: low
createdAt: 2026-08-19T12:44:49.096Z
---

# sort -V 는 prerelease 를 역전시킨다 — 릴리즈 문서 게이트의 네 번째 비교기

## Problem

gen-085 는 TypeScript 안의 version 비교를 `src/core/semver.ts` 하나로 통합했다. 그러나 **bash 에 네 번째 비교기가 있다** — `scripts/check-docs-version.sh` 가 `sort -V` 로 비교한다.

`sort -V` 는 방금 TS 에서 고친 것과 **같은 prerelease 역전**을 갖는다. 실측:

```
$ printf '0.17.5\n0.17.5-alpha.9\n' | sort -V | tail -1
0.17.5-alpha.9
```

SemVer 규격상 `0.17.5-alpha.9 < 0.17.5` 인데 `sort -V` 는 alpha 를 위로 올린다.

**현재 실피해는 없다** — 이 게이트는 태그(정식 버전)에서만 돌고 migration note 파일명은 `^v\d+\.\d+\.\d+\.md$` 로 prerelease 를 애초에 거부한다. 그러나 gen-085 의 완료 기준 1이 주장한 "저장소에 비교 구현이 하나뿐"은 **TypeScript 한정**이며, 그 사실이 어디에도 적혀 있지 않다.

## Solution

두 방향.

- **(A) 명시만 한다** — `check-docs-version.sh` 주석에 "`sort -V` 는 prerelease 를 역전시킨다. 이 게이트는 정식 버전에서만 돌므로 무해하다"를 적고, 태그가 prerelease 일 수 있게 되는 날 다시 본다. 비용 0.
- **(B) node 로 옮긴다** — `src/core/semver.ts` 를 `node -e` 로 호출해 bash 가 자체 비교를 하지 않게 한다. 게이트가 빌드 산출물에 의존하게 되는 트레이드오프가 생긴다(현재는 소스만 읽는다).

(A) 를 먼저 하고, alpha 태그로 문서 게이트를 돌릴 일이 생기면 (B).

## Files to Change

- `scripts/check-docs-version.sh` — `locale_versions` / migration note 비교 3곳
- `.reap/genome/application.md` 또는 environment — "비교기 하나" 주장의 범위 명시
