---
id: bk-d7ecf3
slug: handoff-global
type: structure
title: handoff를 life/handoff.md 하나로 — 세션별 절, 소비되면 삭제
from: flux-0006-design
createdAt: 2026-09-20T23:21:22Z
status: open
---

규범은 `ps-4f2a91`에 썼다 — `03-storage.md`의 **인계는 milestone이 아니라 세션의 것이다**
절이 정본이고, `02-flow.md`·`04-commands.md`·`05-knowledge.md`·`06-agent.md`가 그에 맞춰졌다.
여기 옮겨 적지 않는다. 이 항목은 **그 규범을 실물로 만드는 일**의 목록이다.

## 도구

- `store.ts` — `paths`에 `handoff`(`life/handoff.md`). 세션 키 해석 사다리에
  `CLAUDE_CODE_SESSION_ID`를 둘째 칸으로 넣는다
- `entries.ts` — `make milestone`이 `handoff.md`를 만들지 않는다
- `ctx.ts` — milestone 묶음에서 `handoff.md`를 빼고, 상태 줄에 **인계 줄**(경로 · 절 개수 ·
  내 절 유무)과 **이 세션 줄**(세션 키)을 낸다. 비어 있으면 인계 줄을 내지 않는다
- `messages/` en·ko 라벨

## skill

- `complete` — 닫을 때 `life/handoff.md`의 **내 절을 교체**한다. milestone 소속 여부와
  무관하다. 절 제목 형식과, 이어받았으면 그 절을 **지운다**는 규율
- `evolve` — 읽는 쪽. 내 절이 아닌 절도 읽을 수 있다는 것과, 이어받으면 지운다는 것
- `carve-milestone` — milestone 디렉토리에서 handoff가 빠진 것
- `help`·`orchestrate`·`migrate` — 경로가 나오는 자리

## 씨앗과 문서

- `src/templates/map.md`와 `.reap/map.md` 양쪽
- 사이트 — 저장 구조·자율 진화 흐름·skill 10종
- `RELEASE_NOTES.md`와 사이트 릴리스 노트

## 이 리포 자신

ms-022의 `handoff.md`(12.8KB·헤딩 13)는 살아 있는 부분만 `life/handoff.md`의 절로 옮기고
파일을 지운다. **archive에 든 것은 건드리지 않는다** — 역사다.

## 검사

세션 키 사다리(환경변수 있을 때/없을 때), `make milestone`이 handoff를 안 만드는 것,
상태 줄의 인계 줄(있을 때·없을 때). 실패하는 것을 먼저 쓴다.
