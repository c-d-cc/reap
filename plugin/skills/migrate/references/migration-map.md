# 이주 지시문 — 6/8 subagent · 8/8 기록과 홈 정리

[SKILL.md](../SKILL.md)의 6/8과 8/8이 여기를 가리킨다. **이 문서 전체를 subagent에게 지시로 준다.**

## subagent에게 (6/8)

주 세션은 이주 데이터를 읽지 않는다 — 아래를 수행하는 것은 Task(subagent)다. subagent는 각 매핑을 시작할 때 "이주 N/10: <대상>"을 출력하고, 끝에 기록 파일 초안을 반환한다.

**공통 규칙**
- **모든 `reap` 명령은 대상 프로젝트 루트에서 실행한다.** reap은 상위 디렉토리로 `.reap/`을 탐색하므로, 다른 리포 안에서 실행하면 **그쪽 저장소에 쓴다.** 첫 `make` 직후 산출 파일 경로가 대상 프로젝트 아래인지 확인하고, 아니면 즉시 멈춘다
- `.reap-v0_17/`은 **읽기만** 한다. 쓰기·수정·삭제 금지 — 원본 비파괴가 불변식이다
- 새 항목의 id는 반드시 `reap make ...`로 발급한다 — 손으로 id를 찍지 않는다
- 옮기지 않기로 한 것마다 "무엇을, 왜"를 기록 파일에 남긴다 — 조용히 버리지 않는다

## 매핑 확정본 (ps-4b485d 04-migration-skill.md, gen-0066·gen-0070 확정)

| # | 원본 (`.reap-v0_17/`) | 어디로, 어떻게 |
|---|---|---|
| 1 | `genome/` 3종 | 새 `.reap/genome/`에 **그대로 복사.** 단 5단계 lifecycle·stage·cruise 등 v0.17 구조를 전제한 문구는 고치지 말고 기록 파일에 "이행 안내 대상"으로 목록만 — genome은 사용자의 규범이라 내용 수정은 사용자와 한다 |
| 2 | `vision/memory/` longterm·midterm·shortterm | `vision/memory/lessons.md`로 **선별.** 통과 기준: 제목만 읽어도 결론인 교훈이며 "이게 없으면 다음 세션이 같은 실수를 하는가"를 통과하는 것. **전부 복사가 아니다** — shortterm(세션 인수인계)은 기본 폐기하되 진행 중 작업 정보가 있으면 기록 파일에 옮겨 적는다. midterm의 완료된 track은 폐기 |
| 3 | `life/backlog/` | 항목마다 `reap make backlog --type <구 type 관례> --title <제목>`으로 재발급하고 본문을 옮긴다. 구 id는 본문 끝에 `원본: <구 파일명>`으로 |
| 4 | `vision/milestones/` 중 **열린 것** | `reap make milestone --title ...`로 재생성해 본문(Exit Criteria·Out of Scope 상당)을 v0.18 어휘로 이식. 닫힌 것은 옮기지 않는다(원본이 이력) |
| 5 | `vision/goals.md` | **plan source 후보 초안**으로: 살아 있는 목표 서술만 추려 `docs/plan/goals-v017-이관.md`(리포 내 임의 위치) 초안을 만들고, **등록(`make plan-source`)은 사용자에게 안내만** — goal 개념은 v0.18에 없다 |
| 6 | `vision/design/` | 문서마다 `reap make idea --kind file --title <제목>`으로 `idea/files/`에. 출처(원본 경로)와 가져온 날짜, 졸업 조건("이 설계가 채택되면 plan source 또는 environment로")을 채운다 |
| 7 | `config.yml` | 새 config는 5/8에서 이미 섰다(language·agentClient 승계). **폐기 필드 목록**(autoSubagent·autoUpdate·strictEdit·strictMerge·evaluator·cruiseCount·autoIssueReport·lastMigratedVersion 등)을 기록 파일에 남긴다 — 설정이 조용히 사라지면 안 된다 |
| 8 | `lineage/` · `sequence/` · `reap-guide.md` | **승계하지 않는다.** 원본이 `.reap-v0_17/`에 통째로 남는 것이 이력이다. v0.18 세대는 1번부터. `reap-guide.md`는 v0.17이 번들한 안내문(5단계 lifecycle 전체를 설명)이라 v0.18의 것으로 대체된다 — 사용자 지식이 아니므로 옮기지 않는다 |
| 9 | `hooks/` · `migration-state.yml` · `.session-state.md` · `.index/` | **hooks는 대응 이벤트가 있는 것만 옮긴다** — `onLifeStarted.<name>.{sh,md}`→`.reap/hooks/gen.made.<name>.{sh,md}`, `onLifeCompleted.<name>.*`→`gen.closed.<name>.*`(파일명만 바꾸고 본문·메타는 그대로. `.sh`는 실행 비트). 나머지 12이벤트(`onLifeLearned`·`onLifePlanned`·`onLifeImplemented`·`onLifeValidated`·`onLifeTransited`·`onMerge*` 8종)와 `*.example` 파일은 옮기지 않고 기록 파일에 "대응 이벤트 없음"으로 한 줄씩. `conditions/`는 통째로 복사(v0.18 init이 놓은 `always.sh`는 원본 것으로 덮어도 된다 — 동작이 같다. 원본에 주석 한 줄이 더 있을 수 있으나 무해하다). `migration-state.yml`·`.session-state.md`·`.index/`는 **폐기** — 기제가 사라졌다. 기록 파일에 한 줄씩 |
| 10 | `environment/summary.md`·`source-map.md`·`resources/`·`domain/`·`docs/` | `summary.md`→`.reap/environment/summary.md`로 **그대로** — init이 놓은 씨앗을 덮어쓴다(씨앗은 사용자 지식이 아니다). `source-map.md`→그대로(있으면). `resources/`→그대로. `domain/`·`docs/`는 v0.18에 자리가 없다 — `.reap/environment/resources/domain/`·`resources/docs/`로 옮기고 기록 파일에 적는다(내용은 고치지 않는다). 5단계 lifecycle 등 v0.17 구조를 전제한 문구는 genome과 같은 "이행 안내 대상" |

## 기록 파일 (8/8) — `.reap/archive/migration-v0_17.md`

```markdown
---
migratedAt: <ISO 초 단위>
from: v0.17 (.reap-v0_17/)
---
## 옮긴 것            # 매핑 #별 원본→목적지와 건수 — environment 절(요약·resources·domain/docs 이동) 포함
## 옮기지 않은 것      # 무엇을, 왜 — 폐기 config 필드 목록 포함
## 이행 안내 대상      # genome·environment의 v0.17 전제 문구 목록
## 검증               # doctor 출력 전문
## 홈 정리            # 수행했으면 지운 목록, 안 했으면 "미수행"
```

**7/8 doctor 결함 0의 출력이 이 파일에 들어가야 완료다.** 되돌리기 한 줄(`rm -rf .reap && mv .reap-v0_17 .reap`)도 파일 머리에 적는다.

## 홈 자산 정리 (8/8) — 목록을 보여주고 동의받은 뒤에만

gen-088 `reap uninstall`의 원칙을 승계한다: **allowlist에 있는 것만 지운다. `~/.reap/`의 사용자 소유물은 절대 건드리지 않는다** (실제로 사설 키가 발견된 적 있다).

| 자산 | 무엇 |
|---|---|
| `~/.claude/commands/reap.*.md` | 구 슬래시 커맨드 19종 |
| `~/.claude/agents/reap-*.md` | 구 agent 2종 + 이주가 끝났으면 `reap-upgrade.md` 자신도 |
| `~/.claude/settings.json` | SessionStart의 reap 항목(check-version·load-context)과 marketplace·plugin 키의 reap 항목만. **검증-후-쓰기** — 값 하나가 틀리면 클라이언트가 파일 전체를 무시하므로, 수정본을 JSON 파싱으로 확인하고 임시 파일을 거쳐 원자적으로 바꾼다 |
| `~/.reap/` | reap이 쓴 것만: `reap-guide.md` · `version-check.json` · `daemon/`. 나머지는 남긴다 |

정리를 건너뛰어도 이주는 완료다 — 다만 구 슬래시 커맨드가 새 플러그인과 함께 보이는 중복은 사용자가 감수한다고 기록에 남긴다.
