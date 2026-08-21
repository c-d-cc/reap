---
id: gen-076-a3679b
type: embryo
goal: "resolve #22: install-skills 설치 위치를 fix --check 가 legacy 로 오탐하는 문제 — 경로를 DI 로 공유해 installer/checker 불일치 제거"
parents: ["gen-075-c791fb"]
---
# gen-076-a3679b
**Goal**: `reap fix --check` 가 `reap install-skills` 의 정식 설치 위치를 "legacy" 로 오탐하는 문제(issue #22) 해소 + 경로를 DI 로 공유해 재발 차단. 버전 0.17.3.

**결과**: 완료. 본 repo `fix --check` **19 warnings → 0**.

**핵심 변경**:
- `adapters/claude-code/install.ts` — `claudeCodeCommandsDir(home?)` export (opencode 패턴 적용)
- `adapters/types.ts` — `AdapterModule.userLevelDirs(home?)` 추가, 양 adapter 구현
- `core/integrity.ts` — `checkUserLevelArtifacts(projectRoot, canonicalDirs, home)`. 정식 위치 제외 + "Phase 2" 문구 제거
- `cli/commands/fix.ts` — `resolveCanonicalUserDirs` 로 주입 (`core → adapters` 의존 없음)

**검증**: typecheck 0 / CLI+docs build / 문서 게이트 pass / unit **470-0**(+9) / e2e **268-1**(+5) / scenario 44-0