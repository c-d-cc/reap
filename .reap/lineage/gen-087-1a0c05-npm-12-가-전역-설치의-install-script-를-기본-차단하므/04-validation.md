# Validation

**Verdict: pass**

## 실행 결과 — 전부 fresh **[실행]**

| 검사 | 명령 | 결과 |
|---|---|---|
| TypeCheck | `npm run typecheck` | 통과 (출력 없음) |
| Build | `npm run build` | 통과 (`index.js 0.60 MB`) |
| Unit | `npm run test:unit` | **568** pass / 0 fail |
| E2E | `npm run test:e2e` | **292** pass / 0 fail |
| Scenario | `npm run test:scenario` | 44 pass / 0 fail |
| Daemon | `cd daemon && bun test` | 130 pass / 0 fail |
| 자기진단 게이트 | `bash scripts/check-self-diagnosis.sh` | 전 절 통과, exit 0 (opencode 1.3.16) |
| 구조 진단 | `node dist/cli/index.js fix --check` | 0 error / 4 warning (전부 기존) |

baseline 대비: unit 555 → 568 (+13), e2e 287 → 292 (+5). scenario / daemon 불변.

남은 warning 4건은 이번 변경과 무관한 기존 항목이다 — lineage parent 2건,
`longterm.md` 51줄, `environment/summary.md` 273줄. 뒤 둘은 reflect 의 pruning 대상.

## 완료 기준 대조

| # | 기준 | 결과 |
|---|---|---|
| 1 | 차단 설치 직후 자산 부재를 게이트가 **먼저** 단언 | 충족 — `ok blocked install leaves no user-level assets (condition reproduced)` |
| 2 | `reap init` 한 번으로 자산 4종이 tarball 이 센 개수만큼 놓임 | 충족 — `ok the first reap command restores all user-level assets` |
| 3 | 새 게이트 절이 **수정 전 코드에 fail** | 충족 — 4개 자산을 개별로 보고하며 fail (03-implementation.md 에 전문) |
| 4 | 전 스위트 0 fail | 충족 (위 표) |
| 5 | `fix --check` 신규 0 | 충족 |
| 6 | 버전 무변경 / push·tag·publish 없음 | 충족 — `package.json` 0.17.5 그대로 |

## Evaluator 검토 — `reap-evaluate` (independent)

**severity: high 로 기록** (`reap run validation --phase report-evaluator`).
evaluator 는 모든 수치를 자기 손으로 재실행했고, 별도 복제 트리에서 negative 두 건을 재현했다.

### 제기 1 (HIGH) — **본 세대에서 수정함**

> 부분 설치가 성공으로 stamp 되고 다시는 재시도되지 않는다.

네 installer 중 셋이 자기 실패를 삼킨다(`installAgents` 의 try/catch, `installReapGuide` 의
`fileExists` 분기, `registerSessionHooks` 의 포괄 catch). 초안의 `syncUserLevelAssets` 는 counts 를
돌려줬지만 dispatcher 가 버렸고, 계약 타입이 `Promise<unknown>` 이라 쓸 수도 없었다.

evaluator 의 실측:

```
A  ~/.claude/agents 쓰기 불가   → "synced" | commands 19 | agents 0 | stamp 기록됨
B  settings.json 파싱 불가       → "synced" | hook 없음        | stamp 기록됨
   B 두 번째 호출                → "current" (해당 버전에서 영구히 재시도 없음)
```

B 는 실제로 일어난다 — `~/.claude/settings.json` 을 손으로 편집한 사용자(주석, 마지막 쉼표)가
SessionStart hook 을 **조용히 영구 상실**한다. 변경 전에도 같은 삼킴이 있었으나
`install-skills`/`update` 마다 재시도됐다. **그것을 종결시키는 것이 stamp 였다.**

이것은 이번 세대가 없애려는 실패 형태 그 자체(바이너리는 돌고 통합은 없고 오류도 없음)이므로
**수용이 아니라 수정**을 택했다. 기존 diff 안에서 끝난다:

- `UserLevelSyncResult { complete, missing }` 계약 신설, `Promise<unknown>` 제거
- `installReapGuide` / `registerSessionHooks` 가 성공 여부를 반환
- 양 adapter 가 `missing` 을 계산
- `ensureUserLevelAssets` 는 `complete` 일 때만 stamp — 아니면 `"partial"` 반환, stamp 미기록

대가: 환경이 망가진 사용자는 매 명령마다 재복사한다. 영구 상실보다 낫고, 환경을 고치면
**재설치 명령 없이** 다음 호출에서 정상화된다(테스트로 확인).

### 제기 2 (LOW) — 수정함

`const home = opts.home ?? homedir()` 가 `try` 밖에 있었다. 진입점에서 도는 코드이므로
`try` 안으로 옮겼다.

### 제기 3 (LOW) — 기록만

자산이 stamp 이후 삭제되면 복구되지 않는다(트리거가 부재가 아니라 버전이므로).
`fix --check` 는 `reap-guide.md` 만 보고 slash command·agent 의 부재는 보지 않는다.
**의도된 절충이며 이번 범위 밖** — 03-implementation.md 의 "알아 둘 것" 에 함께 있다.

### evaluator 가 지적한 기록 오류 — 정정

- **guide 제거 negative 를 "unit 1 fail" 로 적었다.** 그 수치는
  `bun test tests/unit/user-level-assets.test.ts` **한 파일**의 결과이며, unit 전체로는 2 fail 이다.
  03-implementation.md 의 표는 파일 단위 실행 결과로 읽어야 한다.
- **opencode 의 guide 설치는 문자열 단언으로만 묶여 있었다.** evaluator 지적대로 행위 검증이
  없었다. `an opencode-only home still gets reap-guide.md` 를 추가했고, negative(guide 설치 제거)에서
  행위 단언 1 + 문자열 단언 1 = 2 fail 을 확인했다. **[negative]**
- **guide 문장이 부정확했다.** "installs whatever the current version is missing" 은 동작이 아니다 —
  버전 stamp 를 비교한다. 문장을 교체하고 `.reap/reap-guide.md` 와 동기화했다.

### evaluator 가 찾은 범위 밖 작업 — **거절, 각 1줄**

- `tests/helpers/setup.ts` 의 `cli()` 가 HOME 을 격리하지 않는다 (개발자 HOME 쓰기의 근원)
- `fix --check` 에 slash command·agent 의 사용자 레벨 부재 검사가 없다

## negative — 이번 라운드 **[negative]**

| 깨뜨린 것 | 결과 |
|---|---|
| `ensureUserLevelAssets` 의 `complete` 게이트 제거 | unit 파일 2 fail |
| opencode 의 `installReapGuide` 호출 제거 | 행위 1 + 배선 1 = 2 fail |

## 이 검증이 증명하지 못하는 것

- **게이트 6절은 "문서가 가리키는 첫 명령이 복구한다"를 증명한다. "어떤 명령이든 복구한다"는
  증명하지 않는다** — 그쪽은 e2e(`status` 로 검증)가 담당하며, 진입점 호출을 제거하는 negative 로
  4 fail 을 확인했다. 게이트 주석은 이 구분을 말하지만 단언 자체는 `init` 하나만 통과한다.
- **게이트 6절은 claude-code 만 본다.** "npm 12 차단 + OpenCode 사용자" 조합은 fake-home
  unit/e2e 로만 덮이며, 실제 패키징 산출물로는 검증되지 않았다.
- **`ensureUserLevelAssets` 의 동시 실행은 분석만 했다.** evaluator 판단: 두 프로세스가 같은 바이트를
  cleanup-then-copy 하고 `registerSessionHooks` 는 같은 입력에서 같은 JSON 을 만들므로 수렴한다.
  제3자가 그 순간 `settings.json` 을 쓰는 lost-update 는 남는다. **[독해]**
- **개발자 HOME 오염은 관측됐고 해소되지 않았다.** 작업 트리의 실험적 slash command·agent 내용이
  개발자의 살아 있는 클라이언트로 들어갈 수 있다(세션 진행 중에도). 근원은 `cli()` 의 HOME 미격리다.
