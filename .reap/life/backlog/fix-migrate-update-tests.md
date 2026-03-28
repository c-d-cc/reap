---
title: migrate/update 관련 테스트 8건 수정
priority: medium
created: 2026-03-28
---

## 실패 테스트 목록

### cleanupLegacyProjectSkills (4건)
- deletes reapdev.*.md files from .claude/commands/
- deletes reap.*/ directories from .claude/skills/
- deletes reapdev.*/ directories from .claude/skills/
- handles both commands and skills in one call

### e2e: migrate (3건)
- new directory structure exists
- migrate cleans up legacy project-level commands and skills
- legacy reap files deleted, other files preserved

### e2e: update (1건)
- update creates missing directories (vision/docs → vision/design 리네이밍 후 경로 불일치)

## 원인 추정
- cleanupLegacyProjectSkills: legacy cleanup 로직이 새 디렉토리 구조와 불일치
- migrate e2e: 디렉토리 구조 변경(vision/docs → vision/design) 반영 안 됨
- update e2e: vision/docs 경로가 더 이상 존재하지 않음
