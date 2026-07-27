---
id: gen-059-9e9790
type: embryo
goal: "fix: migrate/update 관련 테스트 8건 수정"
parents: ["gen-058-c24cf8"]
---
# gen-059-9e9790
migrate/update 관련 실패 테스트 8건 수정 완료. 3개 파일 변경.

변경 내용:
- `integrity.ts`: LEGACY_PREFIX_PATTERN을 LEGACY_COMMAND_PATTERN + LEGACY_SKILL_PATTERN으로 분리. reapdev.* prefix 지원 추가.
- `migrate.ts`: vision/docs -> vision/design 경로 수정
- `update.test.ts`: vision/docs -> vision/design 경로 수정

결과: unit 342 pass, e2e 147 pass. 기존 1건 pre-existing failure(init-repair)는 별도 이슈.