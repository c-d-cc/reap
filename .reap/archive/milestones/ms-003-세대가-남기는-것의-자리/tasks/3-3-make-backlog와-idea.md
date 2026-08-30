# 3.3 — `make backlog` · `make idea`

`gen-0021-fix`가 backlog 항목을 남기려는데 **명령이 없어 손으로 썼다.** id 해시까지 사람이 `randomHash()`를 흉내 냈다. 그것이 이 task의 근거다.

## 인터페이스

spec이 약속한 것이다(`04-commands.md`).

```
reap make backlog --type <t> --title "<t>" [--slug <s>] [--from <id>]
reap make idea --kind research|freememo|file --title "<t>" [--slug <s>]
```

`--from`은 어느 세대가 남겼는지다. 손으로 쓴 두 항목에 `from: gen-0016-exec`·`from: gen-0021-fix`가 그렇게 들어가 있다.

## 무엇이 참이어야 하는가

- **손으로 만든 것과 도구가 만드는 것이 같은 모양이다.** `bk-15780b`·`bk-394d82` 둘이 대조군이다 — frontmatter 필드, 파일명, 배치가 어긋나면 도구 쪽이 틀린 것이다
- **id는 순번이 아니라 해시다.** `id.ts`의 `PREFIXES`가 `bk`·`idea`를 `HASH`(6 hex)로 규정하고 레지스트리를 두지 않는다. `issue()`가 이미 `isRegistered`로 갈라 `randomHash()`를 부른다 — **새로 만들 것이 아니라 이미 있는 길을 쓴다**
- **파일명은 `<id>-<slug>.md`다.** 예외 없다(`03-storage.md`의 보편 규칙)
- **배치는 `life/backlog/`와 `idea/<kind>/`다.** 경로 조립은 `store.ts`가 소유한다 — `paths()`가 이미 `backlog`·`ideaResearch`·`ideaFreememo`·`ideaFiles`를 낸다
- **본문은 비어 있다.** 무엇을 적을지는 agent가 정한다. `make generation`이 그렇게 돈다

## 함정

- **`--type`과 `--kind`의 이름이 다르다.** spec이 backlog는 `--type`, idea는 `--kind`로 적었다. 지금 통일할 것인지, spec대로 둘지 정한다 — **통일한다면 spec을 먼저 고친다**
- **`--type`의 값이 무엇인지 spec에 없다.** 손으로 쓴 두 항목은 둘 다 `type: design`이다. 열거로 막을지 자유 문자열로 둘지 정한다. 막으면 못 담는 것이 생기고, 열면 오타가 섞인다
- **`idea --kind file`의 배치.** `ideaFiles`는 마크다운이 아닌 것도 담는 자리다. `--title`로 빈 `.md`를 만드는 것이 맞는지 본다
- **3.2가 먼저다.** 결정의 자리를 정하며 나온 원칙이 backlog·idea의 배치에도 걸린다
- **`createdAt`의 시간 형식이 갈려 있다**(`bk-c3321b`). generation은 초 단위 ISO를 쓰고 milestone과 sequence 레지스트리는 날짜만 쓴다. backlog는 스탬프하는 주체가 없어 **손으로 쓴 사람이 어느 쪽을 베꼈느냐로 갈렸다** — `bk-394d82`는 날짜만, `bk-c92489`는 ISO다. 그 항목이 "형식 통일은 `make backlog`와 같이 와야 한다"고 적었으므로 **여기서 정한다.** 스탬프하는 주체가 생기는 순간이 곧 형식이 굳는 순간이다

## 함께 보는 것

- **`bk-c92489` — backlog는 archive로 내려갈 길이 없다.** `cleanup`·archive 경로·`mark`·`listEntries` 넷 다 backlog를 모른다. 이 task가 만드는 것이 아니라 **이 task가 만드는 것의 수명**에 대한 질문이므로 여기서 답하지 않는다. 다만 `--type` 열거를 정할 때 그 항목이 말하는 `status: consumed` 흐름과 어긋나지 않게 한다

## 완료 판정

- 두 명령이 있고, 만든 결과가 `bk-15780b`·`bk-394d82`와 같은 모양이다
- 실패하는 테스트를 먼저 쓴 흔적이 커밋에 있다
- `reap` 사용법 출력에 두 줄이 더해진다
- **이 milestone이 도는 동안 실제로 불린다.** 안 불리면 fitness 3번이 그것을 잡는다
