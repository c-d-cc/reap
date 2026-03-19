---
type: task
status: consumed
consumedBy: gen-030
---
# Generation 실행 시 자동 version bump 판단

Generation complete 시 version bump 필요 여부를 AI가 자동 판단하는 기능 추가.

## 요구사항
- patch bump: AI가 자동으로 판단하여 적용 (bugfix, minor improvement)
- minor/major bump: 유저에게 확인을 받아서 적용 (새 기능, breaking change)
- onGenerationComplete hook의 prompt로 구현하거나, completion 단계 로직에 통합
- `npm version patch/minor/major` 실행 + package.json 업데이트
