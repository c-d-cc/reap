---
id: gen-0124-exec
slug: handoff-global
type: exec
backlog: bk-d7ecf3
title: 인계를 life/handoff.md 하나로 — 도구·skill·씨앗·문서
startedAt: 2026-09-20T23:22:03Z
startCommit: cf3c267
status: closed
closedAt: 2026-09-20T23:37:24Z
endCommit: 088a01db
---

## Intent

`ps-4f2a91`의 새 인계 규범을 실물로 만든다. 끝나는 조건은 **`.reap/life/handoff.md` 하나가
실제로 돌고, milestone 디렉토리에 `handoff.md`가 더는 생기지 않으며, 상태 줄이 인계와 세션
키를 낸다**는 것이다. 이 리포 자신의 ms-022 handoff도 옮긴다.

무엇이 참이어야 하는지는 `03-storage.md`의 **인계는 milestone이 아니라 세션의 것이다** 절과
`bk-d7ecf3`의 목록에 있다. 여기 옮겨 적지 않는다.

## References

- ps-4f2a91:03-storage.md — 인계 절(정본) · 세션 식별 사다리
- flux-0006-design — 설계 경위. `Dead Ends`에 접은 셋(세대 id 키·훅 stdin·새 명령)
- bk-d7ecf3 — 이 세대의 근거이자 할 일 목록

## Outcome

인계가 milestone 밖으로 나왔다. `.reap/life/handoff.md` 하나가 세션별 절을 갖고, 이 리포가
그것으로 돈다.

- **도구** — `store.ts`에 `paths.handoff`와 `sessionKey()`. 세션 사다리에
  `CLAUDE_CODE_SESSION_ID`가 둘째 칸으로 들어갔다. `bind`·`unbind`는 워크트리 값만
  `.session`에 굳힌다 — 호스트 id를 파일에 남기면 다음 세션이 남의 id를 물려받는다.
  `entries.ts`의 `make milestone`은 `handoff.md`를 만들지 않는다. `ctx.ts`가 인계 줄
  (경로·절 개수·내 절 유무)과 세션 줄을 내고, milestone 묶음에서 handoff를 뺀다
- **skill 8종** — `complete`의 인계 절을 새로 썼다(절 제목 형식, 세션 키는 상태 줄에서 온다,
  이어받은 절은 지운다, 남길 것이 없으면 절을 안 쓴다). 나머지는 경로
- **씨앗·문서** — `map.md` 둘(영·한), 사이트 네 곳, 릴리스 노트 둘
- **이 리포** — ms-022의 12.8KB·헤딩 13짜리 handoff에서 살아 있는 절만 옮기고 지웠다(2.7KB)

**summary.md: 갱신** (milestone 디렉토리 구성, `.reap/hooks/`). **genome: 해당 없음** —
저장 규약은 plan source가 갖는다는 기존 의도 그대로다.

## Verification

`bun test` 290 pass·0 fail, `typecheck`, `./tests/hook.test.sh`, 문서 게이트 둘, 사이트
빌드(29쪽), `doctor` 결함 0. 빈 리포 probe로 `doctor`의 새 참고가 실제로 뜨는 것을 봤다 —
milestone에 `handoff.md`를 놓자 `notes 1`로 보고했다.

**독립 검증** — fresh subagent 하나. 차단 결함 없음, 판정은 *"close with backlog items"*.
지적 여섯 중 다섯을 이 세대에서 고쳤다.

- **매 세션 주입되는 `environment/summary.md`가 "milestone 디렉토리에는 handoff.md가 있다"고
  말하고 있었다.** 매번 찍히는 `gen.closed.continue.md`도 focus milestone의 `handoff.md`를
  보라고 했다. 방금 만든 규범과 정반대다 → 둘 다 고쳤다
- `lessons.md`의 *"handoff에 적은 것은 milestone과 함께 사라진다"* 는 전제가 사라졌다 →
  진짜 교훈(교체가 지운다)만 남기고 다시 썼다
- **`heading.includes(key)`가 부분 문자열 판정이었다.** `sess-9bf4`가 `sess-9bf47826`의 절을
  자기 것이라 주장하고 `complete`가 남의 절을 덮을 수 있었다 → 제목 첫 토큰 일치로 바꾸고,
  8자를 못 채우는 세션 id는 워크트리 해시로 내린다(`sess-`만 남으면 모든 절과 같아진다)
- 코드 펜스 안의 `## `가 절로 세어졌다 → 펜스 상태를 따라간다
- 사이트의 상태 줄 예시 둘에 `이 세션:` 줄이 없었다 → 넣었다
- 업그레이드한 프로젝트의 남은 milestone `handoff.md`가 조용히 안 보이게 됐다 →
  `doctor` 참고를 더했다

남긴 것 하나 — **이 커밋 이전에 `REAP_SESSION`을 손으로 썼던 프로젝트의 `.session`에는 옛
호스트 id가 굳어 있을 수 있다.** `bindSession`이 `raw.sessionId`를 보존하므로 스스로 안
고쳐진다. 받아들인 이유는 범위가 사실상 비어서다 — `.session`은 gitignored이고 워크트리마다
별개이며, **REAP의 어떤 코드도 `REAP_SESSION`을 설정한 적이 없다**(#34 조사에서 확인). 사람이
직접 설정한 경우에만 생기고, 그때는 그 사람이 값을 안다.

## Dead Ends

- **세션 키를 `.session`에 굳히는 안.** 호스트 id는 세션마다 달라지므로 파일에 남기면 다음
  세션이 남의 id를 물려받는다. 테스트로 못 박았다
- **`doctor`가 남은 `handoff.md`를 결함으로 내는 안.** 결함은 확정적으로 틀린 것이고 이것은
  옮기면 되는 것이다. 참고로 둔다
