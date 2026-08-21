# Shortterm Memory

## 세션 요약 (gen-095, 2026-08-22)

### daemon 흔적을 코드·라우트·설계 문서·이름에서 지웠다 — 청소 코드만 남기고

gen-094 가 **사용자 대면 산문**을 지웠다면 이 세대는 그 아래층이다: 게이트·워크플로·빌드 스크립트의
회고 주석, `/docs/daemon` 라우트, 설계 문서 7파일(5,364줄), 죽은 이름 3종.

**유지 지시 4건은 그대로다** — `uninstall.ts` 의 `DAEMON_PACKAGE` · `update.ts` 의
`removeRetiredDaemonData` · `adapters/index.ts` 의 `REAP_HOME_ENTRIES` · `migration/v0.17.6.md`.
버전업 경로가 사용자 머신을 청소하는 코드이고, 자기진단 게이트 § 8 이 그것을 **실제로 실행**한다.

### 회고를 지우는 기준 (사용자 지시)

> *"「왜 그렇게 생겼는지」 라는 이유를 자꾸 작성하지 마라."*

- **삭제** — 폐기된 것과 대조하는 서술 ("the daemon did X", "이전에는 Y였다")
- **유지** — 지금 코드를 이해하는 데 필요한 사실: 제약 · 불변식 · 외부 도구의 **실측된** 행동
- 애매하면 **지운다**

이 기준은 daemon 이후에도 계속 적용된다.

### 지금 상태

- unit **640** (629→) / e2e **329** (331→) / scenario 44, 전부 0 fail.
  e2e 감소는 판별력 없는 테스트 2개 삭제 — 회귀 아님
- 게이트 전종 green · `fix --check` 0 error / 2 warning (gen-052 상속분) · carrier orphan 1건(기존)
- **`package.json` 0.17.6 유지. push·tag 없음. macOS 로컬 단독.**
- **backlog pending 16건** — 이 세대가 `--no-backlog` 로 시작했고 **1건 신설**했다

## 다음 세션이 알아야 할 것

- **0.17.6 은 이미 발행됐다** (`2026-08-20T15:21Z`, 태그 `v0.17.6`, npm `latest`).
  gen-094·095 는 그 **뒤에 얹힌 미발행 변경**이고 `package.json` 은 0.17.6 그대로다.
  다음 릴리즈는 **0.17.7 patch** 이며 `reapdev.versionBump` 로 bump·5 로케일 changelog·태그·발행을
  진행한다. **태그를 옮기지 않는다** — npm 이 같은 버전 재발행을 거부하고 provenance 와 어긋난다.
  층2 게이트(~$0.25)는 그 전에 재실행한다 (gen-091 이후 소스가 계속 바뀌었다).
  *(주의: 이 세대가 처음 이 자리에 "0.17.6 은 아직 발행 전"이라고 적었다 — `CLAUDE.md` 로 자동
  로드된 memory 사본이 낡아 있었기 때문이다. **npm registry 에 물어서 정정했다.** memory 는
  쓰인 시점의 사실이며, 행동을 결정하기 전에 실물을 확인해야 한다.)*
- **신설 backlog `reapccdocs-…404…md` (priority high) 를 먼저 볼 것.**
  `https://reap.cc/docs/*` 가 **전부 HTTP 404** 다 — 화면은 정상이라 사람 눈에 안 보이고 status 만
  틀렸다. 검색엔진이 색인하지 않으므로 문서 사이트가 검색에서 부재하고, README 5개의 링크 80개가
  죽은 링크로 판정된다. **어떤 게이트도 배포된 사이트에 HTTP 요청을 보내지 않아 5개월 넘게 안 걸렸다.**
- **`/docs/daemon` 을 `/docs/code-intelligence` 로 개명했고 리다이렉트를 두지 않았다.**
  저장소 내 인바운드 링크는 0건이지만 **제3자 링크는 측정 수단이 없고 실제로 깨진다** —
  그 URL 은 오늘 정상 렌더되고 개명 후 NotFound 가 된다. 복구는 `App.tsx` 에 Redirect 한 줄이나,
  **이 세대의 sweep 이 그 한 줄을 red 로 만든다** (EXCLUDED 에 근거와 함께 넣어야 한다).
- **`.reap/vision/design/code-index-scip.md` 는 살아있는 조사 문서다.** 설계 문서 7파일 중 6개는
  daemon 구현 계획이라 지웠지만 이것은 **SCIP·인덱서 규모 조사**이고 위치만 그 밑이었다 —
  사용자 판단으로 `daemon/` 밖으로 옮겨 보존했다. `process-tracing-재설계-…` backlog 의 선결 조건이다.
  **한계 1(이름 기반 call resolution)은 지금 코드 그대로이고, 한계 4 는 gen-089 가 해소했다** —
  gen-095 가 실측해 문서에 취소선과 근거를 달았다. **evaluator 가 4번도 살아있다고 했으나 틀렸다;
  `pipeline.ts` 가 두 edge 종류를 전량 삭제 후 재해석한다.**
- **0.18 plugin 전환은 미결 그대로다** — `midterm.md` 의 0.18 절을 읽을 것.
