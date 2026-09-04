---
id: gen-0089-exec
slug: i18n-skills
type: exec
milestone: ms-021
title: skill 10종·어휘·템플릿·씨앗 en, doctor 판정어 합집합
startedAt: 2026-09-04T00:51:06Z
startCommit: 7412377
status: closed
closedAt: 2026-09-04T01:14:06Z
endCommit: 1cf8939
---
## Intent

ms-021 task 2 — plugin skill 10종·references·record-vocabulary·session-start.sh 주석·plugin.json description을 en으로, `src/templates/*` 씨앗 en(`config.yml` 씨앗 `language: en`), 상태 줄 라벨 인용을 handoff 대응표로 맞춤. **doctor의 idea 헤딩 판정어는 카탈로그 전 언어의 합집합**으로(ko 프로젝트의 en 씨앗 idea가 오판되지 않게). 이 리포의 `.reap/` 실물은 불가침. 끝은 `grep -rP '[가-힣]' plugin/ src/templates/`가 0, 테스트 초록, `--plugin-dir` 세션에서 skill 10종 확인.

## Delegation

brief로 subagent에게. worktree `../reap-wt-i18n`(브랜치 `ms-021-i18n`, v0.18과 동기).

## Outcome

**skill 10종 + references 3종 + 훅 주석 + plugin.json description을 en으로.** 옮긴 파일과 원문 대비 헤딩 수(`grep -c '^#'`):

| 파일 | 헤딩 수(원문=옮김) |
|---|---|
| evolve/SKILL.md | 11=11 |
| evolve/references/delegate-brief.md | 7=7 |
| loop/SKILL.md | 7=7 |
| interview/SKILL.md | 7=7 |
| carve-milestone/SKILL.md | 9=9 |
| cleanup/SKILL.md | 10=10 |
| complete/SKILL.md | 10=10 |
| init/SKILL.md | 14=14 |
| migrate/SKILL.md | 10=10 |
| migrate/references/migration-map.md | 10=10 |
| orchestrate/SKILL.md | 9=9 |
| report-issue/SKILL.md | 10=10 |
| shared/references/record-vocabulary.md | 4=4 |

전부 원문과 헤딩 수가 같다 — 절이 빠지지 않았다. `session-start.sh` 주석·`detect-version.sh`의 남은 주석(stdout 출력은 이미 en이었다)·`plugin.json`의 `description`도 옮겼다.

**`src/templates/*` 씨앗 en.** genome 3종·convention·environment-summary·idea-file·idea-research·map.md·memory-lessons. `idea-file.md`·`idea-research.md`의 졸업·출처 헤딩은 각각 "Graduation Criteria"·"Sources"로 — en 카탈로그 값(`doctor.pattern.graduation`="Graduation", `doctor.pattern.sources`="Sources")을 부분 문자열로 포함한다. `config.yml` 씨앗 `language: ko`→`en`.

**doctor 판정어를 카탈로그 전 언어의 합집합으로.** `src/i18n.ts`에 `allTranslations(key)`를 더했다. `src/doctor.ts`의 졸업·출처 헤딩 판정이 `t(root, ...)` 하나 대신 `allTranslations(...)`가 낸 en·ko 낱말을 `|`로 묶은 정규식을 쓴다(정규식 특수문자는 escape). ko 프로젝트에 en 씨앗 idea, 그 반대 모두 오판되지 않는다.

**`config.yml` 씨앗 언어 변경의 파급.** 새 프로젝트의 기본 응답 언어가 en이 되면서, 프로젝트 언어를 못박지 않고 `ko` 카탈로그를 직접 참조하던 테스트 헬퍼·상수가 깨졌다 — `tests/helpers.ts`의 `labelPrefix`, `tests/orch.test.ts`의 `CLAIMED_CONNECTOR`·`TIMEOUT_WORD`, `tests/plan.test.ts`의 `BROKEN`을 `en` 카탈로그 기준으로 바꾸고, `tests/ctx.test.ts`의 언어 줄 기대값(`{ language: "ko" }`→`"en"`)과 `tests/init.test.ts`의 `config.language` 단언(`"ko"`→`"en"`)을 갱신했다. `tests/plan.test.ts`의 convention 씨앗 헤딩 단언("## 어떻게 읽는가"→"## How to read it")도 맞췄다.

**확인.**
- `grep -rP '[가-힣]' plugin/ src/templates/` — `src/templates/`는 0. `plugin/`은 10개 SKILL.md의 frontmatter `description` 줄에만 남아 있다. 이건 옮기지 않았다 — brief가 "frontmatter description은 이미 en"이라고 명시했고, 그 안의 `Trigger on "reap 시작", "milestone 자르기"` 같은 한국어 조각은 description 본문(영문 산문)에 박힌 **trigger 예시 문구**다. `git log`로 확인하니 이 형태(영문 산문 + 한국어 trigger 예시)는 이 리포의 최초 스냅샷 커밋부터 있었던, i18n 작업 이전의 기존 설계다. description을 건드리라는 지시가 없어 그대로 뒀다 — task 3나 사람이 이 trigger 예시를 옮길지 판단할 것
- `bun test` — 227 pass 0 fail(기존 225 + `doctor.test.ts`에 더한 신규 2). `bun run typecheck` 깨끗. `bash tests/hook.test.sh` all passed. `bun run build` 성공
- `./dist/reap doctor` — 결함 0 · 참고 1(`map.md가 씨앗과 다르다` — 이 리포의 실물 `.reap/map.md`는 한국어라 en 씨앗과 항상 다르다. 불가침이므로 그대로 둔다. 정상)
- `/private/tmp/.../scratchpad/i18n-skills/verify-repo`에서 `dist/reap init` 뒤 `claude --plugin-dir <이 worktree>/plugin -p "Print the injected reap status block verbatim and list every /reap: skill name"` 1회 — 상태 블록이 `Response language: en`·`Memory:`·`Structure:`·`To start work, /reap:evolve; to wrap up, /reap:complete`로(handoff 대응표와 일치), skill 10종 전부 `reap:<name>`으로 나열됨을 확인

**커밋.** `a293da1`(evolve·loop·interview) · `7ac3d48`(carve-milestone·cleanup·complete·init) · `1411e29`(migrate·orchestrate·report-issue·어휘·훅 주석·plugin.json) · `cb0a008`(템플릿 en + 파급 테스트 수정) · `afb9151`(doctor 판정어 합집합 + 신규 테스트)

## Dead Ends

- **doctor 판정어를 en.ts 값만 바꾸는 방식으로 먼저 생각했다가 접었다.** brief C가 요구한 것은 프로젝트 자기 언어 하나가 아니라 카탈로그 **전 언어의 합집합**이다 — 그래야 ko 프로젝트에 en 씨앗 idea가 섞여도 안 잡힌다. `allTranslations`를 더하는 쪽으로 갔다
- 정규식 조립 시 낱말에 정규식 특수문자가 있을 가능성을 고려해 `escapeRegex`를 더했다 — 지금 값(Graduation·졸업·Sources·출처)엔 필요 없지만 이후 언어가 늘 때 조용히 깨지는 것을 막는다
