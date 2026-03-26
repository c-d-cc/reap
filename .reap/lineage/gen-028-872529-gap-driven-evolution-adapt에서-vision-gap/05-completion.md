# Completion — gen-028-872529

## Summary

Vision gap 분석을 코드 수준에서 자동화하여 adapt phase의 지능을 향상시켰다.

### Changes
- `src/core/vision.ts` — 신규. parseGoals, findCompletedGoals, suggestNextGoals, buildVisionGapAnalysis 구현 (~190줄)
- `src/cli/commands/run/completion.ts` — adapt phase에서 구조화된 vision gap 분석 주입 (기존 원문 삽입 대체)
- `tests/unit/vision.test.ts` — 신규. 23개 단위 테스트

### Test Results
- 255 tests 전체 통과 (unit 171 + e2e 84)

## Lessons Learned

- **keyword overlap 매칭의 한계**: 현재 tokenize + overlap 방식은 간단하고 deterministic하지만, 의미적 유사도를 잡지 못함. 예: "README 재작성"과 "문서화 개선"은 관련이 있지만 keyword가 겹치지 않음. 이후 개선 여지가 있으나, 현재 용도(vision goal 체크 제안)에는 충분.
- **backlog.ts 패턴 재활용**: scanBacklog()의 "디렉토리 스캔 -> 파싱 -> 구조화된 배열" 패턴이 vision.ts에도 자연스럽게 적용됨. 이 패턴은 REAP의 표준 데이터 로딩 방식으로 정착.
- **prompt 크기 관리**: buildVisionGapAnalysis()가 생성하는 텍스트가 길어질 수 있음. 현재는 top-3 후보로 제한하여 관리 중.

## Next Generation Hints

- **Clarity level 자동 계산**: vision/goals.md 상태 + backlog 상태 + genome 안정성에서 clarity를 자동 계산하는 로직 구현 가능 (vision.ts의 parseGoals가 기반을 제공)
- **Self-Hosting 검증**: 외부 프로젝트에서 REAP core lifecycle 검증하여 self-hosting 진전
- **README 재작성**: v0.16 기준 self-evolving pipeline 설명 강화
