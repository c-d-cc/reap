---
type: genome-change
status: pending
---

# IntegrityChecker를 Genome 지식에 추가

## 대상 파일 및 변경 내용

### 수정: conventions.md
- **Enforced Rules 테이블에 추가**: IntegrityChecker (`src/core/integrity.ts`) — `.reap/` 폴더의 파일/폴더 구조에 대한 신뢰 원천(single source of truth)
- **규칙 추가**:
  - `.reap/` 하위 파일 구조, 폴더 구조, 파일 내용 형식이 변경되면 IntegrityChecker의 검증 로직도 반드시 함께 업데이트해야 함
  - IntegrityChecker는 반드시 TypeScript type checking을 사용해야 함 (런타임 타입 검증이 아닌 컴파일 타임 타입 활용)
  - `reap fix --check`로 실행 가능, `onLifeCompleted` hook으로 자동 실행

### 수정: constraints.md
- Validation Commands 테이블에 `reap fix --check` 추가 (구조적 완전성 검사)

### 수정: source-map.md
- `src/core/integrity.ts` 컴포넌트 추가 (IntegrityChecker — .reap/ 구조 검증)
