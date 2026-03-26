# Completion — gen-037-5f3c11

## Summary

validation stage에서 이전 stage artifact 미작성을 감지하고 보충 지시를 반환하는 기능을 구현했다 (GitHub Issue #13 해결).

주요 변경:
- **신규 파일 2개**: `artifact-check.ts` (core 모듈), `artifact-check.test.ts` (unit test 10개)
- **수정 파일 3개**: `validation.ts` (work phase에 artifact 검증 추가), `types/index.ts` (ReapOutput status에 `artifact-incomplete` 추가), `reap-guide.md` (보충 예외 규칙 추가)
- **총 340 tests 통과** (unit 216 + e2e 124)

## Lessons Learned

- **false positive 방지가 핵심**: 초기 구현에서 `<!-- Core section.` 패턴을 전역 매칭하면, artifact 내용에서 해당 패턴을 "언급"하는 텍스트도 감지됨. 줄 단위 매칭(`^...$/m`)으로 변경하여 독립적인 HTML 주석만 감지하도록 수정. 패턴 설계 시 실제 사용 맥락을 고려해야 한다.
- **Optional vs Core 구분의 중요성**: template의 Optional section placeholder는 의도적으로 남길 수 있으므로 검증 대상에서 제외. Core section만 검증함으로써 적절한 수준의 gate를 구현.

## Next Generation Hints

- `STAGE_ARTIFACTS` 맵이 `template.ts`, `stage-transition.ts`, `artifact-check.ts` 3곳에 중복 정의됨. 공통 상수로 추출하면 유지보수성 향상.
- `artifact-incomplete` status를 받은 evolve subagent의 실제 행동은 evolve.ts 또는 skill의 지시에 따라 달라질 수 있으므로, 실제 cruise/evolve 시나리오에서 검증 필요.

## Project Diagnosis

- **Core functionality**: 안정. 340 tests 전부 통과.
- **Architecture stability**: 안정. artifact-check.ts가 core 모듈로 독립 분리.
- **Test coverage**: unit 216 + e2e 124. 신규 기능에 10개 unit test 동반.
