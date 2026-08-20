# Shortterm Memory

## 세션 요약 (gen-094, 2026-08-21)

### daemon 을 없던 것처럼 서술한다

사용자 지시: *"daemon 과 관련된 서술 다 지웠으면 됨. **있다가 지웠음 이런 히스토리 서술 불필요.**"*
gen-089/090 이 폐기 후 **회고를 남기는 방식**으로 고쳤고, 사용자가 그 방식을 물렀다.
살아있는 오지시(`## Daemon Setup` 이 없는 `reap daemon start` 를 시킨다) + 회고 서술 둘 다 제거.

### evaluator 가 blocker 를 냈고, 그것이 이 세대의 절반이다

**`src/templates/migration/v0.17.5.md` 가 `npm i -g @c-d-cc/reap-daemon` 을 배포하고 있었다.**
`lastMigratedVersion` 미설정 시 `"0.0.0"` fallback 이라 **신규 프로젝트에도** surface 한다.
격리 측정에서 load-context 가 daemon 19줄을 주입했고 첫 6줄이 설치 지시였다. planning 까지
회귀. 19 → **13**. 왜 놓쳤는지의 교훈은 longterm 에 있다.

### 3라운드 — 새 backlog 2건 소비 (사용자 지시)

`package-lock.json` 재생성 (`workspaces: ["daemon"]` + 버전 0.17.5 잔존). `npm ci` remove
**40 → 0**. **`npm install` 한 번으로는 부족하다** — npm 이 `"daemon"` 을 `"extraneous": true`
로 남기므로 lock 을 지우고 재생성해야 한다. 의존 diff 는 순수 감산(REMOVED 40 / ADDED 0 /
VERSION CHANGED none)이었지만 세 스위트 + 자기진단 게이트를 전부 재실행했다.

`reap-tree.md` 4건 — `:253`(미결 결정 5번)은 **전제만** `reap index` 기준으로 다시 쓰고
**결정은 미결로 남겼다.**

**backlog 를 consumed 로 마킹하는 CLI 경로가 없다** — `reap run start --backlog` 뿐이라
`bun -e` 로 `consumeBacklog()` 를 직접 불렀다.

### 지금 상태

- unit **629** (627→, 신규 검사 2) / e2e 331 / scenario 44, 전부 0 fail
- 게이트 4종 통과: `check-docs-version.sh` · `check-self-diagnosis.sh` · `vite build` · `fix --check`(0 error / 2 warning, gen-052 상속분)
- `package.json` **0.17.6 유지, bump 없음.** push·tag 없음. **로컬 macOS 에서만 돌았다** —
  lock 재생성 효과는 CI(리눅스 `npm ci`)에서 처음 검증된다
- backlog pending **15건** (이 세대가 2건 만들고 2건 다 소비했다)

### 4라운드 — ja/de/zh-CN 산문 검독 (사용자 지시)

**`[실행]` 근거가 전부 초록인 상태에서 결함이 남아 있었다.** 내가 넣은 삽입구가 네 언어에
**영어 문장부호**를 들여왔다 — 원문은 ko/ja/de/zh 모두 괄호였는데 em-dash 로 바꿨고, ja 는
연용형 뒤에 대시가 끼어 문장이 멈춘다. 각 언어 관례(괄호)로 되돌렸고 **en 만 em-dash 유지**.

grep 0건 · 문자열 리터럴 5,853개 · 배포 번들 13건 · exact-match assert · `git diff --stat`
대칭 — **전부 통과한 상태였다.** 기계는 문자열이 거기 있는지를 보고 그것이 그 언어로 읽히는지는
보지 못한다. 이 항목은 앞으로도 **`[독해]`** 다.

### 다음 세션이 알아야 할 것

- **`tests/` submodule 이 미커밋이다.** submodule 안에서 먼저 커밋하고 `git add tests`
- **다음은 0.17.7 patch 릴리즈다.** 태그 이동 없음(npm 이 같은 버전 재발행 거부). 이 세대는
  `package.json` 을 **0.17.6 그대로 두었다** — bump·5 로케일 changelog 신설·태그·발행은
  `reapdev.versionBump` 로 별도 진행. **backlog 없음**(adapt 규칙), hint 에만 있다
- **발행 문서 수정 규칙이 갱신됐다** — midterm 참조. 실행 가능성이 예외 기준이고,
  고치되 버전 항목은 남긴다 (사용자 승인 2026-08-21)
- **longterm 이 51줄**(가이드라인 50). ~10세대째 전용 pruning 없음. 다음 reflect 에서 정리 대상
