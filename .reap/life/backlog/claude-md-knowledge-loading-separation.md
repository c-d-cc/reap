---
title: CLAUDE.md `@` reference 도입 + load-context 정/동 분리 (Claude Code)
priority: medium
created: 2026-05-25
resolves: 17
issueUrl: https://github.com/c-d-cc/reap/issues/17
---

## 배경

Issue #17에서 CLAUDE.md의 file references가 `@` prefix 없이 plain path로 작성되어 Claude Code가 auto-load하지 못한다는 점을 지적. gen-053에서 SessionStart hook이 도입된 이후로는 hook이 동작하는 환경에서는 작동하지만, hook이 실패하거나 미등록된 환경(타 client, 신규 사용자 등)에서는 fallback이 무력함.

`src/cli/commands/load-context.ts:1-172` 분석 결과 hook은 단순 inject가 아니라 **가공된 context** 생성을 수행함:
- 정적 9개 파일 inject (genome×3, env summary, goals, memory×3, reap-guide)
- `.reap/life/current.yml` 파싱 → 사람-친화 `Current State` 섹션
- config + state 기반 strict mode prompt 동적 생성
- config 기반 Language 지시 생성

따라서 hook을 그대로 두고 `@` reference를 추가하면 정적 9개 파일이 양쪽에서 중복 inject되어 **세션당 ~16KB 토큰 낭비**가 발생.

## 합의된 방향 (2026-05-25 세션 결정)

정적/동적을 분리해 중복 0 + Claude Code native 활용:

| Knowledge 종류 | 메커니즘 | 처리 위치 |
|---|---|---|
| Static (genome×3, env summary, goals) | `@` reference | CLAUDE.md template |
| Semi-static (vision/memory/long/mid/shortterm) | `@` reference | CLAUDE.md template |
| reap-guide.md (홈 디렉토리) | `@~/.reap/reap-guide.md` (Claude Code home 경로 import 공식 지원) | CLAUDE.md template |
| **Dynamic** Current State (current.yml 가공) | Hook (load-context dynamic-only) | `reap load-context` 출력 |
| **Dynamic** Strict Mode (config + state 조합) | Hook | 동상 |
| **Dynamic** Language 지시 | Hook | 동상 |

## 구현 범위 (Gen-N, Claude Code only)

### 1. CLAUDE.md template 수정

- `src/templates/claude-md-section.md`:
  - 기존 "Manual Reference (fallback)" 블록을 `@` reference 블록으로 교체
  - 형식: 한 줄에 한 `@` ref. description 텍스트 제거 (파일 자체에 있음).
  - `@~/.reap/reap-guide.md`, `@.reap/genome/application.md`, ..., `@.reap/vision/memory/shortterm.md` 포함
  - "Knowledge Loading" 안내 문구는 정적/동적 분리 사실 반영하여 다시 작성
    - "Static knowledge는 위 `@` refs로 자동 로드됨. SessionStart hook은 generation state/strict/language 등 동적 context만 inject한다."

### 2. `src/cli/commands/load-context.ts` 분리

- 정적 9개 파일 read 제거 (reapGuide, application, evolution, invariants, envSummary, visionGoals, memoryLongterm, memoryMidterm, memoryShortterm)
- `buildKnowledgeContext()` 함수는 **dynamic-only** 결과 반환:
  - `Current State` 섹션 (current.yml 파싱 결과)
  - `Strict Mode` 섹션 (config + state)
  - `Language` 지시 (config)
- 출력 크기 ~16KB → ~1KB로 감소
- `buildKnowledgeContext()` 시그니처 유지 (테스트 호환성). 내부만 변경.

### 3. CLAUDE.md migration 로직

- `reap update` 시 기존 사용자 CLAUDE.md를 새 형식으로 자동 마이그레이션
- gen-054에서 도입한 hash 기반 `<!-- reap:start xxx --><!-- reap:end -->` 마커 sync 로직 활용
- 신규 형식으로 교체. 사용자 커스터마이즈는 마커 밖이라 보존됨
- migration 시점에 hook이 등록되어 있는지 확인 (이미 gen-056에서 처리됨, 추가 작업 불요)

### 4. 신규 명령 검토 — **out of scope (Gen-N+1에서)**

- `reap dump-state` 명령은 OpenCode adapter 작업에 필요. Gen-N에서는 만들지 않음.
- 이번 작업은 Claude Code 한정.

### 5. 테스트

- **Unit**:
  - 새 `buildKnowledgeContext()` 출력 검증 (dynamic 3섹션만 포함, static 9개 파일 미포함)
  - `Current State`, `Strict Mode`, `Language` 섹션 형식
- **E2E**:
  - 새 프로젝트 `reap init` 시 CLAUDE.md에 `@` refs 포함되는지
  - 기존 plain path CLAUDE.md를 가진 프로젝트가 `reap update` 시 자동 migration
  - SessionStart hook이 dynamic-only 출력 생성
  - migration 후 사용자 커스터마이즈 (마커 밖) 보존
- **회귀 검증**: 기존 init/update/load-context 테스트가 새 동작과 일치하도록 갱신

### 6. 문서 업데이트

- `src/templates/reap-guide.md`:
  - Knowledge Loading 섹션 업데이트 — 정/동 분리 메커니즘 설명
  - `@` reference가 static, hook이 dynamic 처리한다는 사실 명시
- `.reap/reap-guide.md` (dog-fooding 동기화)
- `src/templates/claude-md-section.md` (메인 작업)
- `docs/` 영문/한국어 introduction 페이지 — CLAUDE.md 예시 갱신
- README의 CLAUDE.md 예시 부분

## 확정된 설계 결정

| 항목 | 결정 |
|---|---|
| `@` prefix 적용 범위 | static 8개 + reap-guide 9개 모두 | 
| `~/.reap/reap-guide.md` 처리 | `@~/.reap/reap-guide.md` 형식 (Claude Code home 경로 import 공식 지원 확인) |
| description text | 제거 (파일 본문에 있음) |
| 동적 메모리(shortterm 등) | `@` reference 포함 — fallback이 robust해야 의미 있음 |
| Hook 출력 | dynamic-only (Current State + Strict + Language ~ <1KB) |
| Migration | gen-054 sync 마커 활용 자동 처리 |

## Out of Scope (Gen-N+1 또는 별도 issue)

- **OpenCode adapter 신설** (`src/adapters/opencode/`) — Issue #19, 별도 generation에서
- **`reap dump-state` 신규 명령** — OpenCode에서 필요, Gen-N+1
- **Codex adapter** — `@` import도 hook도 미지원, 별도 큰 작업
- abort/completion 동작 변경 — gen-061에서 따로 처리됨, 본 작업과 무관
- daemon 관련 — 별개

## Verification 기준

- [ ] `src/templates/claude-md-section.md`에 `@` reference 9개 포함 (8 project-local + 1 home)
- [ ] `load-context.ts`가 dynamic-only 출력 (출력 크기 ≤ 2KB 검증)
- [ ] `reap init` 신규 프로젝트에서 CLAUDE.md에 `@` refs 자동 포함
- [ ] `reap update` 기존 사용자 프로젝트에서 plain path → `@` refs 자동 migration
- [ ] migration 시 `<!-- reap:start --> ... <!-- reap:end -->` 마커 밖 사용자 커스터마이즈 보존
- [ ] SessionStart hook 출력이 정적 9개 파일 내용 미포함 (`grep` 검증)
- [ ] Hook이 동작하는 환경에서 `@` refs로 자동 로드된 static + hook의 dynamic 합쳐서 기존 정보량과 동일하거나 그 이상
- [ ] Hook이 미동작하는 환경(예: 사용자가 settings.json 깨뜨림)에서도 static knowledge가 `@` refs로 자동 로드됨
- [ ] reap-guide.md / claude-md-section.md / docs 문서가 정/동 분리 메커니즘 설명 반영
- [ ] dog-fooding: `src/templates/reap-guide.md` ↔ `.reap/reap-guide.md` 동기화 확인
- [ ] Unit 테스트 / E2E 테스트 추가됨
- [ ] 기존 init / update / load-context 회귀 없음 (전체 테스트 pass)
- [ ] 이 generation 자체로 dog-fooding 검증 가능 — 본 프로젝트 CLAUDE.md도 새 형식 반영

## 후속 작업 (Gen-N+1 예고)

본 작업 완료 후 Issue #19 (OpenCode 지원) 처리:
- `src/adapters/opencode/` 신설
- `opencode.json` 자동 관리 (`instructions` 필드에 static 파일 + dump 파일 등록)
- `reap dump-state` 신규 명령 (load-context의 dynamic 부분을 `.reap/.session-state.md`로 기록)
- OpenCode plugin (`.opencode/plugins/reap.ts`) — `session.created` hook에서 dump-state 호출
- `tool.execute.before` hook으로 resume 케이스 fallback
- AGENTS.md template
