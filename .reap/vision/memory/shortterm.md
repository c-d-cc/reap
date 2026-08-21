# Shortterm Memory

## 세션 요약 (gen-096, 2026-08-21)

### 브라우저에서는 완벽해 보이던 사이트

`reap.cc` 는 25개도 아니고 **23개** 라우트 전부에 **같은 939바이트 셸 하나**를 내주고 있었다.
셸이 부팅해 wouter 가 클라이언트에서 라우팅하므로 **사람 눈에는 완전한 페이지**였고, 그래서 아무도
발견하지 못했다. 이제 23 × 5 = **115개 페이지**가 실제 본문·고유 `<title>`·로케일별 URL 로 나간다.

라우트는 늘리지 않았다. `<Router base="/ko">` 하나가 로케일을 분리하고 `<Link>` 가 자동으로 접두사를
붙인다 — 컴포넌트를 하나도 안 고쳤다.

### 이 세대가 배운 것 (longterm 으로 승격한 것 외)

**인계 문장 셋 중 둘이 틀렸고, 독립 검토 지적 하나도 틀렸다.** 양쪽 다 실측이 갈랐다.

### 지금 상태

- unit **649** (640→) / e2e **329** / scenario **44**, 전부 0 fail
- 층1(`check-docs-prerender.sh` + `.mjs`) PASSED · 층2 로컬 PASSED(2초) · 층2 실제 reap.cc **FAILED(14)**
- typecheck · typecheck:docs · build · self-diagnosis · docs-version 전부 0 · `fix --check` 0 error / 2 warning
- **`package.json` 0.17.6 유지. push·tag 없음.** backlog pending **9건**(소비 1건, 신규 0건)

### 다음 세션이 알아야 할 것

- **배포 직후 `bash scripts/check-docs-live.sh` 를 실제 reap.cc 에 돌릴 것.** 이 세대가 PASS 를
  관측하지 못한 유일한 대상이다. `docs/**` 가 main 에 push 되면 `docs.yml` 이 자동 배포한다
- **미해결 — `404.html`.** 워크플로의 `cp` 를 유지하라는 지시를 지켰더니 이제 존재하지 않는 모든
  URL 이 **28,069 B 영어 홈** + `canonical=https://reap.cc/` + OG=홈 으로 나간다. 이전엔 939 B 빈 셸에
  canonical 도 OG 도 없었다. 권고는 prerender 한 NotFound 를 쓰고 `cp` 제거. **사용자 판단 대기**
- **2차 독립 검토가 close 시점까지 미응답이었다.** 따라서 3차도 없다. 이 세대의 수정은 **한 라운드분만**
  검토받았고, 1차가 낸 blocking 이 정확히 내 설계 주장 안쪽에 있었으므로 가벼운 한계가 아니다.
  **릴리즈 push 전에 받아볼 가치가 있다** (commit 은 로컬이라 아직 되돌릴 수 있다)
- **워킹트리에 이 세대 것이 아닌 변경이 함께 커밋된다** — team lead 의 0.18 backlog 이동 6건 +
  source backlog 재작성, 그리고 **artifact 가 언급하지 않았던** `reap-tree.md` 삭제 /
  `goals.md` Tree→Cell 수정 / `reap-cell.md` 신규. 커밋 전에 team lead 에 알렸다
- **사용자 판단거리 둘**: description 원본이 없는 4개 라우트(× 5 로케일 = 20 페이지)에 5개 언어로
  문구를 쓸 것인가 / 로케일 자동 감지 제거로 한국어 브라우저가 `/` 에서 영어를 보는 것을 받아들일 것인가
- **`npx vite build` 로 docs 를 빌드하면 안 된다.** 3단계 중 첫 단계뿐이라 셸 하나만 나온다.
  `npm run build` 를 쓸 것
