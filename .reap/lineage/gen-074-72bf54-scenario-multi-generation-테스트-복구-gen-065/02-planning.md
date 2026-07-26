# Planning

## Goal

`tests/scenario/multi-generation.test.ts` 를 gen-065 backlog gate 동작에 맞게 갱신해 scenario 스위트를 green 으로 만들고, gate 의 **두 출구(`--backlog` / `--no-backlog`)를 모두 시나리오로 커버**한다.

완료 시: `bun test tests/scenario/` 40 pass / 0 fail. gen-065 gate 가 scenario 레벨에서 검증됨.

## Completion Criteria

1. `bun test tests/scenario/` → **40 pass / 0 fail**
2. gen2 start 가 gate prompt(`status: "prompt"`, `phase: "select-backlog"`)를 받고, pending 목록이 노출되는지 검증
3. `--backlog <file>` 재호출로 generation 생성 + 해당 backlog 가 `status: consumed` + `consumedBy` 로 전환되는지 검증
4. `--no-backlog` 경로도 별도 case 로 검증 (gate 의 다른 출구)
5. `.reap/environment/summary.md` 의 scenario baseline 이 새 수치로 갱신됨
6. unit/e2e 회귀 없음 (baseline: unit 454-0, e2e 263-1)

## Background

01-learning.md 참조. 요약: gen1 이 `carry-over-test.md`(status: pending)를 만들고, gen2 start 가 `--backlog`/`--no-backlog` 없이 호출되어 gate 에 걸린다. 나머지 4건은 gen2 미생성으로 인한 연쇄 실패.

`merge` / `lifecycle` / `init-start-status` 는 backlog 파일을 만들지 않아 안전함을 확인했다.

## Approach

**소스 코드를 바꾸지 않는다.** gate 는 gen-065 가 의도적으로 도입한 올바른 동작이므로, 테스트를 현재 동작에 맞춘다.

기존 `gen2: start` 한 개 test 를 gate 흐름을 따라가는 여러 test 로 분해한다:

```
gen2: start without a backlog decision → prompt   (gate 가 막는다)
gen2: start --backlog <file>           → ok       (소비하고 진행)
gen2: consumed backlog frontmatter     → status/consumedBy 확인
```

그리고 gate 의 다른 출구를 위해 **독립 describe 블록**을 추가한다 — `--no-backlog` 는 backlog 를 소비하지 않으므로 기존 시나리오 흐름에 끼워넣으면 상태가 오염된다. 별도 임시 프로젝트에서 검증한다.

### 기존 test 이름 유지 방침

`gen2: backlog carried over` 는 파일 존재만 확인하던 test 다. 소비 후에도 파일은 남으므로(status 만 바뀜) 그대로 통과하지만, **의미가 달라졌으므로** 검증 내용을 frontmatter 확인으로 강화한다.

## Risk Assessment

| 리스크 | 대응 |
|---|---|
| gate prompt 의 응답 형식 가정 오류 | 실제 CLI 출력을 먼저 확인한 뒤 assertion 작성 |
| `--backlog` 파일명 불일치 | prompt 가 반환하는 `b.filename` 과 정확히 일치해야 함 — 응답에서 읽어 사용 |
| `--no-backlog` case 가 기존 흐름 오염 | 독립 describe + 별도 temp 프로젝트 |
| 다른 scenario 파일 회귀 | 전체 스위트 실행으로 확인 |

## Scope

**변경 대상**
- `tests/scenario/multi-generation.test.ts`
- `.reap/environment/summary.md` — scenario baseline 수치 (reflect phase)

**out of scope**
- `src/` 일체 — gate 는 올바른 동작
- 다른 scenario 파일 — 점검 결과 안전
- 릴리즈 노트 — 다음 세대 completion 에서 일괄

## Tasks

- [ ] T001 gate prompt 의 실제 응답 형식 확인 (수동 실행)
- [ ] T002 `multi-generation.test.ts` — `gen2: start` 를 gate 흐름 3-test 로 분해
- [ ] T003 `gen2: backlog carried over` → consumed frontmatter 검증으로 강화
- [ ] T004 `--no-backlog` 경로 독립 describe 추가
- [ ] T005 `bun test tests/scenario/` 전체 green 확인
- [ ] T006 unit/e2e 회귀 확인
- [ ] T007 environment scenario baseline 갱신 (reflect)

## Dependencies

T001 → T002 (실제 형식 확인 후 assertion)
T002~T004 → T005 → T006
