# Completion

## Summary

**Goal**: npm 12 가 전역 설치의 install script 를 기본 차단하면서 REAP 의 사용자 레벨 통합이
통째로 설치되지 않는다. `postinstall` 하나에만 걸린 그 의존을 끊고, 자기진단 게이트가 그 조건을
재현해 검사하게 한다.

**결과**: 달성. 소스 10파일 / 테스트 4파일 / 스크립트 1. backlog 신설 0, 버전 무변경.

### 무엇이 결함이었나

REAP 의 사용자 레벨 자산은 넷이다 — slash command 19개, agent 정의 2개, `~/.reap/reap-guide.md`,
SessionStart hook. 이 넷을 놓는 코드는 정상이었다. **부르는 경로가 `scripts/postinstall.sh` 하나뿐**인
것이 결함이다. 실측:

```
정상 설치        : commands 19 / agents 2 / guide 있음 / hook 있음
--ignore-scripts : commands  0 / agents 0 / guide 없음 / hook 없음
                   바이너리는 동작한다. 오류도 경고도 없다.
```

그 상태에서 `reap init` 을 해도 사용자 레벨은 그대로 0 이고, README 의 Quick Start 는 **`/reap.init`** —
없어진 그 slash command 다. 사용자에게 남는 문이 없었다.

덤으로 `fix --check` 는 `"run 'npm install -g @c-d-cc/reap' to reinstall"` 이라고 답했다.
**그 재설치가 바로 차단되는 동작이다.** 따르면 같은 자리로 돌아온다.

### 무엇을 바꿨나

**설치되는 것은 그대로 두고, 부르는 곳만 바꿨다.**

1. **단일 소유자** — adapter 마다 `syncUserLevelAssets(home)` 하나가 자산 일습을 안다.
   `installSkills` / `registerSessionIntegration` / 새 진입점 셋이 이것을 경유한다.
   caller 는 셋이지만 **목록을 아는 곳은 하나**다(gen-064 교훈의 연장 — 세 번째 caller 를 덧붙이지 않았다).
2. **진입점** — `program.parse()` 앞에서 `ensureUserLevelAssets`. 명령 셋을 고르지 않았다.
   차단된 사용자가 가진 것은 바이너리 하나이므로 **부르는 것 자체**가 조건이어야 한다.
3. **stamp** — `~/.reap/.install-stamp` 가 client 별로 설치된 버전을 기록한다.
   현재 버전이면 파일 read 1회로 끝난다.
4. **게이트 6절** — tarball 을 `--ignore-scripts` 로 설치해 조건을 강제 재현하고,
   **부재를 먼저 단언한 뒤** 복구를 단언한다. 개수는 설치된 패키지에서 센다.

## Lessons Learned

### 통합이 drift 를 드러냈다

`registerSessionIntegration` 은 `reap-guide.md` 를 빼고 있었고 주석이 그 이유를 적고 있었다 —
"postinstall 과 install-skills 의 몫". **분담의 전제가 사라졌는데 분담만 남아 있었다.**
`reap update` 만 쓰는 사용자는 CLAUDE.md/AGENTS.md 가 빈 경로를 import 하는 상태였다.
목록을 한 곳으로 모으는 작업이 그것을 자동으로 닫았다 — 중복 제거의 값은 "이후 어긋나지 않는다"만이
아니라 **"이미 어긋나 있던 것이 보인다"** 이기도 하다.

### stamp 가 삼킨 실패를 영구화했다 — evaluator 가 잡았다

초안은 sync 가 반환하면 stamp 를 찍었다. 그런데 네 installer 중 셋이 자기 실패를 삼킨다.
evaluator 의 실측: `~/.claude/settings.json` 이 파싱 불가면 hook 없이 `"synced"` + stamp 기록,
두 번째 호출은 `"current"`. **손으로 편집한 settings.json 을 가진 사용자가 SessionStart hook 을
조용히 영구 상실**한다.

변경 전에도 같은 삼킴은 있었다. 다만 매 `install-skills`/`update` 가 재시도했다.
**종결시킨 것이 stamp 였다** — 그리고 그 결과는 이번 세대가 없애려던 형태와 정확히 같다:
바이너리는 돌고, 통합은 없고, 오류는 없다.

일반형: **캐시는 자기가 캐싱하는 작업이 성공했는지 모른다.** "함수가 반환했다"는 증거가 아니다.
성공을 기록하려면 성공을 확인해야 한다. `UserLevelSyncResult { complete, missing }` 로 계약을
바꾸고 `complete` 일 때만 stamp 한다. 부분 설치는 재시도되고, 환경을 고치면 **재설치 명령 없이**
다음 호출에서 정상화된다.

### 검사가 잡을 수 없는 자리를 검사로 막으려 하지 않았다

`--ignore-scripts` 를 쓴 것은 npm 버전 비의존을 위해서다. `release.yml` 이 게이트를 node 번들 npm 에
고정해 뒀으므로, 버전으로 조건을 추론했다면 그 고정이 바뀌는 날 **아무것도 재현하지 않으면서 pass 를
보고**하게 된다. 그래서 부재 단언을 먼저 놓았다 — 재현이 성립하지 않으면 그 자리에서 fail 한다.

### negative 를 읽기 전에 패치가 붙었는지 확인해야 한다

첫 negative 에서 파이썬 치환이 타입 오류로 조용히 실패했고 "10 pass" 를 받았다.
**적용 실패와 검사 무력은 화면에서 같아 보인다.** 치환 결과를 assert 로 확인하고 다시 돌렸다.

## 인접 발견 — 기록만 한다 (유저 결정 2026-08-20)

backlog 로 만들지 않는다. 다음 세대가 읽을 자리는 여기다.

- **`tests/helpers/setup.ts` 의 `cli()` 가 HOME 을 격리하지 않는다.** 이번 변경으로 테스트 실행이
  개발자의 실제 `~/.claude/`·`~/.config/opencode/`·`~/.reap/` 에 버전당 1회 쓴다(관측됨).
  내용은 `install-skills` 와 같지만 **작업 트리 중간 상태의 agent 정의가 살아 있는 클라이언트로
  들어갈 수 있다.** 유저가 현재 설치 상태를 확인했고 정상이다 — slash 19 / claude agent 2 /
  opencode agent 2, `opencode agent list` 동작. **실제 피해는 없었다.** 근본 해소는 범위 밖.
- **`fix --check` 에 사용자 레벨 부재 검사가 없다.** 지금은 `reap-guide.md` 만 본다.
  stamp 이후 slash command·agent 가 삭제되면 아무도 말하지 않는다.
- **게이트 6절은 claude-code 만 본다.** "npm 12 차단 + OpenCode" 는 실제 패키징 산출물로 미검증.
- **`environment/summary.md` 가 296줄이다**(273→). 새 구조가 실제로 늘어난 몫이고, 근본 정리는
  **처방적 서술을 genome 으로 옮기는 것**인데 이번 세대는 genome immutable 조건이었다.
  손으로 지워 경고를 끄는 것은 genome 이 금한다. genome 을 열 수 있을 때 함께 처리할 것.
- **diff 가 ~6 파일 목표를 넘었다** — 소스 10(실질 4 + 배선·1~3줄 6). 유저 수용.
- **`.reap/life/backlog/npm-uninstall-…md`** 는 이 세대 중에 나타났고 내가 만들지 않았다
  (`reap make backlog` 미실행 — evaluator 가 발견). **유저가 유지를 결정했다** — 그 갭이
  유저 본인에게 실제로 일어난 일이기 때문이다(전역 reap 제거 후 남은 skill 을 손으로 지워야 했다).
  pending 6 → 7. 손대지 않는다.

## Next Generation Hints

- **0.17.5 태그 재발행** — 태그 `v0.17.5` 는 있으나 그 release run 이 게이트에서 실패했고
  아무것도 발행되지 않았다. 릴리즈 문서를 gen-084·085·086·087 로 보강한 뒤 태그를 옮긴다.

## Adapt

**Genome 변경 없음.** 이번 세대는 genome immutable 조건으로 지시받았다(embryo 이므로 규칙상으로는
가능하지만 범위 밖). 이번에 얻은 교훈 둘은 이미 `vision/memory/longterm.md` 에 들어갔고,
genome 으로 승격할 것이 있다면 다음에 genome 을 열 때 함께 판단한다.

**backlog 신설 0.** 인접 발견은 위 절에 텍스트로만 남겼다.

**Embryo → Normal 전환 — 이번에도 보류.** 조건(세대 수·genome 안정·abort 희소)은 여전히 충족한다.
2026-03-26 유저 판단이 유효하다: REAP 자신이 self-evolving 중이라 예기치 못한 genome 변경 여지가 있다.
이번 세대만 봐도 evaluator 가 설계 계약(`UserLevelSyncResult`)을 바꾸게 만들었다 —
아직 구조가 굳는 중이라는 신호다. 다음 판단 시점은 유저가 명시 검토할 때.

**Vision goals** — 이번 goal 에 대응하는 미완 항목이 없어 마킹 변경 없음.
