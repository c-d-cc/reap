---
type: genome-change
target: conventions.md
priority: high
createdBy: gen-087-adc61f
consumed: true
consumedBy: gen-087-adc61f
---

# conventions.md — Script Orchestrator 패턴 규칙

## 변경 내용
- Script Orchestrator 섹션 추가:
  - Slash command(.md)는 1줄 wrapper 유지
  - Deterministic 로직은 command script(`src/cli/commands/run/`)에서 core 직접 호출
  - Creative 작업은 structured JSON output으로 AI에게 지시
  - Phase 기반 재진입: `reap run <command> --phase <phase>`
