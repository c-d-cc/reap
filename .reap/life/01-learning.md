# Learning — gen-005-944652

## Goal
start에서 backlog consume 마킹 + learning artifact에 근거 참조

## Source Backlog
`start-backlog-consume.md` — start에서 backlog consume 마킹 + learning artifact에 근거 참조

## Key Findings

### 현재 상태 (v0.16)
- `start.ts`: backlog를 scan하고 보여주지만, 선택한 backlog를 consumed로 마킹하지 않음
- `--backlog <filename>` 파라미터 없음
- `GenerationState`에 `sourceBacklog` 필드 존재 (types/index.ts 확인 필요)
- `consumeBacklog()` 함수는 backlog.ts에 이미 존재
- learning.ts prompt에서 sourceBacklog 참조 안내 없음

### v0.15 패턴
- start.ts: `--backlog <filename>` → generation 생성 후 `markBacklogConsumed(dir, filename, genId)` 호출
- GenerationState에 `sourceBacklog` 필드로 추적
- objective stage에서 sourceBacklog를 읽어서 artifact에 근거로 포함

### 수정 범위
1. start.ts — `--backlog` 옵션 추가, consumeBacklog 호출, state.sourceBacklog 설정
2. learning.ts — sourceBacklog가 있으면 해당 파일 읽어서 context에 포함 + prompt에 근거 명시 안내
3. types/index.ts — sourceBacklog 필드 확인/추가

## Clarity Level: High
- backlog에 구체적 solution 기술, v0.15 참조 코드 확인 완료, 변경 파일 3개
