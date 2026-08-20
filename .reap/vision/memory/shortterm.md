# Shortterm Memory

## 세션 요약 (gen-092, 2026-08-20)

### auto-update 가 남의 버전을 읽고 남의 설치를 바꾸고 있었다

`getInstalledVersion()` 이 `execSync("reap --version")` 이었다 — **PATH 의 바이너리**이지 그 코드가
속한 패키지가 아니다. 이 저장소에서 실측으로 갈렸다(PATH 0.17.5 vs package.json 0.17.6).
그리고 7단계는 무조건 `npm install -g` 였다 — 프로젝트에 로컬 설치한 사용자의 **전역 설치**가
바뀐다.

**결함이 둘이고 근거가 따로다.** (1)을 고쳐도 (2)는 닫히지 않는다 — 트리거가 "전역이 낡음"에서
"자기가 낡음"으로 **뒤집힐 뿐**이다. backlog 이 스스로 그 정정을 담고 있었고, 그것이 이번 goal 의
절반이었다.

수정: `src/core/package-info.ts` 신설(버전을 아는 다섯 곳 → 하나) + `detectInstallKind` 를
`uninstall.ts` 에서 core 로 이동해 **global 일 때만** 업그레이드.

### 이 세대의 지배적 실패는 "문장"이었다

코드를 고치고 **그 코드를 서술한 바로 옆 문장을 안 고친 것이 여섯 번**이다 — 파일 헤더 2, 함수
doc 2, 테스트 docblock 1, 인라인 주석 1. **셋은 evaluator 가, 셋은 내가** 잡았다. 릴리즈 문서
7파일에도 같은 일이 났고(하지 않는 안내를 약속), 고치면서 **반대 방향으로 한 번 더** 할 뻔했다
("silently" — 하한 미달이면 말을 한다).

evaluator 3라운드: **high → low → low.** 1라운드의 blocker 둘은 **내 수정이 만든 것**이었다.
그중 F1 은 `runningVersion()` 의 `"0.0.0"` 이 truthy 라 `version-unknown` 분기가 죽고
**매 postinstall·매 세션마다 거짓 breaking-change 경고**가 나가는 상태였다 — 옛 코드는 조용했다.

### 지금 상태

- unit **620** (585→) / e2e 329 / scenario 44, 전부 0 fail
- 자기진단 게이트 전 절 통과, 문서 게이트 통과, docs 빌드 통과
- `fix --check` 0 error / 2 warning (gen-052 lineage parent 상속분)
- **`package.json` 0.17.6 유지. push·tag 없음.**

### 다음 세션이 알아야 할 것

- **릴리즈가 바로 다음 순서다.** team lead 계획: 이 세대 → `check-agent-integration.sh` 재실행
  → 태그·발행. **커밋 9개 미푸시.**
- **backlog pending 은 16건이다** (11 → 16; 이번 세대가 5건 추가, source backlog 1건은 소비돼
  lineage 로 갔다). 세대 중에 나는 이것을 "8 → 12" 로 적었는데 **틀렸다** — midterm 에 있던
  "8건"은 gen-086 시점의 수였고 그 뒤 세대들이 더했다. 낡은 수를 재세지 않고 인용했다.
  새 5건 중 둘은 **사용자에게 실제로 일어나는 것**이다: `config.autoUpdate` 가 **읽히지 않는다**(false 로 둬도 자동 업데이트된다),
  `--mark-migrated` 가 버전을 못 읽으면 기록을 `0.0.0` 으로 낮춘다.
  **`autoUpdate` 건은 0.17.6 에 함께 넣을지 인간이 판단할 자리다** — 이번 릴리즈가
  "당신이 언급한 적 없는 설치"를 고치는데 그 절반이 남아 있다.
- **round 4 수정분(주석·artifact only)에 대한 evaluator 4차 확인은 응답이 오지 않은 채 닫았다.**
  round 3 이 이미 blocker 0 이었고 코드 동작 변경이 없어 진행했다. 응답이 늦게 오면 읽어볼 것.
- `checkAutoUpdateGuard` 는 **호출자가 없다**(backlog). `reap uninstall` 의 `unknown` 문구가
  판정을 단정한다(backlog, gen-090 문구).
