# v0.17 대조 — 무엇이 빠졌고 무엇을 만들지 않는가

실측은 2026-09-03, `~/cdws/reap_v17`(v0.17.7 + 다리 5커밋)과 reap v0.18(71d5681) 기준. 1차 판정은 ps-4f2a91 `08-delivery.md`의 폐기 표와 ps-4b485d `03-compat.md`의 6건(gen-0066)이 이미 했고 **유지한다.** 이 문서는 그 두 표가 다루지 않은 잔여를 전수로 훑은 결과다.

## 만든다 — v0.18에 자리가 없어 이주한 사용자가 실제로 잃는 것

| # | v0.17 | v0.18 현재 | 판정 | 근거 |
|---|---|---|---|---|
| G1 | `npm i -g @c-d-cc/reap` (node) | `package.json`이 `reap 0.1.0 private`, bin이 `src/cli.ts`(Bun 전용) | **npm 배포 패키지** — node 번들 + `@c-d-cc/reap@0.18.0` + `next` 태그로 발행하는 release 워크플로 | 0.17.8 다리와 upgrade agent가 `npm i -g @c-d-cc/reap@next`를 전제한다 ([02-distribution.md](02-distribution.md)) |
| G2 | README 5로케일 · `reap help <topic>` 16주제 · reap.cc 사이트 24쪽 | README 없음, 사용자 문서 없음 | **README(설치·플러그인·첫 세대·이주·제거)** | upgrade agent 3단계가 "설치된 패키지의 README를 따라 플러그인을 설치하라"고 지시한다. 사이트는 방향 결정 대상 ([05-open.md](05-open.md)) |
| G3 | hooks — 14이벤트 `.sh/.md`, conditions, `make hook` | `.reap/hooks/` 자리만, `make hook` 없음, 이벤트 발화 없음 | **hooks 6이벤트 + `make hook`** | 사람(2026-09-01, gen-0074): "v0.18도 hooks 제공 예정, lifecycle만 다름". 07-orchestrate의 "아직 아니다"는 그 결정으로 만료 — spec 갱신이 이 milestone 안이다 |
| G4 | `environment/` summary·source-map·domain·resources·docs | 이주 매핑 9종에 **environment/가 없다** | **migrate 매핑 보강** — environment/ 이주, hooks 이주(G3 뒤), README 경로 정합 | 사용자가 쓴 지식이 조용히 `.reap-v0_17/`에만 남는다 — 매핑 공통 규칙 "조용히 안 버림" 위반 |
| G5 | SessionStart가 `config.language`로 "이 언어로 답하라"를 주입 | `ctx`가 language를 읽지 않는다 | **ctx 언어 줄** | 파일 세 줄. 이주 시 language를 승계하면서 아무 데도 안 쓰면 승계가 무의미하다 |
| G6 | RELEASE_NOTES · GitHub Release · CI(ci/docs/release.yml) | `.github/` 없음(apocalypse) | **release 준비물** — 0.18.0 노트, v0.18용 ci.yml·release.yml(`--tag next`), 0.17.8 bump·노트(reap_v17), 마켓플레이스 `reap2→reap` 준비 | v0.17 release.yml은 태그 push로 `npm publish`(태그 없음 = latest)한다. **그대로 두면 0.18 태그가 latest가 된다** — 차단의 원천이 무너진다 |
| G7 | — | bk-bb11a1 열림 | **loop skill에 plan source 소비 완료 판정 step** | 이 loop 자체가 그 판정을 손으로 했다 |
| G8 | — | 실물 검증은 migrate 1회(gen-0073) | **왕복 검증** — tarball 설치 → 새 프로젝트 init → 플러그인 로드 → v0.17 표본을 upgrade agent 경로로 이주 → doctor 0 | 발행 전 유일한 end-to-end |
| G9 | CLI 4개 언어 · README 5로케일 | 한국어 전용 | **en 기본 + ko 번역 층** — CLI 메시지 카탈로그(`config.language`가 고른다), skill 본문 en(agent는 `응답 언어` 줄로 사용자 언어로 답한다), README en + README.ko | 사람 Q2 답 B (2026-09-04). genome의 문자열 규칙이 바뀐다 |
| G10 | reap.cc 사이트 24쪽 × 5로케일 | 없음 | **새 문서 사이트** — 한국어 먼저, 사람 검수 뒤 확장 | 사람 Q1 답 (2026-09-04) |
| G11 | 테스트 private 리포 submodule + CI dispatch | `tests/` 리포 안 | **reap-test `v0.18` 브랜치 submodule + dispatch** | 사람 Q3 답 B (2026-09-04) |
| G12 | `/reap.evolve` — 세대를 subagent가 통째로 수행 | evolve는 주 세션이 직접 | **evolve 위임 모드** — 주 세션이 세대를 열고 Intent를 적은 뒤 subagent가 일하고 주 세션이 `complete` | 사람 Q4 답 B (2026-09-04). `.session`은 주 세션 것이라 충돌 없음 |

## 만들지 않는다 — 상당물이 있거나 폐기 확정

| v0.17 | v0.18의 자리 | 근거 |
|---|---|---|
| `run start/next/back/abort/early-close/evolve` · `/reap.*` 흐름 명령 7종 | `evolve`·`complete` skill (흐름은 판단) | 08-delivery 폐기 표 |
| `cruise` · `cruiseCount` | 없음 | 08-delivery |
| `merge/pull/push` lifecycle · `/reap.merge` 등 3종 | `orchestrate` skill + git 직접 | 08-delivery |
| `reap-evaluate` agent · `evaluator` | orchestrate의 한 사용 사례 | 08-delivery. 단 subagent 실행자 모델은 방향 질문 ([05-open.md](05-open.md)) |
| `status` · `config` · `check-version` · `uninstall` | `ctx` 상태 줄·`doctor`·config 직접 편집·플러그인 제거 | gen-0066 |
| `update` · migration instruction layer · `lastMigratedVersion` | `migrate` skill(0.17→0.18 한 번) · 이후는 `doctor`·`init --check` | 08-delivery. 0.18.x 사이 구조 변경이 실제로 생기면 그때 |
| `fix --check` · `clean` · `destroy` | `doctor` · `cleanup` skill · `rm -rf .reap` + 플러그인 제거 | 상당물. README에 제거 절차만 적는다 |
| `install-skills` · `load-context` · `dump-state` · opencode/codex adapter | 플러그인 설치 · `ctx --hook` · 없음 | 08-delivery |
| `/reap.knowledge` · `/reap.sync` · `/reap.refreshKnowledge` | `init` skill + genome 직접 편집 | deprecated 2종은 v0.16부터 이미 안내만 |
| `/reap.help` 16주제 · `reap help` 4개 언어 | README + skill 본문 | G2가 담는다 |
| `/reap.report` · `autoIssueReport` | `report-issue` skill | 상당물 |
| `vision/goals.md` · `lineage/` · `memory/` 3단 · `current.yml` | plan source · 비승계 · `lessons.md` 선별 · `.session` | ps-4b485d 04 매핑 |
| `~/.reap/reap-guide.md` + CLAUDE.md `@` import | `ctx`가 genome을 훅으로 주입 | 06-agent |
| `autoSubagent` · `strictEdit` · `strictMerge` · `autoUpdate` | 없음 — 판단을 config로 빼지 않는다 | 06-agent interview 절, 08-delivery |
| `index search --kind` | `index search <q>` (kind 없음) | 출력에 kind가 이미 있다. 필요 신호가 오면 backlog |

## 이 표를 읽는 법

"만든다" 12건이 milestone 후보의 전부다 (G9~G12는 2026-09-04 사람의 방향 답에서 왔다). 여기 없는 v0.17 기능을 발견하면 이 표에 행을 더한 뒤 자른다 — 표 밖에서 만든 것은 근거가 없다.
