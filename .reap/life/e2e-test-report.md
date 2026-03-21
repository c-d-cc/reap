# E2E 테스트 리포트

> 작성일: 2026-03-21 | gen-093-76b22f 완료 시점 기준

## 1. `tests/e2e/command-templates.test.ts` (58 tests)

**목적**: Script Orchestrator 아키텍처 전환 후 모든 slash command `.md` 파일과 `.ts` script 파일의 **구조적 무결성** 검증

| Section | 시나리오 | Tests | 검증 내용 |
|---------|---------|-------|-----------|
| **S1** | Wrapper delegation | 30 | 28개 command `.md` 파일이 `reap run` 위임 + 10줄 이하 wrapper인지, `reap.status`/`reap.update`는 CLI 직접 위임, gen-090~092 추가분 `.ts` 파일 존재 확인 |
| **S2** | Normal stage hooks | 4 | `objective/planning/implementation/validation.ts`가 각각 올바른 hook event(`onLifeObjected` 등)로 `executeHooks` 호출하는지 |
| **S4** | Hook timing | 1 | `merge-completion.ts`에서 hook이 archiving(`mgm.complete()`) 전에 실행되는지 (코드 위치 순서 검증) |
| **S5** | Submodule check | 2 | `completion.ts`, `merge-completion.ts`에서 `checkSubmodules` 호출하는지 |
| **S6** | Merge hooks | 8 | 7개 merge command script가 올바른 merge hook event로 `executeHooks` 호출 + `merge-completion.ts`에 archiving 로직 존재 |
| **S7** | Evolve guidance | 5 | `evolve.ts`에 Hook Auto-Execution 안내, 모든 normal hook 매핑, `reap.next`는 hook/archiving 안 한다는 명시 |
| **S7b** | Merge evolve guidance | 4 | `merge-evolve.ts`에 동일한 hook 안내가 merge 버전으로 포함 |
| **S8** | Frontmatter preservation | 24 | 모든 24개 wrapper `.md`에 `description` frontmatter 존재 확인 |
| **S9** | Dispatcher registration | 1 | `index.ts`에 26개 command 모두 등록되었는지 |
| **Cross** | Stale pattern check | 4 | `reap.next.md`에 archiving 패턴 없음, wrapper들에 `## Gate`/`## Steps`/`HARD-GATE` 등 multi-step 지시 없음 |

---

## 2. `tests/e2e/hook-engine.test.ts` (10 tests)

**목적**: `hook-engine.ts` + `commit.ts` 모듈의 **실제 동작** E2E 검증 (temp dir sandbox)

| Scenario | 검증 내용 |
|----------|-----------|
| **S1** | `.sh` hook 스캔 + 실행 — event 매칭, stdout 캡처 |
| **S2** | condition이 exit 1이면 hook skip + 사유 기록 |
| **S3** | `.md` hook — frontmatter 제거 후 본문만 `content`로 반환 |
| **S4** | 복수 hook의 `order` 기반 오름차순 정렬 |
| **S5** | `onLifeObjected` + `onLifeTransited` 결과 합산 (next 시나리오) |
| **S6** | `onLifeStarted` hook 실행 (start 시나리오) |
| **S7** | `checkSubmodules` — submodule 없는 git repo에서 빈 배열 반환 |
| **S8** | 매칭 hook 없으면 빈 배열 |
| **S9** | condition script 미존재 시 skip + `"condition script not found"` |
| **S10** | `onLifeRegretted` hook 실행 (back 시나리오) |

---

## 3. `tests/integration/full-lifecycle.test.ts` (2 tests)

**목적**: `initProject` → `GenerationManager` 를 통한 **전체 lifecycle** 통합 검증

| Test | 검증 내용 |
|------|-----------|
| **complete lifecycle** | init → create → advance(objective→planning→impl→validation→completion) → complete() → lineage 생성 확인, current cleared |
| **completion auto-archives** | artifact 파일 생성 → 5단계 advance → complete() → lineage 디렉토리에 artifact 이동 확인 (`01-objective.md`, `05-completion.md`) |

---

## 커버리지 갭 요약

| 있는 것 | 없는 것 |
|---------|---------|
| Command template 구조 검증 (static analysis) | `reap run <cmd>` CLI 실행 기반 E2E |
| Hook engine 단위 E2E | Hook + lifecycle 통합 (hook이 stage 전환에 실제 영향) |
| Core `GenerationManager` lifecycle | Merge lifecycle E2E |
| | Backlog carry forward E2E |
| | Compression trigger E2E |

이월된 backlog의 E2E 시나리오 테스트(`run-lifecycle`, `run-merge-lifecycle`)가 이 갭을 채우는 작업.
