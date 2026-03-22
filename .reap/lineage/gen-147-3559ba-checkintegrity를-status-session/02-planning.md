# Planning

## Summary

`checkIntegrity()`를 3개 진입점(status, session-start, update)에서 호출하도록 통합한다.
- status, update: TypeScript에서 직접 `checkIntegrity()` import 호출
- session-start.cjs: CJS 환경이므로 `reap fix --check` 서브프로세스 호출

## Technical Context
- **Tech Stack**: TypeScript, Commander.js CLI, Node.js CJS hooks
- **Constraints**: session-start.cjs는 CJS 환경 → ESM integrity.ts 직접 import 불가 → 서브프로세스 사용

## Tasks

### Phase 1: status 통합
- [x] T001 `src/cli/commands/status.ts` -- `ProjectStatus` 인터페이스에 `integrity` 필드 추가, `getStatus()`에서 `checkIntegrity()` 호출
- [x] T002 `src/cli/index.ts` -- status 핸들러에서 integrity 결과 출력 (errors/warnings 카운트 + 안내)

### Phase 2: update 통합
- [x] T003 `src/cli/index.ts` -- update 핸들러 마지막에 `checkIntegrity()` 호출, 결과 출력

### Phase 3: session-start 통합
- [x] T004 `src/templates/hooks/session-start.cjs` -- `reap fix --check` 서브프로세스 호출, stdout 파싱, session init 블록에 integrity 상태 한 줄 추가

### Phase 4: 빌드 및 검증
- [x] T005 빌드 확인 -- `node scripts/build.js` 성공 확인
- [x] T006 타입체크 -- `bunx tsc --noEmit` 통과 확인
- [x] T007 기존 테스트 -- `bun test` 통과 확인

## Dependencies

- T001 → T002 (status 인터페이스 변경 후 CLI 출력)
- T003: 독립 (update는 CLI index.ts에서 직접 처리)
- T004: 독립 (CJS 서브프로세스 방식)
- T005, T006, T007: T001~T004 모두 완료 후

## 구현 상세

### T001: status.ts 변경
```typescript
// ProjectStatus에 추가
integrity: { errors: number; warnings: number } | null;

// getStatus()에서
import { checkIntegrity } from "../../core/integrity";
const integrityResult = await checkIntegrity(paths);
// return에 포함
integrity: { errors: integrityResult.errors.length, warnings: integrityResult.warnings.length }
```

### T002: index.ts status 출력
```
Integrity: ✓ OK
// 또는
Integrity: 2 errors, 1 warning (run 'reap fix --check' for details)
```

### T003: index.ts update 출력
update 핸들러의 마지막(결과 출력 후)에 integrity 검사 추가. `checkProject()` (fix.ts에서 export) 재사용 가능.

### T004: session-start.cjs
```javascript
// reap fix --check 서브프로세스 호출
let integrityLine = '';
try {
  const result = require('child_process').execSync('reap fix --check', { encoding: 'utf-8', timeout: 5000, stdio: 'pipe' });
  integrityLine = '🟢 Integrity — OK';
} catch (err) {
  // exit code 1 = errors found
  const output = (err.stdout || '').trim();
  const errorCount = (output.match(/✗/g) || []).length;
  const warnCount = (output.match(/⚠/g) || []).length;
  integrityLine = `🔴 Integrity — ${errorCount} errors, ${warnCount} warnings`;
}
initLines.push(integrityLine);
```
