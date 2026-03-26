---
id: gen-002-a64ab4
type: embryo
goal: "init conversation guide 개선 — init만으로 충분한 genome/environment 생성"
parents: ["gen-001-399123"]
---
# gen-002-a64ab4
init conversation guide를 개선하여, init만으로 충분한 genome/environment가 생성되도록 함.

### 변경 파일
- `src/cli/commands/init/common.ts` — DEFAULT_EVOLUTION을 REAP 진화 원칙(Clarity-driven interaction, Genome 관리, Echo chamber 방지, 환경 갱신)으로 강화. CLAUDE.md 자동 생성 로직 추가.
- `src/cli/commands/init/greenfield.ts` — conversation prompt에 설계 철학/메타포 질문, 아키텍처 "왜" 질문, environment 실질 작성 가이드, CLAUDE.md step 추가.
- `src/cli/commands/init/adoption.ts` — conversation prompt에 설계 원칙 질문, 프로젝트 고유 패턴 질문, environment 실질 작성 가이드, CLAUDE.md step 추가. envSummary 생성 로직을 Source Structure + Build & Scripts + Design Decisions로 확장.
- `src/core/genome-suggest.ts` — Architecture Decisions에 "Why This Architecture?" placeholder, Conventions에 auto-detected 마킹 추가.
- `scripts/e2e-init.sh` — evolution.md 검증 패턴 업데이트.

### Validation: PASS (62/62)