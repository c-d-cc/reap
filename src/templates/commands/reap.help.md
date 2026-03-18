---
description: "REAP Help — Contextual help based on current state"
---

# Help

**ARGUMENTS**: $ARGUMENTS

## File Access Rules
- ONLY read `.reap/life/current.yml` and `.reap/config.yml`. No other files for basic help.
- For topic help: also read `reap.{name}.md` from the same directory as this file.
- Do NOT access global node_modules. Do NOT guess file paths.

## If ARGUMENTS is provided → skip to "Topic Help" section below.

## Basic Help (no arguments)

Read `.reap/life/current.yml` and `.reap/config.yml`, then output this template with values filled in:

```
REAP — AI와 사람이 협업하여 소프트웨어를 세대(Generation) 단위로 진화시키는 개발 파이프라인.
각 세대는 5단계를 거칩니다: Objective → Planning → Implementation → Validation → Completion
Genome(.reap/genome/)에 프로젝트 원칙과 규칙을 기록하고, 세대를 거듭하며 진화합니다.

[If active generation: "🔄 {id} | {goal} | Stage: {stage} → /reap.{stage} 또는 /reap.next"]
[If no generation: "No active Generation → /reap.start 또는 /reap.evolve"]

커맨드:
  /reap.start          새 Generation을 시작하고 goal을 설정
  /reap.evolve       ⚡ 전체 lifecycle 자율 실행 (사람 개입 최소화)
  /reap.objective      목표, 요구사항, 완료 기준을 정의
  /reap.planning       태스크 분해 + 구현 계획 수립
  /reap.implementation 계획에 따라 코드 구현
  /reap.validation     테스트 실행, 완료 기준 검증
  /reap.completion     회고, Genome 변경 반영, 마무리
  /reap.next           다음 stage로 전진
  /reap.back           이전 stage로 회귀
  /reap.status         프로젝트 상태 + Genome 건강도
  /reap.sync           Genome ↔ 소스코드 동기화
  /reap.update         REAP 버전 확인 + 업그레이드
  /reap.help           도움말. /reap.help {topic} 으로 상세 설명

Topics: workflow, genome, backlog, strict, agents, hooks, config, evolve, regression, author 등

Strict: {on/off} | Auto-Update: {on/off} | Language: {value}
```

Output the above as-is (not in a code block), with values substituted. Do NOT add extra explanation.

---

## Topic Help

If ARGUMENTS contains a topic, look up from the list below. **If NOT in the list, respond: "Unknown topic: '{topic}'. /reap.help 로 available topics를 확인하세요."**

For command-name topics: read `reap.{name}.md` from the same directory as this file.

#### Topics

- **workflow** / **lifecycle** — 5-stage lifecycle: objective → planning → implementation → validation → completion. Gate → Steps → Artifact. `/reap.next`로 전진, `/reap.back`으로 회귀.
- **genome** — `.reap/genome/`: principles.md, conventions.md, constraints.md, domain/*.md. 불변 원칙: 현재 세대에서 직접 수정 금지 → backlog → completion에서 반영.
- **backlog** — `.reap/life/backlog/`. genome-change, environment-change, task. status: pending/consumed. consumed → lineage, pending → 이월.
- **strict** — `strict: true`: no generation = 코드 수정 차단, non-implementation = 차단, implementation = plan scope만. Escape: "override"/"bypass strict".
- **agents** — AgentAdapter 추상화. auto-detect (Claude Code, OpenCode). config.yml `agents` 오버라이드.
- **hooks** — config.yml: onGenerationStart, onStageTransition, onGenerationComplete, onRegression. command/prompt 타입.
- **config** — `.reap/config.yml`: version, project, entryMode, strict, language, agents, autoUpdate, hooks.
- **evolve** — `/reap.evolve`: 전체 lifecycle 자율 실행. 사람 확인 없이 objective~completion 순차 진행.
- **regression** — `/reap.back`: 이전 stage 회귀. timeline + artifact에 Regression 섹션 기록.
- **minor-fix** — 5분 이내, 설계 변경 없는 수정. stage 전환 없이 현재 artifact에 기록.
- **compression** — 10,000줄 + 5세대 이상 시 lineage 자동 압축. L1(40줄), L2(60줄).
- **author** — HyeonIL Choi (At C to D). hichoi@c-d.cc / https://reap.cc / https://github.com/c-d-cc/reap
- **start** / **objective** / **planning** / **implementation** / **validation** / **completion** / **next** / **back** / **sync** / **status** / **update** / **help** — Read `reap.{name}.md` from same directory, explain.
