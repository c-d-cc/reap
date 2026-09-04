# delegate brief — {{gen-id}}

## 읽을 것 (이 순서로)

1. `.reap/genome/*.md`
2. `{{milestone.md 경로}}`
3. `{{task 경로}}`
4. `.reap/life/generations/{{gen-id}}-*.md` — 이 세대의 Intent
5. {{그 밖에 이번 일에 필요한 것 — 경로로만}}

## 범위

{{이 세대의 Intent 그대로. 순서를 바꾸거나 쪼개도 된다}}

## 작업 트리

`{{worktree 또는 리포 경로}}` (절대 경로). **이 밖은 건드리지 않는다.**

## 규율

- 절대 경로를 쓴다. 이 트리 밖 디렉토리는 불가침이다
- `reap make`·`reap mark`를 부르지 않는다 — id 발급과 세션 바인딩은 주 세션의 것이다
- `.reap/`는 이 세대의 기록 파일과(milestone에 속하면) `handoff.md`만 건드린다. 그 밖은 불가침이다
- 테스트를 먼저 쓴다 — 구현 전에 실패하는 테스트
- 검증 명령은 파이프에 넣지 않는다. exit code를 직접 받는다
- 소스를 고쳤으면 다시 빌드한다. 되돌린 뒤에도 마찬가지다
- 주석에 "왜 이렇게 생겼는지"를 적지 않는다
- 커밋은 의미 단위로 나눈다. 메시지는 한국어로, 무엇을 왜 바꿨는지
- `git push`·`git rebase`·`git commit --amend`를 하지 않는다

## 끝나면

- 세대 기록에 `## Outcome`(무엇을 했고 무엇이 남았는지)을 적는다. 접은 접근이 있으면 `## Dead Ends`도
- **세대를 닫지 않는다** — `mark generation --closed`를 부르지 않는다. 검토와 닫기는 주 세션의 일이다
- `git status --porcelain`이 빈 채로 끝난다

## 보고

- 만든 커밋 해시 목록
- 테스트: 몇 개 통과·실패
- 남은 것 — Intent 중 안 한 것, 다음 세션이 볼 것
