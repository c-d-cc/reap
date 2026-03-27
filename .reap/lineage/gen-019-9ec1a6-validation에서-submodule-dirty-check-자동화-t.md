---
id: gen-019-9ec1a6
type: embryo
goal: "validation에서 submodule dirty check 자동화 — tests/ commit 누락 방지"
parents: ["gen-018-52c4cd"]
---
# gen-019-9ec1a6
submodule dirty check를 completion commit + push에 스크립트 로직으로 삽입. prompt 의존이 아닌 강제 차단.

### Changes
- git.ts: checkSubmoduleDirty()
- completion.ts: commit 전 dirty check → emitError
- push.ts: push 전 dirty check → emitError
- git-submodule.test.ts: 5 unit tests