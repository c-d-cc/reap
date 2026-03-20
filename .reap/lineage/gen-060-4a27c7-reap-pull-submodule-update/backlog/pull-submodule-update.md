---
type: task
status: consumed
consumedBy: gen-060-4a27c7
---
# reap.pull에서 git submodule update 자동 실행

reap.pull의 merge 단계(또는 fast-forward) 후 `git submodule update --init`을 자동 실행해야 함.
현재는 submodule 포인터만 업데이트되고 working tree는 이전 커밋을 가리키는 문제가 있음.

수정 대상: `src/templates/commands/reap.pull.md` — merge/fast-forward 후 submodule update 단계 추가
