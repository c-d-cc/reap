# Next Session Prompt

아래 내용을 다음 세션 시작 시 첫 메시지로 전달하세요.

---

이 프로젝트는 REAP v0.16.0 — AI와 인간이 세대를 거치며 소프트웨어를 공동 진화시키는 자기진화형 파이프라인.

## 세션 시작 절차

1. `.reap/genome/application.md`, `evolution.md`, `invariants.md` 읽기
2. `.reap/environment/summary.md` 읽기
3. `.reap/vision/goals.md` 읽기
4. `CLAUDE.md` 읽기
5. `reap status` 실행
6. `.reap/life/backlog/` 확인

## 현재 상태

- 19 generations 완료 (gen-001 ~ gen-019), embryo 상태
- 164+ TypeScript tests (unit 60, e2e 63, scenario 41), tests/ submodule (reap-test repo, self-evolve branch)
- Pending backlog 1개: `claude-md-migration.md` (medium, update agent 영역 — 배포 후 진행)
- v0.15 참조 소스: `~/cdws/reap_v15/`

## 다음 우선순위 (vision/goals.md 참조)

1. **Gap-driven Evolution (spec2 §3)** — adapt에서 vision gap 자동 분석 + goals 자동 체크 마킹 (코드 레벨 자동화)
2. **Distribution (spec2 §7)** — README v0.16 재작성 + npm 배포 준비 (.npmignore, CI/CD)
3. **Self-Hosting (spec2 §5)** — 외부 프로젝트에서 core lifecycle 검증, invariants 정의

## 주의사항

- genome은 embryo — 자유 수정 가능하지만 세대 초반에 확립하고 이후 작업은 그 위에서 수행
- tests/ 는 submodule — 수정 시 내부에서 별도 commit 필요 (completion commit에서 dirty check 자동 차단)
- backlog 생성: `reap make backlog --type <type> --title "<title>"` (Write 금지)
- evolution.md의 원칙 준수:
  - Code Quality: Pattern-first, No duplication, Enforced conventions
  - Testing: 신규 기능 = 테스트 필수, 기존 수정 = 기존 테스트 수정
  - genome vs environment: prescriptive vs descriptive 구분

## 이전 세션 요약 (2026-03-26)

gen-001~002: 자기 탐구 + init 개선
gen-003~008: 인프라 (backlog, archive, consume, make, CLI 패턴, timestamp)
gen-009~011: 품질 (artifact path, validation HARD-GATE, genome/environment 경계)
gen-012~016: 테스트 (submodule → 구조 → unit → e2e → TypeScript 전환)
gen-017~019: 정리 (restart 제거, abort 2-phase, submodule dirty check)
