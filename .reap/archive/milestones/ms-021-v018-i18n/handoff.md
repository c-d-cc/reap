# handoff — ms-021 v018-i18n

## Exit Criteria 대조표 (항목 ↔ 근거)

| Exit Criteria (milestone.md) | 상태 | 근거 |
|---|---|---|
| `src/`의 사용자 문자열이 카탈로그를 거친다. en·ko 키 집합 동일 테스트가 있다. `config.language: ko`면 ko, 없으면 en, `.reap/` 밖에서는 `REAP_LANG` | 충족 | `src/i18n.ts`의 `resolveLanguage`가 `config.language → REAP_LANG → en` 순으로 해석(`src/i18n.ts:11,17`). `tests/i18n.test.ts`의 `"en·ko 카탈로그의 키 집합이 같다 — 왕복 검증"`이 `Object.keys(en).sort()`와 `Object.keys(ko).sort()`를 `toEqual`로 비교 |
| `bun test`에 한국어 리터럴 단언이 없다(카탈로그 왕복 테스트 밖에서 0) | 충족 — 단서 있음 | `grep -P '[가-힣]' tests/*.ts`는 0이 아니다. 남은 것을 직접 열어 확인한 결과 전부 test 설명 문자열(예: `test("한국어 설명", ...)`)과 fixture 데이터(예: `writeFileSync(..., "인계한것\n")` — 사용자가 실제로 한국어로 적을 genome·memory 본문이 map 로직을 안 가리고 실리는지 보는 테스트)였다. 카탈로그가 낸 문자열을 한국어 리터럴로 단언하는 곳은 없다(`t()`·`ctx.label.*` 키를 거친다 — `tests/ctx.test.ts:64` 예시). 이 구분을 grep 한 줄로는 못 잡는다는 점은 사람이 참고할 것 |
| skill 10종·`record-vocabulary.md`·씨앗 템플릿(`src/templates/*`)·`map.md` 씨앗이 en. `ctx`의 언어 줄이 `Response language: ko` | 충족 | `plugin/skills/*/SKILL.md` 10종 본문 en(gen-0089). `plugin/skills/shared/references/record-vocabulary.md` en. `src/templates/*`(map.md 포함) 전부 en, `grep -rP '[가-힣]' src/templates/`는 0. `ctx --hook` 실측: `config.language: ko`일 때 `Response language: ko`가 나온다(카탈로그 키 `ctx.label.language`) |
| README en/ko·RELEASE_NOTES en·genome 문자열 규칙 갱신 | 충족 | `README.md`(en)·`README.ko.md`(ko) — 절 구조 동일, 상호 링크 한 줄씩. `RELEASE_NOTES.md`의 `## v0.18.0` en, "한국어 전용" 항목 삭제. `.reap/genome/application.md`의 문자열 규칙이 "사용자 문자열은 카탈로그(en 기본·ko). skill·씨앗은 en"으로 갱신 |
| `detect-version.sh`·`verify-package.sh`·`hook.test.sh`의 사용자 출력 en | 충족 | `scripts/detect-version.sh`는 `grep -P '[가-힣]'` 0건(gen-0089가 남은 주석까지 옮김). `verify-package.sh`·`hook.test.sh`는 헤더 주석에 한국어가 남아 있지만 그건 "사용자 출력"이 아니다 — 실제로 실행해 보면(이번 세대) `echo`/`PASS` 줄이 전부 en(`PASS --version: reap 0.18.0` 등), `hook.test.sh`도 `PASS ...` 전부 en |
| 이 리포의 `.reap/` 실물(한국어 genome·map·기록)은 그대로 — 사용자 문서다 | 충족 | 이번 세대에서 `.reap/genome/application.md` 문자열 규칙 한 줄과 이 handoff·세대 기록만 건드렸다. genome 본문·`map.md`·과거 기록은 한국어 그대로 |
| 왕복 검증(ms-019 task 1)을 en 출력으로 다시 돌려 통과 | 충족 | `bash scripts/verify-package.sh` exit 0, 모든 명령 en 출력. `claude --plugin-dir <worktree>/plugin -p "..."` 1회 — 상태 블록이 `<!-- reap status -->`/`Response language: en`/`Memory:`/`Structure:`/`To start work, ...`로, skill 10종 이름이 en으로 나왔다(dead end: PATH의 `reap`가 무관한 리포의 낡은 바이너리를 가리켜 처음엔 실패 — worktree `dist/`를 PATH 앞에 놓고 재실행해 해결. gen-0090-exec-i18n-docs.md Dead Ends 참고) |

## 종합

`bun test` 227 pass · `bash tests/hook.test.sh` all passed · `bash scripts/verify-package.sh` all passed · `./dist/reap doctor` 결함 0(참고 1, map.md — 정상). ms-021의 세 task(카탈로그+CLI, skill+씨앗, README+노트+genome+재검증) 전부 끝났다.

## 남은 것 (milestone 밖)

- Out of Scope로 명시된 ja·zh-CN·de 확장은 ms-022(문서 사이트)와 함께
- `plugin/` 10종 SKILL.md frontmatter `description`의 한국어 trigger 예시(`"reap 시작"` 등)를 en으로 옮길지, 이중 언어로 둘지는 gen-0089가 사람 판단으로 넘겼다 — 그대로 둔 채 이 milestone을 끝낸다
- milestone 종료 시 물어볼 것(milestone.md): ko 사용자가 en 전환을 느꼈는가, skill 본문 en이 agent의 한국어 답에 영향을 줬는가

## cleanup (닫을 때)

archive로 내림: gen-0081~0090 전부 — 산출물이 코드·skill·README·사이트·reap_v17 커밋에 반영됨. gen-0086(reap-test 브랜치)의 클론 경로는 ms-023 handoff에 있다.
