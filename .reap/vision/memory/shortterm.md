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

### 다음 — 0.17.5 릴리즈가 열렸다

**본 세대가 마지막 선행조건이었다.** 남은 것은 `daemon-v0.2.0` **발행**(유저가 태그 push) → 0.17.5.

`@c-d-cc/reap-daemon` 은 여전히 **404** 인데 문서 7종이 전부 `npm i -g @c-d-cc/reap-daemon` 을 안내한다. **발행 없이 0.17.5 를 내면 결함을 다른 결함으로 바꾸는 것.**

### 릴리즈 전 유저 확인이 필요한 것 2건

- **`daemonBin` 이 "존재하는 무관한 파일"이면 판별 불가.** 신원 검사를 하지 않기로 한 결과이며 그 판단은 유효하다. 완화는 했다(기동 실패 시 `bin`/`source` 를 말한다). **이대로 수용할지** — 0.17.5 가 이 기능의 첫 배포다
- **Windows 전 경로 미검증.** 확인할 수단이 없다(개발·CI 모두 non-Windows)

### 신설 backlog 3건

- `낡은-daemon-안내가-명시-경로를-무시한다` — **현재 도달 불가**(`MIN_DAEMON_VERSION`=0.2.0 이 최초 발행본). `semverGte` prerelease / `MIN_DAEMON_VERSION` 발행 검사와 **묶어서** floor 인상 세대에 처리할 것
- `죽은 코드가 typecheck 를 통과한다` — `tsconfig` 에 `noUnusedLocals` 가 없어 죽은 심볼이 typecheck 를 통과한다. 실측 **8건**이며 **균질하지 않다**(순수 죽은 코드 / 미사용 매개변수 / `_` prefix 를 달았는데도 잡히는 placeholder). 일괄 삭제 후 켜는 처방은 틀렸다. `daemon/` typecheck 가 상시 red 인 backlog 와 순서를 맞출 것
- `validation work phase 를 재실행할 수 없다` — 본 세대에서 실제로 겪었다. `reap run validation` 두 번째 호출이 막히고 **evaluator prompt 를 다시 얻을 수 없다**. evolution.md 의 중단 복구 절차와 정면 충돌
