# G9~G12 — 사람의 방향 답에서 온 넷 (2026-09-04)

## G12 — evolve 위임 모드 (ms-020)

v0.17 `/reap.evolve`의 값 — 주 세션의 컨텍스트를 보호하고 세대를 subagent가 수행 — 을 v0.18 `evolve`에 **선택지**로 들인다. 기본은 지금처럼 주 세션이 직접 일한다.

무엇이 참이어야 하는가:
- `evolve`가 세대를 연 뒤 **"직접 할 것인가, 위임할 것인가"**를 판단한다. 위임 신호: 세대가 여러 파일·긴 탐색을 요구해 주 세션의 맥락을 채울 것 같을 때, 사람이 위임을 요청했을 때, 병렬로 둘 이상을 굴릴 때
- 위임하면 주 세션은 **Intent를 적고**, subagent에게 **brief**를 준다 — brief는 skill이 `references/delegate-brief.md`로 갖는 템플릿이다: 읽을 것(genome·milestone·task·세대 기록), 규율(테스트 먼저·커밋 규칙·`make`로 id 발급 금지·`.reap/` 다른 파일 불가침·push 금지), 끝낼 때(Outcome·Dead Ends를 세대 기록에, 닫지 않는다), 보고 형식
- subagent는 **같은 작업 트리**에서 일한다 — `.session` 바인딩은 주 세션의 것이고 subagent는 `make generation`을 부르지 않으므로 충돌이 없다. 병렬이면 worktree로 가르고 주 트리가 id를 발급한다(orchestrate skill·lessons)
- 주 세션이 결과를 **검토**(diff·테스트 실행)한 뒤 `complete`로 닫는다. subagent가 닫지 않는다 — 커밋 규칙 확인은 주 세션의 판단이다
- spec 06-agent의 evolve 절에 "위임"이 판단 항목으로 들어간다. "REAP는 여기서부터 관여하지 않는다"는 유지된다 — 위임은 관여가 아니라 실행 형태의 선택이다

이 loop 자체가 이 모드로 돌았다(gen-0076~0082 전부 subagent 수행, 주 세션 검토·merge·닫기). brief 템플릿은 그 지시문에서 추린다.

## G9 — en 기본, ko 번역 층 (ms-021)

무엇이 참이어야 하는가:
- **CLI**: 사용자에게 보이는 문자열이 메시지 카탈로그(`src/i18n.ts` 또는 `src/messages/{en,ko}.ts`)에서 나온다. 키는 안정된 식별자, 기본 en, `config.language`(`.reap/config.yml`)가 ko면 ko. `.reap/`이 없을 때(`init` 전, 에러)는 `REAP_LANG` 환경변수 → 없으면 en. 카탈로그에 없는 키는 **테스트가 잡는다**(en·ko 키 집합 동일)
- **테스트**: 문자열 단언은 카탈로그 키를 거치거나 en 문자열로. 한국어 리터럴 단언을 남기지 않는다
- **skill 10종·record-vocabulary·map.md 씨앗·템플릿**: 본문을 en으로. agent는 `ctx`의 `응답 언어` 줄(이제 `Response language: ko`)로 사용자 언어로 답한다 — skill 본문 번역판은 두지 않는다(어긋남의 자리). 한국어 사용자에게 보이는 것은 agent의 답이지 skill 본문이 아니다
- **씨앗(genome 템플릿·map.md·environment-summary)**: en. 단 이 리포의 `.reap/` 실물(한국어로 쓰인 genome·map)은 **사용자 문서**이므로 건드리지 않는다
- **README**: `README.md` en, `README.ko.md` ko. RELEASE_NOTES en(ko 절은 두지 않는다 — v0.17도 en 하나였다)
- **genome/application.md**의 "사용자에게 보이는 문자열은 한국어"를 "en이 기본, ko는 카탈로그"로. 커밋 메시지는 한국어 유지(사람 결정 없음 → 유지)
- 0.17.8 릴리스 노트의 "v0.18은 한국어 전용" 문장을 지운다(ms-019 task 3 산출물 수정)

크기: 문자열이 `src/cli.ts`·`entries.ts`·`doctor.ts`·`store.ts`·`plan.ts`·`orch.ts`·`index/`·`carrier.ts`·`ctx.ts`에 흩어져 있다. 세대 셋 안팎 — ① 카탈로그와 CLI 전환 + 테스트 ② skill·어휘·템플릿 en ③ README·노트·genome.

## G10 — 문서 사이트 (ms-022)

**사람 검수(2026-09-04): 기존 reap.cc의 디자인·톤을 그대로 유지하고 내용만 v0.18로 바꾼다.** 첫 시도(VitePress 새 사이트, gen-0085·0088)는 기각됐다 — "새 사이트"는 새 도구가 아니라 새 내용이었다.

- 자리: 리포의 `site/`. v0.17 `docs/` 앱(Vite+React+Tailwind, `components/`·`DocLayout`·`DocPage`·`AppSidebar`·`HeroPage`·i18n 5로케일·`scripts/prerender.mjs`·`docs.yml`)을 **그대로 옮기고** 페이지 세트와 번역 내용만 v0.18로. 디자인 토큰·컴포넌트·CSS는 손대지 않는다
- 페이지: 홈(Hero) · 소개 · 설치 · 첫 사용 · 개념 · skill · CLI · hooks · 코드 인덱스 · orchestrate · v0.17에서 이주 · 릴리스 노트 — 열둘. v0.17 전용 페이지(lifecycle·lineage·merge·cruise·vision 등)는 지운다
- 번역 구조는 v0.17과 같이 `translations/<locale>.ts`. **ko 먼저** — 검수 전까지 로케일 목록을 ko 하나로 두고 prerender도 ko만. 검수 뒤 en → ja·zh-CN·de
- 배포: v0.17 `docs.yml`(typecheck·build·prerender 검사·Pages) 승계, `main`에서만. CNAME `reap.cc`
- 규범을 옮겨 적지 않는다 — spec 문장 복제 금지. 한 페이지가 화면 두 장을 넘으면 옮겨 적고 있는 것이다

**목차 (사람 확정, 2026-09-04)** — v0.17(23쪽, 실행 파이프라인 중심)을 참고하되 **Plan과 Execution을 대등한 축**으로, **agent의 자율 evolve**를 앞세운다. 핵심 개념(Genome·Environment·Vision·Backlog·Hooks·Code Intelligence·협업·레퍼런스)은 자리를 바꿔 유지. 8묶음 28쪽:

| 묶음 | 쪽 |
|---|---|
| 시작하기 | 소개 · 빠른 시작 · **자율 진화 흐름**(세션이 열리면 무슨 일이 일어나는가) · v0.18에서 바뀐 것 |
| 핵심 개념 | 두 축 · 판단·확정·사실 · 저장 구조 |
| Plan 축 | Loop · Plan Source · Idea와 Research · Milestone 자르기 |
| Execution 축 | Generation · 위임 모드 · Backlog · Milestone 닫기와 Fitness |
| 지식 | Genome · Environment · Vision과 Memory · Code Intelligence |
| 협업 | Orchestrate · Claim과 Barrier · Hooks |
| 레퍼런스 | Skill 레퍼런스 · CLI 레퍼런스 · 설정 · Doctor |
| 기타 | 비교 · v0.17에서 이주 · 릴리즈 노트 |

**문체·홈**: 사용자 문서는 reap.cc/ko 톤(합니다체·완결 문장·사용자 관점·영문 고유명사). 홈은 v0.17 홈의 구성과 메시지 그대로(tagline "Recursive Evolutionary Autonomous Pipeline", 왜 REAP인가 5쌍, 구조, 작업 흐름, 설치, 핵심 개념, 문서 링크)에서 v0.18 사실만 교체. spec 문장을 제품 키워드로 쓰지 않는다. **큰 그림은 두 축이다** — Plan 축(loop가 plan을 개선)과 Execution 축(plan을 milestone으로 쪼개 generation으로 진행), 만나는 지점은 carve. 선형 `loop→milestone→generation→complete`로 그리지 않는다(complete는 세대 안의 일). 사용자 문구는 "plan source"가 아니라 "plan" — 등록부 용어는 CLI 레퍼런스·Plan Source 페이지에서만. 쓰는 순서: 홈+시작하기 → 핵심 개념+Plan 축 → Execution 축+지식 → 협업+레퍼런스+기타, 묶음마다 사람 검수.

## G11 — 테스트 비공개 (ms-023)

- `c-d-cc/reap-test`에 `v0.18` 브랜치: 이 리포 `tests/`의 내용을 그대로. 리포의 `tests/`는 submodule로 교체(`.gitmodules` url `https://github.com/c-d-cc/reap-test.git`, branch `v0.18`)
- CI: v0.17 `ci.yml`의 dispatch 패턴(`TEST_DISPATCH_TOKEN`, `reap-push` 이벤트, `tests_sha` 전달)을 v0.18에 맞게 — reap-test 쪽 워크플로가 `v0.18` 브랜치를 체크아웃해 `bun test`·`hook.test.sh`·`verify-package.sh`를 돈다. reap-test 쪽 워크플로 파일도 이 milestone이 쓴다(그 리포 v0.18 브랜치에)
- **push는 사람** — submodule 포인터는 push된 커밋만 가리킬 수 있으므로, 이 milestone은 로컬 클론(`~/cdws/reap_v17/tests`의 remote)에 브랜치·커밋을 만들고 리포에는 submodule 설정까지 준비한다. 사람이 reap-test를 push한 뒤 포인터가 살아난다. 그 전까지 `bun test`는 submodule 디렉토리(로컬 체크아웃)에서 그대로 돈다
- 개발 마찰([[feedback_submodule_pointer_staging]]): completion 전 `git add tests`. `complete` skill에 한 줄 — "tests가 submodule이면 포인터도 stage"
