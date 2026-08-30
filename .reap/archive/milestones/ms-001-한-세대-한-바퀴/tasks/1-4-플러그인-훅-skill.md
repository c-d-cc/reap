# Task 1.4 — 플러그인, 훅, skill 둘

**파일:** `plugin/.claude-plugin/plugin.json` · `plugin/hooks/{hooks.json,session-start.sh}` · `plugin/skills/{evolve,complete}/SKILL.md` · `plugin/skills/shared/references/record-vocabulary.md`

**훅은 절대 세션을 깨뜨리지 않는다.** 플러그인과 바이너리는 따로 설치되므로 **플러그인은 있는데 `reap`가 없는 상태는 정상적으로 발생한다.** 그때 훅은 아무것도 내지 않고 0으로 끝난다 — 아무것도 안 내면 아무것도 주입되지 않는다. REAP 프로젝트가 아닐 때도, `ctx`가 실패할 때도 같다. **훅이 실패해 세션 시작이 막히는 것은 REAP가 할 수 있는 가장 나쁜 일이다. 사용자는 그 순간 REAP가 원인인 줄도 모른다.**

`hooks.json`은 `${CLAUDE_PLUGIN_ROOT}`로 스크립트를 가리키고 matcher는 `startup|clear|compact`. 스크립트가 부르는 것은 `reap ctx --hook` 하나다.

**`record-vocabulary.md`** — [기록 어휘](../../../../../docs/superpowers/specs/reap/04-commands.md)의 generation 어휘 여덟 항목과 그 의미. 마지막 규칙이 문서의 요점이다: **어휘지 템플릿이 아니다.** 쓸 것만 쓰고, 없는 항목을 만들어도 되고, 순서도 없다. 빈 항목을 남기는 것은 아무것도 안 적는 것보다 나쁘다.

**`evolve`** — 세대를 연다. 훅은 genome과 상태 줄만 넣으므로 **`handoff.md`도 `decisions.md`도 아직 세션에 없다** — skill이 상태 줄의 지도를 따라 필요한 것을 읽으라고 지시한다. 그다음이 **어느 축인가**([context와 skill](../../../../../docs/superpowers/specs/reap/06-agent.md)). **두 축 모두 실행 가능하다** — `make generation`이 `--milestone`과 `--plan`을 둘 다 받는다(gen-0002-exec). 축이 정해지면 그것을 부르고 기록 어휘를 참고해 의도를 적는다.

**열린 세대가 이미 있으면 새로 열기 전에 멈춘다.** 상태 줄이 그것을 알린다.

**`complete`** — 세대를 닫는다. `decisions.md`와 `handoff.md`를 아직 안 읽었으면 먼저 읽는다. **커밋 규칙을 확인하는 것이 이 skill의 일이다**([generation](../../../../../docs/superpowers/specs/reap/04-commands.md)): `git status --porcelain`이 비어 있고 시작 커밋 이후 새 커밋이 있는가. 도구는 검사하지 않는다. 확인이 끝나면 기록을 마무리하고 `handoff.md`를 갱신한 뒤 `reap mark generation --closed`.

## 증명해야 할 동작 — 훅 스크립트를 셸에서 직접 돌려 검사한다.
- `reap`가 PATH에 없을 때 종료 코드 0, 출력 없음
- REAP 프로젝트가 아닌 디렉토리에서 종료 코드 0
- `ctx`가 실패해도 종료 코드 0
- 정상 프로젝트에서 유효한 JSON 봉투가 나온다

skill은 산문이라 단위 테스트가 없다. 대신: frontmatter의 `description`이 **언제 쓰는지**를 말하는가(무엇을 하는지가 아니라), 참조 상대 경로가 실제 파일을 가리키는가, **skill이 부르는 CLI 명령과 플래그가 실제로 존재하는가.** 마지막 것이 특히 중요하다 — 없는 플래그를 부르면 사용자 세션에서 처음 드러난다.

## 함정
- `set -e`를 켜두고 `reap`를 부르면 실패 시 훅이 통째로 죽는다.
- 플러그인 매니페스트의 `name`이 skill 주소의 접두사가 된다(`/reap:evolve`). 나중에 바꾸면 사용자가 외운 이름이 전부 깨진다.
- skill이 CLI를 부르는 관계를 뒤집지 않는다. **agent가 REAP를 다루는 통로는 skill이고, skill이 확정적인 부분에서만 CLI를 호출한다.**
