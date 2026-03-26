# Completion — gen-022-947193

## Summary

reap-guide.md 작성 + subagent prompt 공통화 완료. REAP 도구 사용법을 담은 가이드 문서를 만들고, evolve.ts의 프롬프트 빌드 로직을 `src/core/prompt.ts`로 추출.

### Changes
- `src/templates/reap-guide.md` (신규, 220줄): v16 구조에 맞는 REAP 가이드. 3-Layer Model, Genome Structure, Life Cycle, Key Concepts, Hook System, CLI Commands, Maturity System, Critical Rules 등 포함.
- `src/core/prompt.ts` (신규): `loadReapKnowledge(paths)` — guide + genome + environment + vision 병렬 로딩. `buildBasePrompt(knowledge, paths, state, cruiseCount?)` — subagent prompt 조립. `ReapKnowledge` 타입 정의.
- `src/cli/commands/run/evolve.ts` (리팩토링, 212줄 → 54줄): `buildSubagentPrompt()` 인라인 함수 제거, `prompt.ts` 함수로 교체.

### Test Results
- 195 tests 전체 통과 (unit 82 + e2e 72 + scenario 41)

## Lessons Learned

- v15 reap-guide.md가 잘 구조화되어 있어서 v16 적응이 수월했음. 다만 v16의 stage명(learning), genome 파일명(application/evolution/invariants), hook 이벤트명(onLifeLearned), CLI 패턴(`reap run`) 등 차이점이 상당수 존재.
- prompt.ts로 분리하면서 evolve.ts가 54줄로 줄어들어 가독성이 크게 향상됨. 향후 다른 곳(예: skill 파일, init)에서도 prompt.ts를 재사용할 수 있는 기반이 마련됨.
- reap-guide.md를 subagent prompt에 통째로 넣으면 프롬프트가 상당히 길어짐. 향후 프롬프트 크기 최적화가 필요할 수 있음.

## Next Generation Hints

- reap-guide.md를 사용자 프로젝트에 주입하는 방식 결정 (hook? init? CLAUDE.md?)
- prompt.ts를 다른 컨텍스트(개별 stage prompt)에서도 활용
- environment/summary.md에 prompt.ts 모듈 추가 반영
