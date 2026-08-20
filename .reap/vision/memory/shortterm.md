# Shortterm Memory

## 세션 요약 (gen-093, 2026-08-20)

### 보여주고 · 보존하고 · 심어주면서 · 읽지 않던 스위치

`config.autoUpdate` 는 v0.16 부터 있었고 `reap init` 이 만들고 `reap update` 가 보존하고
`reap config` 가 보여주고 skill 이 문서화하고 `integrity.ts` 가 타입까지 검사했지만
**아무도 읽지 않았다.** `false` 로 둔 사용자는 `false` 를 보면서 전역 설치가 계속 갈아치워졌다.
gen-092 가 *어디에* 설치하는가를 좁혔다면 이 세대가 *할 것인가를 끄는 수단*을 만들었다.

**위임받은 판단 셋**: (1) `performAutoUpdate` **안**, floor 경고 뒤 / 전역 설치 검사 앞 —
끈다는 것은 "설치하지 마라"이지 "말하지 마라"가 아니고, 호출부를 게이트하면 경고가 사라진다.
(2) config 를 못 읽으면 **fail open** — npm 은 postinstall 을 패키지 디렉토리에서 돌리고
거기엔 프로젝트 config 가 없으므로 fail closed 는 설치 경로 전체를 껐을 것이다.
(3) `reap update` 는 무관 — 이 플래그가 끄는 것은 REAP 이 스스로 하는 설치 하나뿐.

### 지금 상태

- unit **627** (620→) / e2e **331** (329→) / scenario 44, 전부 0 fail
- 자기진단 게이트 전 절(opencode 1.3.16) · 문서 게이트 · `vite build` · carrier orphan 기존 1건 ·
  `fix --check` **0 error / 2 warning** (gen-052 상속분)
- **`package.json` 0.17.6 유지. push·tag 없음. 로컬 macOS 에서만 돌았다.**
- **backlog pending 15건** (실측 `grep -l "^status: pending" .reap/life/backlog/*.md`).
  16 → 15, 이 세대가 source 1건을 소비했고 **새로 만들지 않았다.**

### 다음 세션이 알아야 할 것

- **0.17.6 은 아직 발행 전이고 커밋 11개가 unpushed 다.** 남은 순서는
  **층2 재실행(`scripts/check-agent-integration.sh`, ~$0.25) → 태그 → push → publish**.
  태그를 밀면 `release.yml` 이 문서 정합성·버전 하한·자기진단·build 를 거쳐 npm publish 까지
  자동이며 **OIDC 로 발행하는 첫 시도**가 된다.
- **0.17.6 의 구성**: gen-088 `reap uninstall` · gen-089 daemon 폐기 + indexer 내장 ·
  gen-090 source-map 분리 · gen-091 층2 게이트 판정 · gen-092 버전 판독 ·
  gen-093 `autoUpdate` 배선.
- **0.18 plugin 전환 쪽에 새 사실과 미결 셋이 생겼다 — `midterm.md` 의 0.18 절을 읽을 것.**
  요지만: `command` source 발견이 배포 형태 판단을 뒤집을 수 있고, 그것이 확정돼야 update
  관련 backlog 4건의 삭제 여부가 정해진다.
- **이 세션은 handoff 되고 다음 세션은 새로 열린다** (사용자 결정 2026-08-20).
- **`checkautoupdateguard-…` backlog 를 소비할 때 이 세대가 남긴 근거를 그대로 받지 말 것.**
  내가 처음 쓴 문장이 틀렸고 evaluator 가 잡아 정정했다. 정정된 사실: guard 가 **유일하게
  봉사할 수 있는 인구는 하한 미달 `-alpha` 빌드**다 (`performAutoUpdate` 는 `+dev`·`-alpha`
  둘 다 거르고 guard 는 `+dev` 만 거른다). "이미 최신인 설치"는 후보가 아니다 — 들을 것이 없다.
- **자기진단 게이트는 이 세대가 추가한 6단계를 한 번도 실행하지 않는다.** 로컬 pack 된
  tarball 이 `dist/.dev-build` 를 갖고 있어 `performAutoUpdate` 가 2단계에서 반환한다.
  `autoUpdate` 판정은 **unit 으로만** 덮인다.
- **`autoUpdate: false` 가 닿지 않는 자리 둘** — (a) cwd 가 정확히 프로젝트 루트일 때만
  존중된다(`readAutoUpdateSetting` 이 위로 올라가지 않는다). (b) **npm postinstall 경로에는
  원리상 도달하지 않는다** — cwd 가 패키지 디렉토리라 프로젝트 config 가 없다. 즉 낮은 버전을
  고정한 사용자가 `false` 를 둬도 그 설치의 postinstall 은 최신으로 갈아치운다(gen-043 부터의
  동작, 이 세대의 회귀 아님). **되풀이되는 SessionStart 경로는 닫혔다.** 둘 다 프로젝트
  config 로는 못 푼다 — 사용자 레벨 설정이나 env 가 있어야 한다.
- **명시한 버전은 여전히 존중되지 않는다** (team lead 관찰, backlog 없음 — hint 에만 있다).
  postinstall 이 `npm install -g @c-d-cc/reap@latest` 를 부르므로 `npm i -g …@0.17.5` 로
  버전을 고정해 설치한 사용자도 그 자리에서 latest 로 올라간다. gen-092 가 *어느 설치*는
  좁혔지만 *어느 버전으로*는 그대로다. 같은 계열이지만 **별개 판단**이다.
- **테스트 실행이 여전히 개발자의 실제 HOME 에 버전당 1회 쓴다** (`tests/helpers/setup.ts` 의
  `cli()` 가 HOME 을 격리하지 않는다). 이 세대의 새 e2e 는 HOME+XDG 둘 다 격리했다.
