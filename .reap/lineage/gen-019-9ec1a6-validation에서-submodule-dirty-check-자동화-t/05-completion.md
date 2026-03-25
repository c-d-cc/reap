# Completion — gen-019-9ec1a6

## Summary
submodule dirty check를 completion commit + push에 스크립트 로직으로 삽입. prompt 의존이 아닌 강제 차단.

### Changes
- git.ts: checkSubmoduleDirty()
- completion.ts: commit 전 dirty check → emitError
- push.ts: push 전 dirty check → emitError
- git-submodule.test.ts: 5 unit tests

## Lessons Learned
- prompt로 안내해도 subagent가 빠뜨리는 것은 스크립트 로직으로 강제해야 함. 이번 gen-019 자체가 그 증거 — subagent가 또 submodule commit을 누락했지만 다음부터는 completion에서 차단됨.
