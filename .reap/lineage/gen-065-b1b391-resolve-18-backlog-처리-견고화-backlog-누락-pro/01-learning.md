# Learning

## Project Overview

REAP는 자기참조적 self-hosting CLI 파이프라인. 본 generation은 v0.16.5 release 직전 backlog 처리 견고화 — **두 버그(Issue #18 + consumeBacklog regex silent fail) + 누적 cleanup(7개)**를 한 묶음으로 처리.

직전 generation (gen-064)은 OpenCode slash commands 등록을 완료했고 main이 origin/main 대비 20+ commits ahead. 본 generation 종료 후 release 가능 상태로 정리되어야 함.

## Source Backlog

`backlog-auto-prompt-on-start.md` — 2026-05-26 작성. Issue #18(공식, 2026-04-14 auto-report) + 신규 발견 frontmatter status 누락 bug + 누적 7개 cleanup을 한 묶음으로 묶은 backlog. `status: pending` 으로 작성됐고, 본 generation start의 `--backlog` flag에 의해 정상 consume 처리됨 (확인: frontmatter `status: consumed`, `consumedBy: gen-065-b1b391`, `consumedAt: 2026-05-25T15:42:27.315Z`). 본 generation 종료 시 lineage archive 예정. **dog-fooding 검증 포인트**.

## Key Findings

### 코드 위치 — 핵심 두 모듈

**`src/core/backlog.ts:55-63` — `consumeBacklog` 함수 (버그 #2 근원)**:

```ts
export async function consumeBacklog(filePath: string, genId: string): Promise<void> {
  const content = await readTextFile(filePath);
  if (!content) return;
  const updated = content
    .replace(/status:\s*pending/, `status: consumed\nconsumedBy: ${genId}\nconsumedAt: ${new Date().toISOString()}`);
  await writeTextFile(filePath, updated);
}
```

- regex `/status:\s*pending/` 가 안 맞으면 `content` 그대로 write. **silent fail** — 에러도 warning도 없음.
- 호출처: `src/cli/commands/run/start.ts:129` (create phase에서 `--backlog`가 있을 때만).
- 영향: 호출 자체는 됐지만 (state.sourceBacklog 도 set 됨, state save 도 됨) 파일 frontmatter만 변경 안 됨 → archive.ts가 consumed status 기준으로 archive 결정한다면 누락.

**archive.ts에서 backlog archive 로직 확인 필요** — 본 generation에서 함께 fix해야 할 가능성.

**`src/cli/commands/run/start.ts:10-83` — `start` 명령 (버그 #1 근원)**:

- create phase는 `--backlog <filename>` 가 명시되어 있어야만 consume 호출. 빈 경우는 `backlog` 변수가 undefined로 skip.
- AI/사용자가 backlog를 모르고 start를 호출하면 누락이 silent로 진행됨.
- scan phase에서는 이미 pending backlog 목록을 emit하지만, AI가 그걸 무시하고 create phase로 직행할 수도 있음 (이게 gen-007~015 누적 사례의 본질).

### CLI option 라우팅

`src/cli/index.ts` 의 `reap run start` 옵션: `--phase`, `--goal`, `--type`, `--parents`, `--backlog`. **`--no-backlog` 신설** 필요.

### YAML 의존성

`load-context.ts:2` 에서 `import YAML from "yaml"` 사용. `package.json` 의 production dependency. **`backlog.ts`에서 그대로 import 가능**.

### archive.ts에서 backlog 처리 패턴

`src/core/archive.ts:51-56` (backlog 본 backlog의 표에서 인용) — consumed backlog를 lineage `<gen>/backlog/` 로 이동하는 코드 존재. 본 generation에서 cleanup 시 그 패턴 차용 가능.

→ implementation 단계에서 archive.ts 상세 확인.

### 7개 누적 backlog ↔ generation 매핑

backlog 본 backlog의 표 그대로:

| Backlog 파일 | Generation Lineage Dir |
|---|---|
| `strict-merge-mode-bypass-for-merge-gen.md` | `gen-058-c24cf8-fix-merge-generation...` |
| `fix-migrate-update-tests.md` | `gen-059-9e9790-fix-migrate-update...` |
| `daemon-e2e-tests.md` | `gen-060-e3c492-daemon-e2e...` |
| `early-close-lifecycle.md` | `gen-061-386e6c-resolve-16-early-close...` |
| `claude-md-knowledge-loading-separation.md` | `gen-062-332df2-resolve-17-claude-md...` |
| `opencode-adapter.md` | `gen-063-830a29-resolve-19-opencode-adapter...` |
| `opencode-slash-commands.md` | `gen-064-bb39bb-opencode-slash-commands...` |

각 lineage 디렉토리는 `ls` 로 확인 완료 (위 7개 모두 존재). 각 `meta.yml` 의 goal 텍스트로 매핑 재확인 가능.

각 lineage 의 마지막 commit timestamp를 `consumedAt` 으로 사용 — git log로 추출.

### 7개 backlog의 frontmatter 분석

`grep` 결과:
- 7개 모두 `status:` 필드 **없음** → 신규 발견 bug #2의 정확한 사례.
- gen-064에서 consume 호출됐을 텐데 regex `/status:\s*pending/` 가 매칭 실패 → silent fail. (`scan` 결과를 보면 7개 모두 `status: pending` 으로 인식되는데, 이는 `parseFrontmatter` 의 기본값 `?? "pending"` 때문임.)
- **본 backlog (`backlog-auto-prompt-on-start.md`) 만 `status: pending` 으로 작성**되어 정상 consume 마킹됨.

## Previous Generation Reference

- gen-064 fitness OK (build/reinstall 없이). Issue #16/17/19 모두 닫을 준비됨.
- 사용자 fitness 직전 코드 직접 검토가 `installSkills` vs `registerSessionIntegration` 갭을 catch — back regression로 graceful 처리. **본 generation에도 같은 자세 유지**: implementation 후 e2e 만으로 단정하지 말고 caller 모두 검증.
- gen-064 longterm memory: "Plan 단계에서 함수 caller 를 직접 읽어라" — 본 generation도 `consumeBacklog` caller 모두 검증.

## Backlog Review

본 backlog (source) 외에 6개 pending 추가 있음 — 모두 위 표의 7개 중 6개 (본 backlog가 7번째). 본 generation의 Part 3 cleanup이 정확히 이 6개 (+ gen-058용 1개)를 lineage 로 이동.

## Context for This Generation

### 합의된 7개 Part

1. `start --backlog` 누락 시 prompt + `--no-backlog` flag (Issue #18 fix)
2. `consumeBacklog` 견고화 — YAML 파서, 4 케이스 graceful
3. 누적 7개 cleanup (one-shot, implementation 안에서 수행)
4. `reap consume backlog` helper — **Learning phase에서 결정**
5. dog-fooding 검증 (본 backlog가 정상 archive)
6. unit + e2e
7. 문서 (reap-guide, .reap/reap-guide, backlog 작성 가이드)

### Part 4 — `reap consume backlog` helper 결정 (Learning 결정 포인트)

객관적 평가:

**Pro**:
- 향후 누락 retroactive 처리 — 동일 사고 재발 시 manual git 작업 없이 1 command.
- Part 3 cleanup script가 이걸 활용 가능 — implementation의 명료성↑.
- `reap make backlog` 와 대칭적 (backlog 라이프사이클 CLI 완결).

**Con**:
- 누락이 root cause fix 후 발생할 가능성은 낮음 (consumeBacklog 견고화 + start prompt 도입으로 두 경로 모두 차단).
- 추가 CLI surface area — 향후 유지 부담.
- Part 3 cleanup은 1회성 작업 — script로도 충분.
- 사용자가 직접 호출할 use case 명확하지 않음 (보통 시스템 자동 작업).

**판단**: **Part 4 미구현** 결정.
- 본 generation의 root cause fix (Part 1+2) 이후 누락 발생 경로 자체 차단됨.
- Part 3 cleanup은 implementation 안의 일회성 작업 (script 또는 직접 file 조작). helper 명령 없이 처리 가능.
- 향후 실제 use case 발생 시 별도 backlog로 처리. 추측 기반 surface area 추가는 echo chamber 우려.
- 시간/scope를 Part 1+2의 견고성 (caller 검증, e2e 폭) 과 Part 3 정확성에 집중.

→ Part 4는 본 generation에서 안 만들고, 별도 follow-up backlog로도 만들지 않음 (필요할 때 그때 backlog). completion artifact의 hints 정도에만 언급.

### 확정된 scope (Part 1, 2, 3, 5, 6, 7)

- Part 1: start prompt + `--no-backlog` flag — start.ts + index.ts + reap-guide
- Part 2: consumeBacklog 견고화 — backlog.ts (YAML 파서 도입)
- Part 3: 누적 cleanup — implementation 안에서 7개 file 처리 + 8번째인 본 backlog는 completion commit에서 자동 archive 검증
- Part 5: 본 backlog 자체 archive 검증
- Part 6: unit (consumeBacklog 4 케이스 + start phase 동작) + e2e (lifecycle 시나리오)
- Part 7: reap-guide.md / .reap/reap-guide.md / backlog 작성 가이드

### Risk

1. **archive.ts가 backlog `status: consumed` 만 보고 archive를 결정한다면**, 7개 cleanup 시 frontmatter에 `status: consumed` 추가 필요. archive.ts 코드 확인은 implementation의 첫 작업.
2. **consumeBacklog YAML 파서 적용 시 기존 frontmatter 형식 보존**: comment, key 순서, 사용자 추가 필드 보존. YAML.parse → modify → YAML.stringify는 form 손실 가능. 안전한 접근: YAML.parse로 분석만 + 라인 단위 frontmatter 조작. 또는 YAML.stringify 후 기존 본 backlog가 유지 가능한지 확인.
3. **본 generation의 본 backlog dog-fooding**: 현재 frontmatter `status: consumed` + `consumedBy: gen-065-b1b391` 정상 마킹 완료. completion commit이 archive.ts를 호출하면 `lineage/gen-065/backlog/` 로 이동. archive.ts에서 backlog 처리 확인 후 보장.
4. **e2e 환경에서 build 필수**: src 수정 후 `npm run build` 안 하면 stale binary가 테스트됨. CI 환경 아닌 로컬에서 매번 build 필요 (`feedback_stale_build.md`).
5. **tests/ submodule**: 신규 test는 submodule 안에서 commit (main 브랜치). completion 시 pointer staging 잊지 말 것.

## Clarity Level

**High**. Source backlog가 매우 구체적 (7개 Part 명시, 9개 Risk, 17개 verification 기준). 직접 cause 범위가 명확 — backlog scope 외 추가 작업 없음. 사용자 합의 사항 (A option, Q1~Q4) 모두 backlog에 명문화.

→ Planning에서 task decomposition으로 직행. AI 자율 추가는 backlog 직접 인과 범위 내로 제한.
