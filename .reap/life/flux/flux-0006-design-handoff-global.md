---
id: flux-0006-design
slug: handoff-global
type: design
title: handoff를 milestone 밖으로 — life/handoff.md 하나에 세션별 절
refs:
  - ps-4f2a91:03-storage.md
startedAt: 2026-09-20T23:17:34Z
startCommit: c036af2
status: open
milestones: []
---

## Question

`handoff.md`는 milestone 디렉토리에 있다. 답하는 질문은 *"다음 세션이 어디서 시작하나"* 로
**세션**의 것인데 파일은 **milestone**에 매여 있어 셋이 어긋난다.

- 닫힌 세대 121 중 **43(36%)이 milestone에 속하지 않는다**(exec 22·plan 15·fix 6). 이들은
  인계할 자리가 없다. `complete`는 fix에 대해 명시적으로 건너뛰고, backlog만 근거인 exec은
  조용히 빠진다(`gen-0123`이 그랬다)
- milestone을 닫으면 handoff가 함께 `archive/`로 간다 — **인계가 가장 필요한 순간**(다음
  milestone 자르기 직전)에 파일이 빈 것으로 새로 생긴다
- spec이 이미 알고 있다. `04-commands.md`: *"`handoff.md`는 milestone 레벨이고 종료 시점에
  쓰이므로 그 순간을 메우지 못한다"* — 그 구멍을 세대 기록의 `Intent`가 반만 메운다

**사람이 정한 방향(2026-09-21)** — `life/handoff.md` 전역 파일 하나. 세션별 절로 쓰기 충돌을
피하고, 소비된 절은 삭제한다. 사람은 전에 단일 파일을 반대했으나 쓰면서 필요하다고 판단을
뒤집었다.

**그래서 이 flux가 답할 것은 방향이 아니라 그 방향의 빈칸이다.**

1. **세션을 무엇으로 가르는가.** `.session`의 `sessionId`는 `sha256("session:" + 리포 루트)`
   앞 12자다 — 세션이 아니라 **워크트리**를 가리킨다. 한 워크트리의 모든 세션이 같은 값을
   영구히 공유하므로 그대로 쓰면 절이 안 갈린다. `life/run/<sessionId>/`가 물린 이유가 이것이다
2. **절의 수명.** 언제 생기고 누가 지우는가. "소비된 절은 삭제"의 *소비*가 무엇인가
3. **읽는 쪽.** `ctx`가 무엇을 내는가 — 전부인가, 내 절만인가, 이름만인가
4. **쓰는 쪽.** `complete`만인가. 도구가 절을 다루는가(`make`/`mark`의 일인가) 손으로 쓰는가
5. **기존 milestone handoff를 어떻게 하는가.** 남기는가, 옮기는가, 지우는가

## Explored

### probe — 진짜 세션 id는 있다 (2026-09-21, 이 머신)

`CLAUDE_CODE_SESSION_ID` 환경변수가 **자식 프로세스 전부에 그대로 내려온다.** 값이
`9bf47826-d68e-4e85-8d88-7973becab239`였고 `~/.claude/projects/<proj>/<그 값>.jsonl`이 실재했다 —
transcript 파일명과 일치한다. 훅 stdin(`{session_id, …}`)을 파싱할 필요가 없다. `reap`가
자기 환경에서 직접 읽는다.

**Codex는 없다.** `codex` 0.155.1 바이너리의 문자열에서 `CODEX_*SESSION*`을 찾지 못했다.
`CODEX_HOME`만 있다. 그러므로 **세션 id는 호스트마다 있을 수도 없을 수도 있다.**

### 병렬은 worktree로 갈린다 — 그래서 충돌은 실행 중이 아니라 git에서 난다

`07-orchestrate.md`가 못 박는다: *"같은 디렉토리에서 세션 둘은 지원하지 않는다. 병렬은
worktree로 가른다."* worktree마다 `.reap/`가 별개이므로 **동시에 같은 파일을 쓰는 일은
일어나지 않는다.** `orch`의 공유 상태가 리포 밖 `~/.reap/orch/<workspace-id>/`에 사는 이유도
그것이다.

**그러나 `.reap/`는 git에 든다.** 두 worktree가 각자의 `life/handoff.md`를 고치면 **머지에서
충돌한다.** 전역 파일 하나를 두면서 절을 가르는 것이 실제로 막는 것은 이 충돌이다 — 실행
중의 경합이 아니다. 이 구분을 흐리면 `life/run`과 같은 실수가 된다.

### 지금 실물

- 닫힌 세대 121 / milestone 소속 78 / **소속 없음 43**
- ms-022의 `handoff.md`는 **12.8KB · 헤딩 13개**이고 그중 셋이 `## 지난 task N 이전 handoff (기록)`
  이다. *"교체하고 누적하지 않는다"* 는 규칙이 지켜지지 않았다. 게다가 낡았다 — 마지막 실제
  갱신은 `gen-0099`(bd79356)인데 그 뒤 `gen-0112`가 ms-022 소속으로 닫히면서 갱신하지 않았다
- **v0.18은 아직 출시 전이다**(`v0.18.0` 태그 없음). 사용자 데이터 이주 부담이 없다


## Dialogue

| 갈림 | 선택지 | 사람의 답 |
|---|---|---|
| handoff의 자리 | milestone 유지 / 전역 하나 / 소속 없는 세대만 대체 자리 | **전역 하나** (2026-09-21). 전에는 단일 파일을 반대했으나 쓰면서 뒤집었다 |
| 절을 무엇으로 가르나 | 세션 / 세대 / 안 가름 | **세션** (사람 지시). agent가 세대 id를 대안으로 제시하려 했으나, probe로 진짜 세션 id가 확인되어 사람 지시가 그대로 성립한다 |
| 절의 소비 | 표시 / 삭제 | **삭제** (사람 지시) |

**agent가 먼저 알린 것** — `.session`의 `sessionId`가 세션이 아니라 워크트리 해시라는 사실.
사람의 지시를 그대로 구현하면 `life/run`의 재판이 될 수 있었다. probe가 `CLAUDE_CODE_SESSION_ID`를
찾아 지시가 성립하게 됐고, **Codex에는 없으므로 사다리의 마지막 칸은 오늘의 워크트리 해시로
떨어진다** — 그 칸에서는 세션이 안 갈린다는 사실을 spec에 적는다. 숨기면 같은 실수가 반복된다.


## Dead Ends

## Outcome
