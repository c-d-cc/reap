---
id: ms-027
slug: revive-three
title: v0.17에서 빠진 셋 복원 — help skill, environment 갱신 절, 닫기 전 독립 검증
from: loop-0004-plan
status: closed
openedAt: 2026-09-05T02:04:22Z
closedAt: 2026-09-05T02:40:12Z
---
## Background

사람 판단(2026-09-05): v0.17에서 빠진 것 가운데 셋은 삭제가 잘못됐다 — `/reap.help`(사용자가 세션 안에서 "지금 뭘 할 수 있나"를 물을 통로), `/reap.knowledge`의 절반(코드가 크게 바뀐 뒤 `environment/summary.md`를 다시 쓰는 판단), `reap-evaluate`(닫기 전 독립된 눈의 검증). cruise는 보류(idea/research idea-cruise-revival). 01-gap은 셋을 "README + skill 본문"·"init + 직접 편집"·"orchestrate의 한 사용 사례"로 흡수했지만 실제로는 그 자리에 판단 절차가 없었다.

## Exit Criteria

- `plugin/skills/help/SKILL.md`(사용자가 부름): 상태 줄을 다시 보여 주고, 사람이 부르는 skill과 agent만 부르는 skill을 한 화면으로 설명하고, 지금 상태에서 다음 행동을 제안한다. skill 11종, 메뉴 8종 — README·사이트·`setup.done`·plugin-skills 검사·docs-surface 게이트가 그 수를 말한다
- `complete`에 "environment/summary.md가 낡았는가" 절 — 이 세대가 summary가 서술하는 것(구조·의존·빌드/테스트 명령·진입점)을 바꿨으면 닫기 전에 다시 쓴다. 판단 기준이 표로 있다. init §3.2가 "처음 쓰는 법"의 정본이고 complete는 그것을 가리킨다
- `complete`에 "닫기 전 독립 검증" 절 + `references/verify-brief.md` — 동작을 바꾼 세대는 새 subagent가 Intent·diff·테스트를 대조해 보고하고, 주 세션이 판단한다. 검증자는 편집하지 않는다. 문서·기록만 바꾼 세대는 건너뛴다
- 01-gap·README "What v0.18 drops"·RELEASE_NOTES·사이트(v018change 표·releaseNotes removed)가 셋의 새 자리를 말한다

## Out of Scope

- cruise — idea-cruise-revival
- 검증을 doctor로 자동화 — 판단이라 스크립트가 아니다

## Plan Items

1. help skill + 수 갱신 (tasks/1)
2. complete의 두 절 + verify-brief (tasks/2)
3. 문서 정합 (tasks/3)

## 이 milestone이 끝나면 물어볼 것

- `/reap:help`를 실제로 불러 보니 다음 행동 제안이 맞았는가
- 독립 검증이 실제 세대에서 잡아낸 것이 있었는가 — 없다면 비용만 든 것

## Fitness (사람, 2026-09-05)

"닫자." — `/reap:help`를 두 번 실제로 불러 출력 형식을 고쳤고(9e2ed86), 제안이 맞는 것을 사람이 확인. 물어볼 것 둘째("독립 검증이 실제 세대에서 잡아낸 것이 있었는가")는 아직 동작을 바꾼 세대의 complete가 돌지 않아 답 없음 → `idea/research/`가 아니라 다음 코드 변경 세대의 Outcome이 답한다. 그때까지 열어 둘 질문이 아니다.

크기 소급: 세대 하나(gen-0107). backlog 항목이면 충분했다.
