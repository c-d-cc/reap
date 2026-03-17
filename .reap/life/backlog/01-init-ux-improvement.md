---
type: task
priority: medium
title: "reap init UX 개선 — name 인자 없이도 동작"
---

## 현재 동작
- `reap init <name>` — name이 필수 인자
- 기존 프로젝트에서도 `reap init my-project --mode adoption`처럼 이름을 명시해야 함

## 개선 방향
- `reap init` (인자 없음): 현재 디렉토리 이름을 프로젝트 이름으로 자동 사용, `--mode adoption` 자동 감지 (기존 소스 존재 시)
- `reap init <name>` (인자 있음): 새 디렉토리 생성 후 init (현재 동작 유지)
- `reap init . --mode adoption`: 현재 디렉토리에 명시적으로 adoption 모드 init

## 기대 결과
```bash
# 기존 프로젝트에서 — 디렉토리 이름 자동 사용
cd my-existing-project
reap init

# 새 프로젝트 — 현재와 동일
reap init my-new-project
```
