# Planning

## Summary
`genome-loader.cjs`의 `buildGenomeHealth()`에 placeholder 패턴 감지 로직을 추가하여, 초기 템플릿 상태의 genome 파일이 "synced"로 잘못 표시되는 문제를 해결한다.

## Technical Context
- **Tech Stack**: Node.js CJS (genome-loader.cjs는 hook 파일, TypeScript가 아닌 CommonJS)
- **Constraints**: genome-loader.cjs는 session-start hook에서 require됨. export 인터페이스 유지 필수.

## Tasks

### Phase 1: Placeholder 감지 로직 추가
- [x] T001 `src/templates/hooks/genome-loader.cjs` -- PLACEHOLDER_PATTERNS 상수 배열 추가 (정규식 패턴: `\(Add .+ here\)`, `\(Describe .+\)`, `\(language and version\)`, `\(External .+\)`, 빈 테이블 행 패턴 `^\| +\| +\| +\|`)
- [x] T002 `src/templates/hooks/genome-loader.cjs` -- `hasPlaceholders(filePath)` 함수 추가: 파일 내용을 읽고 PLACEHOLDER_PATTERNS 중 하나라도 매칭되면 true 반환
- [x] T003 `src/templates/hooks/genome-loader.cjs` -- `buildGenomeHealth()` 수정: L1 파일들에 대해 `hasPlaceholders()` 호출, placeholder 파일 수에 따라 severity 결정
  - 일부 L1 파일이 placeholder → issues에 "needs customization (N/4 files)" 추가, severity 최소 'warn'
  - 모든 L1 파일이 placeholder → severity를 'danger'로 설정
- [x] T004 `src/templates/hooks/genome-loader.cjs` -- `hasPlaceholders` 함수를 module.exports에 추가 (테스트 접근용)

### Phase 2: 테스트
- [x] T005 `tests/hooks/genome-loader.test.ts` -- `hasPlaceholders()` 단위 테스트: placeholder 템플릿 파일 → true, 실제 작성된 파일 → false
- [x] T006 `tests/hooks/genome-loader.test.ts` -- `buildGenomeHealth()` 통합 테스트: placeholder 파일 존재 시 severity='warn' 또는 'danger', 실제 파일 시 severity='ok'

## Dependencies
- T002 → T001 (패턴 상수 필요)
- T003 → T002 (함수 필요)
- T004 → T002
- T005, T006 → T001~T004 (구현 완료 후 테스트)
