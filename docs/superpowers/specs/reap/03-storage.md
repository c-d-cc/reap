# 저장 구조와 정체성

## 저장 구조


<!-- reap:carrier-333308-map-seed — 이 레이아웃을 아는 곳: 여기, store.ts의 DIRS·SEEDS, templates.ts, map.md 씨앗 -->
```
.reap/
  config.yml            언어, agentClient, workspace-id
  map.md                이 디렉토리가 무엇을 어디에 두는지 (씨앗)
  templates/            프로젝트 전용 템플릿 (있으면 번들 템플릿을 이긴다)
  plan/                 plan source 등록부 — sources.yml · conventions/
    sources.yml           등록된 plan source (id, root, role, convention)
    conventions/
      <ps-id>-<slug>.md   이 소스를 읽는 법 / 쓰는 법 (agent가 갱신)
  vision/               무엇을 하려는가
    memory/
      lessons.md        프로젝트 전역 교훈
    milestones/
      <ms-id>-<slug>/   예: ms-004-auth-session
        milestone.md    frontmatter(CLI) + 자유 본문(agent). **가장 먼저 열리므로 작게 유지한다**
        handoff.md      다음 세션 인계 (agent가 작성)
        tasks/          작업 상세 — 인터페이스, 함정, 완료 판정 (제목 목록만 주입)
          <n>-<slug>.md   예: 1-2-id-and-documents.md
  life/                 하는 중
    generations/
      <gen-id>-<slug>.md   예: gen-0002-exec-token-rotation.md
    backlog/
      <bk-id>-<slug>.md  이월 항목
    flux/
      <flux-id>-<slug>.md  예: flux-0001-plan-plan-flux.md — 열린 것만
  archive/              끝난 것
    generations/
      <gen-id>-<slug>.md
    milestones/
      <ms-id>-<slug>/
    backlog/
      <bk-id>-<slug>.md
    flux/
      <flux-id>-<slug>.md  닫힌 flux 전부
    idea/
      research/ · freememo/ · files/   cleanup이 내린 것
  genome/
    application.md      제품 정체성, 아키텍처
    evolution.md        AI 행동 규칙
    invariants.md       절대 제약 (사람만 수정)
  environment/
    summary.md          현재 기술 스택, 소스 구조, 빌드, 테스트
    source-map.md       코드 구조와 의존 (선택)
    resources/          채택한 외부 스펙·API 문서 (필요할 때 읽음)
  idea/                 아직 단단하지 않은 지식 — 셋 다 <idea-id>-<slug>.md
    research/           조사 결과 (결론 없음)
    freememo/           자유 메모 (형식 없음)
    files/              외부 참고자료
  sequence/
    <type>.md           id 레지스트리 (append-only, git-mergeable)
  hooks/
    {event}.{name}.{md|sh}
    conditions/
  .session              현재 세션 바인딩 (gitignored)
  .index/               코드 인덱스 — manifest와 그래프 (gitignored)
```

### 최상위를 가르는 것은 유형이 아니라 시간이다

세 단계다. `vision/`은 **하려는 것** — 아는 것(`memory/`)과 잘라낸 실행 단위(`milestones/`). `life/`는 **지금 살아 있는 것**, `archive/`는 **더는 참고하지 않는 것**.

**`plan/`은 이 3단 밖이다.** `genome/`·`environment/`·`idea/`처럼 최상위에 나란히 선다. plan source는 **리포 밖을 가리키는 등록부**라 "하려는 것 / 사는 것 / 끝난 것"이라는 시간축에 얹히지 않기 때문이다 — 등록된 소스는 하려는 것도 사는 것도 끝난 것도 아니고, 그냥 **거기 있다.**

**`life/flux/`가 기획 축의 기록이 사는 자리다.** 처음엔 `plan/flux/`였는데 `gen-0052`가 옮겼다 — `plan/`을 3단 밖에 둔 논거(리포 밖을 가리키는 등록부라 시간축에 안 얹힌다)는 `sources.yml`·`conventions/`의 것이지 flux의 것이 아니다. **flux는 열리고 닫히고 archive로 가므로 시간축에 얹히고**, `life/`의 정의("아직 참고할 값이 있는 것")에 그대로 맞으며 `archive/flux/`와 짝이 맞는다. generation과는 다른 사이클이므로 `life/generations/`에 섞지 않고 `life/flux/`다. 열린 flux만 여기 있고, 닫히면 `archive/flux/`로 간다.

**`life/`는 열려 있는 것이다.** 닫힘·소비는 상태이고 archive는 위치이지만, v0.18에서는 둘이 같은 순간에 일어난다 — `mark generation --closed`·`mark flux --closed`·`mark backlog --consumed`가 표시와 함께 `archive/`로 옮긴다(사람 결정 2026-09-05). `life/`를 보면 지금 열린 것이 전부 보이고, 그 밖의 것은 없다.

**generation을 유형별 폴더로 가르지 않는다.** 유형이 늘 때마다 최상위가 늘고, 세대는 유형과 무관하게 시간순으로 하나의 흐름을 이룬다. 전부 `life/generations/` 하나에 쌓이고 유형은 **id 안에** 있다.

**archive는 milestone에 매달리지 않는다.** `archive/`의 넷은 나란히 있고 서로를 담지 않는다. milestone 아래에 그 세대를 넣으면 닫을 때마다 "이 milestone에 속한 세대"를 계산해야 하고, milestone이 없는 fix 세대는 그 계산에서 매번 예외가 된다. **소속은 frontmatter가 이미 말하므로 디렉토리가 다시 말할 이유가 없다.**

### 닫히면 바로 archive다

한동안 `life/`를 "아직 참고할 값이 있는 것"의 작업 세트로 정의하고, 닫힌 세대를 남겼다가 milestone이 닫힐 때 `cleanup` skill이 "앞으로 이것을 볼 일이 있는가"를 판단해 내리게 했다. 두 가지가 그것을 뒤집었다.

- **판단이 서지 않았다.** `cleanup` skill 본문 스스로 "근거 없이 남겼다"는 실패를 적었고, 실제로 닫힌 세대를 다시 읽은 경우는 전부 `handoff.md`를 거쳤다. 다음 세션에 필요한 것이 `handoff.md`에 있어야 한다는 규칙과 "세대 기록을 뒤지라"는 작업 세트는 서로를 약하게 만든다
- **위치 이동은 판단이 아니다.** 결정적으로 할 수 있는 일을 skill의 판단에 맡길 이유가 없다 — 원칙 2의 반대편이다

그래서 세 종류가 같은 규칙이다. `life/generations/`·`life/flux/`·`life/backlog/`에는 열린 것만 있고, 닫히거나 소비되는 순간 CLI가 `archive/`로 옮긴다. 기록은 id로 찾으며 조회는 두 곳을 다 본다 — 필요한 것은 언제든 열린다. `--archived` 플래그는 옛 규칙으로 `life/`에 남은 것을 내리는 용도로만 남는다.

**milestone 종료 순서는 둘이다** — 사람의 fitness → `mark milestone --closed`. milestone 디렉토리(`milestone.md`·`handoff.md`·`tasks/`)가 통째로 `archive/milestones/`로 가고, 세대는 이미 거기 있다.

### `map.md` — 구조가 스스로를 설명한다

3단은 이름만으로 안 읽힌다. `vision/`에 왜 `milestones/`가 있고 `life/`에 왜 `backlog/`가 있는지는 자명하지 않고, **그 답이 이 spec에만 있으면 REAP를 쓰는 프로젝트는 영영 그것을 못 읽는다** — 이 문서는 REAP를 *만드는* 사람의 것이다.

`init`이 `map.md`를 놓는다. 각 계층이 무엇을 뜻하고 무엇이 거기 사는지를 담는다.

**주입하지 않는다.** 상태 줄이 `구조: .reap/map.md`로 이름만 내고, 필요한 agent가 연다. 매 세션 실어야 할 만큼 자주 필요하지 않고, 주입은 한 번 늘리면 줄이기 어렵다.

**씨앗이다.** 다른 씨앗과 같이 `init`이 없을 때만 쓰고 덮어쓰지 않는다 — 프로젝트가 자기 구조 설명을 덧붙일 수 있어야 하기 때문이다. 대가는 분명하다: **REAP가 레이아웃을 바꾸면 낡은 지도가 조용히 남는다.** 검사할 수 있는 것이므로 `doctor`가 번들 템플릿과 견주어 보고한다.

`.reap/`라는 이름은 의도적이다. 마이그레이션 기간에 한 리포에 `.reap/`과 `.reap/`가 공존할 수 있어야 한다.

## 세션 정체성과 공유 상태


병렬 세션은 각자의 git worktree에서 돈다. worktree마다 `.reap/`는 별개 사본이므로, **세션 간 공유 상태를 worktree 안에 둘 수 없다.**

**세션 식별** — 다음 순서로 해석한다.
1. `REAP_SESSION` 환경변수
2. 없으면 워크트리 로컬 `.reap/.session` 파일

`.index/`도 gitignored다. **크기 때문이 아니다** — 인덱스를 커밋하면 그 인덱스를 담은 커밋을 다시 인덱싱해야 하고 **그것이 끝나지 않는다.** 지우는 것은 언제나 안전하고 다음 질의가 다시 만든다.

`.session`은 gitignored이며 현재 바인딩된 generation id와 milestone id를 담는다. `reap make generation`이 쓰고, `ctx`와 `decide`가 읽는다. agent가 매번 id를 정확히 넘길 것을 기대하지 않는다 — 바인딩은 확률에 맡길 메타데이터가 아니다.

"현재 generation"은 전역 상태가 아니라 **세션에 바인딩된 상태**다. 이것이 REAP의 `life/current.yml`(전역 단일 상태)과의 결정적 차이이며, 병렬 세션을 가능하게 하는 전제다.

**orchestrate 공유 상태** — `~/.reap/orch/<workspace-id>/` 아래. 홈 디렉토리에 두는 이유는 worktree 밖이어야 하기 때문이다.

**workspace-id** — git 리포지토리의 공통 디렉토리(`git rev-parse --path-format=absolute --git-common-dir`)의 부모 경로를 정규화해 SHA-256으로 해싱한 앞 12자. worktree들이 서로 다른 작업 디렉토리를 가져도 같은 id로 수렴해야 한다. 여기가 틀리면 orchestrate는 에러 없이 조용히 갈라진다.

## id 체계


오래 인용되는 것은 번호를, 소비되고 사라지는 것은 해시를 받는다.

| 종류 | 형식 | 레지스트리 |
|---|---|---|
| plan source | `ps-a3f8c2` | `sequence/source.md` |
| flux | `flux-0001-plan` | `sequence/flux.md` |
| milestone | `ms-004` | `sequence/milestone.md` |
| generation | `gen-0002-exec` | `sequence/generation.md` |
| backlog | `bk-a3f8c2` | 없음 |
| idea | `idea-a3f8c2` | 없음 |
| carrier | `carrier-a3f8c2` | 없음 — 표식 자체가 레지스트리다 |

plan source는 등록·해제가 반복될 수 있어 해시를 쓰되, 인용 대상이므로 레지스트리에 기록한다.

**generation id는 유형을 품는다.** `gen-<순번>-<plan|exec|fix>`. 순번이 앞에 오므로 이름순 정렬이 곧 시간순이고, 인용만 봐도 그것이 무엇이었는지 보인다. **순번은 유형과 무관한 하나의 계열이다** — `gen-0001-plan` 다음이 `gen-0002-exec`일 수 있다. 유형마다 계열을 따로 두면 한 폴더 안에서 정렬이 시간순을 잃는다.

네 자리를 쓰는 이유는 세 자리를 넘기는 프로젝트가 있기 때문이다. 넘으면 그때부터 이름순 정렬이 시간순과 어긋나므로 넉넉히 잡는 편이 싸다.

레지스트리는 **append-only 마크다운 테이블**이다. 항목을 지워도 행은 남는다 — 번호가 다시 쓰이지 않아야 옛 참조가 다른 것을 가리키게 되는 일이 없다. 바이너리가 아니라 마크다운인 이유는 두 브랜치가 각각 항목을 추가했을 때 사람이 읽고 풀 수 있는 충돌이 나야 하기 때문이다.

**레지스트리는 최종 내용만 담는다.** 표와 머리말뿐이고 **이력 주석을 두지 않는다.** id 체계를 바꾸거나 번호를 보정하는 일이 있어도 옛 매핑을 여기 적지 않는다 — 매번 남기면 표보다 주석이 길어지고, 그것은 **아무도 안 읽는 레지스트리**가 된다는 뜻이다. 그런 변경의 경위가 필요하면 git이 갖는다.

**셀은 이스케이프해서 쓰고 읽을 때 되돌린다** — `&`→`&amp;` · `|`→`&#124;` · 개행→`&#10;`. 마크다운 테이블을 고른 대가다. 제목에 `|`나 개행이 들어가면 표가 깨지고, 깨진 표는 **레지스트리 전체를 못 읽게 만든다** — id 발급이 거기서 멈춘다. 이스케이프 순서가 있다: 쓸 때 `&`를 먼저, 읽을 때 `&`를 마지막에 되돌린다. 그렇지 않으면 제목에 원래 있던 `&amp;`가 `&`로 바뀐다.

```markdown
<!-- reap:sequence(milestone) — append only. 발급된 번호는 다시 발급되지 않는다. -->
| id | title | createdAt |
|---|---|---|
| ms-004 | 인증 세션 관리 개편 | 2026-08-22 |
```

**참조는 제목이 아니라 id를 인용한다.** 제목은 바뀌고, 제목 참조는 바뀔 때마다 끊긴다.

### slug는 키가 아니다

**id를 갖는 모든 파일과 디렉토리는 `<id>-<slug>`다.** 예외를 두지 않는다.

| | 예 |
|---|---|
| milestone | `ms-004-auth-session/` |
| generation | `gen-0002-exec-token-rotation.md` |
| backlog | `bk-a3f8c2-token-rotation-retry.md` |
| idea | `idea-a3f8c2-oauth-device-flow.md` |
| plan source 규약 | `ps-4f2a91-reap.md` |
| carrier 표식 | `reap:carrier-a1b2c3-claude-code-commands-path` |

**예외를 두지 않는 이유는 이것들이 전부 목록으로 읽히기 때문이다.** 항목은 쌓이고, 무엇이 있는지는 디렉토리를 훑어 판단한다. `bk-a3f8c2.md` 열 개는 아무것도 말하지 않으므로 열 번 열어봐야 한다. 규칙에 예외가 하나라도 있으면 읽는 쪽이 매번 "이건 어느 쪽이더라"를 묻는다.

**carrier만 파일이 아니라 표식이다.** `<id>-<slug>` 부분은 같고 앞에 `reap:` 이름공간이 붙는다 — 파일 이름이 아니라 **남의 소스 안 주석**으로 들어가므로 그 자리에서 "이건 REAP 것"이라고 말해야 하기 때문이다. 감싸는 괄호는 두지 않는다: **id가 생긴 모양이 자리마다 달라지면 읽는 쪽이 매번 다시 배운다.**

**id가 없는 것은 이 규칙 밖이다** — `sequence/<type>.md`, `hooks/{event}.{name}.{ext}`, milestone 안의 `tasks/<n>-<slug>.md`.

**id가 앞에 온다.** slug는 제목에서 파생되므로 제목이 바뀌면 함께 바뀌고, 그러면 제목 참조와 똑같이 깨진다. 그래서 **저장되는 참조에는 slug가 들어가지 않는다** — `refs`도 `from`도 `milestone`도 id만 담는다. slug가 바뀌면 디렉토리 이름만 바뀌고 참조는 그대로다.

CLI는 어디서든 id를 받는다. 편의를 위해 slug나 그 접두사로도 찾을 수 있게 하되, 여러 개에 걸리면 후보를 보여주고 멈춘다 — 짐작해서 하나를 고르지 않는다.
