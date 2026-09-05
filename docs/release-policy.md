# v0.18 배포 정책

## 0.18은 npm latest로 나간다 (사람 결정, 2026-09-05)

설치 경로는 하나다 — `npm i -g @c-d-cc/reap` → `reap setup`. 태그 없이 설치되려면 latest여야 하고, latest에 0.18을 두어도 0.17 사용자가 깨지지 않게 하는 장치는 dist-tag가 아니라 **floor**다.

## `package.json`의 `reap.autoUpdateMinVersion: "0.18.0"` — 지우지 않는다

0.17 이하의 `check-version`은 SessionStart마다 latest의 버전과 그 package.json의 `reap.autoUpdateMinVersion`을 읽는다. 설치된 버전이 floor보다 낮으면 자동 설치 대신 **"Breaking change detected: v0.17.x → v0.18.0. Run: npm i -g @c-d-cc/reap"** 를 찍고 멈춘다(v0.17.7 `check-version.ts` 5번 guard). **v0.18 코드가 읽는 값이 아니다** — 소비자는 0.17 사용자의 check-version이고, 이것을 지우면 0.17 사용자가 세션을 열 때마다 0.18을 자동으로 받아 v0.17 저장 구조 위에서 깨진다.

## 0.17 사용자의 길

1. 세션 시작 시 위 blocked 메시지를 본다 → 명령을 실행한다(`npm i -g @c-d-cc/reap`). 이제 `reap`는 0.18이다
2. v0.17이 설치해 둔 SessionStart 훅이 `reap check-version`·`reap load-context`를 부른다 → 0.18이 v0.17 명령 이름을 알아보고 **다음 셋을 안내**한다(`cli.legacy_command`, exit 0): `reap setup` → 새 세션 → `/reap:migrate`
3. `reap setup`이 마켓플레이스 `c-d-cc/plugins` 등록과 `reap@ctod-plugins` 설치를 대신한다
4. 새 세션에서 `/reap:migrate` — 원본은 `.reap-v0_17/`에 보존, 8/8이 옛 홈 자산(slash command·agent·훅·`~/.reap/`)을 목록→동의→삭제

## 0.17.8 이행 다리는 발행하지 않는다

`~/cdws/reap_v17` v0.17 브랜치의 0.17.8(일일 캐시·`next` 안내·upgrade agent)은 latest를 0.17 라인에 두는 전제에서만 뜻이 있었다. latest 직접 발행이면 아무에게도 닿지 않으므로 은퇴한다. 코드는 남기고 태그·publish·main merge를 하지 않는다. `docs/upgrade-agent/reap-upgrade.md`도 같은 이유로 쓰이지 않는다.

## 브랜치 흐름 (2026-09-01, 사람 결정)

**main은 발행된 마지막 상태(v0.17.7, b4d3ae1)에 머문다.** 트랙은 완성됐을 때 main으로 merge한다. main에 직접 커밋하지 않는다.

- **v0.18 브랜치** — 차세대 구현. 발행 = 이 브랜치의 태그 `v0.18.0` push(release.yml은 태그에서 돈다) → main merge
- **v0.17 브랜치** — 0.17 유지보수 라인. 0.17.8 은퇴로 당장 할 일 없음

근거: `docs/reap-plan/reap_v_0_18_release/05-open.md` Q6 · `06-release.md`
