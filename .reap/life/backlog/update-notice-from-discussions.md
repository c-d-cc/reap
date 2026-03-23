---
type: task
priority: medium
status: pending
---

# reap update 시 GitHub Discussions 기반 notice 표시

## 개요
`reap update` 실행 시 GitHub Discussions (Announcements)에서 해당 버전의 notice를 fetch하여 사용자 언어에 맞게 표시.

## 흐름
1. version bump 시 (reapdev.versionBump) notice 작성
2. notice 내용을 유저에게 컨펌 받음
3. 컨펌 후 GitHub Discussions에 게시 (gh api 사용)
4. `reap update` 실행 시 현재 버전에 해당하는 notice를 fetch하여 표시
5. 사용자 language 설정에 맞게 표시 (다국어 지원)

## Notice 작성 규칙
- 평소: 5줄 내외로 짧게
- Breaking change 있을 때: 상세하게 작성
- AI가 작성하되, 유저 컨펌 후 게시

## 구현 포인트
- GitHub Discussions API: `gh api repos/c-d-cc/reap/discussions`
- Notice 포맷: 버전별 discussion post (제목에 버전 포함)
- fetch 실패 시 graceful fallback (오프라인 등)
- reapdev.versionBump 워크플로우에 notice 작성 단계 추가
