# Handoff

## 어디까지 왔나

**task 넷 전부 완료. `ms-003`의 작업 갈래는 여기서 끝이다.**

| | 무엇을 했나 | 세대 |
|---|---|---|
| 3.1 | `context.md`와 `build-context`를 드러냈다. skill 8종 → 7종 | `gen-0023-exec` |
| 3.2 | **결정 로그 제도를 통째로 내렸다.** 지우기 전에 29줄을 전수 감사해 미반영 둘을 spec에 올렸다 | `gen-0025-exec` |
| 3.3 | `make backlog`·`make idea`. frontmatter 시간을 초 단위 ISO로 통일하고 소급 채웠다 | `gen-0026-exec` |
| 3.4 | 로드맵·spec·`summary.md` 정합. 전수 검사 19개 파일 | `gen-0027-exec` |

**계획이 한 번 뒤집혔다.** 3.2는 원래 "milestone 밖 결정의 자리를 만들고 `reap decide`를 짓는" task였다. `gen-0024-exec`을 그렇게 열었다가 사람이 반대 판단을 내려 abort했고(번호는 재사용하지 않는다), 같은 자리에 정반대 task가 섰다.

## 종료 조건 대조

1. **`context.md`·`build-context`가 어디에도 없다** — 잔여는 왜 없어졌는지를 설명하는 서술뿐. skill 7종이 두 자리에서 같다 ✓
2. **결정 로그 제도가 없다** — `05-knowledge.md`의 "결정 로그를 두지 않는다"가 규범으로 서 있고 `bk-394d82`가 닫혔다 ✓
3. **`make backlog`·`make idea`가 있다** — 손으로 쓴 넷과 같은 모양을 낸다. 실제로 불려 `bk-ce5006`을 남겼다 ✓
4. **로드맵이 실제와 맞는다** ✓
5. **`bun test` 103 · `typecheck` 0 · `hook.test.sh` 통과 · 실제 새 세션에서 상태 줄 주입 확인** ✓

`ms-001`부터 handoff가 "이 세션이 못 하는 것"으로 남겨온 **실제 세션 주입 확인**이 이번에 처음 됐다.

## 남은 것 — 다음 milestone으로

- `bk-ce5006` — `mark backlog`가 없어 `consumed`를 손으로 찍는다
- `bk-c92489` — backlog가 archive로 내려갈 길이 없다
- 둘은 **같은 뿌리**다. backlog 수명 주기에서 만드는 쪽만 도구가 갖는다. 로드맵 증분 4에 적어두었다
- `bk-15780b`은 `status: consumed`인데 `life/`에 남아 있다 — `bk-c92489`가 해결할 것

## milestone이 끝났는가

**스스로 닫지 않는다.** `milestone.md`의 "증분 2가 끝나면 물어볼 것" 다섯이 사람에게 물을 것이다.

---

## cleanup 실행 결과 (2026-08-23) — 두 번째 실행

**여섯 중 다섯을 내렸다. 하나를 남겼다.**

| 내린 것 | 판단 |
|---|---|
| `gen-0021-fix` | `fix` 축의 첫 표본. 그 판정(무엇이 fix인가)은 `02-flow.md`와 이 milestone의 fitness 4번에 있다 |
| `gen-0022-plan` | 증분 2 재구성. 근거는 `milestone.md`의 Background와 `09-roadmap.md` 머리말에 반영됐다 |
| `gen-0023-exec` · `gen-0026-exec` · `gen-0027-exec` | 산출물이 spec·코드·`summary.md`에 전부 반영됐다. 산출물을 보면 되지 기록을 다시 볼 이유가 없다 |

**남긴 것은 없다. `life/generations/`가 비었다.**

**한 번 틀렸다가 고쳤다.** 처음에 `gen-0025-exec`(결정 로그 제도를 내린다)을 "그 결정이 아직 관찰 중이니까"라며 남겼다. 사람이 *"다 완료한 건데 왜 저것만 남아 있는가"*라고 물었고, 근거가 검증을 못 버텼다 — 그 세대의 교훈 둘은 `lessons.md`로, 규칙은 `05-knowledge.md`로, 관찰은 `tracks.md`로 **내가 직접 다 졸업시킨 뒤였다.** 남길 이유로 든 29줄 감사표는 "27은 반영돼 있었고 둘은 아니었다"는 통계이고, 그 둘은 이미 spec에 올라갔다. 다시 열 상황을 한 문장으로 쓸 수 없었다.

`cleanup`의 "애매하면 남긴다"를 **애매하지 않은 것을 애매하게 만드는 데** 썼다. 그 구멍을 `plugin/skills/cleanup/SKILL.md`에 규범으로 막았다 — 남기기로 했다면 *어떤 세션이 무엇을 하다가 이 파일을 열게 되는지*를 한 문장으로 쓸 수 있어야 한다.

반영된 것은 이미 올라가 있다 — 교훈 둘이 `lessons.md`로(**규범 문장이 없으면 예시가 규범이 된다** · **제도를 지우기 전에 전수 감사한다**), 규칙은 `05-knowledge.md`로, 관찰은 `tracks.md`로.

**`tracks.md`에서 트랙 셋을 지웠다** — `decisions.md` 자리 문제 · `mark milestone --focus`/`--closed` 부재 · 손·도구 스탬프 날짜 갈림. 셋 다 이 milestone이 해소했다.
