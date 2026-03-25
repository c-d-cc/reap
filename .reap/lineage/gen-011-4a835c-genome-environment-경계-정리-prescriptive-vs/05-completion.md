# Completion — gen-011-4a835c

## Summary
genome/environment 경계를 prescriptive/descriptive로 명확히 분리. application.md에서 Tech Stack, Testing, Version/License를 제거하고 environment/summary.md로 이동. evolution.md에 경계 원칙 + 갱신 전략 추가.

### Changes
- application.md: descriptive 제거 → prescriptive only
- summary.md: Tech Stack 상세 추가
- evolution.md: genome/environment 경계 원칙 + 점진적 갱신 전략
- src/templates/evolution.md: 배포 template 동기화

## Lessons Learned
- genome은 "이렇게 해야 한다", environment은 "현재 이런 상태다". 판단 기준: "이 정보가 바뀌면 genome을 수정해야 하나?"
- gen-001에서 발견한 문제가 gen-011에서야 해결. 인프라 정비에 집중하느라 지연됐으나, 인프라가 갖춰진 후에 하는 것이 더 깔끔.
