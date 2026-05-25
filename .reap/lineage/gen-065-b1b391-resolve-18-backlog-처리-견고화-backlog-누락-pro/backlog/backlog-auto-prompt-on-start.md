---
type: task
status: consumed
consumedBy: gen-065-b1b391
consumedAt: 2026-05-25T15:42:27.315Z
priority: high
created: 2026-05-26
resolves: 18
issueUrl: https://github.com/c-d-cc/2026-05-26-backlog-auto-prompt-on-start
---

# Backlog 처리 견고화 — Issue #18 + frontmatter status 누락 fix + 누적 cleanup

## 배경

### Issue #18 (auto-reported, 2026-04-14)

`reap run start --goal "<goal>"`를 `--backlog <filename>` flag 없이 실행하면, 관련 backlog 항목이 영원히 `pending`으로 남는 bug. v0.16.4 시점 자동 리포트. gen-007~015에서 10개 backlog가 9 generation 동안 미처리 누적된 사례 보고.

### 신규 발견 — 2026-05-26 세션

본 generation 시작 전 backlog 상태 확인 중 **두 번째 버그 발견**:

- `consumeBacklog` 함수 (`src/core/backlog.ts:55-61`)는 다음 regex로 status 마킹:
  ```ts
  .replace(/status:\s*pending/, `status: consumed\nconsumedBy: ${genId}\nconsumedAt: ...`);
  ```
- 이 regex는 frontmatter에 **`status: pending`이 명시되어 있어야** 매칭. `reap make backlog`로 만든 파일은 자동으로 포함되지만, 사용자/AI가 Write tool 등으로 직접 만든 backlog는 누락 가능.
- 매칭 실패 시 silent fail — 에러 로그/경고 없음. consumed 마킹 안 되고 archive 안 됨.

### 실제 영향 (현재 상태)

`.reap/life/backlog/`에 7개 미archive 파일이 누적:

| Backlog 파일 | 사용된 Generation | 상태 |
|---|---|---|
| `strict-merge-mode-bypass-for-merge-gen.md` | gen-058 | 미마킹, 미archive |
| `fix-migrate-update-tests.md` | gen-059 | 미마킹, 미archive |
| `daemon-e2e-tests.md` | gen-060 | 미마킹, 미archive |
| `early-close-lifecycle.md` | gen-061 | 미마킹, 미archive |
| `claude-md-knowledge-loading-separation.md` | gen-062 | 미마킹, 미archive |
| `opencode-adapter.md` | gen-063 | 미마킹, 미archive |
| `opencode-slash-commands.md` | gen-064 | 미마킹, 미archive |

`.reap/lineage/gen-058/` ~ `gen-064/` 모두 artifacts(01~05) + meta.yml만 있고 **`backlog/` 서브폴더 자체가 없음**. 두 버그가 중첩되어 archive 자체가 한 번도 일어나지 않음.

## 합의된 방향 (2026-05-26 세션)

A 옵션 — 한 generation에서 두 버그 모두 fix + 누적 cleanup. 의미적으로 한 묶음.

### Q1 (매칭 알고리즘): AI 의미 판단 (fuzzy-match 거부)
### Q2 ("해당 없음" 표명): `--no-backlog` flag 명시
### Q3 (적용 시점): start만 (adapt/commit 변경 없음)
### Q4 (scope 확장): consumeBacklog 견고화 + 누적 cleanup 포함

## 구현 범위

### Part 1 — `start --backlog` 누락 시 prompt (Issue #18)

`src/cli/commands/run/start.ts` create phase 진입 시:

```
if (--backlog 없음):
  pending = scanBacklog(...).filter(status === "pending")
  if pending.length > 0 and !--no-backlog:
    emitOutput({
      status: "prompt",
      prompt: [
        `Goal: "${goal}"`,
        "",
        "Pending backlog items:",
        ...pending.map(b => `- ${b.filename}: ${b.title}`),
        "",
        "본 goal과 관련된 backlog가 있는지 검토하세요.",
        "  - 관련된 backlog: --backlog <filename> 추가하여 재호출",
        "  - 관련된 backlog 없음: --no-backlog 추가하여 재호출",
      ].join("\n"),
    });
    return;  // 명령 중단, AI가 prompt 읽고 재호출
```

신규 `--no-backlog` flag:
- `src/cli/index.ts`의 reap run 옵션에 추가
- start.ts에서 `noBacklog` 옵션 받음
- 의식적 "관련 없음" 표명 + idempotent 보장 (무한 loop 방지)

### Part 2 — `consumeBacklog` 견고화 (신규 발견 bug fix)

`src/core/backlog.ts:55-61`의 `consumeBacklog` 함수를 다음 케이스 모두 처리하도록 보강:

1. **`status: pending` 명시된 경우** (기존): 그대로 replace
2. **`status:` 필드 없는 경우** (신규): frontmatter 끝(`---` 직전)에 `status: consumed` + `consumedBy` + `consumedAt` 추가
3. **`status: consumed` 이미 마킹된 경우**: idempotent (skip 또는 consumedBy/At 갱신)
4. **frontmatter 자체 없는 경우**: 명시적 에러 또는 가시적 warning (silent fail 금지)

구현 방식 옵션:
- (a) YAML 파서 사용 (안전, 명확)
- (b) 정밀 regex 다중 분기
- (c) 라인 단위 frontmatter manipulator

권장: (a) — 이미 `js-yaml` 또는 `yaml` 의존성 있음 (load-context.ts에서 사용). 명확성 + robustness 우선.

### Part 3 — 누적 backlog cleanup (one-shot)

7개 backlog를 각 해당 generation의 lineage로 이동. 본 generation의 implementation 단계에서 수행:

1. 각 backlog 파일 frontmatter에 `status: consumed\nconsumedBy: <gen-id>\nconsumedAt: <last-commit-time-of-gen>` 추가
2. 파일을 `.reap/lineage/<gen-dir>/backlog/<filename>`로 이동 (archive.ts:51-56 패턴 따라)
3. life/backlog/에서 제거

각 backlog → generation 매핑은 위 표 그대로. 자동화 script로 generation의 implementation 안에서 처리.

Cleanup 후 `.reap/life/backlog/`에는 본 backlog 파일만 남아야 함 (consume 처리되어 마지막에 archive됨).

### Part 4 — `reap consume backlog` 신규 helper 명령 (선택)

향후 같은 누락이 또 발생할 경우를 대비:

```
reap consume backlog <filename> --gen <gen-id>
```

- 명시적으로 특정 backlog를 특정 generation에 consume 마킹
- 누적된 backlog 정리 또는 누락 retroactive 처리
- Part 3의 자동화 script가 이걸 활용 가능

**고민 포인트**: Part 3 cleanup 1회성 작업과 향후 안전망 helper의 가치 비교. 별도 backlog로 미루는 게 적절할 수도. **Learning phase에서 결정**.

### Part 5 — 본 backlog 자체 dog-fooding 검증

본 backlog (`backlog-auto-prompt-on-start.md`)는 frontmatter에 `status: pending` 추가됨. 본 generation 완료 시 자동으로 `consumed` 마킹 + lineage archive되어야 함. 직접 검증 가능.

### Part 6 — 테스트

**Unit**:
- `consumeBacklog` 모든 케이스 (pending 있음 / status 없음 / consumed 이미 / frontmatter 없음)
- start phase create 동작 (pending+flag 조합 4가지)
- `--no-backlog` flag 파싱

**E2E**:
- 전체 lifecycle: pending → start --backlog X → completion → consumed + lineage archive 확인
- 전체 lifecycle: pending → start --no-backlog → completion → 그대로 pending (의도된)
- 전체 lifecycle: pending + start without both flags → prompt → AI 재호출 → 정상 진행
- 누적 backlog cleanup script 검증 (이건 본 generation에서만 1회 실행, 회귀 검증 불요)

### Part 7 — 문서 업데이트

- `src/templates/reap-guide.md`: start 절에 `--no-backlog` 안내 + AI 행동 가이드 ("prompt 받으면 본 goal과 관련된 backlog 검토 후 적절한 flag 추가하여 재호출")
- `.reap/reap-guide.md` (dog-fooding sync)
- backlog 작성 가이드 추가 — frontmatter에 `status: pending` 포함 권장 (또는 자동 처리 안내)

## 확정된 설계 결정

| 항목 | 결정 |
|---|---|
| 적용 시점 | start의 create phase만 (scan/adapt/commit 변경 없음) |
| 매칭 방법 | AI 의미 판단 |
| "해당 없음" 표명 | `--no-backlog` flag |
| Pending 0개 | prompt 없이 진행 |
| consumeBacklog 견고화 | YAML 파서 기반 (frontmatter 모든 케이스 처리) |
| 누적 cleanup | 본 generation의 implementation에서 7개 처리 |
| `reap consume backlog` helper | Learning에서 결정. 별도 backlog 가능성 열어둠 |
| Silent fail 방지 | consumeBacklog가 매칭 실패 시 가시적 warning emit |

## Out of Scope (별도)

- **fuzzy-match auto-suggestion**: 사용자 명시 거부
- **adapt/commit phase 처리**: 사용자 명시 거부
- **기존 누적 정리는 본 generation에 포함** (별도 작업 X)
- **reap make backlog 동작 변경**: 이미 status: pending 자동 삽입. 변경 불요.
- **Codex adapter 대응**: 별도 트랙

## Risk / Caveat

1. **YAML 파서 도입 시 frontmatter 형식 보존** — comment, key 순서, indentation 등 변경 최소화 필요. 사용자 frontmatter 보존 보장.
2. **Cleanup script가 잘못 매칭** — 7개 backlog ↔ generation 매핑이 표 그대로인지 implementation에서 재확인. 잘못된 매핑 시 rollback 가능하도록.
3. **`--no-backlog` UX 마찰** — AI가 처음 접하면 의문 가능. reap-guide에 명확한 사용 사례 포함.
4. **Idempotent 보장** — start prompt가 무한 loop 안 되도록 한 번 prompt 후 재호출 시 진행.
5. **누적 cleanup 후 본 generation 종료 시점에 본 backlog도 archive 됨** — 정상 동작이지만, lineage/<본 gen>/backlog/에 본 backlog 들어가는 게 의도. 검증.

## Verification 기준

### Issue #18 fix (Part 1)
- [ ] `reap run start --phase create --goal "x"` (pending 있음, flag 없음) → prompt 노출, generation 미생성
- [ ] `--backlog <filename>` 재호출 → 정상 진행 + consumed 마킹 (Part 2 fix 적용된 상태)
- [ ] `--no-backlog` 재호출 → 정상 진행 + backlog 그대로 pending
- [ ] pending 0개 + flag 없음 → prompt 없이 진행 (회귀 검증)
- [ ] `--backlog X` 명시 → 기존 동작 유지

### consumeBacklog 견고화 (Part 2)
- [ ] frontmatter에 `status: pending` 명시 — 정상 consumed 마킹
- [ ] frontmatter에 `status:` 필드 없음 — 자동 추가 + consumed 마킹
- [ ] 이미 `status: consumed` — idempotent (skip 또는 갱신, 데이터 손실 0)
- [ ] frontmatter 자체 없음 — 가시적 warning emit
- [ ] silent fail 0건 (모든 케이스에서 가시적 결과)

### 누적 Cleanup (Part 3)
- [ ] 7개 backlog 모두 적절한 generation의 lineage로 이동
- [ ] 각 backlog frontmatter에 consumed + consumedBy + consumedAt 추가
- [ ] life/backlog/에 본 backlog 1개만 남음
- [ ] lineage/gen-058~064/backlog/ 각각 해당 파일 존재

### 통합 / Dog-fooding
- [ ] 본 backlog (`backlog-auto-prompt-on-start.md`)도 본 generation 종료 시 정상 consumed + lineage archive
- [ ] reap-guide.md / .reap/reap-guide.md 양쪽에 `--no-backlog` 설명 + AI 행동 가이드
- [ ] scan phase 동작 회귀 없음
- [ ] 전체 unit + e2e pass, 기존 gen-061~064 효과 보존
- [ ] dog-fooding 동기화 (src/templates ↔ .reap)
- [ ] `reap make backlog` 동작 변경 없음 (status: pending 자동 삽입 유지)

## 후속 작업 (Gen N+1 이후 후보)

- `reap consume backlog <filename> --gen <gen-id>` helper 명령 — 본 generation에서 결정. 만들면 종료.
- 사용자가 실 사용 후 발견 시 별도 issue
- backlog ↔ lineage 매칭 자동화 (lineage entry의 sourceBacklog 필드 활용 등)
