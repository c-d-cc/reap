---
id: gen-038-1fb73f
type: embryo
goal: "migrate/init에서 프로젝트 레벨 legacy commands/skills 정리"
parents: ["gen-037-5f3c11"]
---
# gen-038-1fb73f
migrate/init에서 프로젝트 레벨 legacy commands/skills 파일을 자동 정리하는 기능을 구현했다.

주요 변경:
- **신규 함수 1개**: `cleanupLegacyProjectSkills()` in `src/core/integrity.ts`
- **수정 파일 2개**: `migrate.ts` (execute phase에서 cleanup 호출), `init/common.ts` (initCommon에서 cleanup 호출)
- **테스트 9개 추가**: unit 7개, e2e 2개
- **총 349 tests 통과** (unit 223 + e2e 126)