# Objective

## Goal
Hook system 전면 개편. 기존 4+4개 이벤트를 stage-level 8+8개로 교체.

### Normal Lifecycle (8개)
| Event | Trigger |
|-------|---------|
| onLifeStarted | generation 생성 후 |
| onLifeObjected | objective 완료 후 |
| onLifePlanned | planning 완료 후 |
| onLifeImplemented | implementation 완료 후 |
| onLifeValidated | validation 완료 후 |
| onLifeCompleted | completion + archiving 후 |
| onLifeTransited | 모든 stage 전환 시 (범용) |
| onLifeRegretted | regression 시 |

### Merge Lifecycle (8개)
| Event | Trigger |
|-------|---------|
| onMergeStarted | merge generation 생성 후 |
| onMergeDetected | detect 완료 후 |
| onMergeMated | mate 완료 후 |
| onMergeMerged | merge 완료 후 |
| onMergeSynced | sync 완료 후 |
| onMergeValidated | validation 완료 후 |
| onMergeCompleted | completion + archiving 후 |
| onMergeTransited | 모든 merge stage 전환 시 |

## Completion Criteria
- ReapHookEvent 타입 교체
- 모든 커맨드 템플릿에서 hook 이벤트명 교체
- genome (constraints, domain/hook-system) 업데이트
- 실제 hook 파일 리네임
- reap-guide.md 업데이트
- docs 번역 4개 + README 4개 업데이트
- 하위호환: 구 이벤트명 hook 파일 감지 시 migrate 지시 스크립트
- 빌드/테스트 통과

## Scope
- **Stash에 WIP 있음**: `git stash pop`으로 복구 가능 (types, genome, commands 일부 완료)
- **미완료**: docs 번역, README, reap-guide, reap.next stage별 hook 발동 로직, migrate 스크립트
