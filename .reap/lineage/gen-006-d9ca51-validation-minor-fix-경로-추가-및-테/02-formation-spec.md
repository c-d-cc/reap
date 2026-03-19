# Formation Spec

## 요구사항

### FR-001: Validation minor fix 경로
- `reap.validation.md`의 판정 기준에 "코드 품질 개선 사항" 항목 추가
- minor fix가 필요하면 partial로 판정하고 Growth 회귀 안내

### FR-002: 테스트 매직 넘버 제거
- `init.ts`에서 COMMAND_NAMES를 export
- `init.test.ts`에서 `toHaveLength(8)` 대신 COMMAND_NAMES.length 동적 참조

## 수용 기준
- [ ] Validation 커맨드에 minor fix partial 판정 경로 존재
- [ ] init.test.ts에 하드코딩 숫자 없음
- [ ] 테스트/tsc 통과

## Mutations
없음
