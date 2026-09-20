---
id: bk-7696f1
slug: spec-anchor-check
type: structure
title: spec 안의 앵커 링크를 아무도 검사하지 않는다
createdAt: 2026-09-20T22:57:32Z
status: open
---

`gen-0123-exec`의 독립 검증이 발견했다. `ps-4f2a91` 안에 문서 간 **앵커 링크**가
그 세대에서 처음 둘 생겼다 —

- `07-orchestrate.md` → `02-flow.md#닫은-다음--이어받는-것이-다음-세션이라고-전제하지-않는다`
- `02-flow.md` → `07-orchestrate.md#hooks`

둘 다 지금은 맞는다(검증에서 슬러그를 재현해 대조했다). 문제는 **둘 중 어느 제목을
고쳐도 링크가 조용히 죽는다**는 것이다. `doctor`는 `.reap/` 안의 상대 링크를 보고
`check-docs-surface.sh`는 이름이 등장하는지만 본다 — plan source 안의 앵커는 아무도
안 본다.

할 일 — 검사할 자리를 정한다. `doctor`가 plan source까지 보는 것이 맞는지, 아니면
`scripts/`의 게이트 하나인지가 먼저다. 앵커가 둘뿐인 지금은 값이 작지만, 늘어난 뒤에
깨진 것을 발견하면 어디서부터 틀렸는지 알 수 없다.
