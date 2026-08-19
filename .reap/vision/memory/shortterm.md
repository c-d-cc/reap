# Shortterm Memory

## 세션 요약 (gen-086, 2026-08-19)

### REAP 이 자기 사용자에게 잘못 말하던 것 3건 — 전부 닫았다

정리된 backlog 1건(11건을 합친 것)을 소비했다. **범위는 유저가 고정**했고 지키는 것 자체가 이번 세대의 절반이었다 — 소스 5파일 / 테스트 5파일, backlog 신설 0, 게이트·스크립트 신설 0.

- **`gitPush` 가 stderr 를 버렸다** → `GitPushResult { success, error }`. 옛 문구 `"Check remote configuration and network."` **삭제**. 그 문장이 결함의 본체였다 — 추측인데 진단처럼 읽혔고, 실사례에서 두 가지 모두 정상이었다
- **validation work 재실행 불가** → 두 graph 의 `validation:entry` 에 self-loop. `stage-transition.ts` 무변경. **새 메커니즘을 만들지 않았다**
- **`DaemonNotInstalledError` 가 명시 경로 무시** → `ensureDaemon` 이 `locateDaemon()` 을 쓰고 `missingDaemonRemedy` 를 신설·공유

### 결함 2 의 진짜 증거는 evaluator 가 아니었다

backlog 은 "evaluator prompt 회수 불가"만 적었다. 재현하다 더 강한 것이 나왔다 — **artifact 미작성 분기가 스스로 `nextCommand: "reap run validation"` 을 내보내고 REAP 이 그것을 거부**한다. evaluator 를 안 쓰는 사용자도 겪는다.

그리고 **본 세대가 자기 수정의 첫 사용자**다. validation 에서 `run validation` 을 두 번 불러 evaluator prompt 를 두 번 받았다.

### negative 가 없었으면 못 봤을 것

daemon 항목 첫 negative 에서 fail 이 1건뿐이었다. 내가 쓴 보완 단언 `toContain(DAEMON_BIN_ENV)` 이 **무력**했기 때문 — `DAEMON_LOCATE_HINT` 가 그 변수명을 이미 철자한다. 경로 문자열로 바꾸니 2건. evaluator 가 같은 모양을 하나 더 찾았다(`toContain("daemonBin")`).

### 지금 상태

- unit **555** (545→) / e2e **287** (279→) / scenario 44 / daemon 130, 전부 0 fail
- `package.json` **0.17.5 유지** (의도적 무변경). 태그 미발행
- **로컬 macOS 에서만 돌았다.** push 하지 않았으므로 reap-test dispatch 미실행 — 리눅스는 표본 밖
- `fix --check` 0 error / 3 warning — 전부 기존(lineage parent 2 + `environment/summary.md` 272줄)

### 다음

- **0.17.5 릴리즈 문서 보강 → 태그.** 세대 밖, main agent 소관. gen-084·085 **+086** 내용을 RELEASE_NOTES / NOTICE / 5 로케일에
- daemon 파생 작업은 여기서 끝났다. 남은 pending 7건은 전부 0.18 또는 daemon SCIP

### 열려 있는 갭

- **`ensureDaemon` 배선은 `[독해]` + typecheck 뿐.** 비공개 함수이고 실제 spawn 을 시도해 주입 seam 없이는 검증 불가
- **결함 3 은 오늘 사용자 화면에 뜨는 경로가 없다** — `daemonRequest` 소비처 전수 확인. 짝이 안 맞던 상태의 교정이며 사용자 대면 `[실행]` 증거는 만들 수 없다
- **merge lifecycle 의 self-loop 은 graph·unit 단언뿐.** merge validation 을 두 번 부르는 e2e 가 없다 (merge e2e 자체가 없다)
- `resolveDaemonBin` 이 프로덕션 dead code 가 됐다. 제거는 범위 밖이라 두었다
- `src/cli/commands/run/pull.ts:22` 에 이번에 지운 문장이 fetch 경로에 그대로 있다. 계획이 명시 배제
- `environment/summary.md` 272줄. 근본 정리는 **처방적 서술을 genome 으로 옮기는 작업**이며 손으로 지워 경고를 끄는 것은 genome 이 금한다
