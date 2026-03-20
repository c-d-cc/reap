# Implementation

## Changes

### README (4개 언어)
- Slash Commands 테이블: abort, sync.genome/environment, report 추가
- Compression 섹션: epoch hash chain + fork guard 반영
- Environment 3-layer 구조 설명
- SessionStart Hook: environment summary + command 설치
- Hooks 예시: version-bump 제거
- Project Structure: ~/.reap/ + .claude/commands/ 정리
- Four-Axis: life → lifecycle

### docs 사이트
- 새 페이지 5개: Genome, Environment, Lifecycle, Lineage, Backlog
- CoreConceptsPage 재작성: Four-Axis 카드 + 원칙 + Session Init 스크린샷 + Evolution Flow
- WorkflowPage → LifecyclePage 리네임
- HookReferencePage → Guide/Hooks로 이동 (breadcrumb Guide)
- ConfigurationPage: config yaml 예시 갱신 (hooks 제거, autoIssueReport 추가)
- 번역 4개 언어 동기화 (en, ko, ja, zh-CN)

### 소스
- types/index.ts: ReapHooks, ReapHookCommand 레거시 타입 제거, autoUpdate default 주석 수정
