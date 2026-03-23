---
type: task
priority: low
status: consumed
consumedBy: gen-160-74aee5
---

# Artifact 상단 gate 문구 개선

## 현재
```
# REAP MANAGED — Do not modify directly. Use reap run commands.
```

## 변경
```
# REAP MANAGED — Do not modify directly. Use 'reap run <stage> --phase <phase>' to update.
```

## 이유
- 현재 문구가 추상적이라 AI가 구체적 action으로 매핑하기 어려움
- 따옴표 안의 명시적 command 형식이 AI 패턴 매칭에 유리
- `<stage>` 표기가 CLI 관례에 적합
