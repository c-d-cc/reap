---
id: bklog-76e909
type: task
status: consumed
priority: medium
createdAt: 2026-08-21T00:00:00.000Z
from: gen-098-99c09a
consumedBy: gen-099-b9afc9
consumedAt: 2026-08-21T13:34:00.406Z
---

# carrier ID 에 hash8 을 붙인다 — slug 은 읽히고 hash 는 고유성을 보장한다

> **사용자 결정 (2026-08-21)**: `<slug>-<hash8>`. 해시 단독이 아니다 — 둘 다 쓴다.
>
> **선행**: `참조-id-체계-…` generation. 그 세대가 만드는 해시 생성 · 고유성 검사 ·
> 레지스트리 형식 셋을 이 작업이 그대로 재사용한다. 먼저 하면 두 번 만든다.

## Problem

carrier ID 는 지금 **손으로 정한 slug 뿐**이다:

```ts
// reap:carrier(claude-code-commands-path)
```

**충돌이 기계적으로 탐지 불가능하다.** 서로 다른 두 사실에 같은 slug 를 주면 `grep` 이 무관한
파일을 함께 반환하고, 도구는 그것을 하나의 사실로 센다. 검사가 "두 사실이 다르다"를 알 방법이
없으므로 **어떤 검사도 이것을 잡지 못한다.**

지금 14개이고 전부 `list-carriers.sh` 한 화면에 보이므로 확률은 낮다. 하지만 낮은 확률은
방어가 아니다 — genome 이 "잡는다고 적은 사례는 재현해 확인한 것만 적는다"고 하는 것과 같은
규율이 여기에도 적용된다.

### 이미 오염 사례가 있다 (충돌은 아니지만 인접하다)

```
id  (3 files)
    RELEASE_NOTES.md                        ← 산문 속 자리표시자 `reap:carrier(id)`
    backlogs_v0.17_residual/list-carriers…  ← 그 문제를 설명하는 backlog
    backlogs_v0.17_residual/README.md
```

`RELEASE_NOTES.md` 가 기능을 **설명하면서** 쓴 예시를 스캐너가 실제 carrier 로 센다.
**gen-085 · gen-088 · gen-089 세 세대가 이것을 두고 헷갈렸고**, gen-097 이 그 문제를 문서화하면서
오히려 2건을 더 늘렸다.

**hash8 이 이것을 고치지는 않는다** — 산문 예시는 가짜 해시를 쓸 것이고 똑같이 잡힌다.
그것은 grep 패턴 문제이며 별도 backlog 가 있다
(`backlogs_v0.17_residual/list-carrierssh-가-산문-속-…`). **두 건을 같은 세대에서 함께 처리하라** —
패턴을 고치는 김에 형식이 바뀌므로 따로 하면 같은 파일을 두 번 만진다.

## Solution

```ts
// reap:carrier(claude-code-commands-path-a3f8c2d1)
```

- **slug 이 앞이다.** 표식의 유일한 기능은 **값 옆에서 읽히는 것**이다 — genome 이 목록 방식을
  버린 이유가 "찾아가야 보이고 실제로 아무도 안 봤다"였다. 해시가 앞에 오면 그 실패로 돌아간다
- **hash8 은 생성 시 난수다.** slug 을 해싱하면 **slug 을 바꿀 때 해시도 바뀌어** 고유성 보장이
  무의미해진다. 이름과 정체성을 분리하는 것이 목적이므로 이름에서 파생시키면 안 된다
- 무엇이 생성하는가 — `reap make carrier` 를 만들지, 사람이 `openssl rand -hex 4` 로 만들지 결정할 것

### 판정해야 하는 것

**1. 기존 14개를 어떻게 이관하나**

70여 개 표식 사이트에 해시를 붙여야 한다. 기계적이지만 **놓친 사이트는 고아가 된다** —
`--orphans` 가 잡으므로 검증 경로는 있다. 이관 후 `--orphans` 가 **비어 있을 것**이 완료 조건이다.

**2. 형식을 무엇이 강제하나**

`list-carriers.sh` 가 `<slug>-<hash8>` 형식을 어기는 ID 를 보고해야 한다. 그러지 않으면 다음 사람이
해시 없이 새 carrier 를 만들고 아무도 모른다. **"이 절차를 사람이 매번 기억해야 하는가" → Yes 면
검사를 만들어라** (genome).

**3. 해시 오타는 단어 오타보다 진단이 어렵다**

`claude-code-commands-path-a3f8c2d1` 을 한 글자 틀리면 고아가 되는데, 단어 오타와 달리 **눈으로
차이를 못 본다.** `--orphans` 출력이 "이 ID 와 1글자 다른 ID 가 존재한다"를 함께 알려주면
진단이 즉시 된다 — 그 정도의 편의는 넣을 가치가 있다.

**4. 문서에 실린 예시**

genome · reap-guide · README · 5개 로케일이 carrier 문법을 **예시와 함께** 설명한다.
전부 새 형식으로 바꿔야 하고, 그 예시들이 다시 스캐너에 잡히지 않아야 한다 (위 오염 사례).

## Files to Change

- `scripts/list-carriers.sh` — 형식 검사 + grep 패턴(산문 제외) + 유사 ID 힌트
- 표식 사이트 약 70곳 (`grep -rn "reap:carrier(" .` 로 전수)
- `.reap/genome/application.md` · `src/templates/evolution.md` · `reap-guide.md` ×2 — 문법 설명과 예시
- `README.md` · `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` — 예시
- `src/cli/commands/make/carrier.ts` (신규 검토) — 해시 생성을 사람에게 맡길지 결정한 뒤
- tests: 형식 위반 탐지의 negative — **`--orphans` 가 비어 있다는 것만으로는 부족하다.**
  일부러 형식을 어긴 ID 를 넣어 red 를 확인할 것

## 판단 메모

- **carrier 와 참조 ID 는 층이 다르다.** carrier 는 *사실*에 붙는 표식이고 아무것도 그것을
  참조하지 않는다 — ID 의 기능은 `grep` 이 나머지를 찾게 하는 것뿐이다. 반면 goal·milestone 의
  ID 는 다른 항목이 **가리키는** 대상이다. 그래서 레지스트리(제목·생성일)가 carrier 에는
  필요 없을 수 있다 — **필요 여부를 판정하고 근거를 남길 것**
- **충돌의 심각도도 다르다.** goal 번호 재사용은 조용히 다른 것을 가리키지만, carrier 충돌은
  `grep` 이 무관한 파일을 반환해 사람이 즉시 이상함을 느낀다. 시끄러운 실패다.
  그래도 탐지 불가능하다는 점은 그대로다
