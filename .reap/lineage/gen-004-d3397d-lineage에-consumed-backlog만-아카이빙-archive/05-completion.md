# Completion — gen-004-d3397d

## Summary
archive.ts를 v0.15 패턴으로 수정하여, lineage에 consumed backlog만 아카이빙하고 pending은 life/에 유지.

### Changes
- `src/core/archive.ts` — backlog/ 제외 복사, consumed만 별도 lineage 아카이빙, consumed는 life에서 삭제

### Validation: PASS (init 62, lifecycle 16, multi-gen 34)

## Lessons Learned
- v0.16 rewrite에서 v0.15의 세밀한 backlog 처리 로직이 단순화(cp recursive)로 대체되어 데이터 중복 발생. v0.15 소스 비교가 계속 유효.

## Next Generation Hints
- reap make 명령어 + backlog 작성 prompt 규칙
- artifact-path-in-prompt
