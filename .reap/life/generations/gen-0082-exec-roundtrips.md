---
id: gen-0082-exec
slug: roundtrips
type: exec
milestone: ms-019
title: 왕복 검증 — tarball 설치 새 프로젝트, v0.17 표본 upgrade agent 경로 이주
startedAt: 2026-09-03T15:33:02Z
startCommit: e9dbda8
status: closed
closedAt: 2026-09-03T15:58:01Z
endCommit: bb81163
---
## Intent

ms-019 task 1·2 — Bun 없는 PATH에서 tarball 설치본으로 (1) 빈 리포 init→세대→complete 왕복과 `--plugin-dir` 세션의 상태 줄·skill 확인, (2) v0.17 표본을 upgrade agent 본문(1~5단계)대로 `/reap:migrate`까지. README·agent 본문·skill이 어긋나면 이 세대에서 고친다. 끝은 두 왕복의 수행 로그와 doctor 0.

수행: worktree `../reap-wt-verify`(브랜치 `ms-019-verify`)에서 subagent.

## Outcome

**어긋남 수정** (커밋: 이 세대 뒤에 이어짐)
- `plugin/skills/migrate/SKILL.md` 1/8 표: "hooks 안의 파일"이 `detect-version.sh`가 이미 "v0.17 관례(onXxx) 훅 파일만"으로 좁혀놓은 것과 어긋났다(87791b6에서 스크립트만 고쳐졌고 표는 안 고쳐졌었다) — "hooks 안의 v0.17 관례(onXxx) 훅 파일"로 정정
- 같은 파일 32행 "이름이 같다고 표지가 아니다" 문장이 `sequence/`·`vision/milestones/`만 예시로 들고, 스크립트 주석이 함께 드는 `config.yml`(agentClient·language)과 `hooks/`(v0.18 init도 `conditions/always.sh`를 놓음)는 빠져 있었다 — 스크립트 주석과 맞춰 두 예시를 추가
- `migration-map.md` #9의 "v0.18 init이 놓은 always.sh는... 내용이 같다"가 실측과 어긋났다 — v0.17 원본에 주석 한 줄이 더 있다(동작은 동일: `exit 0`). "동작이 같다. 원본에 주석 한 줄이 더 있을 수 있으나 무해하다"로 정정

**왕복 1 — 새 프로젝트** (표본: `scratchpad/roundtrip/proj`, prefix: `scratchpad/roundtrip/prefix`)
- `bun run build:node` → `npm pack`(19 files, `src/`·`tests/`·`plugin/`·`.reap/` 없음 확인) → `npm install --global --prefix <임시>` → PATH에서 `~/.bun/bin` 제거 + prefix/bin 선두 배치, `command -v bun` 실패로 부재 확인
- `reap --version` → `reap 0.18.0`. 빈 git 리포에서 `init`→`make loop --type plan`→`make milestone --from ... --focus`→`make generation --milestone`→파일 커밋→`mark generation --closed`→`doctor`(**결함 0**) 전부 통과
- `ctx --hook`: `>` 리다이렉트로 받은 원문을 Node·Python `json.loads` 양쪽으로 파싱해 유효한 JSON임을 확인, `additionalContext`에 `응답 언어:`와 `현재 milestone` 상태 줄 포함 확인. (첫 시도에서 zsh `echo`의 백슬래시 이스케이프 때문에 "깨진 JSON"으로 오판했던 것은 스스로 정정 — Dead Ends 참고)
- `claude --plugin-dir <worktree>/plugin -p "..."` 비대화 1회로 통과: 세션 시작 시 주입된 상태 줄(응답 언어·현재 milestone·열린 loop·기억·구조·안내문)을 원문 그대로 출력했고, `/reap:`로 시작하는 skill 10종(carve-milestone·cleanup·complete·evolve·init·interview·loop·migrate·orchestrate·report-issue)을 정확히 열거했다 — 2회 한도 중 1회만 사용

**왕복 2 — v0.17 표본 이주** (표본: `scratchpad/roundtrip/migrate-sample`, v0.17 원본은 `~/cdws/reap_v17/.reap`에서 읽기만)
- 표본에 매핑 #9 실검증용 `hooks/onLifeCompleted.notify.sh`(`echo done`, 실행비트)를 추가하고 전부 커밋
- upgrade agent 본문 1~5단계: 1 사전점검(v0.17 표지·git 클린·node/npm) 통과 · 2 tarball 설치(왕복1 prefix 재사용, `reap --version` 재확인) · 3 플러그인은 `--plugin-dir`로 대체(왕복1에서 이미 확인, 재호출 안 함) · 4 `/reap:migrate` 진입(아래) · 5 마무리(doctor 0·기록 파일 존재 확인, 아래)
- migrate SKILL 8단계: 1/8 `detect-version.sh` → `v017`, 근거 `lineage/ vision/memory/shortterm.md hooks/ 안의 v0.17 훅 파일` — **정정한 스크립트 표지 정의가 실측과 일치** · 2/8 `git status --porcelain` 비어 있음·`life/current.yml` 없음, 차단 없이 통과 · 3/8 고지 실측(memory 168줄·lineage 96개·backlog 9개·environment 2파일·vision/design 10개) · 4/8 `git mv .reap .reap-v0_17` · 5/8 `reap init`(표본 루트) — `language: ko`·`agentClient: claude-code`가 구 값(korean·claude-code)과 이미 일치, 추가 편집 불필요
- 6/8: `migration-map.md` 전문을 지시로 준 Task subagent가 수행(주 세션은 데이터 내용을 안 읽음). 매핑 1(genome 3종 그대로)·2(longterm 45개 중 23개 선별, mid/shortterm 전량 폐기·근거 기록)·3(backlog 9/9 `reap make backlog --type task`로 재발급)·4(milestones 없음)·5(goals 13/17 살아있는 목표만 초안, 등록은 안내만)·6(design 10/10 `reap make idea --kind file`)·7(config 폐기 필드 8개: project·autoSubagent·autoUpdate·autoIssueReport·strictEdit·strictMerge·evaluator·lastMigratedVersion)·8(lineage 96·sequence(없음)·reap-guide.md 미승계)·9(`onLifeCompleted.notify.sh`→`gen.closed.notify.sh`, 본문·실행비트 그대로, conditions 3종 복사)·10(summary.md·source-map.md 그대로 복사, resources/domain/docs 없음) 전부 수행, 발급 id는 기록 파일 참고
- 7/8 `reap doctor` → **결함 0**, 참고 4(genome·environment 크기 안내선 — v0.17 원본이 이미 컸던 것을 "내용 수정 안 함" 원칙대로 그대로 옮긴 결과, 트리밍은 사용자 몫)
- 8/8 기록 파일 `.reap/archive/migration-v0_17.md` 작성(옮긴 것·옮기지 않은 것·이행 안내 대상·검증(doctor 전문)·홈 정리 다섯 절, 되돌리기 한 줄 포함)
- 끝 확인: `gen.closed.notify.sh` 존재·실행비트 확인 · `hooks/conditions/`에 원본 3종(always.sh·has-code-changes.sh·version-bumped.sh) 확인 · `environment/summary.md`·`source-map.md` 원본과 `diff` 완전 동일 · 기록 파일에 매핑 9·10 절 있음 · `.reap-v0_17/`는 격리 커밋(8a07ca5) 이후 `git diff`가 빈 것으로 무손상 확인(252 파일, 원본 251 + 검증용 훅 1) · `reap make generation --backlog bk-f875ae`로 세대를 열고 `mark ... --closed`로 닫자 **`--- hooks ---` 아래 `[gen.closed.notify.sh]` `done`이 실제로 출력** — 이주된 훅이 발화함을 확인. 이 시험 세대는 중간 커밋 없이 닫혀 doctor가 결함 1(커밋 없이 닫힌 generation)을 새로 잡았으므로 `--aborted`로 지워 표본을 doctor 결함 0 상태로 되돌림(발화 증거는 로그에 이미 남음)
- 홈 정리(8/8 마지막)는 목록만 제시하고 수행하지 않음(표본이 홈이 아니므로 애초에 손댈 것도 없었음)

**리포 검증**: `bun test` 214 pass, `bun run typecheck` 통과, `bash tests/hook.test.sh` 전부 통과, worktree 자체 `./dist/reap doctor` 결함 0(참고 1 — `gen-0081-exec`는 다른 세션 소유라 안 건드림).

## Dead Ends

- **`ctx --hook` JSON을 zsh `echo`로 파일에 옮기면 깨진다.** `HOOK_OUT="$(reap ctx --hook)"; echo "$HOOK_OUT" > f`로 캡처했더니 Node·Python 둘 다 "제어 문자가 있는 잘못된 JSON"이라고 거부했다 — reap 출력 자체는 정상(`\n`을 제대로 이스케이프)이었는데, **zsh 내장 `echo`가 기본으로 `\n`을 실제 개행으로 해석**해 파일에 raw newline이 섞였다. `reap ctx --hook > f`(리다이렉트 직결)로 다시 받으니 유효한 JSON이었다. 바이너리·JSON처럼 이스케이프가 의미 있는 출력을 캡처할 때는 `echo`를 거치지 말고 리다이렉트나 `printf '%s'`를 쓴다.
- **세대를 열고 곧바로 닫는 "훅 발화만 보려는" 시험이 doctor 결함을 남긴다.** `reap make generation`→`mark --closed`를 그 사이 커밋 없이 하면 doctor가 "커밋 없이 닫힌 generation"을 결함으로 잡는다. 발화 자체는 그 시점 출력으로 이미 증명되므로, 표본을 깨끗하게 남기려면 시험 후 `mark ... --aborted`로 정리하거나(레지스트리 행은 append-only라 남는다 — lessons.md 참고) 애초에 닫기 전에 더미 커밋을 하나 끼운다.
