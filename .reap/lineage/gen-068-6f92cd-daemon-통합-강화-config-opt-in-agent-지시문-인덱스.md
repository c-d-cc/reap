---
id: gen-068-6f92cd
type: embryo
goal: "daemon 통합 강화 — config opt-in, agent 지시문, 인덱스 갱신 시점, 생명주기 관리, commit hash staleness check"
parents: ["gen-067-187ad4"]
---
# gen-068-6f92cd
**Goal**: daemon 통합 강화 — config opt-in, agent 지시문, 인덱스 갱신 시점, 생명주기 관리, commit hash staleness check.

**Result**: backlog 의 5 항목 중 4 항목 (1: config opt-in / 2: agent 지시문 / 3: 인덱스 갱신 시점 / 4: commit hash staleness 노출) 모두 구현 및 검증 완료. 항목 5 (MCP server interface) 는 명시적으로 다음 generation 으로 이월 — 새 backlog 후보로 adapt 단에서 별도 검토. 본 generation 회귀 0 (typecheck/build/unit/e2e 의 본 변경 관련 fail 없음).

### Key Changes

1. **`ReapConfig.daemon?: boolean`** — opt-in flag. 미설정 시 기존 사용자 회귀 0 보장 (JSDoc 명시).
2. **4 lifecycle 진입점 게이트** — `src/cli/commands/run/{start,learning,implementation,completion}.ts` 가 `config?.daemon === true` 시 dynamic import 후 `ensureRegistered` + `triggerIndexing`.
3. **daemon `lastIndexedCommit` 노출 + pipeline 4 path 일관 반환** — `ProjectEntry.lastIndexedCommit?: string | null`, `register` null 초기화, `PipelineResult.lastCommit?` 4 path (full/incremental/no-change/concurrent-guard) 모두 반환, index handler 가 registry 에 전달.
4. **Static knowledge daemon 절** — `buildDaemonStaticSection()` 신설, sync(`dump-state-sync.ts`) / async(`load-context.ts`) 양 builder 동일 helper 호출. byte-identical 유지.
5. **agent prompt daemon 절** — `buildBasePrompt` 가 `config?.daemon === true` 시 "Code Intelligence (Daemon)" 절 추가. 사용자 fallback (daemon down / opt-out) 명시.
6. **reap-guide + agent 템플릿 갱신** — template + 양 reap-guide.md sync. `reap-evolve.md` 에 단계별 활용, `reap-evaluate.md` 에 Phase 2 Verification 5번 항목 추가 (impact 분석, silent skip 명시).
7. **dog-fooding** — `.reap/config.yml: daemon: true` 활성화. 본 generation 의 validation/completion 호출이 자기 자신을 첫 사용자로 검증.

### Verification Outcome

- typecheck (메인): pass.
- build (메인): pass — 0.57 MB / 150 modules / 8 ms.
- unit: 427 / 0.
- e2e: 218 pass / 1 fail (pre-existing init-repair, 회귀 0).
- scenario: 35 pass / 5 fail (pre-existing multi-generation; gen-065 fix 이후 update 안 된 sandbox 시나리오, 회귀 0).