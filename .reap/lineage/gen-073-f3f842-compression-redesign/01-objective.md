# Objective

## Goal
Compression 재설계:
1. `/reap.completion` 커맨드에서 compression 판단/실행
2. Level 2를 싱글 epoch.md 파일로 변경 + frontmatter에 hash chain (DAG 보존)
3. Level 2 압축 전 local + remote branch fork 검사
4. epoch된 generation에서 새 branch 생성 차단

## Completion Criteria
- compression.ts: Level 2 로직 재작성 (싱글 파일, hash chain, fork guard)
- Level 2 트리거: Level 1 파일 100개 초과, 최근 9개 보호
- reap.completion.md: compression 단계 추가
- 빌드/테스트 통과
