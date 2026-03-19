# Planning

## Summary

CLI pull/push/merge subcommand를 삭제하고 slash command로 전환한다. README 4개 언어를 v0.5.0 기준으로 업데이트하고, docs 앱 translations에 Distributed Workflow 콘텐츠를 추가한다.

## Technical Context
- **Tech Stack**: TypeScript (CLI 정리), Markdown (README), TypeScript (docs translations)
- **Constraints**: README 영어 기준 작성 → 다른 언어 동기화, 커밋은 사용자 ok 시만

## Tasks

### T1: CLI commands 삭제 + index.ts 정리
- `src/cli/commands/merge.ts`, `pull.ts`, `push.ts` 삭제
- `src/cli/index.ts`에서 import + subcommand 등록 제거

### T2: reap.pull.md, reap.push.md slash command 템플릿
- `src/templates/commands/reap.pull.md` — 에이전트가 git fetch + 원격 lineage 스캔 + merge generation 전체 실행
- `src/templates/commands/reap.push.md` — 에이전트가 generation 상태 검증 + git push
- `src/cli/commands/init.ts` COMMAND_NAMES에 추가

### T3: README.md (en) 완성
- Distributed Workflow 섹션
- CLI Commands 테이블에서 pull/push/merge 제거
- Slash Commands 테이블에 reap.pull, reap.push 추가

### T4: README.ko.md 동기화
### T5: README.ja.md 동기화
### T6: README.zh-CN.md 동기화
### T7: docs translations (en.ts → ko.ts, ja.ts, zh-CN.ts)
### T8: docs 3페이지 (Overview, Merge Lifecycle, Merge Commands)

---

## Regression Tasks (merge lifecycle 6단계 변경)

### T9: 타입 + 코어 변경
- `src/types/index.ts` — MergeStage: `"detect" | "mate" | "merge" | "sync" | "validation" | "completion"` (6단계)
- `MERGE_LIFECYCLE_ORDER` 6단계
- `src/core/merge-lifecycle.ts` — labels: Mate, Merge, Sync, Validation, Completion

### T10: Merge artifact 템플릿 6종 (번호 재배정)
기존 5종 삭제 후 재생성:
- `01-detect.md` (유지)
- `02-mate.md` (구 genome-resolve)
- `03-merge.md` (구 source-resolve)
- `04-sync.md` (신규 — genome↔source 정합성, conflict 시 사용자 컨펌)
- `05-validation.md` (validation commands 실행)
- `06-completion.md` (번호 변경)

### T11: Slash command 템플릿 변경
삭제: reap.merge.genome-resolve.md, reap.merge.source-resolve.md, reap.merge.sync-test.md
생성/수정:
- `reap.merge.mate.md` — genome 교배. conflict 해결. 사용자 판단.
- `reap.merge.merge.md` — git merge --no-commit + source conflict 해결
- `reap.merge.sync.md` — genome↔source 정합성 검증. AI가 비교, 불일치 시 **사용자 컨펌 필수**.
- `reap.merge.validation.md` — validation commands 실행 (bun test, tsc, build)
- 기존 start/detect/evolve/completion — 6단계 반영
- `reap.pull.md` — 6단계 반영
- `init.ts` COMMAND_NAMES 업데이트

### T12: README + docs 6단계 반영
- README.md (en) 5단계 → 6단계 + stage 이름 변경
- README ko/ja/zh-CN 동기화
- docs translations 6단계 반영
- docs 3페이지 6단계 반영

### T13: tsc, bun test, build 검증

## Dependencies
```
기존: T1 → T2 → T3 → T4,T5,T6 → T7,T8
Regression: T9 → T10,T11 (병렬) → T12 → T13
```
