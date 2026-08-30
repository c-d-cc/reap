# 3.1 — `context.md`와 `build-context`를 드러낸다

`06-agent.md:36`이 이미 "맥락을 조립하는 별도의 skill도 두지 않는다"고 못 박았는데(`gen-0006-plan`) 같은 문서의 skill 표에 `build-context`가 남았고, `make milestone`은 아무도 안 쓰는 `context.md`를 계속 만들었다. **사람이 판정했다 — 둘 다 드러낸다.**

## 손댈 곳

전수로 찾아둔 것이다. 작업 중에 더 나오면 그것도 함께 본다.

| 파일 | 무엇 |
|---|---|
| `docs/.../02-flow.md:46` | 세션 흐름 도식의 `/reap:build-context` 줄 |
| `docs/.../02-flow.md:83` | 지점 표의 "맥락 쌓기" 행 |
| `docs/.../03-storage.md:22` | milestone 디렉토리 레이아웃의 `context.md` 줄 |
| `docs/.../04-commands.md:78` | `doctor` 누적 경고가 `context.md`를 안내선 대상으로 든다 |
| `docs/.../06-agent.md:110` | skill 표의 `build-context` 행 → **8종에서 7종으로** |
| `docs/.../06-agent.md:109` | `evolve`가 "`build-context`로 넘긴다"는 서술 |
| `docs/.../06-agent.md:20,32,45` | `context.md`를 조립 대상·상태 줄 예시로 드는 대목 |
| `docs/.../README.md:19` | 색인의 "skill 8종" |
| `src/entries.ts:37` | `make milestone`이 만드는 파일 목록 |
| `src/ctx.ts:48` | 상태 줄이 이름을 내는 milestone 문서 목록 |
| `src/templates/map.md:34` · `.reap/map.md` | milestone 디렉토리 설명. **둘은 byte-identical이어야 한다** |
| `tests/ctx.test.ts:32,81` · `tests/entries.test.ts:32,237,244` | `context.md`를 전제한 테스트 |

## 함정

- **`.reap/map.md`와 `src/templates/map.md`는 같은 내용이어야 한다.** 한쪽만 고치면 `doctor`가 나중에 씨앗 불일치로 보고할 것이고, 지금은 아무도 안 잡는다
- **`06-agent.md:36`은 고치지 않는다.** 그 문장이 참이고, 표가 그것을 따라가는 것이다. 방향을 거꾸로 잡으면 `gen-0006-plan`의 결정을 뒤집는 셈이 된다
- **skill 개수는 두 곳에 있다** — `06-agent.md:103`의 절 제목("배포하는 skill 8종")과 `README.md:19`의 색인. `gen-0021-fix`가 방금 이 둘이 어긋난 것을 고쳤다. 또 어긋나게 하지 않는다
- `tests/entries.test.ts:237,244`는 **archive 이동 시 파일이 함께 따라가는지**를 보는 테스트다. `context.md`를 지우면 그 검증 대상을 다른 파일로 옮겨야지, 테스트를 지우면 안 된다

## 정해야 할 것

**이미 archive된 두 milestone(`ms-001`·`ms-002`)의 빈 `context.md`를 지우는가.** 지우면 이력이 깔끔하고, 두면 "그때는 있었다"는 사실이 남는다. 새로 만든 `ms-003`의 것은 지운다.

## 완료 판정

- `grep -rn "context.md\|build-context" docs/ src/ plugin/ tests/ .reap/genome/ .reap/environment/ .reap/map.md`가 비거나, 남은 것이 전부 **의도적으로 남긴 이력**임을 설명할 수 있다
- `make milestone`이 만드는 파일이 `decisions.md`·`handoff.md` 둘이다
- skill 개수를 말하는 두 자리가 모두 **7종**이다
- `bun test` 통과 · `typecheck` 0
