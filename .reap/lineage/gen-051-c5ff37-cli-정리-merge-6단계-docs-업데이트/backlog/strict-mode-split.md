---
type: task
status: pending
priority: medium
title: strict 모드 세분화 — strictEdit + strictMerge
---

# strict 모드 세분화

## 설계

기존 `strict: true/false`를 하위 호환 유지하면서 세분화:

```yaml
# shorthand — 전부 켜기
strict: true

# 개별 제어
strict:
  edit: true    # generation/stage 외 코드 수정 차단 (기존 strict 기능)
  merge: false  # raw git pull/push/merge 차단, reap pull/push/merge만 허용
```

- `strict: true` → `{ edit: true, merge: true }`
- `strict: false` → `{ edit: false, merge: false }`
- `strict: { edit: true }` → edit만 켜고 merge는 false (기본값)

## 구현 범위
- config.ts 파싱 로직 (boolean | object 분기)
- session-start hook에서 strictMerge 시 git 명령 경고 메시지 추가
- git hook (pre-push, pre-merge-commit) 설치로 실제 차단 (또는 경고)
- genome-loader.cjs에서 strict mode 빌드 로직 확장
