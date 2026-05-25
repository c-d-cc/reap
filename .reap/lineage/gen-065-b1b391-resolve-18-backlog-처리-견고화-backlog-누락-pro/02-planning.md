# Planning

## Goal

Issue #18 + 신규 발견 `consumeBacklog` regex silent fail + 누적 7개 backlog 미archive — 세 영역을 한 generation에서 root cause 수준에서 해결.

종료 후 상태:
- `reap run start --phase create --goal "x"` (pending 있음 + flag 없음) → AI에게 prompt + 명령 중단
- `consumeBacklog`가 frontmatter 모든 케이스 graceful 처리 (silent fail 0)
- 누적 7개 backlog 모두 적절한 lineage 디렉토리로 이동
- 본 backlog는 normal lifecycle로 lineage/gen-065/backlog/ 로 archive (dog-fooding)

## Completion Criteria

1. start.ts create phase: `--backlog`/`--no-backlog` 모두 없고 pending > 0 시 `status: prompt` 반환 + generation 미생성
2. `--no-backlog` flag 추가 — pending 무시하고 progress
3. `consumeBacklog`: 4 케이스 (status:pending 있음 / status: 없음 / status:consumed / frontmatter 없음) 모두 silent fail 없이 graceful 처리
4. 7개 누적 backlog가 각 매핑된 lineage `<gen>-*/backlog/` 디렉토리로 이동 + frontmatter `status: consumed` + `consumedBy` + `consumedAt` 추가
5. 본 backlog (`backlog-auto-prompt-on-start.md`)는 본 generation completion commit에서 자동 archive (lineage/gen-065-*/backlog/)
6. 신규 unit + e2e test 통과, 기존 회귀 0
7. reap-guide.md ↔ .reap/reap-guide.md 동기화 (`--no-backlog` flag + AI 행동 가이드)

## Background

Source backlog `backlog-auto-prompt-on-start.md` 본문 그대로. 두 버그가 중첩되어 gen-058~064의 7개 backlog가 archive되지 않고 `.reap/life/backlog/` 에 잔존. 

archive.ts:46-48 확인 결과: `scanBacklog` 결과 중 `b.status === "consumed"` 만 archive. `scanBacklog`는 frontmatter 파싱 후 `status` 필드가 없으면 `?? "pending"` 기본값 — 즉 `status: consumed` 필드가 frontmatter에 명시되지 않으면 `pending`으로 인식 → archive 누락. 

Part 2 fix가 정확히 이 frontmatter `status: consumed` 필드를 모든 케이스에서 보장하면 archive.ts 변경 없이 정상 동작.

## Approach

### Part 1 — start prompt + `--no-backlog`

`src/cli/commands/run/start.ts`의 create phase 시작 부분 (line 85 직후):
- `--backlog` 없고 `--no-backlog` 없을 때 → `scanBacklog` → pending > 0이면 `status: prompt` emit + return.
- prompt 본문: goal + pending 목록 + AI 행동 가이드 (관련 있으면 `--backlog X`, 없으면 `--no-backlog`).
- pending = 0일 때는 prompt 없이 그대로 진행 (회귀 방지).

`src/cli/index.ts`의 `run` 옵션 추가: `--no-backlog`.
`src/cli/commands/run/index.ts`의 dispatcher: `--no-backlog` 를 start로 전달 (boolean 5번째 인자 추가).

idempotent 보장: `--no-backlog`가 명시되면 prompt 없이 진행. AI가 prompt 받고 재호출 시 두 flag 중 하나 명시 → 진행. 무한 loop 방지.

### Part 2 — consumeBacklog YAML 파서 기반

```ts
import YAML from "yaml";

export async function consumeBacklog(filePath: string, genId: string): Promise<{ status: "ok"|"already"|"warning"; warning?: string }> {
  const content = await readTextFile(filePath);
  if (!content) return { status: "warning", warning: "empty file" };
  
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!fmMatch) {
    return { status: "warning", warning: `${filePath}: frontmatter not found — backlog skipped` };
  }
  
  const fmRaw = fmMatch[1];
  const fm = (YAML.parse(fmRaw) ?? {}) as Record<string, unknown>;
  
  if (fm.status === "consumed" && fm.consumedBy === genId) {
    return { status: "already" }; // idempotent: same gen already marked
  }
  
  const now = new Date().toISOString();
  // 라인 단위 manipulation으로 사용자 frontmatter 형식 최대 보존
  const lines = fmRaw.split("\n");
  let hasStatus = false;
  let hasConsumedBy = false;
  let hasConsumedAt = false;
  const newLines: string[] = [];
  for (const line of lines) {
    if (/^status:/.test(line)) {
      newLines.push(`status: consumed`);
      hasStatus = true;
    } else if (/^consumedBy:/.test(line)) {
      newLines.push(`consumedBy: ${genId}`);
      hasConsumedBy = true;
    } else if (/^consumedAt:/.test(line)) {
      newLines.push(`consumedAt: ${now}`);
      hasConsumedAt = true;
    } else {
      newLines.push(line);
    }
  }
  if (!hasStatus) newLines.push(`status: consumed`);
  if (!hasConsumedBy) newLines.push(`consumedBy: ${genId}`);
  if (!hasConsumedAt) newLines.push(`consumedAt: ${now}`);
  
  const newFm = newLines.join("\n");
  const updated = content.replace(fmMatch[0], `---\n${newFm}\n---\n`);
  await writeTextFile(filePath, updated);
  return { status: "ok" };
}
```

**중요한 선택**: YAML.parse로 분석은 하되 write는 라인 단위 manipulation. YAML.stringify는 quote/comment/순서 손실 위험. 4 케이스 graceful 처리되고, 사용자 frontmatter 형식 최대 보존.

호출처 (start.ts:128):
```ts
const result = await consumeBacklog(backlogPath, state.id);
if (result.status === "warning" && result.warning) {
  // emitOutput stderr 직접 출력은 어색하니, log/console.warn 대신 next stage prompt에 알리는 게 옳을지도?
  // 사용자 검토 필요. 초안: console.warn(result.warning)
  console.warn(`[backlog] ${result.warning}`);
}
```

→ Implementation에서 정확한 warning 출력 방식 결정 (console.warn vs emitOutput 추가 필드).

### Part 3 — 누적 7개 cleanup

Implementation 시점에 stand-alone 작업으로 수행. 자동화 script (`scripts/cleanup-stale-backlog.ts` 또는 직접 commit 안 작업)로 처리:

각 매핑마다:
1. `git log --format=%cI -n 1 -- <lineage-dir>` 로 마지막 commit timestamp 추출 → `consumedAt`
2. backlog file frontmatter에 `status: consumed`, `consumedBy: <gen-id>`, `consumedAt: <timestamp>` 추가 (Part 2 fix 함수를 활용하면 깔끔 — 또는 직접 라인 manipulation)
3. `mkdir -p .reap/lineage/<gen-dir>/backlog`
4. `mv .reap/life/backlog/<file> .reap/lineage/<gen-dir>/backlog/<file>`

이는 본 generation의 implementation artifact 안에서 atomic shell 명령 묶음으로 진행. dry-run 옵션은 implementation 시 사용자 확인 후 실행 (인터랙티브 검토 — 사용자가 commit 전에 결과 점검).

### Part 5 — dog-fooding 검증

본 backlog는 `status: consumed` + `consumedBy: gen-065-b1b391` 이미 마킹 완료. completion commit에서 archive.ts가 호출되면 자동으로 `lineage/gen-065-*/backlog/backlog-auto-prompt-on-start.md` 로 이동. Validation phase에서 archive.ts 코드 재확인하여 보장.

### Part 6 — 테스트

**Unit (tests/unit/)**:
- T-U1 `consumeBacklog` — 4 케이스 (status:pending 있음 / status: 없음 / status:consumed 동일 gen / status:consumed 다른 gen / frontmatter 없음)
- T-U2 `consumeBacklog` — 사용자 추가 field 보존 (priority, createdAt 등)
- T-U3 start phase create — 4 케이스 (pending 있음+flag 없음 → prompt / pending 있음+--backlog → 진행 / pending 있음+--no-backlog → 진행 / pending 0개+flag 없음 → 진행)

**E2E (tests/e2e/)**:
- T-E1 lifecycle: pending → start --backlog X → completion → file이 lineage로 archive 됨
- T-E2 lifecycle: pending → start --no-backlog → completion → file 그대로 pending
- T-E3 start 두 flag 없고 pending 있음 → prompt status 받음, generation 미생성
- T-E4 (회귀): pending 0 + flag 없음 → 진행

**기존 테스트**: start phase test 기존 케이스는 `--backlog` 명시 또는 pending 0개 시나리오이므로 회귀 영향 없을 것으로 예상. 실제 실행으로 확인.

### Part 7 — 문서

- `src/templates/reap-guide.md` "CLI Commands" 절 — `reap run start` 옵션 안내에 `--no-backlog` 추가 + AI 행동 가이드
- `.reap/reap-guide.md` 동기화 (dogfooding)
- backlog 작성 가이드는 `reap make backlog` 가 자동 처리하므로 별도 문서 X. reap-guide의 backlog 절에 "직접 Write tool로 생성 금지 — `reap make backlog` 사용" 보강.

## Risk Assessment

1. **YAML 라인 manipulation 정확성**: 7개 backlog의 frontmatter 형식이 미묘하게 다를 수 있음 (key 순서, quote 유무). 라인 단위로 처리하여 형식 보존. unit test에서 round-trip 검증.

2. **archive.ts 미변경 가정**: Part 2 fix가 frontmatter `status: consumed`를 보장하면 archive.ts 변경 불요. 확인됨 (archive.ts:48).

3. **start prompt가 evolve 흐름 깨지 않음**: evolve.ts가 start를 호출할 때 backlog flag를 미리 결정하는 흐름이라면 OK. evolve.ts 코드 점검 — implementation 첫 작업.

4. **Cleanup 정확성**: 7개 매핑이 표 그대로인지 lineage `meta.yml` goal 텍스트로 재확인 (implementation 안). 잘못된 매핑은 lineage 오염.

5. **본 generation의 본 backlog dog-fooding**: validation에서 archive 시점 직전 frontmatter 상태 확인.

6. **stale build**: src 수정 후 `npm run build` 잊으면 e2e가 stale dist를 테스트. 빌드 후 즉시 e2e 실행.

7. **tests submodule**: 신규 unit/e2e 추가 시 submodule 안에서 commit. completion 시 pointer staging 잊지 말 것.

## Scope

### 변경 대상
- `src/core/backlog.ts` — `consumeBacklog` 견고화
- `src/cli/commands/run/start.ts` — prompt + `--no-backlog` 분기
- `src/cli/commands/run/index.ts` — `--no-backlog` dispatcher 전달
- `src/cli/index.ts` — `--no-backlog` option 등록
- `src/templates/reap-guide.md` + `.reap/reap-guide.md` — 문서
- `tests/unit/backlog.test.ts` (또는 기존 파일) — unit 추가
- `tests/e2e/lifecycle/` — e2e 추가
- `.reap/life/backlog/*.md` (7개) — frontmatter 추가 + 이동
- `.reap/lineage/gen-058~064/backlog/<filename>` — 신규 위치

### 명시적으로 out of scope
- archive.ts 변경 (Part 2 fix가 frontmatter 보장하면 불요)
- `reap consume backlog` helper 명령 (Learning에서 미구현 결정)
- fuzzy-match / auto-suggestion
- adapt/commit phase의 backlog 처리 변경
- `reap make backlog` 동작 변경

## Tasks

- [ ] T001 `src/cli/commands/run/evolve.ts` 점검 — start 호출 흐름이 `--no-backlog` 영향 받는지 확인 (실제 변경 불필요 가능성)
- [ ] T002 `src/cli/index.ts` — `run` 명령에 `--no-backlog` boolean option 추가
- [ ] T003 `src/cli/commands/run/index.ts` — `--no-backlog`를 start handler로 전달 (signature 확장)
- [ ] T004 `src/cli/commands/run/start.ts` — create phase에서 `pending > 0 && !backlog && !noBacklog` 시 `status: prompt` emit + return
- [ ] T005 `src/core/backlog.ts` — `consumeBacklog` YAML 파서 기반 재작성 (4 케이스 graceful, idempotent, 사용자 field 보존, 라인 단위 manipulation)
- [ ] T006 `src/cli/commands/run/start.ts` — `consumeBacklog` 반환값 활용 (warning 시 console.warn)
- [ ] T007 7개 누적 backlog cleanup 실행 — 매핑 재확인 + frontmatter 추가 + lineage 이동 (atomic git 작업)
- [ ] T008 tests/unit — `consumeBacklog` 4 케이스 + 사용자 field 보존 (T-U1, T-U2)
- [ ] T009 tests/unit — start phase create 4 케이스 (T-U3)
- [ ] T010 tests/e2e — lifecycle full path (T-E1, T-E2, T-E3, T-E4)
- [ ] T011 `npm run build` 및 `bun test` 전체 실행, 회귀 0 확인
- [ ] T012 `src/templates/reap-guide.md` + `.reap/reap-guide.md` 동기화 — `--no-backlog` 옵션 + AI 행동 가이드
- [ ] T013 Validation: 본 backlog frontmatter 상태 확인 + 7개 cleanup 결과 git status로 검증

## Dependencies

- T002 → T003 → T004 (signature 변경 chain)
- T005 → T006 (consumeBacklog 새 signature)
- T005 → T007 (cleanup이 새 consumeBacklog 활용 가능, 단 직접 script도 OK)
- T002~T006 완료 → T008, T009, T010 (test가 새 코드 동작 검증)
- T008~T010 → T011 (전체 실행)
- T011 → T013 (build pass 후 validation)
- T012는 어느 시점이든 가능 (병렬 가능)

## Echo Chamber 점검

본 plan의 모든 task는 source backlog의 "Verification 기준" 17개에 1:1 매핑됨. 자율 추가 없음. Part 4 helper는 Learning에서 객관 평가 후 미구현 결정 (sycophancy 방지).
