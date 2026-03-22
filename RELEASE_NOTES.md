## What's New

- **Recovery Generation** — New generation type (`type: recovery`) for correcting past generation errors. `/reap.evolve.recovery` reviews and creates recovery generations
- **Structural Integrity Checker** — `reap fix --check` validates `.reap/` directory structure. Auto-runs via `onLifeCompleted` hook
- **`/reap.update-genome`** — Apply pending genome-change backlog without a generation. Available during idle periods
- **Evolve Design Pivot Detection** — Subagent detects artifact-design mismatches and triggers `/reap.back` for correction
- **`lastSyncedGeneration` Tracking** — Genome sync state tracked by generation ID. Detects "never synced" state after init
- **Destroy Confirmation** — Changed from `destroy {projectName}` to `yes destroy`
- **Session Language Injection** — `session-start.cjs` injects configured language into AI context
- **Init Skills Sync** — `reap init` installs `.claude/skills/` immediately (resolves #6)
- **resolveParents NaN Fix** — Fixed sort bug caused by legacy `completedAt` placeholder values

## Generations

- **gen-136-4b0342**: fix: destroy 컨펌 메시지 변경 + session-start language 주입 누락 수정
- **gen-137-c8d9b9**: resolve #6: reap init이 .claude/skills/에 sub-command를 설치하지 않음
- **gen-138-26723a**: resolve #7: lastSyncedGeneration 기반 genome sync 상태 추적
- **gen-139-f2cdec**: feat: recovery generation 개념 정의 + genome domain 문서화
- **gen-140-80b51f**: recovery: gen-138 lastSyncedGeneration 설계 교정
- **gen-141-cad97c**: fix: resolveParents NaN completedAt 정렬 버그 수정
- **gen-142-610ca8**: feat: .reap/ 구조적 완전성 검사 도구 + onLifeCompleted hook
- **gen-143-fed640**: feat: evolve subagent prompt 설계 피벗 감지 규칙 추가
- **gen-144-e63e59**: fix: localInstall nvm 경로 수정
- **gen-145-864402**: feat: reap update-genome 명령어 추가
- **gen-146-56b321**: refactor: update-genome을 CLI에서 slash command로 변환
