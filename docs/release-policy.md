# v0.18 배포 정책

발행 자체는 이 계획(ps-4b485d)의 범위 밖이다 — 이 문서는 발행 세대가 읽을 정책을 코드보다 먼저 적어둔다.

## 0.18은 npm latest로 올리지 않는다

0.17 이하의 `check-version`은 SessionStart마다 **dist-tag `latest`**의 버전과 `reap.autoUpdateMinVersion`(floor)을 읽고, 조건이 서면 `npm install -g @latest`를 실행한다. 따라서:

- **0.18은 `next` 태그로 발행한다.** latest가 아니므로 어떤 0.17 사용자도 자동으로 도달하지 않는다 — 차단의 원천
- **latest는 0.17.8(이행 다리)에 둔다.** 0.17.7 이하 사용자는 언제 켜든 0.17.8로 자동 상승하고, 0.17.8이 "0.18이 `next`에 있다"를 안내한다
- **latest 승격은 별도 결정이다.** 대가: 승격 전까지 `npm i -g @c-d-cc/reap`는 신규 사용자에게도 0.17.8을 준다 (승계 문서 §9의 유일한 어색한 지점)

## `package.json`의 `reap.autoUpdateMinVersion: "0.18.0"`

**v0.18 코드가 읽는 값이 아니다** — 소비자는 0.17 사용자의 check-version이다. 0.18이 사고로 latest가 되어도 0.17.x는 floor 미달로 `blocked`가 되어 자동 설치 대신 경고만 받는다. v0.18 쪽에 소비자가 없다고 지우면 이 안전장치가 사라진다.

## 발행 시 함께 할 것 (발행 세대의 체크리스트)

- `version`을 0.18.0으로 bump — 지금의 `0.1.0`은 개발 리포의 것이다. floor(0.18.0)보다 낮은 버전을 발행하면 자기 자신을 막는 모순이 된다
- migration note와 upgrade agent 본문 (M3 산출물) 준비 확인
- 0.17.8이 **먼저** latest에 있어야 한다 — 순서가 바뀌면 floor가 0.17.7 사용자의 0.17.8행까지 막는다

근거: `docs/inherited/plugin-distribution.md` §9 · `docs/reap-plan/reap_v_0_18_migration/01-situation.md`(차단 이중화 결정, 사람 2026-08-31)
