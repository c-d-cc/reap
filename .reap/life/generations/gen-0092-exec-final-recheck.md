---
id: gen-0092-exec
slug: final-recheck
type: exec
milestone: ms-019
title: 최종 재검증 — en/ko 왕복 둘·발행 직전 체크·문서 정합
startedAt: 2026-09-04T01:33:58Z
startCommit: c396352
status: open
---
## Intent

ms-019 task 5 — tasks/5-final-recheck.md 전부: 왕복 1(en, 그리고 `REAP_LANG=ko`), 왕복 2(v0.17 표본 이주 → `language: ko` 프로젝트가 한국어 출력, `--plugin-dir` 세션이 한국어 상태 줄), 06-release "발행 직전 체크" 실제 실행, release-policy·06·README·upgrade agent·마켓플레이스 항목 정합 대조, orchestrate skill에 submodule worktree 한 줄. 어긋남은 이 세대에서 고친다. 끝은 출력 로그가 기록에 있고 doctor 0.

## Delegation

brief로 subagent에게 — **주 트리에서**(worktree 아님; submodule 체크아웃이 여기 있다). `make`·`mark` 금지.

## Outcome

표본 위치: `/private/tmp/.../scratchpad/final/`(en 왕복: `proj-en/`·`prefix/`·`pack/`, ko 이주: `migrate-ko/`). 이 경로는 세션마다 바뀌는 scratchpad라 다음 세대가 재현하려면 A·B 절차를 다시 밟아야 한다.

**A — 왕복 1 (en)**
- `bash scripts/verify-package.sh` 파이프 없이 실행 → 전 단계 PASS, `VERIFY_SCRIPT_EXIT=0`(빌드→pack→전역 설치→bun 제거 PATH→`--version`·`init`·`make loop/milestone/generation`·`mark`·`ctx --hook`(JSON 유효)·`doctor`(결함 0)·`plan sources`·`index update/status`·`orch claim/release` 전부 통과)
- 별도 prefix(`bun run build:node`→`npm pack`→임시 prefix 전역 설치→bun 제거 PATH)를 다시 만들어 `proj-en`(빈 git 리포)에서 `reap init` → `doctor`(결함 0)
- `claude --plugin-dir plugin -p "Print the injected reap status block verbatim and list every /reap: skill name"` 1회(2회 중 1회) — 답은 "reap 상태" 블록을 **한국어로 번역해** 인용했다(이 세션 자신의 글로벌 응답언어 지시 때문 — Dead Ends 참고). 원문 진위는 `reap ctx --hook`을 `>` 리다이렉트로 직접 캡처해 확인: `Response language: en` · `Memory: .reap/vision/memory/lessons.md` · `Structure: .reap/map.md` — en 라벨 확정. skill 이름은 답에 10종(carve-milestone·cleanup·complete·evolve·init·interview·loop·migrate·orchestrate·report-issue) 정확히 열거됨
- 같은 리포(`proj-en`, `config.language: en`)에서 `REAP_LANG=ko reap`(인자 없이) → **영어 usage 그대로.** 결함이 아니다 — `src/i18n.ts`의 `resolveLanguage`는 `config.language → REAP_LANG → en` 순이고 README의 "REAP_LANG=ko outside a project" 문구와 일치한다. `.reap/`가 없는 별도 디렉터리에서 같은 명령을 돌려 REAP_LANG 자체는 한국어 usage를 정확히 내는 것도 확인(`사용법: reap <명령>...`)

**B — 왕복 2 (ko 이주)**
- `~/cdws/reap_v17/.reap`을 복사해 전부 커밋한 표본(`migrate-ko`)에서 migrate SKILL 8단계 전부 수행
- 1/8 `detect-version.sh` → `v017`(근거: `lineage/ vision/memory/shortterm.md`) · 2/8 `git status --porcelain` 빈 값·`life/current.yml` 없음, 차단 없음 · 3/8 분량 실측(memory 168줄·lineage 96개·backlog 9개·environment 2파일·design 5개·goals 38줄) · 4/8 `git mv .reap .reap-v0_17` · 5/8 `reap init` 뒤 `config.yml`을 수기로 `language: ko`(구 값 `korean`→`ko` 변환)·`agentClient: claude-code`(이미 일치)로 맞춤
- 6/8: `migration-map.md` 전문을 지시로 준 general-purpose subagent(agentId a6df2a48c05c93053)가 매핑 1~10 전부 수행 — genome 3파일 그대로, longterm 45줄 전량을 lessons.md로(제목만으로 결론 기준 통과), backlog 9/9 재발급, 열린 milestone 0건(원본에 milestone 개념 자체가 없음), goals 13개 초안, design 10/10(`vision/design/` 최상위 4 + `backlogs_v0.18/` 6) idea로, config 탈락 필드 8개 기록, lineage·sequence·reap-guide.md 비승계, hooks(이벤트 이름 매칭 파일이 이 스냅샷엔 없어 이동 0건, conditions/ 3파일 그대로), environment(summary·source-map 그대로, resources/domain/docs 없음)
- 7/8 `reap doctor` → **결함 0 · 참고 5**(전부 크기 안내선·lessons.md 누적 경고, 결함 아님) — 참고 5건 원문을 기록 파일 Verification 절에 그대로 붙임
- `.reap-v0_17/`은 격리 커밋 이후 `git diff --stat .reap-v0_17`가 빈 것으로 무손상 확인
- 8/8 기록 파일(`archive/migration-v0_17.md`) — subagent가 Moved/Not moved/Needs updating 초안을 쓰고, 이 세션이 Verification(doctor 전문)·Home cleanup(표본이라 미수행, 실제 홈에서 지울 allowlist 4항목만 제시) 절을 채워 완성
- `claude --plugin-dir plugin -p "주입된 reap 상태 블록을 그대로 출력하고 /reap: skill 이름을 전부 나열하라"` 1회(2회 중 2회, 포그라운드 재시도 — Dead Ends 참고) — 답이 "응답 언어: ko" 한 줄을 누락한 채 나머지(기억·덜 단단한 것·구조 안내 3줄)만 한국어로 인용했다. 원문은 다시 `reap ctx --hook` 직접 캡처로 확인: `응답 언어: ko` · `기억: .reap/vision/memory/lessons.md` · `덜 단단한 것: .reap/idea/ (files 10)` · `구조: .reap/map.md` — ko 라벨 확정. skill 10종도 정확히 열거됨(마지막에 milestone이 없어 "현재 milestone" 줄은 애초에 안 뜬다 — 이 표본에 milestone 개념이 없으므로 정상)

**C — 발행 직전 체크 (06-release 코드 블록 실제 실행)**
- `cd ~/cdws/reap_v17 && npm pack --dry-run` → `@c-d-cc/reap@0.17.8`, 87 files, exit 0 (bun test는 브리핑 지시로 건너뜀 — v0.17 바이너리가 홈에 자체 설치하므로. 전 스위트 초록 자체는 task 3의 커밋 `0f25750`에 이미 기록됨: bun test 1047 pass·check-docs-version.sh·check-self-diagnosis.sh 통과)
- `cd ~/cdws/reap && bun test` → **227 pass, 0 fail**(25.28s) · `./tests/hook.test.sh` → 5개 항목 전부 PASS · `npm pack --dry-run` → `@c-d-cc/reap@0.18.0`, 20 files, exit 0
- `curl -fsI https://raw.githubusercontent.com/c-d-cc/reap/main/docs/upgrade-agent/reap-upgrade.md` → **404**(exit 56, `-f`가 실패 처리) — **정상.** main(b4d3ae1)엔 아직 이 파일이 없다(v0.17→main merge 전). 06-release 2번 항목이 이미 이 순서를 전제한다
- `npm view @c-d-cc/reap dist-tags` → `{ alpha: '0.16.0-alpha...', latest: '0.17.7' }` — `next`·0.17.8 둘 다 아직 없음. 발행 전 상태와 일치(publish는 사람의 몫)

**D — 정합 대조**
- 설치 명령(`npm i -g @c-d-cc/reap@next` · `claude plugin marketplace add c-d-cc/plugins` · `claude plugin install reap@ctod-plugins`) — README.md·README.ko.md·site/install.md·upgrade agent 3단계·`ctod-plugins/.claude-plugin/marketplace.json`(name: reap, source: ./plugins/reap/plugin) 전부 동일
- npm 태그 `next` — release-policy.md·06-release.md·README·site/install.md 일치
- 이주 절차 이름 — README(8단계 요약)·site/migration.md(8단계 목록)·upgrade agent 4단계(`/reap:migrate`로 위임)·migrate SKILL.md 8단계 제목 전부 일치
- skill 10종 — README.md·README.ko.md·site/skills.md·`plugin/skills/`(shared 제외 10개 디렉터리) 전부 일치
- 버전 — `package.json`·`plugin/.claude-plugin/plugin.json` 둘 다 0.18.0
- 발행 순서 — release-policy.md "브랜치 흐름"과 06-release.md 순서 1~5 일치(main은 발행 상태에 머문다, 트랙은 완성 시 merge)
- **어긋남 발견·수정 1건**: `site/migration.md`가 "무엇을 잃는가" 목록에 "**다국어 지원** — v0.18은 한국어 전용이다"를 그대로 남기고 있었다 — Q2 답 B(en 기본 + ko 번역 층, `01-gap.md` G9)로 이미 뒤집힌 문구다. README의 "Language" 절과 정면으로 어긋나 삭제(커밋 `dc2fd75`). reap_v17 쪽의 동일 문구(RELEASE_NOTES.md·RELEASE_NOTICE.md·5개 로케일 번역)는 이 세션의 앞선 작업(커밋 `be2664a`)에서 이미 고쳐져 있었다 — v0.18 리포의 이 한 곳만 남아 있던 것
- upgrade agent(`reap_v17`)·마켓플레이스(`ctod-plugins`)는 읽기만 했고 고치지 않음 — 어긋남도 못 찾음

**E — orchestrate skill**
- probe로 실측: worktree에 submodule이 체크아웃돼 있으면 `git worktree remove`가 "working trees containing submodules cannot be moved or removed"로 실패하고 `--force`면 성공한다. `plugin/skills/orchestrate/SKILL.md` 1절에 한 줄 추가(커밋 `0687b7f`)

**최종 상태**: `./dist/reap doctor` → 결함 0 · 참고 1(map.md가 씨앗과 다름 — 이 리포가 스스로 진화시킨 정상 상태, 이번 세대와 무관). `git status --porcelain` 빈 값.

## Dead Ends

- **`claude -p`에 "있는 그대로 출력"을 시켜도 믿을 수 없다.** en 왕복에서는 이 세션 자신의 글로벌 응답언어 지시("항상 한국어로 답하라") 때문에 영어 원문 상태 블록을 한국어로 번역해 "그대로"라고 답했다. ko 왕복에서는 이미 한국어라 번역은 안 일어났지만 그래도 "응답 언어: ko" 한 줄을 답에서 누락했다. 두 경우 다 `reap ctx --hook`을 `>` 리다이렉트로 직접 캡처한 원문과 대조해서만 진위를 확인할 수 있었다 — 다음에 비슷한 검증을 할 때 `claude -p`의 "verbatim" 답은 참고용이지 증거가 아니다. 원문 캡처가 증거다
- **`claude -p` 백그라운드 실행이 20분 넘게 0바이트로 멈췄고 Monitor 알림이 안 왔다** — 팀 리드가 이전 세대에서도 같은 증상(40분 멈춤)을 겪었다고 전했다. `run_in_background`로 던진 프로세스를 `kill`하고 포그라운드에서 `perl -e 'alarm 300; exec @ARGV' -- claude -p ...`(이 macOS/zsh 환경엔 `timeout`/`gtimeout`이 없다)로 재시도해 exit code와 출력을 직접 받았다. `claude -p`를 백그라운드로 던지지 말고 포그라운드+alarm으로 부르는 편이 낫다
- **`REAP_LANG=ko reap`가 프로젝트 안에서 영어를 냈다고 처음엔 결함으로 의심했다** — 실제로는 `resolveLanguage`의 `config.language → REAP_LANG → en` 우선순위와 README의 "REAP_LANG=ko outside a project" 서술이 정확히 일치하는 설계다. `.reap/`가 있는 프로젝트 안에서는 REAP_LANG이 config를 못 이긴다 — 이건 결함이 아니라 문서화된 동작이다
