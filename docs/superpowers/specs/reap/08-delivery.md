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
| opencode 어댑터 | v1은 claude-code 하나만. 어댑터 인터페이스는 남긴다 |
| code index (tree-sitter) | v1 제외. 독립 서브시스템이라 나중에 이식 |
| migration instruction layer | REAP가 진화하기 시작한 뒤 필요 |

## 클라이언트 통합


orchestrate가 `SendMessage`/`ListAgents`에 기대므로 REAP는 **Claude Code 전용으로 시작**한다. REAP은 두 어댑터를 유지하느라 모든 기능을 두 번 만들어야 했다. 어댑터 인터페이스는 남겨두고, 두 번째 클라이언트가 실제로 필요해질 때 채운다.

### 배포물은 둘이고 서로 독립적이다

| 산출물 | 무엇 | 어떻게 설치되나 |
|---|---|---|
| **바이너리** | `reap` 실행 파일 | brew / curl |
| **플러그인** | skill과 SessionStart 훅 | 클라이언트의 플러그인 설치 |

```
plugin/
  .claude-plugin/plugin.json      name: reap, version, description
  skills/
    evolve/SKILL.md
    complete/SKILL.md
    carve-milestone/SKILL.md
    orchestrate/SKILL.md
    cleanup/SKILL.md
    interview/SKILL.md
    init/SKILL.md
    report-issue/SKILL.md
    loop/SKILL.md
    shared/references/
      record-vocabulary.md      세대 어휘와 milestone 어휘를 한 파일에
  hooks/hooks.json                SessionStart -> reap ctx --hook
```

### 마켓플레이스는 이 리포에 없다

**플러그인 레포에 `marketplace.json`을 두지 않는다.** 마켓플레이스는 `c-d-cc/plugins`(`ctod-plugins`) 하나이고, 이 리포는 거기에 **submodule로 물린다**(`plugins/reap`, `source: ./plugins/reap/plugin`). 양쪽에 manifest가 있으면 같은 플러그인이 두 마켓플레이스에서 보이고 사용자가 어느 쪽을 설치했는지 알 수 없다.

**기획 플러그인은 따로 없다.** 한때 `reap-plan`을 형제로 두려 했으나(`gen-0045`) `loop-0001`이 되돌렸다 — 기획은 REAP의 `loop` skill이 쓴다.

**submodule은 push된 커밋을 싣는다.** 그래서 개발 루프에는 못 쓰고, 작업 트리를 그대로 싣는 로컬 마켓플레이스가 따로 필요하다. 마켓플레이스 항목의 `source`는 **그 마켓플레이스 디렉토리 안쪽만** 가리킬 수 있으므로(절대경로·`../` 둘 다 거부된다) 로컬 쪽은 심링크를 쓴다.

**REAP는 사용자의 설정 파일을 편집하지 않는다.** SessionStart 훅은 플러그인의 `hooks/hooks.json`이 선언하고 클라이언트가 등록한다. 남의 `settings.json`을 기계적으로 고치는 것은 되돌리기 어렵고, REAP이 자기 항목을 넣었다가 제거 경로를 따로 만들어야 했던 문제가 여기서 사라진다. 그래서 `reap install`도 `reap uninstall`도 없다 — 플러그인을 지우면 끝이다.

**skill이 곧 slash command다.** 플러그인의 skill은 `/reap:evolve` 형태로 직접 불린다. 별도의 command 파일을 두지 않는다 — 같은 내용이 두 곳에 있으면 어긋나고, 어긋난 쪽을 사용자가 본다. skill 디렉토리 이름에 `reap-` 접두사를 붙이지 않는 것도 같은 이유다. 플러그인 이름이 이미 그 역할을 한다.

### 두 산출물이 어긋날 수 있다는 것을 전제한다

플러그인과 바이너리는 따로 설치되고 따로 갱신되므로, **플러그인은 있는데 바이너리가 없는 상태가 정상적으로 발생한다.** SessionStart 훅은 이 경우 세션을 깨뜨리지 않고, `reap`를 찾을 수 없다는 사실과 설치 방법을 알린 뒤 조용히 끝나야 한다. 훅이 실패해 세션 시작이 막히는 것은 REAP가 할 수 있는 가장 나쁜 일이다.

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
