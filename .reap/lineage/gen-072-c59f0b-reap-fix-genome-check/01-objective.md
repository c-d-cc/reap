# Objective

## Goal
`reap fix`에 genome 필수 파일(principles.md, conventions.md, constraints.md, source-map.md) 누락 검사 추가.
누락 시 빈 템플릿으로 복구하고 issue/fixed로 보고.

## Completion Criteria
- genome 필수 파일 누락 시 감지 및 복구
- source-map.md 누락된 프로젝트(~/cdws/selfview)에서 `reap fix`가 문제를 찾아냄
