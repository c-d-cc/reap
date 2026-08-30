---
id: gen-0002-exec
slug: id-문서-make-mark
type: exec
milestone: ms-001
title: id, 문서, make, mark
startedAt: 2026-08-22T15:43:20Z
startCommit: 7047f69
status: closed
closedAt: 2026-08-22T15:50:15Z
endCommit: 3eed1b4
---

## Intent

세대와 milestone을 **손으로 여닫는 것을 그만둔다.** 지금 한 세대를 열려면 네 곳(기록 파일 · frontmatter 스탬프 · `sequence/` 행 · 세션 바인딩)을 손으로 맞춰야 하고, 어긋나도 아무도 모른다 — `memory/tracks.md`의 마찰 셋이 전부 이 하나로 모인다.

`id.ts`(발급) · `doc.ts`(frontmatter와 항목 찾기) · `entries.ts`(make·mark)를 만들고 `cli.ts`에 붙인다.

**끝나는 지점:** `bun test` 통과 · `typecheck` 0 · 바이너리로 `init` → `make milestone` → `make generation` → 커밋 → `mark --closed`가 전부 `ok: true`이고, 파일이 규약된 자리에 규약된 모양으로 생긴다. 그리고 **이 세대 자신을 닫을 때 `mark`를 쓴다** — 도구가 자기를 쓰는 첫 지점이다.

## References

- ms-001 Task 1.2 — 공개 인터페이스, 증명해야 할 동작 열 개, 함정 넷
- [명령](../../../docs/superpowers/specs/reap/04-commands.md) — `make`/`mark`의 계약, generation·milestone frontmatter 형식
- [저장 구조](../../../docs/superpowers/specs/reap/03-storage.md) — id 체계와 레지스트리, slug는 키가 아니다
- gen-0001-exec (`6ec278b`) — `store.bindSession`은 이미 있고 여기가 첫 호출자다

## Outcome

Task 1.2 완료 (`52206c3`). `bun test` 61개 통과 · `typecheck` 0 · 바이너리로 `init` → `make milestone` → `make generation` → 커밋 → `mark --closed`가 전부 돌고 파일이 규약된 자리에 규약된 모양으로 생긴다.

- `id.ts` — **접두사가 계열을 정하고 계열이 형식을 정한다.** 자릿수로는 못 가른다(6자리 숫자는 6자리 hex이기도 하다). 레지스트리는 append-only이고 다음 번호는 행에서 나온다
- `doc.ts` — `parseDoc`/`formatDoc`/`patch`/`slugify`/`listEntries`/`findEntry`
- `entries.ts` — `makeMilestone` · `makeGeneration` · `markGeneration`
- `cli.ts` — `make`/`mark` 디스패치, 플래그 파서(`--x v`와 `--x=v` 둘 다), 예외를 `Result`로 접는 `attempt`
- `store.ts`에 `unbindSession` 추가 — abort로 기록을 지우면 바인딩도 사라져야 한다. 지워진 기록을 가리키는 세션은 `ctx`를 거짓말하게 만든다

**함정 넷은 전부 테스트로 잡았다.** 레지스트리 제목 왕복은 `|`와 개행 각각에 대해 제목과 `createdAt`을 함께 검사한다 — 제목만 보는 테스트는 이 결함을 통과시킨다.

**계획에 없었지만 넣은 것:** `make milestone`의 `--from`/`--ref`. spec의 milestone frontmatter가 요구하는 필드이고, 없으면 milestone이 자기 출처를 기록할 수 없다. 비용은 파서 두 줄이었다.

**남은 것:** Task 1.3(`ctx`) → 1.4(플러그인·훅).

## Notes

이 기록의 frontmatter는 `dist/reap mark generation gen-0002-exec --closed`가 닫았다 — 도구가 자기를 쓴 첫 지점이다. 열기(`make`)는 아직 손이었다. gen-0003-exec부터 양쪽 다 도구가 한다.
