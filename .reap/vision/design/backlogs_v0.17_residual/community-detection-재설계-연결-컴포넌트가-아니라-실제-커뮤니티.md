---
type: task
status: pending
priority: low
createdAt: 2026-08-20T00:20:32.014Z
---

# community detection 재설계 — 연결 컴포넌트가 아니라 실제 커뮤니티

> gen-089 이 daemon 을 폐기하고 indexer 를 내장하면서 **의도적으로 이식하지 않은** 분석 둘 중 하나.
> 나머지 하나는 `process-tracing-재설계-...`.

## Problem

`daemon/src/indexer/community.ts` (61줄, gen-089 에서 삭제됨. 복원은 git history 에서)는
이름과 달리 **Louvain 이 아니라 연결 컴포넌트(BFS)** 였다. 그 결과가 어떤 모양이었는지는 실측돼 있다:

```
총 105개  →  573 nodes (전체 796 의 72%) 한 덩어리 + 싱글톤 97개
cohesion  →  전부 1.00
라벨      →  "src/core"
```

세 줄 모두 알고리즘의 성질이지 데이터의 성질이 아니다:

- **cohesion 은 상수다.** 연결 컴포넌트는 정의상 internal/total = 1 이다. 계산할 필요가 없는 값을
  계산해서 보여주고 있었다
- **덩어리 하나가 72%** 다. import 로 이어진 코드베이스는 대개 하나의 컴포넌트가 된다
- **라벨은 그 안에서 가장 흔한 디렉토리 이름**이다. `ls src/` 보다 정보가 적다

**그래프를 고쳐도 안 바뀐다.** gen-089 가 import 해석률을 0% → 100% 로 올렸지만
연결 컴포넌트는 edge 가 늘수록 오히려 **더 하나로 뭉친다**.

## Solution

**착수 전에 먼저 물어야 할 것: 누가 이 결과로 무엇을 하는가.**
gen-089 의 교훈이 그것이다 — daemon 의 대표 기능이 5개월간 0을 반환했는데 아무도 몰랐던 이유는
**소비자가 없어서**였다. 답이 없으면 만들지 않는 것이 옳다.

답이 있다면 방향은 셋:

| 안 | 내용 | 비용 |
|---|---|---|
| **Louvain / Leiden** | modularity 최적화. cohesion 이 실제로 변수가 된다 | 알고리즘 구현 ~150줄, 의존 0 |
| **Label propagation** | 더 단순하고 빠름. 결정론적이지 않음(seed 필요) | ~60줄 |
| **디렉토리 사전 분할 후 modularity** | 사람의 의도(디렉토리)를 사전지식으로 사용 | 가장 싸고 가장 덜 흥미로움 |

어느 쪽이든 **라벨을 어떻게 붙일지가 실제 난제**다. "가장 흔한 디렉토리"는 정보가 없고,
"가장 중심적인 심볼 이름"은 오해를 부른다 (process tracing 이 정확히 그 함정에 빠졌다).

## Files to Change

- `src/indexer/community.ts` — 신설 (삭제된 daemon 판을 참고하되 알고리즘은 교체)
- `src/cli/commands/index-cmd.ts` — `reap index communities` verb 추가
- `src/core/prompt.ts` — Code Intelligence 절에 한 줄
- `tests/unit/indexer-community.test.ts` — 신설. **cohesion 이 상수가 아님을 보이는 것이 첫 테스트다**
- `src/templates/reap-guide.md` + `.reap/reap-guide.md` + README ×5 + docs 5 로케일

## Verification

- [ ] 알려진 구조를 가진 fixture 에서 **cohesion 이 서로 다른 값**을 갖는다 (상수 1.00 이 아니다)
- [ ] 이 저장소에서 커뮤니티가 **1개가 아니다**, 그리고 각 커뮤니티가 사람이 납득할 경계다
- [ ] 라벨이 `ls src/` 보다 많은 정보를 준다 — 근거를 artifact 에 적을 것
- [ ] 착수 근거(누가 이 결과로 무엇을 하는가)가 artifact 에 적혀 있다
