# Longterm Memory

## 프로젝트 기원과 방향

REAP v0.16은 v0.15의 complete rewrite. v0.15 소스(`~/cdws/reap_v15/`)를 참조하되 그대로 포팅하는 게 아니라 v0.16 구조에 맞게 재설계.
v0.15에 있던 기능은 명시적으로 제외하기로 한 것 외에는 v0.16에서도 동작해야 함.

## 핵심 설계 교훈

### Slash command는 최소화, flow 제어는 CLI가
v0.15에서는 merge를 stage별 개별 slash command로 분리했지만 skill matching 비용이 증가.
v0.16에서는 단일 command + CLI가 상태를 보고 다음 할 일을 stdout으로 안내하는 핑퐁 구조로 전환 (gen-023).

### 정량적 평가 금지 (Goodhart's Law)
유저가 명확히 지시: 정량적 fitness 메트릭 제안 금지. 인간의 자연어 피드백만이 유일한 fitness 신호.
16항목 소프트웨어 완성 기준도 점수가 아닌 정성적 평가로만 사용.

### "편향 분석"은 잘못된 프레이밍
gen-029에서 lineage 편향 분석을 구현했으나 gen-030에서 제거. 특정 영역에 작업이 집중되는 건 문제가 아니라 자연스러운 흐름.

### Workaround 금지 원칙의 탄생
gen-021~023에서 submodule dirty check, nonce 꼬임 문제를 매번 수동 우회하고 넘어감.
유저가 지적 → 근본 원인 추적 + backlog 등록 + genome에 원칙 추가 (gen-024에서 수정).

## v0.15 → v0.16 명시적 차이

- Stage: objective → learning (탐구 먼저)
- Genome: principles/conventions/constraints/source-map → application/evolution/invariants (3파일)
- Completion: 5 phases → 4 phases (reflect/fitness/adapt/commit)
- Vision: goals만 → goals + memory (gen-031에서 추가)
- Hook: 기본 실행만 → 조건부 실행 + 순서 제어 (gen-021에서 포팅)
- Session start hook: CLAUDE.md + reap-guide.md로 대체
- Migration: .reap/v15/로 백업 후 새 구조 생성, genome은 AI 기반 재구성

### Cruise는 prompt-driven loop으로 구현
evolve.ts가 `emitOutput` 후 exit하므로 code-level loop 불가.
subagent prompt에 cruise loop 절차를 포함시켜, subagent가 completion 후 자동으로 다음 generation을 시작하도록 유도 (gen-033).
→ **2026-03-27 결정**: cruise도 generation마다 새 agent 생성으로 변경 예정. parent가 loop 관리.

### Memory는 "자유"만으로는 작동하지 않는다
gen-031에서 memory를 도입하고 "자유롭게 쓸 수 있다"고 했지만 아무도 안 씀.
gen-035에서 reflect phase에 명시적 트리거 + tier별 criteria 추가하여 해결.
교훈: 규칙 없는 자유는 무행동으로 귀결됨.

### Agent 정의 = 정적 템플릿, prompt = 동적 context
subagent prompt에 guide+genome+environment를 직접 넣으면 ~500줄, reap-guide와 중복.
`.claude/agents/reap-evolve.md`에 role/mindset/behavior만 담고 "파일을 읽어라"로 지시.
buildBasePrompt()는 동적 context(state, vision, memory, clarity, cruise)만 생성.

### Lifecycle 준수는 AI 자신에게도 적용
이번 세션에서 generation 없이 subagent prompt 슬림화를 진행함 → 유저가 지적.
"모든 개발 작업은 REAP lifecycle을 따라야 한다"는 규칙은 AI 자신에게도 적용됨.

### 종료 path는 transition graph 외부 (gen-061, 2026-05-24)
abort/early-close 같은 "탈출 path"는 `NORMAL_TRANSITIONS`/`MERGE_TRANSITIONS` graph 안에 transition으로 추가하지 않고, `verifyTransition` 호출 자체를 건너뛰는 방식으로 구현. 대신 `state.stage` 검사로 명시적 가드. 정상 lifecycle 흐름과 탈출 path의 책임 분리가 명확해짐. 새 종료 path를 추가할 때 abort.ts/early-close.ts 패턴을 차용.

### Template = single source of truth + marker-hash sync (gen-054, 재발견 gen-062)
gen-054에서 도입된 marker-hash sync(`<!-- reap:start {hash} -->...<!-- reap:end -->` + `extractReapSection` + `detectLegacyReapSection` + `updateClaudeMdFile`)는 본래 CLAUDE.md 자동 갱신용이었으나, gen-062에서 그 가치가 재확인됨:
- template 한 줄만 수정해도 모든 사용자(plain-path legacy + marker-wrapped stale 둘 다) 자동 처리.
- migration 전용 코드 0줄 추가로 issue 해결 가능.
- "template만 바꾸면 사용자 모두 다음 update 시 자동 반영" 패턴은 dog-fooding 자동화의 핵심.
- 응용 가치: `.reap/reap-guide.md`, hooks template 등 다른 dog-fooding 영역으로 확대 가능. `onLifeCompleted` hook으로 자동 sync 트리거하면 drift가 원천 차단됨.

### Claude Code native 메커니즘 활용 + REAP hook의 역할 분리 (gen-062, 2026-05-25)
초기에는 SessionStart hook이 9 static 파일을 모두 inject했음(gen-053). Claude Code가 native `@` import를 지원한다는 사실을 활용해 static은 `@` ref로, dynamic만 hook으로 분리.
- 결과: hook 출력 89% 감소, 정보 손실 0(`@` import lazy load).
- 교훈: 플랫폼 native 메커니즘을 활용할 수 있는 곳에서는 자체 구현을 미루지 말 것. 단, hook 자체를 제거하지는 않음 — dynamic context(generation state, strict mode, language)는 `@` 로 표현 불가하므로 hook이 여전히 필수. 정/동 분리가 답이지 hook 전면 제거가 답이 아님.
