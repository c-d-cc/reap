---
id: gen-0059-exec
slug: orch-도구
type: exec
milestone: ms-008
title: orch — workspace-id probe · claim/release · barrier/roster
startedAt: 2026-08-30T17:09:27Z
startCommit: 6381e10
status: closed
closedAt: 2026-08-30T17:13:10Z
endCommit: 50c5e29
---
## Intent

`ms-008` 9.1(확정 가능한 probe 둘) · 9.2 · 9.3 · 9.4 · 9.5. 실제 두 Claude 세션 왕복(9.6)과 idle `SendMessage` 시점 probe는 사람과 정한다.

## Outcome

- **probe** — workspace-id가 worktree 간에 수렴한다(`56ee0e4f7122` 둘 다). `claude agents --json` 필드 아홉 확인. `.session` 겹침: worktree마다 별개, 같은 디렉토리 둘은 지원 안 함 — spec `07`에 적었다
- **`src/orch.ts`** — `claim`(`O_EXCL`, TTL, 같은 holder는 갱신, 만료분 탈취 + `log.jsonl`), `release`(holder만), `arrive`/`waitBarrier`(lock 파일로 도착 기록, `--timeout` 필수, 만료 시 roster 대조로 누가 안 왔는지), `roster`(`claude agents --json`, 못 읽으면 빈 목록), `status`. 주소는 `REAP_AGENT` 또는 세션 id, 뿌리는 `REAP_HOME`(기본 `~/.reap`)
- `reap orch claim|release|barrier|roster|status [--topic]`. 테스트 8, 171 통과
- **바이너리 두 프로세스로 실제 돌렸다** — 동시 `claim` 하나만 성공, `barrier --expect 2` 둘 다 통과, 로그 넷
- **`orchestrate` skill** — 혼자면 없는 것 · 역할=주소·worktree로 가른다 · claim 관례 · barrier 두는 곳 · 메시지 kind 넷 · 조율자 패턴
- Open Question 둘 답함(claim 관례 · workspace-id)
