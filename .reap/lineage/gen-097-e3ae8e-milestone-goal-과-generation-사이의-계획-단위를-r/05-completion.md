# Completion

## Summary

**goal**: goal 과 generation 사이의 계획 단위(milestone)를 REAP 에 도입하고, 그것이 goal 을 소비하는
지점 전부에 실제로 도달하는지 인과 추적으로 검증한다.

`vision/milestones/<slug>.md` 를 신설했다. 하나의 milestone 이 **여러 generation 을 품고**,
경계 3요소(소속 goal · `## Exit Criteria` · `## Out of Scope`)와 갱신 가능한 `## Generations`
체크리스트를 갖는다. opt-in — 없으면 REAP 은 이전과 **바이트 동일하게** 동작한다.

### 이 세대가 실제로 바꾼 것: 추측 → 명시

`suggestNextGoals` 는 goal 제목과 backlog 제목의 **토큰 겹침 점수(≥0.2)** 로 다음 세대를 골랐다.
한국어 조사가 STOP_WORDS 에 들어 있는 데서 보이듯 언어에도 민감하다. milestone 이 있으면 다음
generation 은 **계획이 이름을 부른다.** 즉 새 개념을 더한 것이 아니라 **기존 추측 경로를 대체**했다.

### 상태 둘, 초점은 플래그, 유효성은 파생

| 축 | 값 | 저장 |
|---|---|---|
| 상태 | `open` / `completed` | frontmatter |
| 초점 | `main: true` — 정확히 하나 | frontmatter |
| 유효성 | 경계 3요소가 채워졌는가 | **저장 안 함 — 내용에서 파생** |

**main 은 초점이지 제약이 아니다.** goal 후보는 **유효한 모든 open milestone** 에서 나오되 main 이
먼저다. 뒤쪽 계획의 항목을 앞당기는 것은 `--milestone <slug>` 으로 명시하는 정상 경로다.

### milestone 이 보이는 곳 — 계획은 셋이라 했고 실제로는 넷이었다

| 채널 | 코드 |
|---|---|
| 동적 컨텍스트 (async) | `buildKnowledgeContext` |
| 동적 컨텍스트 (sync) | `buildKnowledgeContextSync` — 위와 **byte-identical** |
| subagent prompt | `buildBasePrompt` |
| **evaluator prompt** | `buildEvaluatorPrompt` — 우연히 들어갔고, 옳아서 남겼다 |
| `start --phase scan` | 미체크 generation 이 goal 후보로 |
| `completion --phase adapt` | 휴리스틱 블록을 **대체** |

텍스트가 네 곳에서 생기지 않도록 렌더러를 순수 함수 하나(`buildMilestoneSection`)로 뽑고
**읽기만** async/sync 로 갈랐다.

### 규모

- 신규: `core/milestone.ts` · `cli/commands/milestone.ts` · `cli/commands/make/milestone.ts`
- 테스트 **+103**: unit 670→**736**, e2e 329→**355**, scenario 44→**55**. 전부 0 fail
- 전 게이트 통과: typecheck · typecheck:docs · build · self-diagnosis(8절) ·
  `fix --check` 0 error · `list-carriers --orphans` 고아 0

## Lessons Learned

### 잘된 것 — 역방향 관측자를 판정 기준으로 삼은 것

gen-096 교훈("기능을 지웠을 때 무엇이 여전히 초록인가")을 **계획 단계에서** 판정 기준에 넣었다.
그래서 문 3 의 단언이 *"후보가 나온다"* 가 아니라 **"휴리스틱 블록이 사라졌는가"** 가 됐다 —
전자는 대체를 지워도 통과한다(`suggestNextGoals` 가 어차피 후보를 내므로).

주입 5지점을 각각 제거해 red 를 확인했고, 그 과정에서 **실제 결함 하나가 잡혔다**:
`\Z` 는 JS 정규식에 없어 리터럴 `Z` 로 읽히고, 그래서 `## Generations`(항상 마지막 절)가 조용히
빈 배열이 됐다. typecheck 통과, 읽어서 안 보임, negative 로만 드러남.

### 개선할 것 — grep 을 돌리고 다른 질문의 답을 읽었다

learning 이 *"`run/*.ts` 14개 전부가 `buildBasePrompt` 를 경유한다"* 고 적었다. 실제 호출자는
**하나**다. 14는 `grep -rln "goal" src/cli/commands/run/*.ts` 의 결과였다 — **명령은 실제로
돌렸고, 다른 질문에 답했다.**

그 오독이 planning 까지 흘러 **일의 규모를 잘못 쟀다**. 주입 지점이 하나인 줄 알았는데 넷이었고
그중 둘은 byte-identical 계약 아래 있었다. 구현에서 발견해 계획을 고쳤다(D1).

"check, don't reason" 은 지켰다. 부족했던 것은 **그 명령이 무엇을 세는지 소리 내어 말하는 것**이다.
longterm 에 접어 넣었다.

### 두 번째 — 새 기능의 테스트는 새 기능만 본다

`milestone` 명령을 CLI 에 끼워 넣으면서 `program` 문을 새로 열지 않아 **`cruise` 가 `milestone` 의
하위 명령**이 됐다. `reap cruise 3` 이 아무것도 출력하지 않았다.

milestone 관련 26 케이스는 **전부 초록이었다.** 잡은 것은 기존 cruise 테스트 7건이다.
새 기능만 돌려보고 넘어갔으면 릴리즈됐을 결함이다 — **전체 스위트를 돌리기 전까지 통과는
"내가 만든 것 안에서 문제없음"일 뿐이다.**

### 세 번째 — caller 전수 확인이 우연한 정답을 찾아냈다

gen-064 self-audit 절차(변경한 함수의 caller 전부 확인)에서 `buildMilestoneSection` 호출이
3개가 아니라 **4개**임을 발견했다. Python `replace()` 가 모든 일치를 바꿔 `buildEvaluatorPrompt`
에도 들어간 것이다.

되돌리지 않았다 — evaluator 가 *"빌더가 범위를 지켰는가"* 를 판단하려면 `## Out of Scope` 를
알아야 한다. **우연히 옳은 자리였다.** 다만 주석과 관측자 2개를 붙여 **의도한 것으로 만들었다**.
그러지 않으면 다음 사람이 "이건 왜 여기 있지" 하고 지운다.

## Milestone Progress

이 generation 은 milestone 에 속하지 않는다 — milestone 을 **만드는** 세대이므로
`current.yml.milestoneId` 가 비어 있다. 첫 milestone(v0.18)은 이 세대 완료 직후 만든다.

## Next Generation Hints

- **v0.18 milestone 생성이 다음 할 일.** `reap make milestone` → 경계 채우기 →
  `reap milestone main <slug>`. generation 목록의 원본은 `vision/design/backlogs_v0.18/` 6건.
  **선행 조건: `goals.md` 에 plugin 전환 goal 이 없다** — `milestone main` 이 goal 매칭을 요구하므로
  신설해야 한다
- **plugin 전환이 v0.18 의 첫 generation.** 별도 브랜치. 자기진단에서 실측한 대로 최근 26세대 중
  22세대가 배포·게이트였고, plugin 전환이 그 class 의 대부분을 소멸시킨다
- **지식 축 경계 통합 설계는 이제 4축이다** (milestone·plan·idea·memory). gen-097 이 그중
  milestone↔midterm 하나를 그었다
- **v0.18 릴리즈 세대는 migration note 와 docs 5 로케일을 반드시 포함해야 한다.** 본 세대가
  의도적으로 미룬 둘이고, 기존 프로젝트에 규칙이 도달하는 채널은 note 뿐이다
- **evaluator 를 안 띄웠다.** longterm 은 독립 검토가 한 번에 수렴하지 않는다고 기록한다.
  fitness 전에 원하면 호출 가능

## Change Proposals

- **genome 직접 수정** (embryo 세대이므로 허용): `application.md`(Vision 4분류 · Static/Dynamic 표의
  Dynamic 행 · dynamic 자격 기준 (b) 추가) · `evolution.md`(`### Milestones` 신설 ·
  **carrier 표식 심음** · reap-guide 와 축자 중복인 pruning 상세 18줄을 포인터 4줄로 접음)
- **배포 템플릿 동기화**: `src/templates/evolution.md` · `src/templates/reap-guide.md`
- **backlog 없음.** 발견한 것은 전부 본 세대에서 처리했거나 계획된 deferral 이다
