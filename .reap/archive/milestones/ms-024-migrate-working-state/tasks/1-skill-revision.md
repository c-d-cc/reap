# 1 — migration-map·SKILL 개정

## 매핑 재정의

| # | 원본 | 바뀌는 것 |
|---|---|---|
| 2 | memory 3단 | shortterm의 **진행 중 작업·다음 세대 후보**와 midterm의 **살아 있는 트랙**은 lessons가 아니라 #11의 재료다. lessons 선별은 그대로 |
| 5 | goals.md | 살아 있는 목표를 `docs/plan/goals.md`(또는 기존 기획 디렉토리)로 옮기고 **등록한다**(`make plan-source --root docs/plan --role ...`), 규약 파일에 "goals.md는 목표 목록, 트랙별 설계는 하위 디렉토리"를 적는다. 사람 판단으로 미루지 않는다 — 지우는 것이 등록보다 싸다 |
| 6 | design/ | goals·midterm·shortterm이 참조하는 설계(=채택·실행 중)는 **plan 디렉토리로 디렉토리째 이동**(`docs/plan/<track>/`), 상호 링크는 상대 경로가 유지되므로 안 깨진다. 참조되지 않는 설계만 `make idea --kind file`. 판정 근거(어디서 참조되는가)를 기록 |
| 11 | 마지막 lineage의 completion(Next Generation Hints·Deferred·검토 사항) + shortterm 다음 후보 + midterm 트랙 | **milestone 하나**(트랙 이름, Background=트랙 요약과 진행 상태, Exit Criteria=원본 로드맵의 현재 phase 종료 조건, tasks/=다음 세대 후보 각 하나, `--focus`, `--ref`로 plan 인용) + **backlog**(트랙 밖 잔여: Defense 잔여 항목 등, 각 `make backlog`). 후보가 여러 트랙이면 milestone은 최우선 트랙 하나, 나머지는 backlog |
| 12 | CLAUDE.md REAP 절 | `## REAP` 절을 찾아(v0.17 `claude-md-section.md` 템플릿 형태) v0.18 절로 교체: "REAP v0.18 plugin이 SessionStart에 genome·environment·상태 줄을 주입한다. `@` import 없음. 작업은 `/reap:evolve`로 열고 `/reap:complete`로 닫는다. 구조는 `.reap/map.md`". 절이 없으면 안 만든다 |
| 1 | genome | 복사 뒤 **v0.17 절차 어휘 재작성**: 표(embryo/normal → 없음: genome은 사람이 고친다, 세대 중 발견은 backlog로 / adapt·reflect phase → complete skill / completion artifact → 세대 기록 Outcome / genome-change backlog → `make backlog --type genome` / environment refresh at completion → complete가 summary.md를 갱신 / autoSubagent·cruise·evaluator → 삭제 / lineage → archive·lessons). 프로젝트 고유 규칙(코딩 규약·테스트 정책·불변식)은 한 글자도 안 바꾼다. 바꾼 절의 전후를 기록 파일에 |

## SKILL 7/8 검사 (스크립트 `scripts/verify-migration.sh`)

- 원본에 진행 중 트랙이 있었는가(`shortterm.md`에 "다음"·"next" 절 또는 `goals.md`의 `- [ ]`) → 있으면 새 `.reap`에 focus milestone 1개 이상, 없으면 통과
- `grep -ciE 'embryo|adapt phase|reflect phase|completion artifact|autoSubagent|cruise|lifecycle stage' .reap/genome/*.md` = 0
- `grep -c 'reap-guide\|reap-evolve\|@\.reap/' CLAUDE.md` = 0 (파일 있으면)
- `reap plan sources`에 1개 이상(원본에 goals가 있었으면)
- `reap ctx`에 `현재 milestone:`/`Milestone:` 줄
- `reap doctor` 결함 0
출력을 기록 파일 `## 검증`에

## 8/8 기록 파일

`## 다음 세션이 볼 것` 절 신설 — `reap ctx` 상태 줄 전문. 이것이 "지워도 되는가"의 답이다.
