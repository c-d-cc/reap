# Shortterm Memory

## 세션 요약 (gen-084, 2026-08-19)

### 전제가 틀렸다 — 그것이 이 세대의 가장 중요한 산출물

이 세대는 "pnpm 기본 store 와 Yarn PnP 에서 daemon 이 **원리적으로** resolve 되지 않는다"를 고치려고 시작했다. **실제로 설치해 재보니 셋 다 정상 동작한다.** pnpm 의 격리는 resolver 교체가 아니라 심링크 배치이고, Yarn PnP 는 기본 fallback 이 최상위 의존을 허용한다.

**진짜 조건은 "reap 과 daemon 이 서로 다른 resolution root 에 설치되는 것"** — 전역 reap + 로컬 daemon, 서로 다른 prefix, nvm 전환. 문제는 **축소되지 않고 확대**됐다. 문서가 둘 다 `npm i -g` 를 안내하는데 그게 되는 건 우연히 같은 prefix 에 떨어져서다.

**거짓 서술은 사용자에게 도달한 적이 없다.** gen-083 은 완료 artifact 와 backlog 에만 적었고, 지금 문서는 매니저 이름이 아니라 **조건**으로 쓰여 있다. unit 테스트가 되돌림을 강제한다.

**gen-083 lineage 항목은 반증된 주장을 담고 있다** — 그대로 둔다(그 시점의 기록이므로). 소비된 backlog 원문에는 정정 블록을 달았다.

### 지금 상태

- unit **493 → 523** / e2e 278 → 279 / scenario 44 / daemon 130, 전부 0 fail
- 자기진단 게이트 daemon 절 **6 → 10 assertion**. negative test 8건 전부 FAIL 확인 후 복원
- environment 276줄 / longterm 53줄 — 둘 다 가이드라인 초과. 근본 정리는 처방적 서술을 genome 으로 옮기는 작업이며 미완

### 다음 — 0.17.5 는 npm 토큰 권한 하나에 막혀 있다

**세대 작업은 끝났다.** gen-083/084 는 커밋·push 됐고 reap CI / reap-test 모두 green (unit 523 / e2e 279 / scenario 44 / daemon 130).

`daemon-v0.2.0` 태그는 **이미 remote 에 있고** `38ba4e8` 을 가리킨다. **재발행 시 태그를 다시 밀 필요 없다** — `gh run rerun 32226672534` 로 충분하다.

**막힌 지점**: `npm publish` 가 `E404 PUT https://registry.npmjs.org/@c-d-cc%2freap-daemon`. tarball 검사는 전부 통과했고(17 files, 14.3 kB) 실제 발행 호출에서 거부됐다. npm 은 권한 없는 대상의 존재를 숨기려 403 대신 404 를 낸다 — 즉 **패키지가 없어서가 아니라 토큰이 새 패키지를 만들 권한이 없다**는 뜻으로 읽는다. `@c-d-cc` 는 org 이고(`@c-d-cc/reap` maintainer = `hichoi`, 사용자명과 스코프명이 다르다), 기존 토큰은 `@c-d-cc/reap` 발행에는 계속 성공하고 있다.

**유저 조치 대기 (2026-08-19, 유저 외출 중)**: npmjs.com → Access Tokens → `NPM_TOKEN` 의 Packages and scopes 확인. "Only select packages" 면 그것이 원인이며, 스코프 전체(또는 All packages) 쓰기 권한으로 재발급 후 GitHub secret 교체 → workflow 재실행.

**진단은 [추론]이다** — 로컬 npm 이 미로그인(`E401`)이라 토큰 설정을 직접 확인하지 못했다. 다른 원인(org 의 신규 패키지 생성 정책, 2FA)일 여지가 남아 있다.

### 이 세션에서 세대 밖으로 처리한 것 3건

- **remote 를 SSH 로 전환** — HTTPS OAuth 토큰에 `workflow` scope 가 없어 gen-083 의 `release.yml` 변경이 push 거부됐다. SSH 는 scope 개념이 없어 재발하지 않는다
- **reap-test CI 에 daemon 빌드 추가** (reap-test `ae57a46`) — `daemon/dist/` 가 gitignore 이고 reap 빌드가 만들지 않아 e2e 1건이 러너에서만 red 였다. `daemon/dist/index.js` 를 지워 로컬에서 재현 후 고침. **근본(갓 클론한 개발자도 같은 실패를 본다)은 backlog** `e2e-가-daemon-빌드를-전제하는데...`
- **`tar | grep -q` 오판 4곳 수정** (`38ba4e8`) — 아래 참조

### `tar -tzf ... | grep -q` 는 pipefail 아래에서 매치를 실패로 뒤집는다

`grep -q` 가 첫 매치에서 떠나면 tar 가 SIGPIPE 로 죽고, `pipefail` 이 그 실패를 파이프라인 실패로 승격시킨다. **매치했는데 실패로 읽힌다.**

daemon 발행 1차 시도가 이것으로 막혔다 — `dist/index.js` 는 17개 항목 중 **1번**이라 grep 이 즉시 떠났고, `queries/` 는 3번부터라 간발의 차로 통과했다. **경합에 의존하는 검사**였다. macOS tar 는 넘어가고 GNU tar 는 오류를 내므로 **로컬에서는 5/5 통과하고 러너에서만 실패**한다.

`check-self-diagnosis.sh:227` 은 방향이 반대라 더 나빴다 — 오탐 red 가 아니라 **조용한 pass**. reap tarball 에 daemon/ 이 섞여도 `if` 가 false 로 읽혀 통과한다.

**gen-083 이 5a-bis 에서 만난 것과 같은 부류다.** 그때 인스턴스 하나만 고치고 같은 패턴을 쓸지 않았다. 처방: 목록을 변수로 한 번 받고 그 다음 grep — 파이프가 없으면 tar 구현과 무관해진다.

### 릴리즈 전 유저 확인이 필요한 것 2건

- **`daemonBin` 이 "존재하는 무관한 파일"이면 판별 불가.** 신원 검사를 하지 않기로 한 결과이며 그 판단은 유효하다. 완화는 했다(기동 실패 시 `bin`/`source` 를 말한다). **이대로 수용할지** — 0.17.5 가 이 기능의 첫 배포다
- **Windows 전 경로 미검증.** 확인할 수단이 없다(개발·CI 모두 non-Windows)

### 신설 backlog 3건

- `낡은-daemon-안내가-명시-경로를-무시한다` — **현재 도달 불가**(`MIN_DAEMON_VERSION`=0.2.0 이 최초 발행본). `semverGte` prerelease / `MIN_DAEMON_VERSION` 발행 검사와 **묶어서** floor 인상 세대에 처리할 것
- `죽은 코드가 typecheck 를 통과한다` — `tsconfig` 에 `noUnusedLocals` 가 없어 죽은 심볼이 typecheck 를 통과한다. 실측 **8건**이며 **균질하지 않다**(순수 죽은 코드 / 미사용 매개변수 / `_` prefix 를 달았는데도 잡히는 placeholder). 일괄 삭제 후 켜는 처방은 틀렸다. `daemon/` typecheck 가 상시 red 인 backlog 와 순서를 맞출 것
- `validation work phase 를 재실행할 수 없다` — 본 세대에서 실제로 겪었다. `reap run validation` 두 번째 호출이 막히고 **evaluator prompt 를 다시 얻을 수 없다**. evolution.md 의 중단 복구 절차와 정면 충돌
