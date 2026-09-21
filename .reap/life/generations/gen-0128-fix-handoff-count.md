---
id: gen-0128-fix
slug: handoff-count
type: fix
title: 인계 절 수를 세션 키로 센다 — 본문의 ##를 절로 세지 않는다
startedAt: 2026-09-21T00:05:41Z
startCommit: 350d7167
status: open
---

## Intent

상태 줄의 인계 절 수가 **본문의 `## ` 소제목까지 세고 있었다.** `gen-0127`의 첫 실사용에서
`## 미결`을 쓰자 `절 2개`로 나왔다 — 절은 하나뿐이었다.

끝나는 조건: 절 제목은 **세션 키로 시작하는 `## `**뿐이고, 본문이 무엇을 쓰든 집계가 흔들리지
않는다. 규율이 아니라 코드가 보장한다.

## References

- src/ctx.ts `handoffSections` — `## `면 전부 세던 자리
- src/ctx.ts `headingKey` — `gen-0124`의 독립 검증이 소유 판정을 첫 토큰으로 바꾸며 만든
  함수. 같은 토큰이 여기서도 답이었다
- ps-4f2a91:03-storage.md `### 절은 세션으로 가른다` — 절 제목 형식의 규범

## Outcome

`handoffSections`가 **첫 토큰이 세션 키 접두사로 시작하는 `## `만** 센다. 접두사를
`SESSION_KEY_PREFIX` 상수로 빼서 **쓰는 쪽(`sessionKey`)과 세는 쪽이 같은 값을 본다** —
두 곳에 `"sess-"`를 적으면 한쪽만 바뀌는 날이 온다.

코드 펜스 제외는 그대로다. 둘은 다른 실패를 막는다 — 펜스는 형식 예시를, 이번 것은 본문
소제목을.

**summary.md: 해당 없음. genome: 해당 없음.**

## Verification

실패하는 테스트 둘을 먼저 썼다 — 본문에 `## 미결`이 있어도 절 1개, 세션 키로 시작하지 않는
`## `뿐이면 인계 줄 자체를 안 낸다. `bun test` 292 pass·0 fail(+2), `typecheck`,
`hook.test.sh`, `plugin-skills.test.sh` 통과. 실물로도 확인했다 — `## sess-… / ## 미결`
두 줄짜리 파일을 놓고 `reap ctx`가 `절 1개`를 냈다.

**독립 검증 생략** — 한 함수의 조건 한 줄과 상수 하나다.
