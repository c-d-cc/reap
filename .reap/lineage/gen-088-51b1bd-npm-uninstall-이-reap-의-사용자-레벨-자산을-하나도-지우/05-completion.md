# Completion

## Summary

**Goal**: `npm uninstall` 이 REAP 의 사용자 레벨 자산을 하나도 지우지 않는다 — 제거 경로 자체가 없다.
`reap uninstall` 을 신설해 daemon 정리와 npm 패키지 제거까지 한 명령으로 수행하고,
이미 지워버린 사용자를 위한 `npx` 회수 경로를 함께 만든다.

**결과**: 달성. 소스 10파일 / 테스트 4파일 / 문서 11파일 / 스크립트 1. backlog 신설 1건(범위 밖 파생),
버전 무변경.

### 무엇이 결함이었나

`npm uninstall -g @c-d-cc/reap` 는 패키지 디렉토리와 bin 심볼릭 링크만 지운다. 홈의 것들 —
slash command 19, agent 정의 2, `~/.claude/settings.json` 의 SessionStart 엔트리 2,
`~/.reap/reap-guide.md`, `.install-stamp`, `~/.reap/daemon/` — 은 postinstall 이 실행한 REAP 코드가
쓴 것이고 npm 은 그 존재를 모른다.

그리고 **걸 수 있는 훅이 없다.** `preuninstall`/`postuninstall` 은 npm 10.9.4(전역·로컬)와
12.0.2(전역) 어디서도 실행되지 않는다 — 같은 probe 가 install 단계에서는 마커를 남겼으므로 부재가
스스로 증명된다. gen-087 의 대칭 결함이되 그보다 나쁘다.

해로움의 순위가 다르다. 파일 잔여물은 쓰레기지만 **hook 엔트리는 REAP 이 사라진 뒤에도 매 세션 없는
명령을 부른다.** `2>/dev/null || true` 로 감싸여 있어 아무것도 눈에 띄지 않는다.

### 무엇을 만들었나

**실행 주체를 REAP 쪽으로 가져왔다.** 사용자가 치는 명령은 하나이고 순서는 명령이 안다:

1. **진입 훅을 건너뛴다** — gen-087 이 모든 명령 앞에 둔 `ensureUserLevelAssets` 를 지나면
   지우기 직전에 설치한다. npx 경로에서는 최악의 경우 스탬프만 남긴다
2. **daemon 을 멈춘다 — 띄우지 않고.** `daemonRequest` 의 첫 줄이 `ensureDaemon` 이라
   꺼진 daemon 에게 health 를 물으면 **띄운 뒤 죽인다**. `stopDaemonIfRunning` 을 신설하고
   `daemon stop` 도 경유시켰다
3. **홈 자산을 지운다** — 양 adapter 를 모두 쓸고(`agentClient` 와 무관), `~/.reap/` 는
   **allowlist** 로만, `settings.json` 은 **개별 hook 단위**로 필터
4. **npm 에 넘긴다** — 전역 설치로 확신될 때만. 그 외에는 명령만 안내한다

### 두 가지 안전 구조

**`~/.reap/` 는 allowlist 다.** 이 판단은 추론이 아니라 실측에서 나왔다 — 개발자 머신의 `~/.reap/` 에
REAP 이 만들지 않은 **사용자 private key** 가 있었다. blocklist 는 오늘 존재하는 사용자 파일만 피할 수
있고, 이 디렉토리는 도구 이름을 달고 있어 사람들이 물건을 넣는다. 목록에 없는 것은 무조건 남는다.
디렉토리 자체는 `rmdir` 로만 지운다 — 비어 있지 않으면 거부한다.

**`settings.json` 은 통째로 다루지 않는다.** REAP 은 엔트리당 hook 하나를 쓰지만, 사용자가 같은 엔트리에
자기 명령을 합쳐 넣었을 수 있다. 개별 hook 단위로 걸러 남는 것이 없을 때만 엔트리를 버린다.
파싱 불가한 JSON 은 손대지 않는다.

## Lessons Learned

### 부재만 보는 단언은 두 상태를 구분하지 못한다 — 이번에도 한 번 만들었다

npx 형태 e2e 를 쓰고 진입 훅 우회를 없애는 negative 를 돌렸는데 **green 이었다.** 훅이 자산을 다시 깔아도
직후 uninstall 이 스탬프까지 지우므로 최종 상태가 같기 때문이다. gen-086 이 걸린 것과 같은 모양이고,
그 교훈을 읽은 세대가 다시 만들었다.

구분자를 **재설치만이 만들어내는 것**으로 바꿨다 — `~/.claude/agents/` 디렉토리. `installAgents` 는
`ensureDir` 를 부르고 제거는 파일만 unlink 하므로, 디렉토리가 없다 = 재설치가 없었다.

같은 실수를 daemon 테스트에서 한 번 더 했다. `daemonStopped === null` 은 구분자가 아니다 —
**못 뜬 daemon 도 null 을 준다.** 두 구현이 공유할 수 없는 것은 `ensureDaemon` 의 3초 폴링이었고,
그래서 구분자는 경과 시간이다.

교훈은 "negative 를 돌려라"가 아니라 **"negative 가 green 이면 단언을 의심하라"** 다.
그리고 negative 는 **단독으로도** 돌려야 한다 — daemon 테스트는 전체 파일에서는 다른 테스트가 대신
빨개졌고, 단독 실행에서만 자기 단언이 무력함이 드러났다.

### 검사를 고치면서 릴리즈를 깨뜨렸다 — evaluator 가 잡았다

자기진단 게이트가 **배포된 패키지를 진단하고 있었다.** tarball 을 격리 prefix 에 설치하면 postinstall 의
auto-update 가 `npm install -g @latest` 를 돌리고, npm 이 lifecycle script 에 `npm_config_prefix` 를
물려주므로 그 재설치가 같은 prefix 로 들어가 방금 설치한 것을 덮어쓴다. 게이트의 존재 이유가 조건부로
거짓이었다.

고쳤다 — 설치 시 대상 prefix 의 bin 을 PATH 앞에 두어 **실제 전역 설치의 조건을 재현**하고,
설치 직후 번들 sha 가 pack 한 것과 같은지 단언했다. 그리고 **그 수정이 다음 릴리즈를 red 로 만들었다.**
CI 는 `.dev-build` 를 찍지 않아 `+dev` 조기 반환이 사라지고, `performAutoUpdate` 가
`installed === latest` 로만 판단해 **아직 배포되지 않은 상위 버전을 다운그레이드**한다.
`release.yml` 은 게이트를 publish 앞에서 돌린다.

내 검사 전부가 초록인 상태에서 evaluator 가 찾았다. 두 세대 연속으로 같은 값을 하고 있다.

교훈 둘:
- **검사의 환경을 바꾸면 그 환경이 만드는 새 조건을 따져야 한다.** 나는 "무엇이 고쳐지는가"만 봤고
  "무엇이 새로 성립하는가"는 보지 않았다. 그 전까지 CI 가 안전했던 것은 **우연** 이었다 —
  러너에 `reap` 이 없어 버전 조회가 null 이었을 뿐이고, 내 수정이 그 우연을 제거했다.
- **"다르면 업데이트"는 "새것이면 업데이트"가 아니다.** `!==` 는 뒤로 가는 것도 허용한다.
  비교는 `core/semver.ts` 가 소유하고 있었는데 이 자리만 자기 판단을 하고 있었다.

### 머신 상태에 기대는 negative 는 negative 가 아니다

daemon 이 아니라 내 실험이 개발자의 전역 reap 을 0.17.4 → 0.17.5 로 올렸다. 그 순간
`installed === latest` 가 되어 **결함이 재현되지 않게 됐다.** 아침에 성립하던 조건이 오후에 사라졌다.

`reap --version` 이 `0.17.0` 을 답하는 shim 을 PATH 앞에 놓아 조건을 강제했다.
게이트 § 6 이 npm 버전으로 추론하지 않고 `--ignore-scripts` 로 조건을 만드는 것과 같은 이유다 —
**조건을 관찰하지 말고 만들어라.**

### 고아 표식은 지시다

`reap:carrier(reap-home-asset-set)` 을 하나 심었더니 `--orphans` 가 고아로 잡았다. 신호대로 따라가
같은 사실을 아는 나머지 넷을 표시했다 — 양 adapter 의 `installReapGuide`, `installStampPath`,
reap 쪽 `DAEMON_ROOT`, 그리고 **daemon 패키지의 `daemon/src/paths.ts`**.

마지막이 표식이 옳은 도구인 이유다. daemon 은 별도 npm 패키지라 **상수 공유가 구조적으로 불가능**하다.
"공유 가능하면 공유가 낫다"는 원칙의 나머지 절반은 "불가능한 경계를 식별하라"이다.

### 사고 — 격리 없이 파괴적 명령을 돌렸다

배선 확인 중 `uninstall --confirm` 을 fake HOME 없이 실행해 실제 홈의 REAP 자산을 지웠다.
gen-087 의 self-heal 이 다음 명령에서 전부 복구했고 private key 는 allowlist 덕에 살아남았다.
**파괴적 명령을 만드는 세대는 그 명령의 첫 오작동 대상이 자기 개발 환경이라는 것을 계획에 넣어야 한다.**
이후 모든 수동 실행은 fake HOME + `REAP_DAEMON_PORT` 로만 했다.

## Next Generation Hints

> 제안일 뿐이다. 무엇이 backlog 이 될지는 인간이 정한다. 이번 adapt 에서 backlog 을 만들지 않는다.

### plugin 전환 시 `reap uninstall` 은 어떻게 바뀌는가 (사용자 명시 요구)

곧 착수할 트랙이므로 **지금 4단계 구조를 아는 사람이 적어둔다.** 상세 리서치는
`.reap/vision/design/plugin-distribution.md` 로 별도 정리된다 — 여기에는 uninstall 에 닿는 것만 적는다.

- **2단계(daemon)와 4단계(npm)는 무변경.** `/plugin uninstall` 은 `~/.reap/daemon/` 도 npm 패키지도
  모른다. **전환 후에도 `reap uninstall` 이 유일한 완전 제거 경로**다.
- **3단계(홈 자산)만 payload 가 바뀐다.** claude-code 몫이 "파일 21개 제거"에서
  **`settings.json` 의 `extraKnownMarketplaces` + `enabledPlugins` 에서 REAP 항목만 빼기**로.
  이번에 만든 **개별 hook 단위 수술 로직이 같은 모양 그대로 재사용된다** — 사용자 것은 남기고
  REAP 것만 빼는 그 구조. `unregisterSessionHooks` 가 그 원형이다.
- **OpenCode 몫은 통째로 남는다.** OpenCode 에는 plugin 대응물이 없다. 전환은 claude-code 편면이며
  **비대칭이 영구화된다** — `removeUserLevelAssets` 의 adapter 별 구현이 갈라지는 첫 지점이 된다.
- **1단계(진입 훅 우회)도 남는다.** `ensureUserLevelAssets` 가 OpenCode 때문에 살아 있다.
- **`removeUserLevelAssets` 는 전환의 전제다.** plugin 전환 backlog 의 미결 1번이
  "기존 `~/.claude/commands/reap.*.md` 19개가 plugin 과 중복 노출되는데 누가 언제 지우는가"이며,
  그 답이 이번 세대의 산출물이다. **버려지지 않고 마이그레이션 도구가 된다.**
- **새로 생기는 잔여물 하나 — 이것이 가장 중요하다.** marketplace source 를 `command`
  (`{"source":"command","command":"reap plugin-root"}`)로 고르면 plugin 실체가 npm 패키지 안에 있으므로
  `npm uninstall` 이 파일은 지운다. 그러나 **`settings.json` 의 등록 항목은 남고, 그것이 가리키는 명령은
  더 이상 존재하지 않는다.** Claude Code 가 세션마다 그 명령을 실행하려다 실패한다 —
  **이번 세대가 없앤 "REAP 이 사라진 뒤에도 매 세션 없는 명령을 부르는 hook 엔트리"와 정확히 같은 모양이
  다른 자리에서 재발한다.** 전환 설계는 이것을 **처음부터 uninstall 대상에 넣어야 한다.**
- **plugin cache 디렉토리는 REAP 이 지우지 않는 편이 옳아 보인다** — Claude Code 소유이고 직접 지우면
  클라이언트 상태와 어긋난다. 다만 등록만 해제하고 캐시를 남기면 그것도 잔여물이다.
  **설계 판단이 필요한 지점으로 남긴다.**

- **`reap daemon status` 도 보고하려고 daemon 을 띄운다.** D2 는 `stop` 만 고쳤다. `statusCmd` →
  `daemonRequest` → `ensureDaemon`. 다만 **midterm 이 daemon 폐기 + indexer 내장을 결정했으므로**
  이 항목은 그 작업에 흡수될 가능성이 높다 — 단독 수정은 낭비일 수 있다.
- **daemon 폐기가 이 세대의 코드에 닿는 지점**: `npmRemovalTargets` 이 `@c-d-cc/reap-daemon` 을 인자에
  넣고 `DaemonAvailability.source` 로 checkout 을 가른다. **폐기 후에도 이미 설치한 사용자에게는 그 제거가
  필요**하므로 경로 자체는 유지해야 하지만, `resolveDaemonAvailability` 의존은 indexer 내장 시 함께 봐야 한다.
- **`auto-update 가 PATH 의 reap 버전을 읽는다` backlog 이 pending 이다.** 이번 세대가 게이트 쪽을 막고
  다운그레이드를 고쳤으나, `getInstalledVersion()` 이 PATH 를 읽는 것 자체는 그대로다.
  로컬 설치 사용자가 전역 설치를 자기도 모르게 업그레이드당하는 경로가 남아 있다.
- **`resolveDaemonBin` 은 여전히 프로덕션 dead code 다** (gen-086 이 남긴 것). 이번에도 범위 밖이었다.
- **`npmRemovalTargets` 의 `checkout` 분기는 현재 도달 불가**하다 — 저장소의 workspace daemon 은
  `source: "package"` 로 분류된다. 가드를 남겨 두었으나 FR6 을 실제로 지키는 것은 install-kind 게이트다.
  `locateDaemon` 의 분류가 사용자 관점에서 옳은지는 따로 볼 가치가 있다.
- **0.17.5 릴리즈 문서에 이번 건을 넣을 자리.** 증상이 "지워도 안 지워진다"라 changelog 한 줄보다 큰
  자리가 맞을 수 있다. README 에는 이미 5개 언어로 들어갔다.
- **Windows 는 여전히 표본 밖이다.** 자기를 지우는 npm 호출이 파일 잠금으로 실패할 수 있다는 서술은
  `[독해]` 이며, 실패해도 홈 정리는 끝난 뒤라는 것이 설계상의 안전장치다.


## Fitness Evaluator 라운드 (validation 라운드와 별개)

`reap-evaluate` 를 fitness 에서 다시 돌렸다. 모든 수치를 스스로 재실행해 확인했고
(unit 600 / e2e 302 / scenario 44 / daemon 130 / 게이트 16.2초), 코드·테스트·게이트에는
**완료를 막는 것이 없다**고 판정했다. 다만 **코드 밖에서 high 1건**을 찾았다:

**`midterm.md` 의 릴리즈 서술이 npm 에 의해 반증된다.** "release run 이 게이트에서 실패했고 아무것도
발행되지 않았다 — 태그를 옮겨야 한다"는 서술이 남아 있었는데, 실제로는 `latest` = 0.17.5,
태그 `v0.17.5` = 현재 HEAD, 배포 번들에 gen-084·086·087 코드가 **들어 있다**(gen-088 것만 없다).
직접 확인했다. **이 세대 자신이 그 반증을 손에 쥐고 있었다** — 새 backlog 에 "배포본과 byte-identical"
이라고 적었고, 그것은 0.17.5 가 발행돼 있어야만 관찰 가능한 사실이다.

longterm 이 이미 두 번 이름 붙인 모양이다 — "물려받은 유예는 다시 재는 claim 이다",
"backlog 의 주장을 실행하지 말고 검증하라". 그것을 승격시킨 바로 그 reflect 에서 같은 일이 일어났다.

해당 문단은 이후 갱신됐고(0.17.5 발행 완료 / 다음은 0.17.6), shortterm 도 맞췄다.

evaluator 의 low 3건 중 npx 문구는 고쳤다 — 침묵으로 바꾼 것이 과교정이었다. `@c-d-cc/reap` 만 지우고
`@c-d-cc/reap-daemon` 을 남긴 사용자가 npx 로 올 수 있으므로, 존재를 단정하지 않는 중립 문구
("If either package is still installed, remove it with: …")로 바꿨다. 나머지 둘
(`environment/summary.md` 증가, 파괴적 명령 사고가 longterm 에 없음)은 각각 근본이 genome 이동이라는 것과
longterm 이 한도에 있다는 것을 이유로 이번에는 남긴다.


## Adapt — Genome Review

**이번 세대에서 genome 을 수정하지 않았다.** embryo 라 허용되지만 계획이 정당화하지 않았고,
팀 리드 브리프가 immutable 로 취급하라고 지시했다.

### 제안 — evolution.md 에 두 문장을 추가할 가치가 있는가 (인간 판단)

evolution.md 의 「검사를 만들 때 — 먼저 실패시켜라」 절은 **negative 가 red 인 경우만** 다룬다.
이번 세대는 그 절이 다루지 않는 두 경우에 걸렸다:

1. **negative 가 green 이면 단언을 의심하라.** 진입 훅 우회를 없앴는데 테스트가 통과했다 —
   최종 상태가 같았기 때문이다. "검사를 먼저 실패시켜라"를 지켰는데도 무력한 단언이 남았다.
   그리고 **negative 는 단독으로도 돌려야 한다** — 파일 전체 실행에서는 다른 테스트가 대신 빨개져
   그 사실이 가려졌다.
2. **검사의 환경을 바꾸면 새로 성립하는 조건을 따져라.** 게이트에 PATH 한 줄을 넣어 한 결함을 막았고,
   그 줄이 **다음 릴리즈를 red 로 만들 조건**을 새로 성립시켰다.

둘 다 longterm memory 에는 이미 넣었다(기존 bullet 에 접어서). genome 으로 승격할지는 **인간 판단**이다.
승격 시 비용이 따라온다 — `src/templates/evolution.md` 동기화 + **migration note**(gen-072: 템플릿만
고치면 기존 프로젝트에 아무것도 도달하지 않는다) + 그 note 를 담을 버전. 이번 세대는 버전을 올리지 않으므로
**0.17.6 작업과 함께 하는 것이 자연스럽다.**

### Embryo → Normal 전환 판단

| 조건 | 상태 |
|---|---|
| generation 수 | 88 (기준 6+) — 충족 |
| genome 수정 빈도 추세 | **gen-084~088 다섯 세대 연속 genome 무수정.** 감소를 넘어 0 |
| application.md 안정성 | 정체성·아키텍처 서술이 안정. 최근 변경은 전부 environment 쪽 |
| abort 빈도 | 최근 없음 |
| vision 명확성 | goals.md 에 실행 가능한 항목, midterm 에 0.17.6·0.18 구체 계획 |

**형식 조건은 전부 충족한다.** 그리고 이번 세대가 **전환에 유리한 증거를 하나 더 만들었다** —
다섯 세대가 genome 을 immutable 로 **자발적으로** 취급했고 그 때문에 막힌 작업이 없었다.
실제로는 이미 normal 처럼 운용되고 있다.

**그럼에도 제안이지 결정이 아니다.** 2026-03-26 유저 판단("REAP 자체가 self-evolving 중이라 보수적")이
여전히 서 있고, 위 § 이 곧 genome 수정을 제안하고 있다는 것 자체가 그 유보의 근거이기도 하다.
**전환을 승인하시면 backlog 은 adapt 밖에서 만든다** — adapt 에서 backlog 생성은 금지다.

### 이번 세대의 backlog

신설 **1건**뿐이며 implementation 단계에서 만들었다(adapt 아님):
`auto-update-가-path-의-reap-버전을-읽는다-…md`. adapt 에서 추가 생성 **없음**.
