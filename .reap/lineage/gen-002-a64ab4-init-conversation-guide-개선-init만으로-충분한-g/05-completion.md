# Completion — gen-002-a64ab4

## Summary

init conversation guide를 개선하여, init만으로 충분한 genome/environment가 생성되도록 함.

### 변경 파일
- `src/cli/commands/init/common.ts` — DEFAULT_EVOLUTION을 REAP 진화 원칙(Clarity-driven interaction, Genome 관리, Echo chamber 방지, 환경 갱신)으로 강화. CLAUDE.md 자동 생성 로직 추가.
- `src/cli/commands/init/greenfield.ts` — conversation prompt에 설계 철학/메타포 질문, 아키텍처 "왜" 질문, environment 실질 작성 가이드, CLAUDE.md step 추가.
- `src/cli/commands/init/adoption.ts` — conversation prompt에 설계 원칙 질문, 프로젝트 고유 패턴 질문, environment 실질 작성 가이드, CLAUDE.md step 추가. envSummary 생성 로직을 Source Structure + Build & Scripts + Design Decisions로 확장.
- `src/core/genome-suggest.ts` — Architecture Decisions에 "Why This Architecture?" placeholder, Conventions에 auto-detected 마킹 추가.
- `scripts/e2e-init.sh` — evolution.md 검증 패턴 업데이트.

### Validation: PASS (62/62)

## Lessons Learned

1. **evolution.md는 사용자에게 물어볼 영역이 아니다**: REAP의 진화 원칙은 프레임워크가 제공하는 best practice. 사용자는 generation을 경험하며 자연스럽게 개선. init conversation에서 다루려 했던 것은 오류.
2. **fact 질문과 principle 질문의 구분**: scanner가 "무엇이 있는가"(fact)를 잘 추출하지만, "왜 이렇게 했는가"(principle)는 인간에게 물어야 함. conversation guide의 핵심 역할.
3. **CLAUDE.md는 인프라**: genome/environment가 아무리 잘 작성되어도, 새 세션에서 로딩되지 않으면 무의미. init에서 자동 생성해야 함.

## Next Generation Hints

- genome/environment 경계 정리 (backlog에 이미 등록됨)
- 실제 새 프로젝트에서 init을 테스트하여 conversation 품질 검증
- e2e-init.sh에 CLAUDE.md 생성 검증 assertion 추가
