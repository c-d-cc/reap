# Hook System

> REAP lifecycle event에 자동 실행되는 hook 규칙

## Normal Lifecycle Events

| Event | Trigger | Timing |
|-------|---------|--------|
| onLifeStarted | `/reap.start` 후 | generation 생성 직후 |
| onLifeObjected | objective 완료 후 | `/reap.next` (objective → planning) |
| onLifePlanned | planning 완료 후 | `/reap.next` (planning → implementation) |
| onLifeImplemented | implementation 완료 후 | `/reap.next` (implementation → validation) |
| onLifeValidated | validation 완료 후 | `/reap.next` (validation → completion) |
| onLifeCompleted | completion + archiving 후 | git commit 이후, 변경사항 uncommitted |
| onLifeTransited | 모든 stage 전환 시 | `/reap.next` 실행 시마다 (범용) |
| onLifeRegretted | regression 시 | `/reap.back` 실행 시 |

## Merge Lifecycle Events

| Event | Trigger | Timing |
|-------|---------|--------|
| onMergeStarted | `/reap.merge.start` 후 | merge generation 생성 직후 |
| onMergeDetected | detect 완료 후 | 분기 분석 완료 |
| onMergeMated | mate 완료 후 | genome 확정, source merge 전 |
| onMergeMerged | merge 완료 후 | source merge 직후, sync 전 |
| onMergeSynced | sync 완료 후 | genome-source 일관성 확인 |
| onMergeValidated | validation 완료 후 | 테스트/빌드 통과 |
| onMergeCompleted | completion + archiving 후 | git commit 이후 |
| onMergeTransited | 모든 merge stage 전환 시 | 범용 |

## File-Based Hooks

`.reap/hooks/` 디렉토리에 개별 파일로 정의. 네이밍: `{event}.{name}.{ext}`

```
.reap/hooks/
├── onLifeCompleted.reap-update.sh
├── onLifeCompleted.docs-update.md
├── onLifeImplemented.lint-check.sh
└── onMergeMated.notify.md
```

- `.md` → AI prompt (에이전트가 읽고 실행)
- `.sh` → shell script (project root에서 실행)

## Frontmatter / Comment Headers

`.md` 파일: YAML frontmatter
```yaml
---
condition: has-code-changes
order: 10
---
```

`.sh` 파일: comment header
```bash
# condition: always
# order: 20
```

## Conditions

`.reap/hooks/conditions/` 디렉토리의 실행 가능한 스크립트. exit 0 = true, non-zero = false.

기본 제공 (reap init 시 설치):
- `always.sh` — 항상 true
- `has-code-changes.sh` — src/ 파일이 마지막 커밋에서 변경됨
- `version-bumped.sh` — package.json version ≠ 마지막 git tag

커스텀: `.reap/hooks/conditions/`에 `.sh` 파일 추가만으로 동작.

## Execution Rules

- 같은 event 내 hook은 `order` 순 (같으면 알파벳순)
- condition이 충족되지 않으면 skip
- onLifeCompleted/onMergeCompleted hook은 커밋 이후 실행 → 변경사항은 별도 커밋

## Hook Suggestion

- Completion Phase 5에서 최근 3개 generation 분석
- 반복 패턴 감지 시 유저에게 event/condition/name/내용을 순차 확인 후 hook 파일 생성
- 한 번에 최대 2개 제안

## SessionStart Hook (별도)

- Claude Code의 `~/.claude/settings.json`의 `hooks.SessionStart`에 등록
- 매 세션 시작 시 REAP guide + generation 상태 주입
- `reap init`/`reap update`가 자동 관리
- **공유 모듈**: `genome-loader.cjs`가 Genome 로딩, config 파싱, staleness 감지, strict mode 빌드를 공통 처리. `session-start.cjs`(Claude Code)와 `opencode-session-start.js`(OpenCode)가 이를 require
