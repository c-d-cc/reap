# v0.18 배포 정책

## 0.18은 npm latest로 나간다 (사람 결정, 2026-09-05)

설치 경로는 하나다 — `npm i -g @c-d-cc/reap` → `reap setup`. 태그 없이 설치되려면 latest여야 하고, latest에 0.18을 두어도 0.17 사용자가 깨지지 않게 하는 장치는 dist-tag가 아니라 **floor**다.

## `package.json`의 `reap.autoUpdateMinVersion: "0.18.0"` — 지우지 않는다

0.17 이하의 `check-version`은 SessionStart마다 latest의 버전과 그 package.json의 `reap.autoUpdateMinVersion`을 읽는다. 설치된 버전이 floor보다 낮으면 자동 설치 대신 blocked로 멈춘다(v0.17.7 `check-version.ts` 5번 guard). **v0.18 코드가 읽는 값이 아니다** — 소비자는 0.17 사용자의 check-version이고, 이것을 지우면 0.17 사용자가 세션을 열 때마다 0.18을 자동으로 받아 v0.17 저장 구조 위에서 깨진다.

**그 blocked 메시지는 사용자에게 닿지 않는다.** 출력이 `console.error`인데(`check-version.ts`의 출력 호출 넷 전부) v0.17이 `~/.claude/settings.json`에 심는 훅 두 줄이 `2>/dev/null`로 버린다(`install.ts`의 `REAP_SESSION_HOOKS`). 손으로 `reap check-version`을 쳐야만 보인다.

## 0.17 사용자는 세션 안에서 v0.18을 알 수 없다 (사람 결정, 2026-09-12)

위 사실을 알고 공백을 받아들였다. **0.17 쪽에서는 아무것도 발행하지 않는다.** 안내를 들리게 하는 최소 패치를 0.17.7 위에 올려 0.18보다 먼저 내는 안과, floor를 낮춰 0.17 사용자를 0.18로 끌어오는 안이 함께 검토됐고 둘 다 떨어졌다. 근거는 규모다 — 지난주 버전별 다운로드가 0.17.7 기준 14, 전체 25 남짓이다.

따르는 결과 둘을 적어 둔다. **0.17 라인은 floor 0.18.0에 막혀 얼어붙는다** — 그 뒤로 0.17 사용자에게 어떤 수정도 배달할 수 없다. 그리고 **v0.18로 오는 사람은 스스로 찾아온 사람뿐이다** — README·릴리스 노트·사이트가 그 길을 말하는 유일한 자리다.

## 손으로 올라온 0.17 사용자의 길

이 경로는 **스스로 `npm i -g`를 친 사람에게만** 해당한다. 진입을 알리는 장치는 없다.

1. `npm i -g @c-d-cc/reap`를 직접 실행한다. 이제 `reap`는 0.18이다
2. v0.17이 설치해 둔 SessionStart 훅이 `reap check-version`·`reap load-context`를 부른다 → 0.18이 v0.17 명령 이름을 알아보고 **다음 셋을 안내**한다(`cli.legacy_command`, exit 0): `reap setup` → 새 세션 → `/reap:migrate`
3. `reap setup`이 마켓플레이스 `c-d-cc/plugins` 등록과 `reap@ctod-plugins` 설치를 대신한다
4. 새 세션에서 `/reap:migrate` — 원본은 `.reap-v0_17/`에 보존, 8/8이 옛 홈 자산(slash command·agent·훅·`~/.reap/`)을 목록→동의→삭제

이주를 잊고 작업해도 두 구조가 섞이지 않는다. v0.18이 v0.17 `.reap/`을 알아본다(`store.ts`의 `detectLayout`) — `ctx`는 상태 줄 대신 이주 안내만 내고, `doctor`는 결함으로 보고하고, `make`·`mark`·`init`은 멈춘다. 읽기는 막지 않는다(gen-0119).

## 0.17.8 이행 다리는 발행하지 않는다

0.17.8(일일 캐시·`next` 안내·upgrade agent)은 latest를 0.17 라인에 두는 전제에서만 뜻이 있었다. latest 직접 발행이면 아무에게도 닿지 않으므로 은퇴한다. 태그·publish·main merge를 하지 않는다. `docs/upgrade-agent/reap-upgrade.md`도 같은 이유로 쓰이지 않는다.

정리한 상태는 원격 `c-d-cc/reap`의 **`v0.17.8` 브랜치(c0a2bdd)** 에 있다. 로컬 워킹 카피 `~/cdws/reap_v17`은 2026-09-12에 삭제됐다 — 그 경로를 가리키는 서술을 새로 쓰지 않는다.

## 브랜치 흐름 (2026-09-01, 사람 결정)

**main은 발행된 마지막 상태(v0.17.7, b4d3ae1)에 머문다.** 트랙은 완성됐을 때 main으로 merge한다. main에 직접 커밋하지 않는다.

- **v0.18 브랜치** — 차세대 구현. 발행 = 이 브랜치의 태그 `v0.18.0` push(release.yml은 태그에서 돈다) → main merge
- **v0.17.8 브랜치** — 은퇴한 이행 다리의 보존 자리. 발행하지 않는다

근거: `docs/reap-plan/reap_v_0_18_release/05-open.md` Q6 · `06-release.md`
