---
id: gen-0110-exec
slug: archive-on-close-skills
type: exec
milestone: ms-028
title: skill·spec·map.md — cleanup 은퇴, 종료 순서 둘, life는 열린 것만
startedAt: 2026-09-05T08:36:25Z
startCommit: 794eca5
status: closed
closedAt: 2026-09-05T08:39:14Z
endCommit: 915e9ca
---

## Intent

ms-028 tasks/2. `cleanup` skill 삭제, carve-milestone 종료 순서를 fitness → mark 둘로, complete에 "닫힘이 곧 이동"(기록을 먼저 끝내고 닫는 커밋이 rename을 싣는다), help·flux·migrate 매핑 #3에서 옛 전제 제거. spec 03-storage "life는 작업 세트다" 절을 "닫히면 바로 archive다"로 다시 쓰고 02-flow·04-commands·05-knowledge·06-agent·08-delivery의 cleanup·10개 언급 정리. map.md 템플릿과 이 리포의 `.reap/map.md`(한국어 번역본) 동기화. plugin-skills 검사의 agent 전용 목록 둘.

## References

- gen-0109 Outcome(CLI 동작) · ms-028 milestone.md

## Outcome

commit 915e9ca(주 트리)·tests ff56696. plugin-skills·docs-surface ok, bun test 238, doctor 결함 0, 플러그인 재설치.

- `plugin/skills/cleanup/` 삭제. carve-milestone 종료 순서 둘(fitness → mark), 그 자리에 cleanup이 왜 없어졌는지 한 문단. complete: "닫힘이 곧 이동 — 기록을 먼저 끝내고 닫는 커밋이 rename을 싣는다". help 표 문구, flux 두 문장, migration-map #3에서 `--archived` 줄 제거
- spec: 03-storage "life는 작업 세트다" → "닫히면 바로 archive다"(뒤집은 이유 둘), 02-flow 표·도식·flux 절, 04-commands mark flux·milestone 종료, 05-knowledge backlog, 06-agent cleanup 행 삭제·flux 닫기, 08-delivery skill 목록
- map.md 템플릿(en)과 이 리포의 `.reap/map.md`(ko) 여섯 줄 동기화
- summary.md: 해당 없음. 독립 검증: 생략 — skill·spec 본문

## Dead Ends

- cleanup skill을 남겨 두고 "할 일 없음"으로 바꾸는 안 — 부르는 자리가 없는 skill은 목록만 늘린다. 삭제
