---
type: task
priority: medium
status: pending
---

# Slash command 토큰 최적화

## 개요
현재 32개 slash command를 정리하여 매 턴 skill matching 토큰 절감.
- Level 2 command를 argument로 통합 (삭제)
- Lifecycle stage command를 `reap.run`으로 통합 (삭제)
- 자주 안 쓰는 command에 `disable-model-invocation: true` 추가

## 최종 command 목록 (17개)

### Auto-matching ON (10개) — 자연어 매칭 가능

| Command | 하위 argument | 설명 |
|---------|--------------|------|
| `reap.evolve` | `[recovery]` | lifecycle 자동 실행 |
| `reap.start` | `<goal>` | generation 시작 |
| `reap.abort` | | generation 중단 |
| `reap.next` | | 다음 stage |
| `reap.back` | `[stage]` | 이전 stage |
| `reap.sync` | `[genome\|environment]` | 동기화 |
| `reap.merge` | `[start\|detect\|mate\|merge\|sync\|validation\|completion\|evolve]` `-b <branch>` | merge lifecycle |
| `reap.pull` | | fetch + 감지 |
| `reap.push` | | 상태 검증 + git push |
| `reap.help` | | 도움말 |
| `reap.report` | | 버그 리포트 |

### disable-model-invocation (9개) — 직접 호출만

| Command | 설명 |
|---------|------|
| `reap.run` | `reap.run <stage> [--phase <phase>]` — lifecycle stage 직접 실행 |
| `reap.status` | 상태 확인 |
| `reap.update` | REAP 업그레이드 |
| `reap.refreshKnowledge` | 컨텍스트 새로고침 |
| `reap.update-genome` | genome 업데이트 |
| `reap.init` | 프로젝트 초기화 |
| `reap.config` | 설정 확인 |
| `reap.fix` | 구조 검사/수정 |
| `reap.clean` | 프로젝트 리셋 |
| `reap.destroy` | 프로젝트 제거 |

## 삭제 대상 (15개)

### Level 2 → argument 통합 (10개)
- `reap.merge.start` → `/reap.merge start`
- `reap.merge.detect` → `/reap.merge detect`
- `reap.merge.mate` → `/reap.merge mate`
- `reap.merge.merge` → `/reap.merge merge`
- `reap.merge.sync` → `/reap.merge sync`
- `reap.merge.validation` → `/reap.merge validation`
- `reap.merge.completion` → `/reap.merge completion`
- `reap.merge.evolve` → `/reap.merge evolve`
- `reap.sync.genome` → `/reap.sync genome`
- `reap.sync.environment` → `/reap.sync environment`
- `reap.evolve.recovery` → `/reap.evolve recovery`

### Lifecycle stages → `reap.run` 통합 (5개)
- `reap.objective` → `/reap.run objective`
- `reap.planning` → `/reap.run planning`
- `reap.implementation` → `/reap.run implementation`
- `reap.validation` → `/reap.run validation`
- `reap.completion` → `/reap.run completion`

## 토큰 절감
- 현재: 32개 × ~15 = ~480 tokens/턴
- 변경 후: 8개 auto × ~15 = ~120 tokens/턴
- **절감: ~360 tokens/턴 (~75%)**

## 구현
- 15개 `.md` 파일 삭제
- 7개 `.md` 파일에 `disable-model-invocation: true` 추가
- `reap.merge`, `reap.sync`, `reap.evolve`, `reap.run`의 body에서 `$ARGUMENTS` 전달 확인
- 코드 변경 최소 (템플릿 수정 위주)
