# CLI 레퍼런스

`reap`을 인자 없이 치면 아래가 그대로 나온다.

```
사용법: reap <명령>

  --version
  init [--force] | init --check     (--check: 씨앗 그대로인 지식 파일을 보고만 한다)
  make loop       --type plan|design|uiux|idea --title "<제목>" [--slug <s>] [--from <id>] [--ref <ps-id>:<경로>]
  make milestone  --title "<제목>" [--slug <s>] [--from <loop-id>] [--ref <ps-id>:<경로>] [--focus]
  make generation --milestone <ms-id> --title "<제목>" [--slug <s>]
  make generation --backlog <bk-id> --title "<제목>" [--slug <s>]   (--milestone과 겸용 가능)
  make generation --fix  --title "<제목>" [--slug <s>]
  make backlog    --type <t> --title "<제목>" [--slug <s>] [--from <id>]
  make plan-source --root <path> --role "<역할>" [--slug <s>]
  make idea       --kind research|freememo|file --title "<제목>" [--slug <s>]
  make hook       --event <e> --name <n> [--type md|sh] [--condition <c>] [--order <n>]
  mark loop       <loop-id> --closed [--milestone <ms-id>]... | --aborted
  mark generation <gen-id> --closed | --aborted | --archived
  mark backlog    <bk-id> --consumed [--by <gen-id>] | --archived
  mark milestone <ms-id> --focus | --closed
  mark idea       <idea-id> --archived
  bind <gen-id>                   (열린 세대에 이 세션을 다시 묶는다)
  seq [generation|milestone|loop|source|<id>]
  carrier new <slug> | list [--orphans|--check]
  doctor                          (보고만 한다. 결함이 있으면 실패로 끝난다)
  index [update [--full] | status | impact <file>... | search <q> | callers <id> | callees <id>]
  orch claim <resource> [--ttl 30m] | release <resource> | barrier <name> --expect <N> --timeout <s> | roster | status   [--topic <t>]
  plan sources | convention <ps-id>
  ctx [--milestone <ms-id>] [--hook]
```

명령은 대부분 `make`(만든다)·`mark`(상태를 바꾼다) 짝이고, 나머지는 조회·조율용 단독 명령이다.

## `init`

`.reap/`와 씨앗 파일을 놓는다. `--check`는 씨앗이 아직 채워지지 않은 파일만 보고한다. 프로젝트당 한 번, `init` skill이 이어서 채운다.

## `make`

`loop`·`milestone`·`generation`·`backlog`·`plan-source`·`idea`·`hook` 일곱 종류를 만들고 id·frontmatter를 스탬프한다. id 발급처럼 확률에 맡길 수 없는 사실을 여기서 못 박는다.

## `mark`

`loop`·`generation`·`backlog`·`milestone`·`idea`의 상태를 바꾼다. `closed`·`aborted`·`archived`·`consumed`·`focus` 등 종류마다 다른 상태 값을 받는다.

## `bind`

세션이 세대 바인딩을 잃었을 때(abort 뒤, 다른 디렉토리에서 열었을 때) `.reap/.session`을 그 세대에 다시 묶는다. `doctor`가 바인딩 안 된 열린 generation을 알려줄 때 쓴다.

## `seq`

다음에 발급될 id를 인자 없이 미리 보여준다. 대상(`generation`·`milestone`·`loop`·`source`)이나 특정 id를 넘기면 그 계열의 현재 번호를 낸다.

## `carrier`

한 사실을 여러 자리가 알 때 붙이는 `reap:carrier-<hash6>` 표식을 관리한다. `new`가 발급하고, `list`가 등록된 표식을 훑어 짝이 없는 것(`--orphans`)이나 문제를 검사(`--check`)한다.

## `doctor`

`.reap/`의 상태를 확정적으로 검사 가능한 만큼만 검사해 보고한다. 파일을 쓰지 않고, 고치지도 않는다.

## `index`

코드 인덱스를 질의한다. `update`(HEAD와 맞춘다)·`status`(해석률)·`impact`(파급 범위)·`search`(정의 찾기)·`callers`/`callees`(호출 관계)로 갈린다. 자세한 것은 [코드 인덱스](/code-index).

## `orch`

여러 세션이 자원을 선점(`claim`/`release`)하고 합류점에서 기다리며(`barrier`) 서로를 본다(`roster`/`status`). 자세한 것은 [orchestrate](/orchestrate).

## `plan`

등록된 plan source 목록(`sources`)과 그 규약(`convention <ps-id>`)을 보여준다. plan source 자체는 리포 안팎 어디든 있을 수 있는 등록부다.

## `ctx`

세션이 열릴 때 SessionStart 훅이 부르는 것과 같은 명령이다. genome·environment 요약과 상태 줄을 낸다. `--milestone`으로 다른 milestone 기준으로, `--hook`으로 훅이 부르는 형식 그대로 낼 수 있다.
