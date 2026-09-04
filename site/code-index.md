# 코드 인덱스

`reap index`는 커밋 단위로 자동 갱신되는 코드 인덱스를 질의한다. 상주 프로세스도 백그라운드 감시자도 없다 — 질의가 스스로 `HEAD`와 인덱스를 비교해 필요하면 먼저 올린 뒤 답한다.

## 하위 명령

```bash
reap index update [--full]    # 인덱스를 HEAD와 맞춘다 (기본, 인자 없이 index만 쳐도 이것)
reap index status             # 개수, import 해석률, 인덱싱된 커밋
reap index impact <file>...   # 이 파일을 바꾸면 어디까지 닿는가
reap index search <query>     # 정의를 찾는다. file:line과 함께
reap index callers <symbolId> # 누가 이것을 부르는가
reap index callees <symbolId> # 이것이 무엇을 부르는가
```

`git diff` 하나로 무엇을 다시 파싱할지 정해지므로, **커밋 안 된 작업은 인덱스에 없다.** 방금 쓰고 커밋 안 한 심볼은 `search`가 못 찾고 새 파일은 `impact`에 안 나온다.

## 언제 index고 언제 grep인가

**index** — 정의가 어디 있는지(`search`), 이 파일을 바꾸면 무엇이 영향받는지(`impact`), 누가 무엇을 부르는지(`callers`/`callees`)를 물을 때. 파서가 파싱한 심볼과 `CALLS`·`IMPORTS` 관계에서 답이 나온다.

**grep** — 커밋 안 된 변경, 문자열 자체를 찾을 때(주석·문서·설정 파일), index가 커버하지 않는 언어의 세부(대부분 언어는 심볼·`CALLS`는 되지만 `IMPORTS`·`impact`는 JS/TS와 Python만 된다).

## 해석률이 낮으면 빈 결과는 "모름"이다

`status`가 내는 줄 중 가장 중요한 것은 import 해석률이다. `impact`가 아는 것은 전부 해석된 import edge에서 오므로, **해석률이 낮으면 `impact`의 빈 결과는 "영향 없음"이 아니라 "모름"이다.** 인덱싱이 돌았는지가 아니라 무엇을 아는지를 `status`로 먼저 확인한다.

호출 해석은 이름 기반 휴리스틱이다 — 타입 해석 없이 이름과 위치로 동명이인을 고르므로 오버로드와 동적 디스패치에서는 틀릴 수 있다.

## 설치 없이 돈다

파서는 바이너리에 실려 있다. 15개 언어(TS·TSX·JS·Python·Go·Rust·Java·Kotlin·C#·C·C++·Ruby·PHP·Swift·Dart)를 지원하고, git 저장소가 아니면 인덱싱하지 않는다 — 서술할 수 없는 것을 인덱싱하는 대신 그렇게 말한다. 인덱스는 `.reap/.index/`에 살고 `init`이 gitignore에 넣는다.
