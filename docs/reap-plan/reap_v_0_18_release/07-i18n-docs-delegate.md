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

- 자리: 리포의 `site/`. v0.17의 `docs/`(Vite+React 자체 prerender)를 되살리지 않는다 — v0.18 `docs/`는 spec·plan의 자리다
- 도구: **VitePress** — 마크다운 그대로, i18n 내장, 정적 출력. 배포는 `.github/workflows/docs.yml`이 GitHub Pages로(reap.cc CNAME은 v0.17 `docs/public/CNAME`의 값을 승계). **배포 워크플로는 main에서만 돈다** — v0.18이 main에 merge되기 전에는 reap.cc가 v0.17 사이트를 계속 보여준다
- 내용(한국어 먼저): 소개(한 문장·일곱 원칙 요약) · 설치 · 첫 사용(init→evolve→complete, 상태 줄) · 개념(세 층, loop·milestone·generation, 3단 저장소, map) · skill 10종(각 한 쪽 — SKILL.md를 옮겨 적지 않고 "언제·무엇을"과 링크) · CLI 레퍼런스(usage 그대로) · hooks · 코드 인덱스 · orchestrate · v0.17에서 이주 · 릴리스 노트(RELEASE_NOTES.md를 그대로 싣는다). 열두 쪽 안팎
- **사람 검수 뒤** en(그리고 ja·zh-CN·de)로 확장 — 그 확장은 이 milestone 밖이다. ms-021(en 전환) 뒤에 en 문서가 나와야 CLI 출력 예시가 맞는다
- 규범을 옮겨 적지 않는다 — spec 문장을 복제하면 어긋난다. 사이트는 "쓰는 법"이고 spec은 "무엇이 참인가"다

## G11 — 테스트 비공개 (ms-023)

- `c-d-cc/reap-test`에 `v0.18` 브랜치: 이 리포 `tests/`의 내용을 그대로. 리포의 `tests/`는 submodule로 교체(`.gitmodules` url `https://github.com/c-d-cc/reap-test.git`, branch `v0.18`)
- CI: v0.17 `ci.yml`의 dispatch 패턴(`TEST_DISPATCH_TOKEN`, `reap-push` 이벤트, `tests_sha` 전달)을 v0.18에 맞게 — reap-test 쪽 워크플로가 `v0.18` 브랜치를 체크아웃해 `bun test`·`hook.test.sh`·`verify-package.sh`를 돈다. reap-test 쪽 워크플로 파일도 이 milestone이 쓴다(그 리포 v0.18 브랜치에)
- **push는 사람** — submodule 포인터는 push된 커밋만 가리킬 수 있으므로, 이 milestone은 로컬 클론(`~/cdws/reap_v17/tests`의 remote)에 브랜치·커밋을 만들고 리포에는 submodule 설정까지 준비한다. 사람이 reap-test를 push한 뒤 포인터가 살아난다. 그 전까지 `bun test`는 submodule 디렉토리(로컬 체크아웃)에서 그대로 돈다
- 개발 마찰([[feedback_submodule_pointer_staging]]): completion 전 `git add tests`. `complete` skill에 한 줄 — "tests가 submodule이면 포인터도 stage"
