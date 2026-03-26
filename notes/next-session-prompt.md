# Next Session Prompt

아래 내용을 다음 세션 시작 시 첫 메시지로 전달하세요.

---

이 프로젝트는 REAP v0.16.0 — AI와 인간이 세대를 거치며 소프트웨어를 공동 진화시키는 자기진화형 파이프라인.

## 세션 시작 절차

1. `.reap/genome/application.md`, `evolution.md`, `invariants.md` 읽기
2. `.reap/environment/summary.md` 읽기
3. `.reap/vision/goals.md` 읽기
4. `.reap/vision/memory/` 3개 파일 읽기 (shortterm → midterm → longterm)
5. `.reap/reap-guide.md` 읽기
6. `CLAUDE.md` 읽기
7. `reap status` 실행
8. `.reap/life/backlog/` 확인

## 현재 상태

- 38 generations 완료 (gen-001 ~ gen-038), embryo 상태
- 349 TypeScript tests (unit 223, e2e 126), tests/ submodule (reap-test repo, self-evolve branch)
- Pending backlog 없음
- v0.15 참조 소스: `~/cdws/reap_v15/`
- Alpha publish 완료: `npm install -g @c-d-cc/reap@alpha`

## 이번 세션 우선순위

### 1. Agent 정의 파일 적용 테스트
- `.claude/agents/reap-evolve.md`, `reap-researcher.md` 생성 완료
- reap-evolve agent로 generation 실행 테스트 → subagent prompt 경량화 효과 검증
- 현재 subagent prompt에서 guide/genome/environment를 빼고 "파일에서 읽어라"로 변경했음
- 새 머신에서 generation 품질이 떨어지는 문제가 있었음 → agent 정의 파일로 개선되는지 확인

### 2. Migration 후속 확인
- 다른 머신에서 v0.15→v0.16 migration 테스트 중
- reap-guide.md 복사, legacy skills 정리, domain 파일 migration 동작 확인
- migration 후 generation 품질 관찰

### 3. 남은 개발
- README v0.16 재작성 (현재 README는 v0.15 기준)
- spec2.md 최신화 (현재와 괴리 큼)
- STAGE_ARTIFACTS 맵 중복 정의 해소 (template.ts, stage-transition.ts, artifact-check.ts)

## 주의사항

- genome은 embryo — 자유 수정 가능하지만 세대 초반에 확립하고 이후 작업은 그 위에서 수행
- tests/ 는 submodule — 수정 시 내부에서 별도 commit 필요
- **모든 개발 작업은 REAP lifecycle(generation)을 따를 것** — 이전 세션에서 generation 없이 작업한 건에 대해 반성 있었음
- backlog 생성: `reap make backlog --type <type> --title "<title>"` (Write 금지)
- memory 갱신: reflect phase에서 필수 (shortterm 매 gen, midterm/longterm 해당 시)
- Workaround 금지: 문제 만나면 근본 원인 추적 + backlog 등록

## 이전 세션 요약 (2026-03-26 ~ 2026-03-27)

gen-020~038: v0.15 패리티 (hooks, fix, destroy, clean, prompt→CLI) + self-evolving (gap-driven, vision eval, memory, clarity, cruise) + migration 구현 + alpha publish + agent 정의 파일
