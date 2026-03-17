# Planning

## Summary
빌드 시 templates를 dist/에 복사, paths.ts 경로 해석을 dev/dist 호환으로 변경, package.json 정비.

## Technical Context
- **Tech Stack**: bun build, Node.js >= 18
- **Constraints**: existsSync로 경로 감지 (fs/promises가 아닌 fs 동기 사용)

## Tasks

### Phase 1: 경로 해석 수정
- [ ] T001 `src/core/paths.ts` — packageTemplatesDir를 existsSync로 dev/dist 양쪽 감지

### Phase 2: package.json + 빌드
- [ ] T002 `package.json` — bin, files, scripts (build, prepublishOnly), engines 수정
- [ ] T003 빌드 실행 + dist/templates/ 생성 확인

### Phase 3: 검증
- [ ] T004 `bun test`, `bunx tsc --noEmit`
- [ ] T005 `npm publish --dry-run` — 포함 파일 확인

## Dependencies
T001 → T003 (경로 수정 후 빌드 테스트)
T002 → T003, T005
