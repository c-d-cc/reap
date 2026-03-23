# Planning

## Summary
`src/core/generation.ts`의 `archiveGeneration()` 내 backlog 복사 로직에서 `isConsumed` 조건을 추가하여, consumed된 항목만 lineage에 복사하도록 수정한다.

## Technical Context
- **Tech Stack**: TypeScript 5.x, Node.js >=18, fs/promises (src/core/fs.ts 경유)
- **Constraints**: 파일 I/O는 src/core/fs.ts의 readTextFile/writeTextFile 사용

## Tasks
- [x] T001 `src/core/generation.ts` -- backlog 복사 로직에 `if (isConsumed)` 조건 추가. 기존 주석 `// Always copy to lineage` 제거 및 조건부 복사로 변경.
- [x] T002 `npm run build` -- 빌드 성공 확인
- [x] T003 `bunx tsc --noEmit` -- 타입체크 성공 확인
- [x] T004 `bun test` -- 전체 테스트 통과 확인 (619 pass, 0 fail)

## Dependencies
- T002, T003, T004는 T001 완료 후 실행
- T002, T003, T004는 서로 독립적이므로 병렬 실행 가능

## 구현 상세

### T001 변경 내용
**파일**: `src/core/generation.ts` ~237줄

**변경 전**:
```typescript
// Always copy to lineage
await writeTextFile(join(backlogDir, entry), content);
// Only remove from life/backlog if consumed
if (isConsumed) {
  await unlink(join(this.paths.backlog, entry));
}
```

**변경 후**:
```typescript
if (isConsumed) {
  // Copy consumed backlog to lineage and remove from life/backlog
  await writeTextFile(join(backlogDir, entry), content);
  await unlink(join(this.paths.backlog, entry));
}
```
