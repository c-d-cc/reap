# 4 — 핵심 개념 3 + Plan 축 4

사람 검수(2026-09-05): 첫 묶음(홈·시작하기) 승인. 같은 톤·같은 규칙으로.

| 라우트 | 쪽 | 담을 것 | v0.17 골격 참고 |
|---|---|---|---|
| /docs/two-axes | 두 축 | Plan 축(loop가 plan을 개선)과 Execution 축(milestone으로 잘라 generation으로 진행)이 왜 대등한가, 만나는 지점(carve), 각 축의 사이클이 어떻게 따로 도는가(loop는 여러 세션·여럿 병렬, generation은 세션 바인딩·하나) | CoreConceptsPage의 개념 표 형식 |
| /docs/three-layers | 판단·확정·사실 | skill이 판단, CLI가 확정(id·frontmatter·바인딩·선점), git이 사실. 왜 CLI가 흐름을 막지 않는가(게이트 없음), doctor가 사후에 보는 것 | CoreConceptsPage |
| /docs/storage | 저장 구조 | `.reap/` 전체 트리(실물), 3단(vision·life·archive)을 가르는 것은 시간, plan·genome·environment·idea는 그 밖, map.md, .session·.index는 gitignore | v0.17 LineagePage/EnvironmentPage의 트리 표현 |
| /docs/loop | Loop | 유형 넷, 열고 잇고 닫기, Question·Dialogue·Dead Ends·Outcome, 닫히는 조건(산출물이 자리를 찾음), 열린 채 두는 것이 정상, `make loop`·`mark loop` | LifecyclePage의 절 구성(단계별 설명) |
| /docs/plan-source | Plan | 제목은 "Plan". 기획 문서를 어디에 두든 등록(`make plan-source`)하고 규약(conventions)으로 읽고 쓰는 법, 인용(`--ref`), 규약을 되먹이는 것, 소비 완료 표시, 등록부(sources.yml)는 여기서만 설명 | VisionPage |
| /docs/idea | Idea와 Research | research·freememo·files 셋, 졸업 조건, doctor가 보는 것, `make idea`·`mark idea` | BacklogPage 형식 |
| /docs/carve-milestone | Milestone 자르기 | 전제를 실제 흔적에 대보기, 크기(task 넷 안팎·세대 여섯에서 열, 단일 세대면 backlog), Exit Criteria·Out of Scope·Background·Plan Items·Constraints·Open Questions, fitness 질문을 미리 쓰기, `make milestone --focus`, 계획에서 내리기 | LifecyclePage planning 절 |

규칙: 합니다체·완결 문장·영문 고유명사, "plan source" 대신 "plan"(등록부는 Plan 쪽에서만), 큰 그림은 두 축, 규범 복제 금지, 분량은 v0.17 대응 쪽과 비슷하게, 명령 예시는 실제 usage에서.
