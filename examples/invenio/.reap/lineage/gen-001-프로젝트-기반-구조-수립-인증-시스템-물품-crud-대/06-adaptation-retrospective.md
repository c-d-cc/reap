# Adaptation Retrospective — Gen-001

## Part A: 회고

### 교훈
1. 첫 세대에서 genome 초기 구성 + 전체 앱 구현은 부담이 큼
2. bun:sqlite + Drizzle 조합이 잘 동작하나, 마이그레이션 관리는 수동
3. Hono의 타입 추론이 강력해서 implicit any 거의 없음
4. Tailwind CSS로 빠르게 UI를 구성할 수 있었음

### Genome 변경 제안
- conventions.md: API 테스트 패턴을 명시 (in-memory DB isolation)
- constraints.md: `bun run build` 도 Validation Commands에 추가

## Part B: 가비지 컬렉션

### 코드베이스 건강 점검
- convention 위반: 없음
- 기술 부채: 마이그레이션이 SQL 문자열로 하드코딩됨 → Drizzle Kit 마이그레이션으로 전환 고려
- 불필요 복잡도: 없음 (첫 세대, 코드가 단순)

## Part C: Backlog 정리

### 다음 세대 후보
- 카테고리 관리 (CRUD + 물품 연동)
- 입출고 트랜잭션 기록
- Drizzle Kit 마이그레이션 도입
- E2E 테스트 추가
- 에러 핸들링 고도화 (zod validation)
