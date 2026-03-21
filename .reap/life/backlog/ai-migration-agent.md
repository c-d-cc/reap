---
type: task
status: pending
---

# AI 기반 Migration Agent 구현

## 현상
- 현재 migration은 하드코딩된 step migration (0.0.0-to-0.10.0.ts)
- 매 버전마다 수동으로 migration 스크립트 작성 필요
- 사용자가 어떤 버전에서 올라올지 예측 불가

## 기대 동작

### 동작 방식
1. `reap update` 실행 → deterministic migration 먼저 시도
2. deterministic migration으로 해결 안 되는 차이가 있으면 AI migration agent 호출
3. AI agent에게 제공하는 context:
   - **최신 REAP 버전의 기대 구조**: config 필드 목록 + 기본값, 디렉토리 구조, hooks 형식, artifact 형식, lineage 형식
   - **사용자의 실제 .reap/ 구조**: config.yml 내용, 디렉토리 트리, hooks 파일 목록
4. AI가 차이 분석 → migration 계획 제시 → 사용자 확인 → 실행

### 구현
- `reap run update` 의 migration 실패/gap 감지 시 `emitOutput`으로 migration prompt 출력
- prompt에 기대 구조 spec을 context로 포함
- AI가 분석 + 실행, 사용자 확인 후 적용

### 기대 구조 spec 소스
- `src/types/index.ts` ReapConfig 인터페이스 → 기대 config 필드
- `src/core/paths.ts` ReapPaths → 기대 디렉토리 구조
- `src/templates/` → 기대 파일 형식

## 관련 코드
- `src/core/migrations/` — 기존 step migration
- `src/cli/commands/update.ts` — update 흐름
- `src/cli/commands/run/` — 신규 migration command 가능
