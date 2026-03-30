---
id: gen-035-45b5c5
type: embryo
goal: "Memory 갱신을 reflect phase 워크플로우에 통합 — 트리거 + criteria 명시"
parents: ["gen-034-674857"]
---
# gen-035-45b5c5
Memory 갱신을 reflect phase 워크플로우에 통합했다. "자유롭게 쓸 수 있다"는 모호한 지시를 tier별 구체적 criteria로 교체:
- **Shortterm**: 매 generation 필수 갱신 (요약, 핸드오프, 미결정, backlog)
- **Midterm**: 맥락 변경 시 (큰 작업 흐름, 멀티 gen 계획, 합의 방향)
- **Longterm**: 교훈 발생 시만 (설계 교훈, 아키텍처 배경, 전환 교훈)
- **갱신 금지**: code 상세(environment), 수치(artifact), genome 중복

5곳에 일관되게 반영: completion.ts prompt, 프로젝트 genome, 템플릿 genome, reap-guide, subagent prompt.
신규 e2e 테스트 1개 추가. 전체 351 tests 통과.