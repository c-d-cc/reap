# Completion — gen-029-a717aa

## Summary

REAP의 self-evolving 능력을 강화하는 3가지 기능을 구현했다:

### Changes
- `src/core/lineage.ts` — `readAllLineageGoals()` 추가: meta.yml + L1 compressed md frontmatter에서 전체 lineage goal 추출
- `src/core/vision.ts` — 3개 함수 추가:
  - `buildDiagnosisPrompt()`: 16항목 완성 기준별 정성적 진단 prompt
  - `analyzeLineageBias()`: 최근 N gen의 vision section별 편향 분석
  - `buildVisionDevelopmentSuggestions()`: 누락/미착수/과대 scope 감지 → 제안
- `src/cli/commands/run/completion.ts` — adapt phase에서 위 3개 분석을 prompt에 주입. bootstrap-only 16항목 텍스트 → 모든 maturity level 진단 프레임워크로 대체
- `tests/unit/lineage.test.ts` — 신규 9 tests
- `tests/unit/vision.test.ts` — 14 tests 추가

### Test Results
- 320 tests 전체 통과 (unit 195 + e2e 84 + scenario 41)

## Lessons Learned

- **기존 패턴 재사용의 효과**: tokenize + overlap 매칭 패턴이 vision gap, lineage bias, development suggestion 3곳 모두에서 일관되게 작동. 코드 중복 없이 같은 인프라를 확장.
- **테스트에서의 criteria coverage 간섭**: buildVisionDevelopmentSuggestions()가 "missing coverage" 감지 시 16개 criteria 전부를 체크하므로, 단순한 fixture로는 빈 결과를 기대할 수 없음. 테스트 fixture에 16개 criteria를 커버하는 goal을 포함해야 했음.
- **prompt 크기 제어**: 3가지 분석이 모두 주입되면 prompt가 길어질 수 있지만, 각 함수가 "데이터 없으면 빈 문자열 반환" + "상위 N개로 제한" 패턴을 따르므로 실제로는 관리 가능한 크기.

## Project Diagnosis

- **Core functionality**: Core lifecycle (learning → completion), merge lifecycle, backlog CRUD, compression 모두 안정적으로 동작. 320 tests 통과로 검증됨.
- **Architecture stability**: 모듈 경계가 명확하고 21 core modules + CLI commands 구조가 gen-007 이후 큰 변화 없이 안정적. adapter pattern으로 agent client 교체 가능.
- **Modularity**: 각 core module이 단일 책임을 가지며, 이번 gen에서도 vision.ts에 3개 함수를 추가하는 형태로 자연스럽게 확장됨. 재사용 패턴(tokenize + overlap)이 잘 작동.
- **Error handling**: ReapOutput JSON 구조로 에러를 일관되게 전달. nonce 검증, artifact 검증 등 invariant 위반 시 명확한 에러 반환.
- **Test coverage**: unit 195 + e2e 84 + scenario 41 = 320 tests. 주요 core 모듈과 lifecycle 시나리오를 커버.
- **Documentation**: genome(application.md, evolution.md)과 environment(summary.md)가 프로젝트 지식을 체계적으로 보관. 외부 사용자용 README는 아직 미비.
- **Security**: nonce-based stage integrity로 stage 위조 방지. 암호학적 해시(SHA256) 사용.
- **Performance**: single bundle ~400KB, 빌드 28ms. CLI 응답 시간 양호.
- **Deployment readiness**: npm 배포 준비 미완 (.npmignore, CI/CD 미구성). 현재 로컬/self-hosting 환경에서만 사용.
- **Code quality**: TypeScript strict mode, zero-dependency 원칙, ESM 일관 적용. evolution.md의 Code Quality Principles 준수.
- **User experience**: JSON stdout으로 AI agent 친화적. slash command 18개로 Claude Code 통합 완료.
- **Visual verification**: CLI 도구이므로 해당 없음.
- **Integration layer**: Git 연동(child_process), Claude Code adapter 구현 완료. 외부 API 의존 없음.
- **Domain maturity**: REAP의 핵심 도메인(lifecycle, generation, lineage, compression, vision)이 코드와 spec 모두에서 정의됨.
- **Governance compliance**: invariants.md의 3개 절대 제약 준수. genome 수정은 adapt phase에서만.
- **Genome stability**: application.md, evolution.md가 최근 generations에서 큰 변경 없이 안정적. embryo → normal 전환을 검토할 시점.

## Embryo → Normal Transition Assessment

- **Genome 수정 빈도**: 최근 5 generation(gen-025~029)에서 genome 수정이 거의 없음. application.md의 core identity가 확립됨.
- **Application.md 안정성**: 프로젝트 아키텍처, 컨벤션, 기술 스택이 명확히 정의되어 있고 안정적.
- **Abort 빈도**: 최근 generation에서 abort 없이 정상 완료가 이어지고 있음.
- **Vision/goals 명확성**: 42개 goal 중 30개 완료. 남은 12개도 명확하고 actionable.

**권고**: Embryo → Normal 전환 조건이 충족되어 보임. 다만, 이 결정은 유저의 판단에 맡김.

## Lineage Bias Analysis

최근 10 generation 분석 결과:
- **Core Stability**: 6/10 — 가장 집중된 영역
- **Distribution**: 5/10
- **Test Infrastructure**: 3/10
- **Self-Hosting**: 3/10
- **Genome/Environment**: 2/10
- **Clarity-driven Interaction**: 1/10
- **Maturity System**: 1/10
- **Gap-driven Evolution**: 1/10
- **Agent Client 확장**: 0/10 — 완전 방치

**방치 영역**: Agent Client 확장(OpenCode, Codex adapter)에 전혀 작업이 없음.

## Vision Development Suggestions

완성 기준 중 vision goal에 매핑되지 않는 영역:
- Architecture stability, Modularity, Error handling — 현재 암묵적으로 좋은 상태이나 vision goal로 명시되어 있지 않음
- Documentation — 외부 사용자용 문서화 goal이 README 외에는 없음
- Security — nonce 외 추가 보안 요구사항 검토 필요 여부

## Next Generation Hints

- **Clarity level 자동 계산**: vision/goals.md 상태 + backlog 상태 + genome 안정성에서 clarity를 자동 계산하는 로직. parseGoals()가 기반을 제공하고, analyzeLineageBias()도 참고 가능.
- **외부 프로젝트에서 REAP core lifecycle 검증**: Self-Hosting 영역이 lineage bias에서 neglected로 감지될 가능성 높음. 실제 외부 프로젝트 적용 시도.
- **README 재작성**: Distribution 영역도 neglected 상태. v0.16 기준 self-evolving pipeline 설명.
- **adapt phase에서 진단 결과의 세대 간 추적**: 현재 진단 결과는 completion artifact에 텍스트로 기록되지만, 세대 간 진단 결과를 비교하는 기능은 아직 없음. lineage에서 이전 진단 결과를 추출하여 변화 추이를 파악하는 것이 가능.
