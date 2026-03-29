# Detect -- Merge Lineage Analysis

## Branches

### Branch A: self-evolve (main)
- 2 commits since divergence
- **gen-050**: Nonce transition graph 리팩토링
- **gen-051**: Evaluator agent 템플릿 정의 (reap-evaluate.md, evaluator-agent.md 설계 문서)
- 변경 파일: vision/design, vision/memory, environment/summary.md, src/templates/agents/reap-evaluate.md, lineage

### Branch B: origin/main
- 34 commits since divergence
- **daemon feature**: reap-daemon 코드 인덱서 전체 구현 (Phase 1~4)
  - HTTP 서버, 프로젝트 레지스트리, tree-sitter 파서, SQLite 저장소
  - 그래프 분석 (blast radius, community detection, process tracing)
  - CLI 연동, lifecycle 자동 인덱싱, worktree 인덱스 관리
- 변경 파일: daemon/ 디렉토리 전체 신규, src/cli/commands/daemon/, CLI index.ts, completion.ts, start.ts 수정

## Genome Changes

Genome diff 결과: **충돌 없음**
- A-only 변경: 없음
- B-only 변경: 없음
- 충돌: 없음

두 브랜치 모두 genome 파일(application.md, evolution.md, invariants.md)을 수정하지 않았다.

## Common Ancestor

- Commit: `bfcc3398a22ddb2f013046d41f90afb0e3952dc9`
- Self-evolve: 2 commits ahead
- Origin/main: 34 commits ahead
- 비대칭 divergence -- origin/main 쪽이 훨씬 큰 변경량

## Conflict Analysis Strategy

### 예상 충돌 파일 (2개)
양 브랜치에서 동시에 수정된 파일:
1. `.reap/vision/memory/midterm.md` -- 양쪽 모두 진행 상황 기록
2. `.reap/vision/memory/shortterm.md` -- 양쪽 모두 세션 핸드오프 기록

### 해결 전략
- Memory 파일: 양쪽 내용을 모두 보존하여 병합. Self-evolve의 evaluator 관련 내용과 origin/main의 daemon 관련 내용 모두 유지.
- 소스 코드: 겹치는 src/ 파일이 없으므로 자동 병합 예상.
- daemon/ 디렉토리: origin/main에만 존재하므로 그대로 수용.
- lineage/: 양쪽 다른 세대 아카이브이므로 자동 병합 예상.
