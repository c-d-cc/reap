---
type: task
status: consumed
priority: high
consumedBy: gen-116-92c7d5
---

# E2E 테스트: project-level skill 설치 검증

## 문제

gen-112에서 `.claude/commands/` → `.claude/skills/` 마이그레이션을 했으나 E2E 테스트가 없음.

### 테스트 커버리지 부족 항목

1. **session-start.cjs의 `.claude/skills/` 생성**: `~/.reap/commands/`에서 `.claude/skills/{name}/SKILL.md`로 복사하는 로직 미검증
2. **OpenCode project-level command 설치**: `opencode-session-start.js`에 project-level 커맨드 복사 로직 자체가 없음. OpenCode도 동일한 문제 존재 가능
3. **skill-loading-e2e.sh outdated**: v0.7.0 기준 (redirect stubs + `~/.reap/commands/`). 현재 `.claude/skills/` 반영 안 됨
4. **Non-REAP 프로젝트 격리**: `.claude/skills/reap.*`이 non-REAP 프로젝트에 생성되지 않는지 검증

## 개선 방향

1. `skill-loading-e2e.sh` 업데이트 — 현재 버전 기준 `.claude/skills/` 검증 추가
2. OpenCode project-level command 설치 방안 검토 (또는 `~/.config/opencode/commands/`에 직접 설치 유지)
3. OpenShell sandbox에서 실제 `reap init` → session-start hook → skill 파일 검증
