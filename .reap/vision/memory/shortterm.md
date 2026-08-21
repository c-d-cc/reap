# Shortterm Memory

## 세션 요약 (gen-096, 2026-08-21)

### 브라우저에서는 완벽해 보이던 사이트

`reap.cc` 는 **23개** 라우트 전부에 **같은 939바이트 셸 하나**를 내주고 있었다. 셸이 부팅해
wouter 가 클라이언트에서 라우팅하므로 **사람 눈에는 완전한 페이지**였고, 그래서 아무도 발견하지
못했다. 이제 23 × 5 = **115개 페이지**가 실제 본문·고유 `<title>`·description·로케일별 URL 로 나간다.

라우트는 늘리지 않았다. `<Router base="/ko">` 하나가 로케일을 분리하고 `<Link>` 가 자동으로
접두사를 붙인다 — 컴포넌트를 하나도 안 고쳤다.

### 독립 검토 4라운드, 매번 직전 라운드의 수정 안에서 결함이 나왔다

| 라운드 | blocking |
|---|---|
| 1차 | Pages 의 `/dir`→`/dir/` 301 로 하이드레이션 주소가 어긋남 |
| 2차 | sitemap 이 개수만 봐서 **`<loc>` 115개를 전부 홈으로 바꿔도 두 층이 통과** |
| 3차 | 검색으로 `/ko/` 에 들어온 방문자가 English 를 고르면 **되튕김** (두 번째 클릭은 먹음) |
| 4차 | **리디렉션 기능에 관측자가 없음** — 한 줄로 끄면 unit 657·두 게이트 전부 초록 |

3차 blocking 이 왜 27/27 브라우저 검증을 빠져나갔는지가 이 세대의 교훈이다 — **모든 판정이
"`/` 에 도착"으로 시작했고 진입 지점이라는 축이 통째로 없었다.** 개수를 늘려도 안 잡힌다.

### 지금 상태

- unit **663** (640→) / e2e **329** / scenario **44**, 전부 0 fail
- 층1 PASSED · 층2 로컬 PASSED(2초) · 층2 실제 reap.cc **FAILED** — 배포 전이므로 정상
- typecheck · typecheck:docs · build · self-diagnosis(8절) · docs-version 전부 0 ·
  `fix --check` 0 error / 2 warning(gen-052 상속분)
- 커밋 **`2940031`** + tests submodule `99e5b81`. **`package.json` 0.17.6 유지, push·tag 없음**
- backlog pending **9건** (0.18 기획 6건은 `vision/design/backlogs_v0.18/` 로 이동)

### 다음 세션이 알아야 할 것

- **배포 직후 `bash scripts/check-docs-live.sh` 를 실제 reap.cc 에 돌릴 것.** 이 세대가 PASS 를
  관측하지 못한 유일한 대상이다. `docs/**` 가 main 에 push 되면 `docs.yml` 이 자동 배포하므로
  **0.17.7 릴리즈 push 가 그 시점**이다
- **5차 검토를 받지 않았다.** 4차 수정(F1·F2·F3·F4·F5·F6)은 검토받지 않은 유일한 라운드이고,
  이 세대에서 그 자리가 네 번 연속 결함을 냈다. push 전에 받아볼 가치가 있다
- **`npx vite build` 로 docs 를 빌드하면 안 된다.** 3단계 중 첫 단계뿐이라 셸 하나만 나온다.
  `npm run build` 를 쓸 것
- **다른 세션이 `vision/design/reap-cell.md`(Tree→Cell 재설계)를 진행 중이고 커밋되지 않았다.**
  `reap-tree.md` 삭제 · `goals.md` 수정과 함께 워킹트리에 남아 있다. gen-096 커밋은
  `git add -A -- . ':!<path>'` **pathspec 제외**로 그 셋을 뺐다 — `skip-worktree`/`stash` 와
  달리 파일도 git 상태도 안 건드리므로 편집 중인 세션에서 빼앗지 않는다. **다음 커밋도 같은 주의가 필요하다**
- **0.17.7 릴리즈에서 `src/templates/migration/v0.17.7.md` 를 함께 만들어야 한다.** gen-094~096 의
  genome 변경이 기존 프로젝트에 도달하는 유일한 채널이고, `check-docs-version.sh` § 5 가 note 버전 >
  패키지 버전을 막으므로 **bump 와 note 가 같은 세대여야 한다**
