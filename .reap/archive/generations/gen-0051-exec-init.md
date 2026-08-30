---
id: gen-0051-exec
slug: init
type: exec
milestone: ms-007
title: init skill — 정본 지식을 세우는 절차
startedAt: 2026-08-30T14:45:33Z
startCommit: 869c84c
status: closed
closedAt: 2026-08-30T14:47:48Z
endCommit: 2c54d50
---
## Intent

`ms-007` 7.2 `init` skill + 7.3의 나머지(`init`→`interview`·`carve-milestone`·`loop`) + 씨앗 판정(7.4).

## Outcome

- **`reap init --check`** — 씨앗 그대로인 지식 파일을 번들 템플릿과 비교해 **보고만** 한다. `ms-007`의 Open Question(씨앗 판정을 CLI가 하는가)에 답했다 — `doctor`를 기다리지 않았다. 테스트 둘
- **`plugin/skills/init/SKILL.md`** — 진입 조건 셋(`--check`로 가른다) → 첫 loop를 연다 → 탐색(여섯, 소스 파일 제외, `CLAUDE.md`는 읽되 보고만) → 질문지(plan source → summary → application → evolution 순, 각 물음에 "코드가 답하나"와 쓰는 자리) → `interview` → `carve-milestone` → `--check`·`ctx`로 확인. **묻는 법 문장 0줄**
- `06-agent.md`·`04-commands.md`에 `--check`. `summary.md` skill 7종
- `localUpdate` — 캐시 diff 없음. 이 리포에서 `init --check`는 `map.md`만 보고한다(씨앗 그대로가 정상)

## Notes

cold start 왕복은 돌리지 않았다 — 사람 결정(`ms-007` 본문). `init` skill은 한 번도 실행되지 않은 채 배포된다. 첫 실사용이 곧 검증이다.
