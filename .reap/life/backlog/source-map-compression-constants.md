# source-map.md 압축 상수 업데이트

- type: genome-change
- status: pending
- title: source-map.md 압축 상수 업데이트

## 변경 내용
`.reap/genome/source-map.md`의 Key Constants 테이블:
- `LINEAGE_MAX_LINES`: 5,000 → 10,000
- `RECENT_PROTECTED_COUNT`: 3 → 20

## 이유
`src/core/compression.ts`의 실제 상수값이 변경되었으므로 문서도 동기화 필요.
