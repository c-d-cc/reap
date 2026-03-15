# Birth Changelog — Gen-002

## Genome 변경 목록

### principles.md
- **추가**: ADR-006 — examples/로 실전 검증 패턴
- **추가**: ADR-007 — Legacy 자동 아카이빙

### conventions.md
- 변경 없음 (mutation 기록 기준은 다음 세대에서 추가 예정)

### constraints.md
- 변경 없음

## 코드/템플릿 변경 (Growth에서 반영)
- `src/templates/commands/reap.conception.md`: 첫 세대 genome 초기 구성 절차 + Health Check 분기
- `src/templates/commands/reap.growth.md`: log 갱신 시점 유연화
- `src/cli/commands/evolve.ts`: legacy 자동 아카이빙
- `tests/integration/full-lifecycle.test.ts`: 자동 아카이빙 반영

## 변경 근거
- Gen-002에서 invenio 실전 검증으로 발견된 4건의 mutation 반영
