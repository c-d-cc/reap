---
id: gen-0108-exec
slug: milestone-sizing-guard
type: exec
backlog: bk-8adfd0
title: milestone 과잉 분할을 제품에서 막는다 — evolve·carve-milestone·loop 본문, doctor 참고
startedAt: 2026-09-05T02:29:33Z
startCommit: 2e2a9f6
status: closed
closedAt: 2026-09-05T02:32:26Z
endCommit: e7bd945
---

## Intent

사람(2026-09-05): "lessons에만 담으면 이 리포에서만 쓰인다 — 제품 자체에 반영해야 한다." ms-025~027 과잉 분할의 원인("사람 검토가 필요한 방향 변경 → milestone")을 REAP를 쓰는 모든 프로젝트가 받는 자리에 막는다.

- evolve 근거 표: "아직 안 적혀 있다 → milestone" 행을 세대 수로 가르고, "안 적혀 있다"와 "사람 검토가 필요하다"가 milestone의 이유가 아님을 명시
- carve-milestone: When not to call·Size 절에 같은 규칙
- loop: 닫을 때 산출물이 세대 하나짜리면 backlog 항목(`--from <loop-id>`)으로, milestone 없이 닫는다
- doctor 참고 `milestone_single_generation`: 닫힌 milestone에 세대가 하나 이하면 사후 신호. 결정적이라 스크립트
- 사이트: carve 페이지 sizeNote 한 문장, doctor 페이지 참고 표 한 행

bk-8adfd0. 세대 하나.

## References

- lessons.md "사람 검토가 필요한 변경은 milestone의 이유가 아니다"(2e2a9f6) — 이 세대가 그것을 제품으로 옮긴다
- plugin/skills/carve-milestone/SKILL.md "Size" — 이미 있던 하한 규칙

## Outcome

commit e7bd945(주 트리)·tests 0de80cd. bun test 236 통과(doctor 1 추가), typecheck, plugin-skills·docs-surface ok, 플러그인 재설치.

- evolve 근거 표: "아직 안 적혀 있다 → milestone"을 세대 수로 두 행으로 갈랐고, "안 적혀 있다"·"사람 검토가 필요하다"가 이유가 아님을 표 위에 명시
- carve-milestone: When not to call에 "검토만이 이유면 자르지 않는다", Size에 "사람이 필요한 결정은 세대 수를 바꾸지 않는다"
- loop: 닫기 표에 "세대 하나짜리 산출물 → backlog 항목(--from)", milestone 없이 닫는 경우의 Outcome 기록
- doctor: `milestone_single_generation` 참고 — 닫힌 milestone 중 세대 ≤1을 **한 줄로** 모은다(이 리포에 ms-005·008·009·011·016·020 여섯 — 규칙이 이 리포에서 여섯 번 깨졌다는 실측). en·ko 카탈로그, 사이트 doctor 참고 표 한 행, carve 페이지 sizeNote 한 문장
- summary.md: 해당 없음. 독립 검증: 생략 — skill 본문·doctor 참고 한 줄·문서

## Dead Ends

- doctor가 milestone마다 한 줄씩 내는 안 — 닫힌 milestone은 archive에 영원히 남아 이력만큼 참고가 길어진다. 한 줄로 모았다
- 닫힌 milestone을 backlog로 되감는 안 — 세대 기록이 milestone id를 참조한다. 되감지 않고 사후 신호로만
