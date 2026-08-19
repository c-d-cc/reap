# Shortterm Memory

## 세션 요약 (gen-087, 2026-08-19)

### npm 12 가 REAP 을 통째로 설치되지 않게 만들고 있었다

npm 12 는 전역 설치의 install script 를 기본 차단한다. REAP 의 사용자 레벨 자산 넷
(slash command 19 · agent 2 · `~/.reap/reap-guide.md` · SessionStart hook)은 `scripts/postinstall.sh`
**하나에만** 걸려 있었다. 결과: 바이너리는 돌고 통합은 없고 **오류도 없다.**
README 의 Quick Start 는 `/reap.init` — 없어진 그 파일이다.

수정은 셋이다. (1) adapter 마다 `syncUserLevelAssets` 하나가 자산 일습을 소유하고 기존 두 caller 가
경유한다 (세 번째 caller 를 덧붙이지 않았다). (2) `program.parse()` 앞에서
`ensureUserLevelAssets` — 명령을 가리지 않는다. (3) `~/.reap/.install-stamp` 로 client·버전당 1회.

**게이트 6절**이 `--ignore-scripts` 로 조건을 강제 재현한다. npm 버전으로 추론하지 않는다 —
`release.yml` 이 게이트를 node 번들 npm 에 고정하므로 그러면 언젠가 조용히 무력해진다.

### evaluator 가 잡은 것이 이번 세대의 절반이다

초안은 sync 가 반환하면 stamp 를 찍었다. installer 셋이 자기 실패를 삼키므로,
`settings.json` 이 파싱 불가인 사용자는 hook 없이 `"synced"` 를 받고 **영구히 재시도되지 않았다.**
변경 전에도 삼킴은 있었으나 매 `install-skills`/`update` 가 재시도했다 — **종결시킨 것이 stamp** 였고,
그 결과는 이번 세대가 없애려던 형태와 정확히 같다.
`UserLevelSyncResult{complete, missing}` 로 계약을 바꾸고 `complete` 일 때만 stamp 한다.

### 지금 상태

- unit **568** (555→) / e2e **292** (287→) / scenario 44 / daemon 130, 전부 0 fail
- 자기진단 게이트 전 절 통과 (opencode 1.3.16). **수정 전 6절이 fail 하는 것을 먼저 확인했다**
- `fix --check` 0 error / 4 warning — 기존 (lineage parent 2 + longterm 51줄 + summary)
- `package.json` **0.17.5 유지**. push·tag·publish 없음. **로컬 macOS 에서만 돌았다**

### 다음 세션이 알아야 할 것

- **`environment/summary.md` 가 296줄이 됐다** (273→). 새 구조가 실제로 늘어난 몫이고,
  근본 정리는 **처방적 서술을 genome 으로 옮기는 것**인데 이번 세대는 genome immutable 조건이었다.
  손으로 지워 경고를 끄는 것은 genome 이 금한다 — 다음에 genome 을 열 수 있을 때 함께 처리할 것
- **테스트 실행이 개발자의 실제 HOME 에 버전당 1회 쓴다.** `tests/helpers/setup.ts` 의 `cli()` 가
  HOME 을 격리하지 않기 때문. 이번 세션에서 실제로 발생했고 `~/.config/opencode/` 도 채워졌다.
  **작업 트리 중간 상태의 agent 정의가 살아 있는 클라이언트로 들어갈 수 있다**
- **`.reap/life/backlog/npm-uninstall-…md` 가 이 세대 중에 나타났다.** 내가 만들지 않았다
  (`reap make backlog` 미실행). pending 6 → 7. 출처 확인 후 유지/삭제를 인간이 정해야 한다
- 0.17.5 릴리즈 문서에 이 건을 넣을지 — 증상이 "REAP 가 아예 안 붙는다"라 changelog 한 줄보다
  큰 자리가 맞을 수 있다
