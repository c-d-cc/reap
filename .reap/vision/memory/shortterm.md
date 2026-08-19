# Shortterm Memory

## 세션 요약 (gen-083, 2026-08-19)

### daemon 배포 결함 — 결함은 backlog 이 파악한 것보다 세 겹 깊었다

backlog 은 "미발행 `file:` 의존 → 끊긴 심링크"를 지적했다. 맞지만 그것만 고쳤으면 형태만 바뀌었을 것이다. 추가로 발견한 것:

- **번들이 `queries/` 를 한 단계 위에서 찾음** → 인덱싱 "성공" + **심볼 0개**
- **번들이 `better-sqlite3` 를 인라인** → **node 에서 동작 불가** (bun 사용자만 우연히 동작)
- **`__dirname` 이 번들에 빌드 시점 리터럴로 박힘** → 배포본이 개발 머신 절대경로를 들고 나감. 폴백 경로가 왜 한 번도 안 맞았는지에 대한 진짜 답

### evaluator 를 두 라운드 돌렸고, 네 건 모두 "전부 초록인 상태"에서 나왔다

1회차(partial): 게이트가 빌드되지 않는 `daemon/dist` 를 pack(다음 push 에서 red) / Verification #2 를 미검증인 채 충족으로 기록.
2회차(pass, conditional): § 5e 의 parse 실패가 조용히 green / bun 선호로 node 조합 미검증.

**게이트가 D-1 을 잡은 것은 우연이었다** — 되돌려보니 5b 에서 fail 했는데 그건 박힌 리터럴이 이 머신에 실존하기 때문이었다. 원인을 직접 보는 assertion(번들에 빌드 경로 없을 것)을 따로 넣었고, 그 첫 구현이 `pipefail` 때문에 무력하다는 것을 negative test 가 잡았다.

### 지금 상태

- unit **473 → 493** / e2e 278 / scenario 44 / daemon 130, 전부 0 fail
- 자기진단 게이트에 daemon 절 **6 assertion** 신설. `daemon/dist` 를 지운 상태에서 통과 확인
- `daemon-v*` 태그 publish job 준비 완료. **publish 는 실행하지 않음**
- environment 273줄 (가이드라인 250 초과) — 처방적 서술을 genome 으로 옮기는 것이 남은 정리. adapt 에서 제안

### 다음 세션이 먼저 알아야 할 것

**`@c-d-cc/reap-daemon` 을 0.17.5 보다 먼저 발행해야 한다.** reap-guide · docs 5로케일 · README 2종이 전부 `npm i -g @c-d-cc/reap-daemon` 을 안내하는데 현재 **404** 다. 발행 없이 0.17.5 를 내면 결함을 다른 결함으로 바꾸는 것. `daemon-v0.2.0` 태그를 밀면 된다.

**fitness 결정 3건**: `REAP_SKIP_DAEMON_CHECK` **제거**(게이트를 미리 무디게 하지 않는다) / daemon **0.2.0 유지** / strict resolver 우회를 **0.17.5 에 포함**.

### 다음 — strict resolver 우회 (0.17.5 하드 선행조건)

`REAP_DAEMON_BIN` / `config.daemonBin` 으로 daemon 위치를 명시 지정하는 경로. backlog priority **high**.

**0.17.5 순서**: gen-083(완료) → strict resolver 우회 → `daemon-v0.2.0` 발행(유저가 태그 push) → 0.17.5 릴리즈.

**gen-084 SCIP 설계는 릴리즈와 순서 무관** — 코드를 내지 않는 설계 세대라 앞뒤 어디든 가능하다. 본 세대가 선행조건이었고 충족됐으므로 "분리된 daemon"을 전제로 설계할 수 있다. **daemon 이 `queries/` 를 런타임 자산으로 들고 다닌다는 점**이 드러났으므로 SCIP 인덱서를 붙일 때의 자산 구조·패키지 크기가 설계 항목이다.

신규 backlog 4건: daemon typecheck 상시 red / `semverGte` prerelease 미구분 / `MIN_DAEMON_VERSION` 발행 검사 / **strict resolver 우회 경로**.

**마지막 것은 "알려진 파손"이다** — pnpm 기본 store 나 Yarn PnP 사용자는 daemon 을 정상 설치하고도 영구히 "설치하라"는 안내를 받고, 게이트는 seam 이 건강하다고 보고한다. daemon 이 의도적으로 dependency 가 아니므로 원리적 충돌이다.
