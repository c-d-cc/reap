# Completion

## Summary

**Goal**: `reap fix --check` 가 `reap install-skills` 의 정식 설치 위치를 "legacy" 로 오탐하는 문제(issue #22) 해소 + 경로를 DI 로 공유해 재발 차단. 버전 0.17.3.

**결과**: 완료. 본 repo `fix --check` **19 warnings → 0**.

**핵심 변경**:
- `adapters/claude-code/install.ts` — `claudeCodeCommandsDir(home?)` export (opencode 패턴 적용)
- `adapters/types.ts` — `AdapterModule.userLevelDirs(home?)` 추가, 양 adapter 구현
- `core/integrity.ts` — `checkUserLevelArtifacts(projectRoot, canonicalDirs, home)`. 정식 위치 제외 + "Phase 2" 문구 제거
- `cli/commands/fix.ts` — `resolveCanonicalUserDirs` 로 주입 (`core → adapters` 의존 없음)

**검증**: typecheck 0 / CLI+docs build / 문서 게이트 pass / unit **470-0**(+9) / e2e **268-1**(+5) / scenario 44-0

## Lessons Learned

### 잘 된 것 — 이슈가 "저자 판단"이라 한 것을 코드에서 확정했다

제보자는 두 선택지를 제시하며 "어느 쪽이 의도인지는 저자의 판단"이라 했다. 그러나 조사해보니 **답이 이미 코드 안에 있었다.**

`integrity.ts` 가 자기 파일 안에서 모순됐다 — L772-774 는 `~/.claude/commands/` 를 "v0.16 정식 위치"라 하고, L715-722 는 같은 경로를 "legacy"라고 경고한다. 여기에 README·docstring·adapter 주석·gen-064 수정 전제까지 전부 한쪽을 가리켰다.

**"판단이 필요하다"는 말을 그대로 받아 사용자에게 되묻지 않고, 근거를 찾아 확정한 것이 옳았다.** 되물었다면 왕복이 한 번 늘고 답은 같았을 것이다.

### 잘 된 것 — "Phase 2" 를 추적해 문구를 없앨 근거를 얻었다

경고 문구의 "Phase 2 remnant" 가 무엇인지 아무도 설명할 수 없었다(이슈도 "not defined in README or reap-guide" 라고 지적). `git log -S "Phase 2 remnant"` 로 v0.15 시절 `~/.reap/commands/` 이전 작업명임을 확인했다.

**정체를 모르는 문구를 그냥 지우는 것과, 왜 지워도 되는지 알고 지우는 것은 다르다.** 후자는 "혹시 다른 의미가 있었나"를 남기지 않는다.

### 잘 된 것 — 새 패턴을 발명하지 않았다

opencode 는 이미 `opencodeCommandsDir(home = homedir())` 를 갖고 있었다(gen-064). claude-code 만 인라인이었고, 같은 gen-064 가 opencode 의 legacy 경고도 제거하면서 claude-code 쪽만 빠뜨렸다.

즉 이번 작업은 **한쪽에만 적용된 패턴을 완성**한 것이다. `grep` 으로 기존 구조를 먼저 본 덕에 설계 논의 없이 형태가 정해졌다.

### 개선점 — 런타임 차이를 가정하지 말 것 (bun ≠ node)

unit test 에서 `process.env.HOME` 을 바꿔 격리하려 했는데 동작하지 않았다. **bun 의 `os.homedir()` 는 `$HOME` 을 무시한다** — Node 는 따른다.

gen-069 의 daemon e2e 가 HOME override 로 성공했기에 같은 방식이 통할 것이라 가정했는데, 그건 **child process 를 spawn** 했기 때문이었다. 같은 "HOME 격리"라도 in-process 와 out-of-process 가 다르다.

longterm 의 "Verify framework semantics with a minimal repro" 를 적용해 `bun -e` 한 줄로 확인했고, 결과적으로 `home` 을 인자로 빼면서 **설계가 오히려 나아졌다**(opencode 헬퍼와 시그니처 형태 일치).

### 개선점 — 6세대 미룬 항목을 이번에 backlog 로 만들었다

e2e `init-repair` 1건이 gen-072~076 내내 "pre-existing" 으로 넘어갔다. gen-076(abort된 interview 세대)이 longterm 에 **"Hints are not backlog"** 를 남겼는데, 정작 이 항목은 여전히 hints 에만 있었다.

교훈을 적어두고 같은 항목을 7번째로 미루면 그 교훈은 무의미하다. **본 세대에서 backlog 로 만들었다.** scenario 5건도 backlog 가 된 다음 세대에 고쳐졌다.

## Next Generation Hints

1. **0.17.3 릴리즈** — 문서 정합 완료. `git tag v0.17.3 && git push origin main v0.17.3` (**유저 확인 필수**). 이후 issue #22 코멘트
2. **`릴리즈-자기진단-게이트-...` backlog** — **본 세대가 선행 조건이었고 이제 충족됐다** (경고 0 달성). 이제 "경고 0" 을 게이트로 걸 수 있다. canary token 설계도 여기 포함
3. `e2e-init-repair-...` backlog (본 세대에서 신규 생성)
4. `agent-관점-검증-층2-...` / interview 재설계 / daemon 2건

## Change Proposals

### genome 변경 없음 — 단, 다음 세대에서 재작성 예정

본 세대의 교훈("코드 대 코드 carrier", "SSOT/DI 우선")은 `릴리즈-자기진단-게이트-...` backlog 의 S2 에서 **carrier 절 전면 재작성**으로 다룬다. 지금 부분 수정하면 다음 세대가 다시 고쳐야 한다.

`evolution.md` 는 현재 270줄 / 임계 300 으로 여유 30줄이다. gen-075 가 "규칙 추가 전 중복 확인"을 경고한 상태이므로, **한 번에 정리하는 편이 낫다.**

### 신규 backlog 1건

- `e2e-init-repair-1건-실패-6세대째-...` — 위 Lessons 참조. (a) 테스트가 낡음 / (b) 구현 결함 판정이 선행돼야 하며, **(b)라면 실사용 영향이 있으므로** 단순히 테스트만 고치고 넘어가지 않도록 명시했다
