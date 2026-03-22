---
type: task
status: consumed
consumedBy: gen-143-fed640
---

# evolve subagent prompt에 설계 피벗/artifact 일관성 검증 규칙 추가

## 문제

evolve subagent가 중간에 설계 변경이 발생해도 이전 단계 artifact를 수정하지 않고 진행함.
`/reap.back` 사용 조건에 "설계 불일치"가 포함되어 있지 않음.

## 발생 사례 (gen-138-26723a)

1. goal: "lastSyncedCommit 기반" → 부모 agent가 "lastSyncedGeneration 기반"으로 설계 변경
2. subagent가 objective/planning을 lastSyncedCommit으로 작성
3. implementation에서 lastSyncedGeneration으로 구현
4. objective/planning artifact가 실제 구현과 불일치한 채 완료됨

## 개선 방향

`src/cli/commands/run/evolve.ts`의 `buildSubagentPrompt()`에 다음 규칙 추가:

1. **Artifact Consistency Rule**: 각 stage 시작 전, prompt의 설계 지시와 이전 artifact 내용이 일치하는지 확인. 불일치 시 `/reap.back`으로 이전 artifact 수정 후 재진행
2. **Design Pivot Detection**: prompt context에 명시적 설계 변경이 있을 때 (예: "IMPORTANT DESIGN DECISION", "대신 X 기반으로"), 현재 artifact와 비교하여 불일치 감지
3. **Regression Triggers 확장**: 현재 "Handling Issues"에 validation 실패만 있음 → "설계 불일치", "이전 artifact와 현재 구현 방향 불일치" 추가
