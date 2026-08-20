---
type: task
status: pending
priority: medium
createdAt: 2026-08-20T15:23:45.016Z
---

# reap-test CI 의 daemon 빌드 단계 제거 — workflow 스코프 없어 못 밀었다

> **이것은 코드 문제가 아니라 자격 증명 문제다.** 패치는 완성돼 있고 아래에 실려 있다.
> 적용 방법은 맨 끝에 있으며 두 줄이다.

## Problem

0.17.6 릴리즈 중 `tests` submodule(`c-d-cc/reap-test`)을 push 하려다 원격에
`ae57a46 ci: build the daemon before the suite runs` 가 있어 분기 상태였다.
`git pull --no-rebase` 로 병합했고(충돌 0건, 로컬 8개 SHA 보존 — rebase 하면 reap 의
커밋 5개가 기록한 submodule pointer 가 존재하지 않는 커밋을 가리키게 된다) push 했다.

**그런데 그 원격 커밋이 이미 무의미하다.** gen-089 가 daemon 상주 프로세스를 폐기하면서
그 CI 단계의 전제가 전부 사라졌다:

```
reap/daemon/                     없음
reap/package.json 의 workspaces  없음
tests/e2e/daemon-config.test.ts  없음  (daemon 스위트 4파일 전부 제거)
```

즉 `npm run build --workspace daemon` 은 **존재하지 않는 workspace 를 빌드하려 한다.**
**다음 main push 에서 reap-test CI 가 red 로 뜬다.**

제거 커밋을 만들었으나 push 가 거부됐다:

```
! [remote rejected] main -> main
  (refusing to allow an OAuth App to create or update workflow
   `.github/workflows/test.yml` without `workflow` scope)
```

**병합 자체는 밀렸다** — workflow 파일을 *바꾸지 않는* push 는 허용된다. 지금 원격 main 은
`77892b5`(병합)이고 daemon 단계가 살아 있는 상태다.

## Solution

아래 패치를 적용하고 push 한다. `workflow` 스코프를 가진 자격 증명이 필요하므로
**사람이 로컬에서 하거나**, `gh auth refresh -h github.com -s workflow` 후 재시도한다.

```diff
diff --git a/.github/workflows/test.yml b/.github/workflows/test.yml
index fd273d2..f49ca80 100644
--- a/.github/workflows/test.yml
+++ b/.github/workflows/test.yml
@@ -82,18 +82,6 @@ jobs:
       - run: npm run build
         working-directory: reap
 
-      # The daemon is a separate package (gen-083 split it out of reap's
-      # dependencies), and `daemon/dist/` is gitignored, so a checkout has the
-      # source but not the bundle. reap's own build does not produce it.
-      #
-      # The e2e suite needs it present: `daemon-config.test.ts` case 4 pins
-      # `daemonInstalled` to true on the grounds that this checkout has daemon/
-      # beside it — a regression reporting it missing is exactly the defect
-      # gen-083/084 fixed. Without this step that assertion fails on the runner
-      # while passing on any developer machine that has ever built the daemon.
-      - run: npm run build --workspace daemon
-        working-directory: reap
-
       # Separate steps so a failure says which suite it came from.
       - run: npm run test:unit
         working-directory: reap
```

### 적용

```bash
cd ~/cdws/reap/tests
# 위 diff 를 그대로 적용하거나, 손으로 지운다:
#   .github/workflows/test.yml 의 "- run: npm run build --workspace daemon" 과
#   그 위 주석 9줄 + 아래 "working-directory: reap" 을 삭제
git commit -am "ci: daemon 빌드 단계를 제거한다 — 빌드할 대상이 없다"
git push origin main
```

적용 후 `grep -c daemon .github/workflows/test.yml` 이 **0** 이어야 하고,
`python3 -c "import yaml; yaml.safe_load(open('.github/workflows/test.yml'))"` 이 통과해야 한다.

## Files to Change

- `c-d-cc/reap-test` 의 `.github/workflows/test.yml` — **reap 저장소가 아니다**

## 왜 backlog 인가

scratchpad 는 세션과 함께 사라지고, `shortterm.md` 는 다음 reflect 에서 교체된다.
이 항목은 **소비될 때까지 남아야** 하고 pending 목록에 보여야 한다 — 그때까지
reap-test CI 가 red 이기 때문이다.
