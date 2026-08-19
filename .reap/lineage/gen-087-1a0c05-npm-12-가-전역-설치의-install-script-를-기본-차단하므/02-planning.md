# Planning

## Goal + Spec

**Goal**: install script 가 차단된 상태에서도 REAP 이 쓸 수 있는 물건이 되게 한다.

무엇을 설치하는지는 바꾸지 않는다. **누가 언제 그것을 부르는가**만 바꾼다.

### 접근 비교

세 후보를 놓고 골랐다. 판정 기준은 goal 이 준 것 그대로 — *사용자가 이상을 모르는 채로 고쳐지는가*.

| 안 | 트리거 | 사용자가 몰라도 고쳐지는가 | 비용 | 판정 |
|---|---|---|---|---|
| A. 문서에 "설치 후 `reap install-skills`" | 사람의 기억 | **아니오** | 0 | **기각** — goal 이 명시 배제. genome: 반복 누락은 지시가 아니라 검사로 막는다 |
| B. `init` / `update` / `fix` 세 명령에 매달기 | 그 셋을 부를 때 | 대체로. 그러나 README Quick Start 는 `/reap.init` 이고 그것은 **없는 slash command** 다 | 소 | **기각** — 열거는 다음에 나올 진입점을 담지 못한다 |
| C. **CLI 진입점 전체 + 버전 stamp** | `reap` 무엇이든 1회 | **예** | stamp 파일 read 1회/호출 | **채택** |

B 를 버린 이유를 한 줄 더: 세 명령을 고르는 순간 "왜 그 셋인가"를 다음 사람이 다시 판단해야 한다.
사용자가 가진 것은 `reap` 바이너리 하나뿐이므로, **그 바이너리를 부르는 것 자체**가 조건이어야 한다.

### C 의 형태

```
reap <무엇이든>
   └─ ensureUserLevelAssets()      ← program.parse() 앞
        ├─ ~/.reap/.install-stamp 읽기
        │     { "claude-code": "0.17.5", "opencode": "0.17.5" }
        ├─ 현재 client 의 값 == 현재 버전  →  즉시 반환 (파일 read 1회로 끝)
        └─ 아니면 adapter.syncUserLevelAssets() 후 stamp 갱신
```

- **silent**: 출력 없음. JSON stdout 계약 불변
- **never throws**: 실패 시 stamp 미기록 → 다음 호출에서 재시도
- **client 별 키**: claude-code 프로젝트와 opencode 프로젝트를 오갈 때 매번 재동기화하지 않기 위해

### 왜 stamp 가 필요한가 — [실행] 로 확인한 제약

`tests/helpers/setup.ts` 의 `cli()` 는 HOME 을 격리하지 않는다. 무조건 재설치 설계는
테스트 1회 실행이 개발자의 실제 `~/.claude/` 를 수백 번 덮어쓴다. stamp 는 그것을
**버전당 1회**로 묶는다. 동시에 업그레이드 후(= 버전 변경) 자동 갱신이라는 이득도 같이 온다 —
npm 12 는 업그레이드 시에도 postinstall 을 차단하므로 이쪽도 실제 구멍이다.

### 왜 세 번째 caller 가 아니라 단일 소유자인가

양 adapter 는 이미 `installSkills` 와 `registerSessionIntegration` 이 silent helper 를
공유하는 형태다(gen-064/066). 여기에 진입점 호출을 **또 하나 붙이면** gen-064 가 고친 모양이
그대로 재발한다. 대신 **"사용자 레벨 자산 일습"을 소유하는 `syncUserLevelAssets()` 하나**를
만들고 기존 둘이 그것을 부르게 한다. caller 는 셋이 되지만 **아는 곳은 하나**다.

부수 효과 하나가 딸려온다: 현재 `registerSessionIntegration` 은 `reap-guide.md` 를 빼고 있어
(`reap update` 만 쓰는 사용자에게 CLAUDE.md 의 `@` import 가 빈 곳을 가리킨다) 통합하면 그 구멍도 닫힌다.

## Requirements

### FR

- FR1. `reap` 의 **모든** 명령이 실행 전에 사용자 레벨 자산 동기화를 1회 보장한다.
- FR2. 동기화는 silent 이며, 실패해도 명령 자체를 막지 않는다.
- FR3. 동기화 대상은 현재와 동일하다 — slash commands / agent 정의 / `reap-guide.md` / (claude-code) SessionStart hook. **새 자산 없음.**
- FR4. 대상 client 는 cwd 의 `.reap/config.yml` `agentClient` 로 정한다. 없으면 claude-code (기존 `install-skills` 와 동일).
- FR5. 이미 현재 버전으로 놓여 있으면 재설치하지 않는다(stamp 판정).
- FR6. 자산 설치는 멱등 + prefix-anchored cleanup-then-copy — 기존 계약 유지, 사용자 파일 불가침.
- FR7. `installSkills` / `registerSessionIntegration` 은 같은 소유자 함수를 경유한다(중복 제거).
- FR8. `fix --check` 의 `reap-guide.md missing` 안내가 npm 12 에서 **동작하는 명령**을 가리킨다.
- FR9. 자기진단 게이트가 install script 차단 조건을 **재현하고** 그 상태에서 자산이 놓이는지 검사한다.

### 완료 기준

1. 차단 설치(`--ignore-scripts`) 직후 자산 4종이 없음을 게이트가 **먼저 단언**한다(재현 성립 증명).
2. 그 상태에서 `reap init` 한 번으로 자산 4종이 모두 놓인다 — 게이트가 tarball 에서 센 개수와 일치를 요구.
3. 새 게이트 절을 **수정 전 코드에 돌려 fail** 하는 것을 본다.
4. unit / e2e / scenario / daemon 전 스위트 0 fail (baseline: 555 / 287 / 44 / 130 — 실측으로 확인).
5. `fix --check` 가 깨끗하다(기존 3 warning 외 신규 0).
6. `package.json` 버전 무변경, push/tag/publish 없음.

## Implementation Plan

- [ ] T001 `src/adapters/claude-code/install.ts` — `installReapGuide` export + `home` 주입,
      `installSlashCommandsOnly` / `registerSessionHooks` 에 `home = homedir()` 매개변수 추가,
      `syncUserLevelAssets(home)` 신설(4종 합성, 결과 반환). `installSkills` 를 그 위로 이관.
      *검증*: 기존 unit `install-skills.test.ts` / e2e `install-agents.test.ts` 재실행
- [ ] T002 `src/adapters/opencode/install.ts` — `installReapGuide(home)` export,
      `syncUserLevelAssets(home)` 신설(guide + slash + agents). `installSkills` / `registerSessionIntegration` 이관.
      *검증*: e2e `opencode-install.test.ts` 재실행
- [ ] T003 `src/adapters/types.ts` — `AdapterModule.syncUserLevelAssets(home?)` 추가 + 계약 주석
      (project-level 을 절대 건드리지 않는다는 조건 명시)
- [ ] T004 `src/adapters/claude-code/index.ts`, `src/adapters/opencode/index.ts` — 메서드 배선.
      `registerSessionIntegration` 을 `syncUserLevelAssets` 경유로 교체
- [ ] T005 `src/adapters/index.ts` — `resolveAgentClient(cwd)` 추출(install-skills.ts 와 공유) +
      `ensureUserLevelAssets({ cwd, version, home })` 신설: stamp 판정 → sync → stamp 기록.
      `"synced" | "current" | "failed"` 반환
- [ ] T006 `src/cli/commands/install-skills.ts` — `resolveAgentClient` 재사용(중복 제거)
- [ ] T007 `src/cli/index.ts` — `program.parse()` 앞에서 `await ensureUserLevelAssets(...)`
- [ ] T008 `src/core/integrity.ts` — `reap-guide.md missing` 안내를 `reap install-skills` 로 교정 (FR8)
- [ ] T009 `scripts/check-self-diagnosis.sh` — 새 절: 차단 설치 재현 → 부재 단언 → `reap init` → 자산 4종 단언.
      **T001 착수 전에 작성하고 현재 코드에 돌려 fail 을 본다**
- [ ] T010 `tests/unit/user-level-assets.test.ts` — stamp 의미론: 최초 `"synced"`, 재호출 `"current"`,
      버전 변경 시 재동기화, client 별 키 분리. fake home 주입 + `XDG_CONFIG_HOME` 격리
- [ ] T011 `tests/e2e/user-level-selfheal.test.ts` — `cliWithHome(fresh)` 로 임의 명령 1회 →
      자산 4종 생성 확인, 2회차는 stamp 그대로
- [ ] T012 전 스위트 재실행 + `fix --check` + 게이트 통과 확인

### 의존 순서

T009(검사 먼저, fail 확인) → T001~T004(adapter) → T005~T007(배선) → T008 → T010/T011 → T012.

### 영향받는 기존 테스트

- `tests/unit/install-skills.test.ts`, `tests/unit/adapter-dispatch.test.ts` — adapter 인터페이스에 메서드가 늘어난다. dispatch 테스트가 메서드 집합을 단언하면 수정
- `tests/e2e/install-agents.test.ts`, `tests/e2e/opencode-install.test.ts` — `cliWithHome` 으로 `init` 을 부르는 케이스에서 이제 자산이 함께 놓인다. 개수 단언이 있으면 조정
- `tests/e2e/install-skills-fix-agreement.test.ts` — T008 문구 변경 영향 확인

## Additional Findings

- `reap fix`(비-check)는 이미 `reap-guide.md` 를 복원한다. 틀린 것은 `--check` 의 안내 문구 하나뿐이다.
- `program.parse()` 는 동기이며 `src/cli/index.ts` 는 ESM 이다 — top-level `await` 로 진입점 앞에 끼울 수 있다.
- 비-REAP 디렉토리에서 `reap` 를 부르면 client 판정은 claude-code 로 떨어진다. 이는 오늘 `postinstall`
  이 하는 것과 **정확히 같은 동작**이므로 새 회귀가 아니다.

## Scope 밖 — 하지 않는 것

- backlog 신설 0 (유저 지시)
- 버전 bump / tag / push / publish 0
- 설치되는 자산의 내용·목록 변경 0
- `check-version` 의 auto-update 경로는 건드리지 않는다(별개 축이며 이번 결함과 인과가 없다)
