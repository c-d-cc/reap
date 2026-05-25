# Implementation Log

## Completed Tasks

| Task | Status | Files | Notes |
|---|---|---|---|
| T001 — claude-md-section.md `@` ref | ✓ | `src/templates/claude-md-section.md` | "Manual Reference (fallback)" 블록을 "Static Knowledge (auto-imported)" 블록으로 교체. 9 `@` refs (한 줄당 1개, description 없음). Termination Paths + Agent 절 보존. |
| T002 — load-context dynamic-only | ✓ | `src/cli/commands/load-context.ts` | reapGuide/application/evolution/invariants/envSummary/visionGoals/memory×3 read + 합치기 로직 제거. `homedir` import 제거. config + current 만 read. 3 dynamic sections (Current State / Strict Mode / Language) 출력. |
| T003 — load-context unit test | ✓ | `tests/unit/load-context.test.ts` | 정적 파일 inject 검증 제거. SENTINEL 기반 미포함 검증 + ≤2KB 출력 크기 검증 신규. 10 tests pass. |
| T004 — init-claude-md e2e test | ✓ | `tests/e2e/init-claude-md.test.ts` | `reap init` 후 CLAUDE.md에 9개 `@` ref 포함 검증 + legacy "Manual Reference (fallback)" / 백틱 plain path 부재 검증 2건 추가. |
| T005 — update migration e2e test | ✓ | `tests/e2e/update.test.ts` | 2 신규 케이스: (a) legacy plain-path CLAUDE.md → `reap update` → `@` ref 갱신 + user content above 보존, (b) marker-wrapped stale hash CLAUDE.md → 새 hash로 교체 + marker 위/아래 user content 보존. |
| T006 — build | ✓ | `dist/cli/index.js`, `dist/templates/claude-md-section.md` | `npm run build` 0 errors, 144 modules bundled. |
| T007 — full test regression | ✓ | (all) | unit 364 pass / e2e 173 pass + 1 fail (pre-existing init-repair: detectLegacyReapSection은 "REAP" heading 검출만 함; .reap/genome 텍스트 mention은 검출 안 함 — gen-060부터 알려진 이슈, 본 작업 무관). |
| T008 — dog-fooding update | ✓ | `/Users/hichoi/cdws/reap/CLAUDE.md` | `node dist/cli/index.js update` 호출 → 본 프로젝트 CLAUDE.md 자동 갱신 (gen-061 Termination Paths 절도 자연 보강됨). |
| T009 — reap-guide.md 동기화 점검 | ✓ | `.reap/reap-guide.md` | 현재 `src/templates/reap-guide.md` 와 비교 시 일부 절 누락 확인. 본 generation 범위 외(Knowledge Loading 자체 영향 아님)이므로 보류, midterm/shortterm memory에 노트만 남김. |
| T010 — README 갱신 | △ skip | (README 시리즈) | README.md line 234 ("CLAUDE.md instructs the AI to load genome, environment, and reap-guide at session start") 는 여전히 사실. 새 형식에서 변경되지 않은 의미. 갱신 불필요. docs/src에는 CLAUDE.md 예시 없음. |

## Detailed Notes

### T001 — Template rewrite

기존 9 line bullet 목록 + description 텍스트(예: "REAP tool usage, architecture, lifecycle, rules")를 모두 제거하고 prefix `@` 만 붙은 9 line으로 교체. description은 각 파일 본문 첫 헤더에 이미 존재.

```
@~/.reap/reap-guide.md
@.reap/genome/application.md
... (총 9개)
```

`Knowledge Loading` 안내 문구는 정/동 분리 사실을 명시:
- Static: `@` refs로 Claude Code가 직접 import.
- Dynamic: SessionStart hook이 inject.

Termination Paths 절(gen-061 도입), Agent 절(gen-053 도입)은 모두 보존. 본 generation 의 변경은 Manual Reference 블록에만 한정.

### T002 — load-context.ts simplification

```diff
- 11 file reads (9 static + config + current)
+ 2 file reads (config + current)

- import { homedir } from "os";  // removed
- sections.push(reapGuide.trim());
- sections.push(genomeParts.join(...));
- sections.push(envSummary.trim());
- sections.push(visionGoals.trim());
- sections.push(memParts.join(...));
```

`buildKnowledgeContext()` signature 유지 → 기존 호출자(execute, 외부 테스트) 호환. 결과 크기는 ~1KB로 감소(테스트로 ≤2KB 검증).

### T005 — Migration test 설계

기존 marker sync 로직(gen-054)을 그대로 활용하기 위해 두 케이스를 모두 테스트:

1. **Legacy plain-path CLAUDE.md** (markers 없음, `## REAP` heading 존재) — `detectLegacyReapSection`이 heading부터 EOF까지 잡아 새 wrapped section으로 교체.
2. **Marker-wrapped stale CLAUDE.md** (markers 존재, hash mismatch) — `extractReapSection`이 hash 비교 → 새 wrappedSection으로 교체.

두 케이스 모두 marker 밖 사용자 커스터마이즈(before/after) 보존을 검증.

### T008 — Dog-fooding 적용 결과

본 프로젝트 `/Users/hichoi/cdws/reap/CLAUDE.md` 의 marker hash가 변경됨:
- Before: `<!-- reap:start 4f4c9ee4 -->` (gen-061 시점 형식, Termination Paths 절 미포함)
- After: 새 hash + Static Knowledge (auto-imported) 블록 + Termination Paths + Agent 블록

`# REAP Project` 한국어 인트로 라인 + marker 밖 user 콘텐츠 보존. validation phase 자동 트리거 안 함.

## Discovered Issues

### `.reap/reap-guide.md` 와 `src/templates/reap-guide.md` 누락 절 발견

T009 검토 중 `.reap/reap-guide.md` 가 `src/templates/reap-guide.md` 대비 7 lines 누락:
- "Default conditions (installed by `reap init`)" 절 5 lines
- "Creating Hooks" 절 4 lines
- `reap make hook` CLI 항목 1 line

원인 가설: 과거 generation에서 template 갱신은 했지만 `.reap/reap-guide.md` 동기화는 누락. **본 generation scope 외**이므로 backlog 등록 보류(원인 추적이 더 필요하고, 단일 라인 fix가 아닐 수 있음). shortterm/midterm memory에 follow-up 항목으로 기록 예정. 본 작업 자체와는 무관 — `@~/.reap/reap-guide.md` 가 가리키는 파일이므로 결국 갱신 가치 있음이나 별 generation에서 처리하는 게 안전.

### init-repair pre-existing failure (재확인)

`tests/e2e/init-repair.test.ts:103` "skips when REAP section already present" 1건 fail. 본 작업 무관 — gen-060부터 알려진 이슈. `detectLegacyReapSection`은 markdown heading에 "REAP" 텍스트가 있는지 검사하는데, 테스트 fixture는 본문에 `.reap/genome/` 만 mention하고 heading 없이 placeholder 역할. 본 generation 스코프 밖이므로 별도 backlog/generation에서 처리.

## Deferred Items

- `.reap/reap-guide.md` 누락 절 동기화 — 다음 generation 또는 별도 backlog.
- init-repair "REAP section already present" detection 강화 — 본 작업과 무관, 별도 generation.
- OpenCode adapter (`src/adapters/opencode/` + `reap dump-state` 신규 명령) — Gen-N+1 (opencode-adapter.md backlog).

## Architecture Decisions

### `homedir` import 제거
load-context.ts에서 `~/.reap/reap-guide.md` 를 더 이상 read하지 않으므로 `os.homedir` 사용처 없음. import 정리. 같은 파일은 CLAUDE.md의 `@~/.reap/reap-guide.md` 로 Claude Code가 처리.

### `buildKnowledgeContext` signature 유지
함수 시그니처 (`(cwd: string) => Promise<string | null>`) 그대로 유지. 외부 테스트와 `execute()` 흐름 호환성. 내부 동작만 변경.

### Dog-fooding 적용 시점
`npm run build` 후 즉시 `node dist/cli/index.js update` 호출 → `/CLAUDE.md` 자동 갱신. 빌드와 dog-fooding 사이 시간 간격 없음 → 일관성 보장.

다음 stage: validation.
