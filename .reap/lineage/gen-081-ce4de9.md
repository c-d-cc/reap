---
id: gen-081-ce4de9
type: normal
parents: []
goal: "hook system overhaul: stage-level events for normal + merge lifecycle"
genomeHash: eb48bd4f1a9e
startedAt: 2026-03-20T15:16:33.192Z
completedAt: 2026-03-21T00:51:00.000Z
---

# gen-081-ce4de9

## Objective
Hook system 전면 개편. 기존 4+4개 이벤트를 stage-level 8+8개로 교체.

## Completion Conditions
- ReapHookEvent 타입 교체
- 모든 커맨드 템플릿에서 hook 이벤트명 교체
- genome (constraints, domain/hook-system) 업데이트
- 실제 hook 파일 리네임
- reap-guide.md 업데이트
- docs 번역 4개 + README 4개 업데이트
- 하위호환: 구 이벤트명 hook 파일 감지 시 migrate 지시 스크립트
- 빌드/테스트 통과
