# Handoff — ms-023 완료 대조와 사람이 할 것

gen-0091-exec가 task 2를 worktree `../reap-wt-tests`(브랜치 `ms-023-tests`)에서 끝냈다. 세대는 닫지 않았다 — merge·push는 사람의 결정.

## Exit Criteria 대조표

| # | 기준 | 상태 | 근거 |
|---|---|---|---|
| 1 | reap-test 로컬 클론에 v0.18 브랜치: `tests/` 전부 + `.github/workflows/` + README 한 줄, 커밋됨(push는 사람) | 완료 | `<scratchpad>/reap-test`, 커밋 `2f84fc8`(task 1) → `4a5006e`(ms-021 en 반영 재동기, 이 세대). **push 안 됨** |
| 2 | 이 리포 `tests/`가 submodule(url reap-test, branch v0.18), 로컬 `bun test` 그대로 | 완료 | `.gitmodules`에 url `https://github.com/c-d-cc/reap-test.git`·`branch = v0.18`. 포인터는 `4a5006e`. `bun test` 227 통과, `bash tests/hook.test.sh` 통과. worktree 커밋 `b8014f2` |
| 3 | `ci.yml`·`release.yml` dispatch로 교체, typecheck·build·verify는 남김. 06-release에 그 사실 | 완료 | `ci.yml`: build(typecheck·build·verify-package) + `dispatch-tests`(v0.17 승계, 브랜치 v0.18·main). `release.yml`: 테스트 단계 제거, `npm publish --tag next` 그대로. 커밋 `7fa57f6`. `06-release.md`에 반영(아래) |
| 4 | `complete/SKILL.md` 한 줄, `environment/summary.md` 테스트 절 갱신 | 완료 | 커밋 `d89e4e3` |
| 5 | `TEST_DISPATCH_TOKEN` 시크릿 필요성·만드는 법을 06-release 발행 준비물에 | 완료 | `06-release.md`의 "v0.18 브랜치가 갖춰야 하는 것" 절에 항목 추가(커밋 `d89e4e3`) |

Out of Scope(계획대로 손 안 댐): reap-test push·시크릿 등록, v0.17-bridge 브랜치.

## 사람이 할 것

**순서가 중요하다 — reap-test push가 이 리포 v0.18 push보다 먼저.**

1. **reap-test push.** 클론이 scratchpad(세션 종료 시 사라질 수 있음)에 있다 — 없으면 `https://github.com/c-d-cc/reap-test.git`를 다시 clone해 `git log`로 커밋 `2f84fc8`·`4a5006e`가 있는지 확인(없으면 이 handoff의 클론이 유실된 것 — task 2를 다시 하거나 이 세션의 diff를 복원해야 한다).
   ```bash
   cd <scratchpad>/reap-test   # 또는 새로 clone한 경로
   git push -u origin v0.18
   ```
2. **`TEST_DISPATCH_TOKEN` 시크릿.** GitHub에서 fine-grained PAT 발급 — 대상 리포 `c-d-cc/reap-test` 하나만, 권한 `Contents: Read and write`. `c-d-cc/reap` 리포의 Settings → Secrets and variables → Actions에 이름 `TEST_DISPATCH_TOKEN`으로 등록.
3. **이 worktree를 검토하고 v0.18에 merge.** worktree `/Users/hichoi/cdws/reap-wt-tests`(브랜치 `ms-023-tests`), 커밋 4개(A는 클론 쪽이라 이 리포 로그엔 없음 — B `b8014f2`·C `7fa57f6`·D `d89e4e3`·기록 갱신). merge 뒤 `push`.
4. **push 뒤 확인.** v0.18 push가 `ci.yml`의 `dispatch-tests` 잡을 돌린다 — GitHub Actions에서 그 잡과, dispatch를 받은 `c-d-cc/reap-test`의 워크플로 둘 다 초록인지 확인. 1번을 안 했거나 2번의 토큰이 없으면 `dispatch-tests`가 `::error`로 실패한다(의도된 동작).
5. **gen-0091을 닫는다.** `complete` skill로 — 이 handoff은 그때 다시 교체된다.
