---
id: gen-0026-exec
slug: make-backlog와-idea
type: exec
milestone: ms-003
title: make backlog와 make idea
startedAt: 2026-08-23T03:49:06Z
startCommit: 167ba0a
status: closed
closedAt: 2026-08-23T03:57:05Z
endCommit: d4f6c16
---

## Intent

`ms-003` task 3.3. `reap make backlog`와 `reap make idea`를 만든다. `gen-0021-fix`가 backlog 항목을 손으로 썼고 id 해시까지 사람이 흉내 냈다 — 그것이 근거다.

**시간 형식 통일이 여기 함께 온다.** `bk-c3321b`(다른 세션이 남긴 것)가 사람의 요구를 기록해 두었다 — *frontmatter의 시간은 ISO 시간으로만 쓴다*. 그리고 **"형식 규범과 `make backlog`는 같이 와야 한다"**고 스스로 적었다. 스탬프하는 주체가 생기는 순간이 곧 형식이 굳는 순간이기 때문이다.

**무엇이 되면 끝인가:** 두 명령이 있고, 만든 결과가 손으로 쓴 넷과 같은 모양이다. frontmatter의 모든 시간 필드가 초 단위 ISO다. `bk-c3321b`가 닫힌다.

## Working Plan

`bk-c3321b`가 열어둔 물음 넷에 이렇게 답한다.

- **범위** — 사람이 요구한 것은 "**frontmatter**의 시간"이다. **sequence 레지스트리의 `createdAt` 칸은 범위 밖**이다. 그것은 frontmatter가 아니라 사람이 읽는 표이고, append-only라 바꾸면 한 표에 두 형식이 섞인다
- **소급** — 후보 (b). 이미 쓰인 값을 **그 파일을 만든 커밋의 시각**으로 채운다. `T00:00:00Z`로 채우면 거짓이지만 커밋 시각은 확인 가능한 사실이다
- **backlog 스키마** — 손으로 쓴 넷이 사실상의 스키마다: `id`·`slug`·`type`·`title`·`from`(선택)·`createdAt`·`status`·`consumedBy`(선택)
- **`doctor`** — 증분 4다. 여기서 하지 않는다

## References

- `.reap/life/backlog/bk-c3321b-frontmatter-시간-형식.md` — 다른 세션이 남긴 것. 사람의 요구가 여기 적혀 있다
- 대조군: 손으로 쓴 `bk-15780b`·`bk-394d82`·`bk-c3321b`·`bk-c92489`

## Outcome

**`reap make backlog`와 `reap make idea`가 있다. frontmatter의 시간은 종류를 가리지 않고 초 단위 ISO다.**

### 명령 둘

```
make backlog --type <t> --title "<제목>" [--slug <s>] [--from <id>]
make idea    --kind research|freememo|file --title "<제목>" [--slug <s>]
```

id는 순번이 아니라 해시다 — `id.ts`의 `isRegistered`가 이미 그 갈래를 갖고 있어 **새 길을 내지 않고 있는 길을 썼다.** 본문은 비운다.

**`--type`과 `--kind`의 이름을 통일하지 않았다.** 뜻이 다르기 때문이다 — backlog의 `type`은 frontmatter에 남는 **분류**(관례이고 열거로 막지 않는다)이고, idea의 `kind`는 어느 디렉토리로 가는지를 정하는 **배치**다. 배치는 틀리면 파일이 엉뚱한 곳에 가므로 열거로 막는다.

**idea 템플릿은 kind마다 다르다.** `research`·`file`은 "무엇이 미정인가 / 무엇이 정해지면 졸업하는가 / 출처"를 요구하고 `freememo`는 비어 있다 — `05-knowledge.md`가 "`freememo/`만 형식 요구가 없다. 아무 요구도 없는 자리가 하나는 있어야 사람이 쓴다"고 규정한 그대로다.

### 시간 형식 — `bk-c3321b`가 열어둔 물음 넷에 답했다

| 물음 | 답 | 근거 |
|---|---|---|
| 범위 | **frontmatter만.** sequence 레지스트리 `createdAt` 칸은 날짜를 유지한다 | 사람이 요구한 것이 "frontmatter의 시간"이고, 레지스트리는 frontmatter가 아니라 사람이 읽는 표다. append-only라 바꾸면 한 표에 두 형식이 섞인다 |
| 소급 | **후보 (b) — 그 파일을 만든 커밋의 시각으로 채웠다** | `T00:00:00Z`는 거짓이지만 커밋 시각은 확인 가능한 사실이다. milestone 셋 · backlog 둘 |
| 스키마 | 손으로 쓴 넷을 그대로 | 대조군이 이미 있는데 새로 정할 이유가 없다 |
| `doctor` | 증분 4 | 여기서 하지 않는다 |

`04-commands.md`에 규범 절을 세우면서 **이 규범이 왜 늦게 섰는지도 적었다** — spec이 형식을 정하지 않은 채 예시 둘을 보여줬고, 규범을 적은 문장이 없으므로 **예시가 사실상의 규범이 됐다.** 그것이 갈라진 원인이다.

`today()`는 `registryDate()`로 이름이 바뀌었다. 자르는 곳이 하나뿐이고 왜 자르는지가 이름과 주석에 있다.

### 실제로 불렸다

`make backlog`로 **`bk-ce5006`을 남겼다** — 이 세대가 `bk-394d82`·`bk-c3321b`를 닫으며 `status: consumed`를 손으로 찍어야 했다는 마찰이다. `mark backlog`가 없다. `gen-0021-fix`가 `make backlog`가 없어 겪은 것과 같은 종류이고, **이번에는 만드는 쪽만 고쳐졌다.** `bk-c92489`와 같은 뿌리다.

`bk-c3321b`를 닫았다.

## 검증

- 실패하는 테스트 다섯을 먼저 쓰고 빨간 것을 확인한 뒤 구현했다
- `bun test` 103 pass / 0 fail(다섯 늘었다) · `typecheck` 0 · `./tests/hook.test.sh` 통과
- **빈 임시 프로젝트 왕복** — `init` → `make backlog` → `make idea --kind research`. 파일 배치와 research 템플릿의 졸업 조건 세 항목까지 눈으로 확인했다
- `tests/templates.test.ts`의 `REQUIRED` 목록이 번들과 정확히 일치한다(테스트가 그것을 검사한다)

## 남은 것

**`make backlog`의 `--type`을 열거로 막지 않았다.** `05-knowledge.md`가 "`type`은 관례"라고 규정했기 때문이다. 오타가 섞이면 `doctor`(증분 4)가 잡는 것이 맞고, 지금 막으면 못 담는 분류가 생긴다. 실제로 갈리는지는 `ms-003` fitness 3번이 본다.
