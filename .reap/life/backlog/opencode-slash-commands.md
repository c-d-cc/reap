---
title: OpenCode slash commands 등록 — `/reap.*` 명령을 OpenCode 환경에서도 사용 가능하게
priority: high
created: 2026-05-25
dependsOn: opencode-adapter
relatedIssue: 19
---

## 배경

Gen-063에서 OpenCode adapter를 신설하면서 다음 산출물을 자동 관리하게 됨:
- `opencode.json` instructions (static knowledge 자동 로드)
- `.opencode/plugins/reap-plugin.ts` (dynamic state dump 트리거)
- `AGENTS.md` (REAP 진입 가이드)
- `~/.reap/reap-guide.md`

그러나 **slash commands (`/reap.start`, `/reap.status`, `/reap.next`, `/reap.early-close`, `/reap.knowledge` 등)는 OpenCode 환경에 등록되지 않음**. Claude Code의 `~/.claude/commands/reap.*.md` 형식은 OpenCode가 인식 불가 (다른 메커니즘 + 다른 디렉토리).

**사용자 UX 영향**: OpenCode 사용자는:
- ✅ AI agent가 REAP knowledge 자동 보유 (gen-063 효과)
- ❌ `/reap.start` 같은 slash 트리거 불가
- ⚠️ 대체 흐름: CLI 직접 호출(`reap status`) 또는 AI에게 자연어 요청(`"reap run learning 실행해줘"`)

이 UX gap은 "OpenCode에서도 REAP를 사용한다"의 본질에 어긋남. 사용자가 다음 업데이트(v0.16.6 또는 v0.17.0)를 받았을 때 OpenCode에서 일관된 UX를 기대.

## 합의된 방향 (2026-05-25 세션)

> "사용자가 다음 업데이트를 받았을때, opencode 에서도 reap 을 사용할수있게 로직이 다 들어있으면 좋겠어"

→ 사용자가 `agentClient: opencode` 설정 후 `reap update` 한 번으로 OpenCode에서 Claude Code와 동등한 UX 확보.

## 구현 범위 (full implementation)

### 1. OpenCode slash commands 메커니즘 조사 (Learning phase 최우선)

다음을 WebFetch / WebSearch로 정확히 확인:

- OpenCode가 slash commands를 어떻게 인식하는가?
  - `~/.config/opencode/commands/` 디렉토리?
  - `opencode.json`의 `commands` 필드?
  - 또는 plugin TUI hook(`tui.command.execute`)?
- 명령 파일 형식 (frontmatter, prompt body, 인자 처리)
- Claude Code의 markdown command 형식과 호환되는지 (frontmatter, body)
- user-level vs project-level commands 구분 가능한지

조사 결과를 planning artifact에 명시. 한국어/영어 도메인 모두 검색.

### 2. Reap slash commands → OpenCode 형식 변환 또는 신규 작성

현재 Claude Code skills:
- `src/adapters/claude-code/skills/reap.{start,status,next,evolve,help,knowledge,abort,early-close,push,pull,merge,run,back,config,report,update}.md` 등 19개

OpenCode 형식에 맞게:
- 동일 markdown 형식이면 그대로 또는 minimal 변환
- 다른 형식이면 별도 source 작성 (`src/adapters/opencode/commands/*.md` 또는 다른 위치)

### 3. OpenCode adapter `installSkills`에 commands 등록 로직 추가

`src/adapters/opencode/install.ts`의 `installSkills` 확장:
- 현재: plugin + opencode.json + ~/.reap/reap-guide.md
- 추가: 19개 reap.* slash commands 사용자 환경에 복사 (조사 결과 기반 위치)
- 명령 cleanup 시 user-supplied custom commands 보존

### 4. Legacy cleanup 재검토

`src/core/integrity.ts:604-611`에 이미 `~/.config/opencode/commands/reap.*` legacy warning 있음 (Phase 2 잔재). 본 작업 후:
- 합법적 reap commands가 user-level에 존재 → cleanup 규칙 충돌 가능성
- 해결책: (a) cleanup 대상에서 제외 (b) marker 기반으로 REAP 설치본만 제거 (c) 버전 기반 cleanup

조사 후 결정.

### 5. AGENTS.md template 업데이트

slash commands 사용 가능 사실 명시:
- 기존 "use `reap status` CLI 또는 자연어 요청" → "`/reap.status` 또는 CLI 사용 가능"
- `<!-- reap:start -->` 마커 안의 사용자 안내 갱신

### 6. 테스트

- **Unit**:
  - OpenCode adapter installSkills에서 commands 디렉토리 생성/복사 검증
  - 사용자 custom commands 보존 검증
  - dispatch 분기 검증 (claude-code는 영향 없음)
- **E2E**:
  - `reap init --agent opencode` (또는 config 변경 + update) 시 commands 디렉토리에 reap.*.md 19개 자동 배치
  - 기존 OpenCode 사용자 custom commands 보존
  - update 반복 호출 시 idempotent (commands 중복 추가 X)

### 7. 문서 업데이트

- `src/templates/reap-guide.md`: OpenCode에서 slash commands 사용 가능 사실 추가
- `.reap/reap-guide.md` (dog-fooding sync)
- `docs/`: OpenCode setup 가이드에 slash commands 사용 예시
- README: OpenCode 지원 범위 명시

### 8. Plugin runtime 검증 보강 (선택)

Gen-063의 plugin runtime 검증 부재 갭과 연결:
- 본 generation에서도 OpenCode 자체 실행은 안 함 (테스트 한계 동일)
- 그러나 사용자가 직접 테스트 가능한 상태로 끌어올림
- Issue #19에 본 generation 결과 코멘트 → `aresstokrat` 테스트 의뢰 (Gen-063 follow-up #5와 통합)

## 확정된 설계 결정

| 항목 | 결정 |
|---|---|
| 목표 | OpenCode 사용자가 `update` 후 `/reap.*` slash 명령 사용 가능 |
| 명령 source | Learning에서 OpenCode 형식 조사 후 결정. 동일 형식이면 src/adapters/claude-code/skills/* 재활용, 다르면 별도 작성 |
| 설치 위치 | OpenCode docs 조사 결과 (가장 유력: `~/.config/opencode/commands/`) |
| Cleanup 정책 | REAP 설치본만 정리 (marker 또는 명령 접두사 기반). 사용자 custom 보존 |
| Adapter dispatch | gen-063 기존 `getAdapter()` 활용. installSkills에 commands 등록 추가 |
| Default agentClient | 변경 없음 — claude-code 유지. 자동 전환 X |

## Out of Scope (별도 처리)

- **Codex slash commands** — Codex는 그 자체로 slash 메커니즘 별도 검토 필요. 큰 작업
- **OpenCode TUI 통합** — `tui.command.execute` 같은 고급 활용은 차후
- **OpenCode 자체 실행 테스트** — 정적 산출물 검증만. runtime 검증은 사용자 의뢰
- **Daemon 통합** — 별도 트랙
- **Plugin tool.execute.after dump** — Gen-063 out-of-scope 그대로 유지

## Risk / Caveat

1. **OpenCode commands 형식이 Claude Code와 호환되지 않을 가능성** — Learning에서 명확해질 때까지 작업 규모 추정 어려움
2. **OpenCode commands 메커니즘이 docs에 잘 안 나올 가능성** — gist / dev.to / GitHub source 직접 확인 필요
3. **명령 인자 처리 방식 차이** — 예: Claude Code는 `$ARGUMENTS`, OpenCode는 다를 수 있음
4. **OpenCode 버전 의존성** — 본 작업 시점의 OpenCode 버전이 미래 broken되지 않게 README에 버전 명시
5. **Legacy cleanup 충돌** — 잘못 처리하면 사용자 reap 명령 매번 삭제됨 (reapdev 사고와 동형). 반드시 marker 또는 명확한 신호로 REAP 설치본만 정리

## Verification 기준

- [ ] OpenCode commands 메커니즘 (위치 + 형식) Learning artifact에 명시
- [ ] `src/adapters/opencode/install.ts`의 `installSkills`에 commands 등록 로직 추가
- [ ] `agentClient: opencode` + `reap update` 후 OpenCode commands 디렉토리에 reap.* 19개 자동 배치
- [ ] 기존 사용자 custom commands 보존
- [ ] 반복 update 시 idempotent (commands 중복 X)
- [ ] Legacy cleanup이 REAP 설치본만 정리 (사용자 custom 안전)
- [ ] Adapter dispatch 정상 — claude-code 환경 회귀 0건
- [ ] AGENTS.md template에 slash commands 사용 안내 반영
- [ ] reap-guide.md / docs / README가 새 UX 반영
- [ ] Unit + E2E 테스트 추가 (commands 설치, cleanup, dispatch 분기)
- [ ] dog-fooding: src/templates ↔ .reap 동기화
- [ ] 본 작업 시 사용된 OpenCode 버전 README에 기록

## 사용자 의도 명시 (decision provenance)

2026-05-25 세션에서 사용자가:
- gen-063 fitness OK 처리
- 그러나 OpenCode 환경에서 `/reap.*` slash 호출 불가가 본질적 UX gap이라고 인지
- "다음 업데이트 받았을 때 OpenCode에서도 reap 사용 가능"을 명확한 목표로 제시
- 이 작업 완료 후에야 OpenCode 본격 테스트 가능하다고 판단

→ 우선순위 `high`로 등록. 다음 generation의 강력한 후보.
