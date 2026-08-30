---
id: gen-0015-exec
slug: id-계열-통합
type: exec
milestone: ms-002
title: id 계열 통합 — gen-NNNN-type
startedAt: 2026-08-23T01:04:35Z
startCommit: c6bf4ea
status: closed
closedAt: 2026-08-23T01:13:53Z
endCommit: 0102e42
---

## Intent

Task 2.2 — 세대 id를 하나의 계열로 합친다.

```
gen-0004-plan · gen-0001-exec   →   gen-0001-plan · gen-0002-exec
sequence/plan-generation.md + exec-generation.md   →   sequence/generation.md
```

`Kind`에서 generation 유형 셋이 하나가 되고, plan/exec/fix는 kind가 아니라 **id 안의 값이자 frontmatter의 `type`**이 된다.

**이 세대가 이 리포도 함께 재번호한다.** `gen-0012-exec`이 증명했듯 코드만 옮기면 도구가 자기 저장소를 못 읽는다. 기존 13개를 `startedAt` 순으로 배치하고 **옛 id → 새 id 매핑을 남긴다** — 커밋 메시지가 옛 id를 인용하는데 히스토리는 다시 쓰지 않으므로, 매핑이 없으면 `git log`와 기록이 영구히 갈린다.

**끝나면:** 이 세대 자신이 새 id로 닫힌다.

**하지 않는 것:** `--fix` 플래그와 `cleanup`은 2.3, `map.md`는 2.4. 여기서는 id 문법에 `fix`를 받아들이기만 한다.

## References

- `tasks/2-2-id-계열-통합.md` — 함정은 `kindOf`가 첫 `-` 앞을 접두사로 보는 것
- ps-4f2a91 `03-storage.md` — "generation id는 유형을 품는다"

## Outcome

세대 id가 하나의 계열이 됐다. `Kind`에서 유형 셋이 하나의 `generation`으로 줄고, plan/exec/fix는 id 안의 값이자 frontmatter의 `type`이다.

**`kindOf`의 전제를 바꿨다.** 접두사 표가 `{ numbered: boolean }` 대신 **뒤에 올 수 있는 것의 정규식**을 든다 — `gen`은 `^\d{4,}-(?:plan|exec|fix)$`. 그래서 `gen-0002`(유형 없음)도 `gen-0002-foo`(모르는 유형)도 거부된다. 뒤에 오는 것이 slug인지 유형인지 가르는 유일한 근거가 이 형식이므로, 느슨하게 두면 파일 이름을 못 읽는다.

레지스트리는 `sequence/generation.md` 하나. 유형이 달라도 같은 계열에서 번호를 받는다.

**이 리포도 함께 재번호했다** — 15개를 `startedAt` 순으로. `plan-005`는 파일이 없어(실수로 발급했다 지운 것) 새 번호를 주지 않고 매핑에 그렇게 적었다.

**옛 id → 새 id 매핑은 `sequence/generation.md`의 주석에 있다.** 커밋 메시지는 다시 쓰지 않으므로 `chore: mark로 exec-006을 닫는다` 같은 커밋이 영영 옛 id를 가리킨다. 그것을 푸는 유일한 곳이다.

`bun test` 83 (79 → +4) · `typecheck` 0 · `hook.test.sh` 5/5 · 빈 프로젝트 한 바퀴(plan·exec·plan 순으로 열어 `gen-0001-plan`·`gen-0002-exec`·`gen-0003-plan`, `mark`로 닫기까지).

## Dead Ends

**`\b`가 한글 앞에서 안 먹는다.** id 인용을 치환하며 `\b(exec|plan)-\d{3}\b`를 썼는데 **한글이 유니코드 낱말문자**라서 `plan-004에`에는 경계가 없다. 같은 줄에서 `plan-003·`은 바뀌고 `plan-004에`는 안 바뀌었다 — 부분적으로 성공해서 더 위험했다.

task 파일이 경고한 것은 반대쪽(`exec-001`이 `exec-0012`의 접두사)이었고, 그쪽은 막았는데 이쪽에 물렸다.

고친 조건: `(?<![0-9A-Za-z_-])(?:exec|plan)-\d{3}(?!\d)`. **앞은 ASCII 낱말문자와 하이픈만 막고 뒤는 숫자만 막는다** — 한글이 뒤따르는 것은 정상이다.

**그리고 치환 뒤 전수 검사가 이것을 잡았다.** 남은 것을 세어보지 않았으면 절반만 바뀐 채로 커밋됐다.

## Notes

`createdAt`을 옛 레지스트리에서 가져오려다 한 번 틀렸다 — 그 파일들도 이미 새 id로 치환된 뒤여서 옛 키로는 못 찾았고, 전부 오늘 날짜로 찍혔다. **치환은 자기가 읽으려던 것도 바꾼다.** 새 id로 다시 읽어 복구했다.

`tests/id.test.ts`에 `kindOf("exec-001") === null`이 남아 있다. 치환 대상이 아니라 **옛 형식이 거부되는지 보는 테스트**다.
