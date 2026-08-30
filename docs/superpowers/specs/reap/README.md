# REAP 설계

**작성일:** 2026-08-22
**상태:** 승인됨

REAP는 AI와 사람이 소프트웨어를 함께 진화시키기 위한 **규약과 도구의 집합**이다. 전작 REAP과 달리 파이프라인 실행기가 아니다.

한 문장으로: **REAP는 작업의 모양을 결정하지 않는다. 작업이 쓸 수 있는 도구와, 무엇을 어디에 저장할지에 대한 규약을 제공한다.**

## 어디서부터 읽는가

| | 무엇 | 언제 읽나 |
|---|---|---|
| [개념과 원칙](01-concepts.md) | 무엇을 만드는가, REAP에서 무엇이 바뀌는가, 두 진화 축, 일곱 원칙 | **여기부터.** 나머지는 전부 이것의 결과다 |
| [사용 흐름](02-flow.md) | 세 개의 층, 한 세션의 흐름, 지점별 개입, 무엇이 강제되지 않는가 | 부품이 실제로 어떤 순서로 움직이는지 알고 싶을 때 |
| [저장 구조와 정체성](03-storage.md) | `.reap/` 배치, 세션 바인딩과 공유 상태, id 체계 | 무엇이 어디에 저장되는지 |
| [명령 표면과 기록](04-commands.md) | `make`/`mark`/`doctor`, generation, milestone, 기록 어휘 | CLI가 무엇을 하고 무엇을 안 하는지 |
| [지식 레이어](05-knowledge.md) | plan source, idea, **코드를 아는 세 층**(index·source-map·carrier), 차용한 개념 | 지식이 어디에 어떤 성격으로 사는지 |
| [agent 층](06-agent.md) | context 조립, skill 7종, interview | agent가 REAP를 어떻게 다루는지 |
| [orchestrate와 hooks](07-orchestrate.md) | 병렬 세션 조율, 이벤트 훅 | 여러 세션이 함께 일할 때 |
| [배포와 결정](08-delivery.md) | 폐기한 것, 플러그인 배포, 기술 스택, 아직 검증 안 된 것 | 만들고 내보내는 방법 |
| [로드맵](09-roadmap.md) | 아직 자르지 않은 증분들과 각각이 검증할 주장 | 다음에 무엇을 만들지 정할 때 |

## 이 문서들은 REAP의 plan source다

REAP는 자기 자신으로 만들어진다. 이 디렉토리는 `.reap/plan/sources.yml`에 `ps-4f2a91`로 등록되어 있고, 읽고 쓰는 규약은 `.reap/plan/conventions/ps-4f2a91-reap.md`에 있다.

spec은 *무엇이 참이어야 하는가*를 말한다. *어떤 순서로 그것을 참으로 만드는가*는 [로드맵](09-roadmap.md)이 말하고, 잘라낸 것은 `.reap/vision/milestones/`의 milestone이 된다. 같은 것을 두 곳에 적으면 어긋나고, 어긋난 쪽을 구현자가 읽는다.
