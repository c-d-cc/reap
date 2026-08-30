# M3 — migration skill (v0.17 → v0.18)

신규 skill이다. v0.17 사용자 프로젝트를 v0.18 구조로 옮기는 **모든 것**을 이 skill이 책임진다 (사람, 2026-08-31). reap이 하던 자동 migration layer 방식(세션 주입 안내)과 달리, 명시적으로 호출되는 skill이다.

## 요구사항 — 사람이 확정한 것

1. **판정** — 기존 `.reap/`이 v0.17 구조인지 구조 지문으로 감지한다 (`config.yml`의 필드 구성, `life/current.yml`, memory 3단 파일). v0.18 구조(3단 레이아웃)와 이름만 같으므로 판정이 모든 것에 앞선다
2. **사전 차단** — 사용자 프로젝트 리포에 **uncommitted change가 있으면 block**한다. 되돌릴 수 없는 이동을 더러운 트리 위에서 하지 않는다
3. **고지와 동의** — 진행 전에 **토큰 사용량이 매우 클 수 있음을 고지**한다 (memory·기록 전체를 읽고 선별하는 작업이다)
4. **격리** — 구 디렉토리를 `.reap-v0_17/`로 리네임한다 (dot이 든 `.reap-v0.17/`은 쓰지 않는다 — 도구·글롭이 확장자로 오독할 수 있다). 원본은 파괴되지 않고, 실패 시 리네임을 되돌리면 원상이다
5. **이주** — 새 `.reap/` 구조를 세우고 데이터를 매핑해 옮긴다 (아래 매핑 골격)
6. **subagent 강제** — 이주 작업은 subagent로 수행한다. 주 세션의 컨텍스트를 이주 데이터로 채우지 않는다
7. **진행 표시와 기록** — 어떤 단계가 있고 지금 어디인지를 사용자에게 보여주고, 무엇이 어디로 갔고 무엇이 안 갔는지를 **기록 파일로 남긴다**
8. **검증** — 끝나면 `doctor`가 결함 0을 내야 하고, 그 결과가 기록에 포함된다

## 이주 매핑 골격

세부는 M3를 자를 때 확정한다. 골격만 적는다 — 결정된 것은 굵게, 미결은 물음표.

| v0.17 (`.reap-v0_17/`) | v0.18 (`.reap/`) |
|---|---|
| `genome/` 3종 | **그대로** — 사용자가 쓴 규범이다. 다만 v0.17 구조를 전제한 문구는 이행 안내 대상 |
| `memory/` shortterm·midterm·longterm | lessons 성격만 `vision/memory/lessons.md`로 **선별** — 시효 지난 것은 버린다 |
| `life/backlog/` | `life/backlog/` — frontmatter를 v0.18 형식으로 |
| `life/current.yml` (진행 중 generation) | 열린 것이 있으면 **이주 전에 닫으라고 안내**하고 block? — 미결 |
| `vision/milestones/` | `vision/milestones/` — 열린 milestone의 형식 변환 |
| `vision/goals.md` | 미결 — goal 개념의 거취가 M2 판단에 걸려 있다 |
| `vision/design/` | 미결 — plan source로 등록하는가, `idea/`로 보내는가 |
| `lineage/` · `sequence/` | 미결 — 세대 이력을 승계하는가, `.reap-v0_18` 세대는 1번부터인가 |
| `config.yml` | 새 형식으로 재작성. `autoUpdate` 등 폐기 필드는 버리고 그 사실을 기록에 남긴다 |
| `hooks/` · `migration-state.yml` · `.session-state.md` | 폐기 — 기제 자체가 사라졌다 |

## 홈 자산 정리

프로젝트 밖의 구 자산 — `~/.claude/commands/reap.*.md` 19개, agent 2개, `settings.json`의 SessionStart 항목과 marketplace 키, `~/.reap/` — 는 gen-088 `reap uninstall`의 allowlist 로직을 승계해 제거한다. 사용자 소유물(`~/.reap/`에 사용자가 둔 파일)은 건드리지 않는다는 gen-088의 원칙도 함께 승계한다.
