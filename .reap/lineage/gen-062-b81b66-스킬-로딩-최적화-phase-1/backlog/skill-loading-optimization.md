---
type: task
status: consumed
consumedBy: gen-062-b81b66
---
# REAP 스킬 로딩 최적화 — session hook symlink 방식

## 문제
24개 reap.*.md 커맨드가 ~/.claude/commands/에 설치되어 non-REAP 프로젝트에서도 매 턴 스킬 매칭 추론 비용 발생.

## 목표 구조
- 소스: `~/.reap/commands/` (reap init/update가 설치)
- 로딩: session-start.cjs가 .reap/ 감지 시 `.claude/commands/reap.*.md` → `~/.reap/commands/` symlink 생성
- non-REAP 프로젝트: symlink 없음 → 스킬 로딩 없음

## 마이그레이션 전략 (기존 유저 안전)

### Phase 1: 병행 운영 (이번 버전)
- `~/.reap/commands/`에 커맨드 파일 설치 (신규)
- `~/.claude/commands/reap.*.md`는 **삭제하지 않고** 내용을 `~/.reap/commands/` 기준 redirect로 교체
- session-start.cjs: .reap/ 감지 시 프로젝트 `.claude/commands/`에 symlink 생성
- .gitignore에 `.claude/commands/reap.*` 추가

### Phase 2: 정리 (다음 minor 버전)
- `~/.claude/commands/reap.*.md` redirect 파일 삭제

## 핵심 원칙
기존 유저가 update 했을 때 즉시 broken 되지 않아야 함. Phase 1에서 redirect로 병행 → Phase 2에서 정리.
