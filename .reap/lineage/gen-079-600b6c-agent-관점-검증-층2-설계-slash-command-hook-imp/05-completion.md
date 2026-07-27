# Completion

## Summary

**Goal**: agent 가 REAP 설치물을 실제로 읽고 동작하는지 확인하는 검증(층 2). 0.17.3 묶음 3/3.

**결과**: 완료. **backlog 는 "설계 필요"였으나 실측으로 구현까지 갔다.**

**핵심 산출물**: `scripts/check-agent-integration.sh` — 헤드리스 agent 를 구동하고 **파일 시스템 상태로 판정**. gen-063 재현 시 잡는 것을 실증.

**부수**: `reapdev.versionBump` Step 5-2, `reap-guide.md` § Verifying a Release, 0.17.3 릴리즈 노트 3세대분 일괄 보강

**검증**: 게이트 4종 전부 pass / unit 470-0 / e2e 272-0 / scenario 44-0

## Lessons Learned

### 잘 된 것 — 설계 전에 실측해서 후보를 좁혔다

backlog 는 A/B/C/D 4후보를 열어두고 "설계 필요, 미확정"이라 했다. 착수하자마자 **A 를 직접 돌려봤다** — `claude -p` 로 slash command 가 실행되고 hook 발화까지 확인됐다($0.24).

그 한 번의 실측이 나머지를 정리했다. B(설정 파싱)는 우리 해석이 틀리면 같이 틀리고, C(수동)는 이미 실패한 방법이며, D(OpenShell)는 **격리를 풀어주지 판정을 풀어주지 않는다** — A 의 진짜 난관은 판정이었고 그건 부수 효과로 해결됐다.

**"설계 세대"라고 해서 문서만 쓸 이유가 없었다.** 실측 두 번으로 불확실성이 사라지자 구현까지 갔고, 0.17.3 에 넣을 내용이 생겼다.

### 잘 된 것 — 제약이 설계를 개선했다

격리 HOME 에 설치하니 *"Not logged in"* 이 나왔다. **Claude Code 는 로그인을 slash command 와 같은 `~/.claude/` 에 두므로 하나를 격리하면 다른 하나를 잃는다.**

처음엔 막힌 것처럼 보였으나, 이 제약이 두 층의 경계를 분명히 했다:

- 층 1 = "tarball 이 올바른 파일을 올바른 위치에 놓는가" → **격리 필요**
- 층 2 = "그 위치의 파일을 클라이언트가 읽는가" → **현재 설치를 읽기만 하면 됨**

층 2 에 tarball 설치는 애초에 불필요했다. 결과적으로 스크립트가 짧아지고 사용자 환경을 건드리지 않게 됐다.

### 개선점 — 첫 설계가 목표를 검증하지 못했다

slash command 를 전부 지웠는데 **검사가 통과했다.** agent 가 `/reap.start` 를 못 찾자 CLI 를 직접 실행해 같은 `current.yml` 을 만들었기 때문이다.

**부수 효과가 결정적이라는 것과, 그 부수 효과가 목표를 증명한다는 것은 다르다.** slash command 는 결국 CLI wrapper 이므로 결과가 같다 — 판정 방법이 결정적이어도 무엇을 판정하는지가 틀렸다.

프롬프트로 우회로를 막고 sentinel 을 도입해 3차 시도에서 해결했다. **backlog 의 Acceptance 1번("과거 사고를 잡는가")이 없었다면 1차에서 끝냈을 것이다.**

### 개선점 — 비용 있는 검사는 자동화의 한계에 부딪힌다

$0.25/회라 CI 상시가 불가능하고, 결국 `reapdev.versionBump` skill 의 절차로 넣었다. 그런데 **skill 은 사람이 따르는 지시문**이고, gen-073 이 확인한 대로 지시문은 이미 실패한 방법이다.

여기서는 대안이 없다 — 자동화하면 push 마다 과금된다. **한계를 인지하고 배치한 것**이며 그 트레이드오프를 skill·guide 양쪽에 적었다. 다만 다음에 이 검사가 건너뛰어지는 사고가 나면, 그때는 지시문이 아닌 방법을 찾아야 한다.

## Next Generation Hints

1. **0.17.3 릴리즈** — 3건 완료. 문서·노트 모두 정합(게이트 4종 pass). `reap install-skills` 후 `check-agent-integration.sh` 를 한 번 더 돌리고 태그 (**유저 확인 필수**)
2. **릴리즈 후 issue #22 코멘트** — 제보자가 물은 것에만 답할 것
3. `ci-에서-테스트-실행-...` — PAT 발급은 사용자 작업. 단계적 도입 계획이 backlog 에 있음
4. interview 재설계 / daemon 2건
5. **OpenCode adapter 의 층2 검증** — 본 세대는 claude-code 만. adapter 가 둘이므로 갭도 둘이다. `opencode` CLI 의 헤드리스 지원 확인이 선행

## Change Proposals

### genome 변경 없음

본 세대 교훈("설계 전 실측", "판정 방법과 판정 대상은 다르다")은 기존 원칙의 적용 사례다:
- evolution.md § "검사를 만들 때 — 먼저 실패시켜라" — 1차 설계의 실패가 정확히 이것으로 드러났다
- application.md § carrier — gen-078 에서 재작성 완료

`evolution.md` 는 270줄/임계 300 으로 여유가 30줄이다. 중복 추가는 피한다.

### 신규 backlog 없음

deferred 2건(OpenCode 층2, CI 통합)은 hints 에 기록. **gen-078 의 "hints 는 backlog 가 아니다" 교훈에 따라**, 다음 세대에서 실제로 착수할 것이면 그때 backlog 화한다 — 지금 만들면 pending 이 더 쌓이기만 한다.
