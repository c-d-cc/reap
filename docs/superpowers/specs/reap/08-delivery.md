# 배포와 결정

## 폐기하는 것


| 폐기 | 이유 |
|---|---|
| 5단계 고정 lifecycle, 서명 잠금, 단계 회귀 | REAP의 존재 이유 자체가 이것을 없애는 것 |
| 흐름 제어 명령 (`start`/`next`/`back`/`close`/`gate`) | 흐름은 판단이고 판단은 skill의 것 |
| maturity / cruise 모드 | 자율이 기본값이 되면 "자율을 N세대 미리 승인"이 무의미 |
| merge lifecycle (분산 병합) | orchestrate가 이 자리를 대체 |
| evaluator agent (별도 기능으로서) | orchestrate의 한 사용 사례일 뿐 |
| lineage 2단계 압축 | 비대해지기 전에 만든 장치. 실제로 아플 때 다시 넣는다 |
| 클라이언트 어댑터 | 호스트가 우리 매니페스트를 읽으면 그대로 얹고, 안 읽으면 만들지 않는다 |
| code index (tree-sitter) | v1 제외. 독립 서브시스템이라 나중에 이식 |
| migration instruction layer | REAP가 진화하기 시작한 뒤 필요 |

## 클라이언트 통합


REAP는 **Claude Code와 Codex 둘을 지원한다.** 그런데 이것은 어댑터로 이룬 것이 아니다 — **codex가 우리 매니페스트를 그대로 읽는다.** `.claude-plugin/marketplace.json`과 `.claude-plugin/plugin.json`을 `codex plugin marketplace add`·`codex plugin add`가 바꿀 것 없이 받고, skill 열 종이 `reap:evolve` 꼴 그대로 모델 앞에 놓인다(flux-0005 실측, codex 0.145.0).

**그러므로 어댑터 계층을 만들지 않는다.** 두 어댑터를 유지하느라 모든 기능을 두 번 만드는 일은 REAP이 이미 겪었고, 여기서는 그 대가를 치를 이유가 없다. 없는 차이를 추상화가 만들어낸다. 호스트 차이는 아래 셋뿐이고, 전부 좁은 자리에 갇혀 있다.

| 차이 | Claude Code | Codex | 어디에 갇히는가 |
|---|---|---|---|
| 설치 명령 | `claude plugin install <p> -y` | `codex plugin add <p>` | `setup` |
| SessionStart 훅 | 플러그인의 `hooks/hooks.json`이 선언하고 클라이언트가 등록 | **플러그인 훅을 실행하지 않는다** (`plugin_hooks` 기능이 제거됐다). 사용자 훅 `~/.codex/hooks.json`만 돈다 | `setup` |
| skill 호출 | `/reap:evolve` — 사람이 부른다 | 목록에 올라가고 **모델이 고른다**. 슬래시 표면이 아니다 | skill 본문 |

**훅의 출력 계약은 두 호스트가 같다** — `hookSpecificOutput.additionalContext`. 갈리는 것은 **어디에 등록하는가** 하나다. Claude Code에서는 플러그인의 `hooks/hooks.json`이 선언하고, codex에서는 `setup`이 사용자 훅 파일에 `reap ctx --hook`을 직접 건다(codex CLI에서 실제로 주입되는 것을 gen-0121에서 확인했다).

**codex 쪽 훅은 스크립트가 아니라 명령을 건다.** 설치된 `session-start.sh`의 절대경로에는 버전이 박히고(`…/reap/0.18.0/hooks/…`) 다음 릴리스에서 죽은 경로가 된다. `ctx --hook`은 REAP 리포가 아닌 곳에서 빈 출력과 exit 0으로 끝나므로 그대로 걸어도 안전하다.

**codex의 홈은 `CODEX_HOME`이 정한다.** 없을 때만 `~/.codex`다. 이것을 가정하면 남의 설정을 엉뚱한 곳에 쓴다.

**설치된 것과 목록에 보이는 것은 다르다.** Codex 설치 판정은 `plugin list --json`의 `installed` 배열과 `installed`·`enabled`를 확인한다. 미설치 항목과 비활성 항목을 성공으로 보고하지 않는다. 활성 개발 플러그인이 있으면 원격 등록은 생략하며, 원격 등록·설치가 실패해도 독립적인 사용자 훅 등록은 진행한다. `init`·`doctor`는 현재 세션의 호스트를 먼저 본다 — Claude에만 설치된 것으로 Codex의 미설치를 가리지 않는다.

**개발 설치도 두 호스트를 갱신한다.** `scripts/local-install.sh`가 CLI를 빌드·링크하고 같은 로컬 `reap-dev` 마켓플레이스를 있는 호스트 모두에 설치한다. Codex 캐시는 제거·재설치로 갱신하고 `setup`으로 훅을 건다. 릴리스 전 작업 트리 검증 경로이며 원격 배포가 완료됐다는 증거는 아니다.

**Codex의 훅 등록과 신뢰는 별개다.** 새 훅이 검토 대상으로 표시되면 사용자가 `/hooks`에서 정확한 `reap ctx --hook` 정의를 검토·신뢰해야 한다. REAP는 신뢰 해시를 대신 쓰지 않는다. 기본 2,500토큰을 넘는 출력은 Codex가 전체를 파일에 보관하고 경로와 요약을 주입할 수 있다([공식 훅 문서](https://learn.chatgpt.com/docs/hooks)).

**Codex 앱은 `setup` 뒤에 한 번 재시작해야 한다.** CLI는 매 세션이 훅 파일을 새로 읽지만, 떠 있는 앱은 새 대화를 열어도 기존 훅 목록을 쓴다 — 재시작 전 앱에서는 주입이 없고 재시작 뒤에는 CLI와 똑같이 들어온다(gen-0121 실측). `setup`의 끝말이 이것을 알려야 한다.

**orchestrate는 Claude Code에서만 산다.** `claude agents` 로스터와 `SendMessage`에 기대기 때문이다. 이것을 codex에서 흉내 내지 않는다 — 없는 표면을 감싸면 조용히 어긋난다. 그 skill은 자기가 어느 호스트를 요구하는지 본문에서 말한다.

### 배포물은 둘이고 서로 독립적이다

| 산출물 | 무엇 | 어떻게 설치되나 |
|---|---|---|
| **바이너리** | `reap` 실행 파일 | brew / curl |
| **플러그인** | skill과 SessionStart 훅 | 호스트의 플러그인 설치 — `claude plugin` 또는 `codex plugin`. `setup`이 있는 호스트를 감지해 전부 건다 |

```
plugin/
  .claude-plugin/plugin.json      name: reap, version, description
  skills/
    evolve/SKILL.md
    complete/SKILL.md
    carve-milestone/SKILL.md
    orchestrate/SKILL.md
    interview/SKILL.md
    init/SKILL.md
    report-issue/SKILL.md
    flux/SKILL.md
    shared/references/
      record-vocabulary.md      세대 어휘와 milestone 어휘를 한 파일에
  hooks/hooks.json                SessionStart -> reap ctx --hook
```

### 마켓플레이스는 이 리포에 없다

**플러그인 레포에 `marketplace.json`을 두지 않는다.** 마켓플레이스는 `c-d-cc/plugins`(`ctod-plugins`) 하나다. 양쪽에 manifest가 있으면 같은 플러그인이 두 마켓플레이스에서 보이고 사용자가 어느 쪽을 설치했는지 알 수 없다.

**그 리포는 플러그인 파일을 직접 싣는다 — submodule이 아니다.** codex는 Git 마켓플레이스를 `clone --filter=blob:none --no-checkout` + `sparse-checkout`으로 받고 submodule을 가져오지 않는다(gen-0121 실측: `plugins/<name>/`이 빈 디렉토리로 남고, 마켓플레이스 목록에는 플러그인이 멀쩡히 보인다). **실체 없는 설치가 성공으로 보고되는 것**이 submodule의 실제 비용이다. 그래서 릴리스가 이 리포의 `plugin/`을 마켓플레이스 리포로 복사해 넣는다. 복사본이 원본과 어긋나는 것은 릴리스 절차가 막는다 — 사람이 손으로 맞추는 자리가 아니다.

**기획 플러그인은 따로 없다.** 한때 `reap-plan`을 형제로 두려 했으나(`gen-0045`) `flux-0001`이 되돌렸다 — 기획은 REAP의 `flux` skill이 쓴다.

**마켓플레이스도 하나면 된다.** `codex plugin marketplace add`가 `owner/repo`와 `.claude-plugin/marketplace.json`을 그대로 받으므로, 두 호스트가 같은 `c-d-cc/plugins`를 읽는다. codex 전용 사본을 만들면 같은 플러그인이 두 곳에서 보이고 어느 쪽이 최신인지 아무도 모른다.

**배포된 마켓플레이스는 릴리스된 것만 싣는다.** 그래서 개발 루프에는 못 쓰고, 작업 트리를 그대로 싣는 로컬 마켓플레이스가 따로 필요하다. 마켓플레이스 항목의 `source`는 **그 마켓플레이스 디렉토리 안쪽만** 가리킬 수 있으므로(절대경로·`../` 둘 다 거부된다) 로컬 쪽은 심링크를 쓴다.

**설정 파일을 건드리는 자리는 `setup` 하나뿐이다.** 원칙은 그대로다 — 남의 설정을 기계적으로 고치는 것은 되돌리기 어렵고, 플러그인이 훅을 선언할 수 있는 호스트에서는 REAP가 설정 파일에 손댈 이유가 없다. Claude Code가 그렇다.

**Codex에서는 그 길이 막혀 있다.** 플러그인 훅 기능이 제거됐으므로, 상태 줄을 넣으려면 사용자 훅 파일(`~/.codex/hooks.json`)에 REAP 항목이 들어가야 한다. 사람은 "상태 줄이 두 호스트에서 똑같이 동작한다"를 택했고(flux-0005), 그래서 `setup`이 그 항목을 쓴다. `invariants.md`가 이 예외를 담도록 갱신됐다.

**넣는 주체가 빼는 주체다.** `setup --remove`가 `setup`이 건 것을 되돌린다 — 플러그인과, 있다면 훅 항목까지. 플러그인만 지우면 훅 항목이 고아로 남기 때문이다. 이것이 예전의 "`install`도 `uninstall`도 없다"를 대신한다. 다만 **`setup`이 넣지 않은 것은 건드리지 않는다** — 사용자 훅 파일에는 남의 항목이 함께 산다.

**별도의 command 파일을 두지 않는다.** Claude Code에서 플러그인의 skill은 `/reap:evolve` 형태로 직접 불린다 — 거기서는 skill이 곧 slash command다. Codex에서는 아니다: skill이 목록으로 모델 앞에 놓이고 모델이 고른다. **어느 쪽이든 원본은 `SKILL.md` 하나여야 한다.** 같은 내용이 두 곳에 있으면 어긋나고, 어긋난 쪽을 사용자가 본다. skill 디렉토리 이름에 `reap-` 접두사를 붙이지 않는 것도 같은 이유다 — 플러그인 이름이 두 호스트 모두에서 이미 그 역할을 한다.

**그래서 skill 본문은 사람이 슬래시를 쳤다고 전제하지 않는다.** 호출된 경로를 묻지 말고, 필요한 것을 스스로 확인한다 — 상태 줄이 없으면 `reap ctx`를 직접 부르는 것이 그 예다.

### 두 산출물이 어긋날 수 있다는 것을 전제한다

플러그인과 바이너리는 따로 설치되고 따로 갱신되므로, **플러그인은 있는데 바이너리가 없는 상태가 정상적으로 발생한다.** 호스트가 둘이 되면 어긋나는 방향이 하나 더 는다 — 한 호스트에만 걸린 상태, 그리고 `setup` 이후에 새 호스트를 깐 상태. `setup`은 재실행이 안전해야 하고, 다시 부르면 빠진 쪽만 채운다. SessionStart 훅은 이 경우 세션을 깨뜨리지 않고, `reap`를 찾을 수 없다는 사실과 설치 방법을 알린 뒤 조용히 끝나야 한다. 훅이 실패해 세션 시작이 막히는 것은 REAP가 할 수 있는 가장 나쁜 일이다.

skill도 마찬가지다. skill이 지시하는 CLI 호출이 실패하면 그것을 감추지 말고 사용자에게 알린다.

**훅의 타임아웃은 `hooks.json`이 선언하고 스크립트는 시간을 재지 않는다.** 훅 스크립트는 `reap`가 없거나 실패하는 것을 전부 `exit 0`으로 흘려보낼 수 있지만, **응답하지 않는 것은 흘려보낼 수 없다** — `exit`할 주체가 아직 안 돌아왔기 때문이다. 스크립트 안에서 `timeout`을 쓰면 그 명령이 없는 환경에서 훅 자체가 깨지고, 그것은 세션 시작을 막는 것과 같다(`genome/invariants.md`). 끊는 일은 클라이언트에게 맡긴다.

## 기술 스택과 배포


- **언어:** TypeScript
- **런타임/테스트:** Bun (`bun test`)
- **배포:** `bun build --compile`로 만든 **단일 바이너리**. brew / curl 설치. npm 배포는 선택.

단일 바이너리를 택한 이유는 npm이 설치 스크립트를 차단하는 문제(npm 12부터 기본)를 원천적으로 피하기 위해서다. REAP은 이 때문에 매 명령마다 설치 상태를 확인하고 필요하면 재설치하는 로직을 유지해야 했다.

## 구현 중 검증할 것


**idle 대화형 세션의 메시지 수신 시점.** 사람의 입력을 기다리며 idle 상태인 세션에 `SendMessage`를 보냈을 때 즉시 처리되는지, 다음 사람 입력까지 대기하는지 확인하지 않았다. 남의 세션을 건드리게 되어 조사 단계에서 확인하지 않았다. 일회용 세션 두 개로 검증한다. 결과에 따라 `orchestrate` skill의 조율 패턴이 달라진다.

**worktree 간 workspace-id 수렴.** 같은 리포의 서로 다른 worktree에서 같은 workspace-id가 나오는지 확인한다. 여기가 틀리면 orchestrate는 에러 없이 조용히 갈라진다.

**`claude agents --json`의 출력 안정성.** 이 명령은 스크립팅용으로 문서화되어 있지만, 반환 필드가 버전 간에 유지되는지는 확인이 필요하다. `roster`는 필드가 없을 때 실패하지 않고 알 수 없다고 말해야 한다.

**흐름 제어를 skill에 맡겼을 때의 실제 준수율.** 커밋 규칙이 게이트에서 규칙으로 내려온 것은 REAP의 가장 큰 도박이다. `doctor`가 "커밋 없이 닫힌 generation"을 얼마나 자주 보고하는지가 이 도박의 성적표다. 자주 보고된다면 그 지점만 게이트로 되돌린다.
