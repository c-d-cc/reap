# Planning

## Goal

한 항목이 다른 항목을 **제목이 아니라 ID 로** 가리키게 한다. 이 세대는 체계를 세우고
**첫 소비자(milestone→goal)에 실제로 얹는다** — 소비자 없는 체계는 검증되지 않는다.

## 확정된 설계 결정 (사용자, 2026-08-21)

| # | 결정 | 근거 |
|---|---|---|
| 1 | **전 유형에 순번** — goal · milestone · backlog · design · idea · memory | 유형별 일관성. 파일에 이름이 둘(파일명 + ID) 생기는 비용은 감수 |
| 2 | **prefix 는 유형을 담는다** — `goal-` `ms-` `bl-` `ds-` `idea-` `mem-` | `gen-097-e3ae8e` 가 선례. 참조를 읽으면 종류가 보인다 |
| 3 | **레지스트리는 `.reap/sequence/<type>.md`** — append-only, 커밋됨 | 지운 항목의 행이 남으므로 **번호 재사용이 구조적으로 불가능**하다. 별도 카운터 필드가 필요 없다 |
| 4 | **SQLite 안 쓴다** | REAP 은 병렬 브랜치 merge 를 1급으로 갖는다. 같은 번호 충돌은 **사람이 풀 수 있어야** 하는데 바이너리는 git 이 못 돕는다. 200행 규모에 과하고, `node:sqlite` 는 Node 22.5+ 인데 `engines` 가 없다 |
| 5 | **기존 프로젝트는 migration note** | 제목 매칭 폴백을 남기면 메커니즘이 둘이 되고, 이번에 고치려던 불안정한 쪽이 영원히 남는다 |
| 6 | **generation · carrier 는 범위 밖** | generation 은 `gen-097-e3ae8e` 를 이미 갖고 `lineage/` 가 레지스트리다. carrier 는 `<slug>-<hash8>` 로 **다음 generation** (별도 backlog) |

## 형태

```markdown
vision/goals.md
### Distribution
- [ ] `goal-004` 배포 형태를 사용자 도구로 인식되게 한다
```

```markdown
vision/milestones/v018-배포-형태를-plugin-으로.md
---
id: ms-001
goal: goal-004        ← 제목이 아니라 ID
---
```

```markdown
.reap/sequence/goal.md
<!-- reap:sequence(goal) — append only. 지운 번호는 돌려주지 않는다 -->
| id | title | createdAt |
|---|---|---|
| goal-001 | 외부 프로젝트에서 core lifecycle 검증 | 2026-08-21 |
| goal-004 | 배포 형태를 사용자 도구로 인식되게 한다 | 2026-08-21 |
```

**ID 는 눈에 보인다.** 렌더링에서 숨기지 않는다 — 사람이 대화에서 `goal-004` 를 인용할 수 있어야
하고, 그것이 이 선택지의 원래 단점("대화에서 못 부른다")을 없애는 방법이다.

**파일에는 파일명과 ID 가 둘 다 있다.** 사람은 slug 을 쓰고(`reap milestone main v018-…`),
참조는 ID 를 쓴다(`goal: goal-004`). 레지스트리가 둘을 잇는다.

## Requirements

**FR-1** `.reap/sequence/<type>.md` 를 읽고 쓴다. 다음 번호는 **레지스트리의 최대값 + 1** 이며,
항목이 지워져도 행은 남으므로 번호가 되돌아오지 않는다.

**FR-2** `reap make goal --title "<t>" --section "<s>"` 이 `goals.md` 에 항목을 추가하고 ID 를
부여하고 레지스트리에 append 한다. **REAP 이 사용자 소유 파일에 쓰는 첫 경로**이므로,
쓰는 것은 **append 뿐**이고 기존 줄을 고치지 않는다.

**FR-3** `reap make milestone` / `reap make backlog` 이 ID 를 부여하고 frontmatter 와 레지스트리에
기록한다.

**FR-4** `parseGoals` 가 `` `goal-NNN` `` 을 읽어 `VisionGoal.id` 로 내고 **제목에서 제거**한다.
ID 가 없는 항목도 파싱된다 (`id: undefined`) — 기존 프로젝트가 깨지지 않는다.

**FR-5** `validateForMain` 이 **ID 로 매칭**한다. 제목 매칭은 제거한다.

**FR-6** `readBullets` · `readGenerations` 가 **이어진 줄을 항목에 이어 붙인다** (증상 2·3).

**FR-7** `reap fix --check` 가 셋을 보고한다 — **중복 ID** · **ID 없는 항목** · **끊어진 참조**.
전부 경고이며 `fixProject` 에 대응물을 두지 않는다 (사용자 소유 파일이다).

**FR-8** `reap init` / `reap update` / `migrate` 가 `.reap/sequence/` 를 만든다.

## Completion Criteria

1. `make goal` / `make milestone` / `make backlog` 이 ID 를 부여하고 **번호가 재사용되지 않는다** —
   항목을 지운 뒤 새로 만들면 지워진 번호가 아니라 다음 번호가 나온다
2. `milestone main` 이 **ID 로 판정**한다. goal 제목을 바꿔도 통과하고, 없는 ID 는 거부한다
3. **중복 ID · ID 없는 항목 · 끊어진 참조**를 `fix --check` 가 각각 보고한다
4. 증상 2·3 이 사라진다 — 여러 줄로 쓴 exit criteria 와 generation 항목이 온전히 읽힌다
5. 이 저장소의 기존 항목(goal 23 · milestone 2 · backlog 2 · design 4)에 ID 가 부여되고
   `fix --check` 가 **ID 관련 경고 0** 을 낸다
6. genome · reap-guide 가 ID 체계와 레지스트리를 서술한다
7. unit / e2e / scenario 전 스위트 **0 fail** (baseline: 736 / 355 / 55)

## Out of Scope — 명시

- **carrier `<slug>-<hash8>`** — 다음 generation. 이 세대가 만드는 해시 생성·고유성 검사·레지스트리
  형식을 재사용한다
- **memory `from`/`to` 배선** — memory 가 아직 3-tier 다. `mem-` prefix 만 예약하고 소비는 그 세대가
- **idea 졸업 경로** — `.reap/idea/` 가 아직 없다. `idea-` prefix 만 예약
- **migration note** — 버전 bump 를 동반해야 하므로 v0.18 릴리즈 세대가 묶어 쓴다 (gen-097 과 동일)
- **docs 5 로케일** — 위와 같은 이유
- **generation ID** — `gen-097-e3ae8e` 를 이미 갖고 있다. 두 번 만들지 않는다

## Implementation Plan

### A. 레지스트리 코어 (T001~T005)

- [ ] T001 `src/types/index.ts` — `SequenceType` union(`goal`/`milestone`/`backlog`/`design`/`idea`/`memory`) ·
      `SequenceEntry { id, title, createdAt }` · `VisionGoal.id?`
- [ ] T002 `src/core/paths.ts` — `sequence` (`.reap/sequence/`, **점 없음** — 점으로 시작하는 것은
      `.index/`·`.session-state.md` 뿐이고 둘 다 gitignore 다. 레지스트리는 반드시 커밋된다)
- [ ] T003 `src/core/sequence.ts` 신규 — 레지스트리 읽기(표 파싱) · `nextId(type)` · `appendEntry`.
      **append 만 한다** — 행을 고치거나 지우지 않는다. *테스트: unit*
- [ ] T004 `src/core/sequence.ts` — `findDuplicates` · `lookup(id)` · `allIds()`. *테스트: unit*
- [ ] T005 unit — **번호 재사용 불가**를 개별 케이스로. 항목 삭제 후 `nextId` 가 그 번호를 내지
      않는 것을 단언한다. 이것이 이 세대의 존재 이유다

### B. ID 부여 (T006~T009)

- [ ] T006 `src/cli/commands/make/goal.ts` 신규 + `RESOURCES` 추가. `goals.md` 의 해당 `###` 섹션
      끝에 **한 줄 append**. 섹션이 없으면 만든다. *테스트: e2e*
- [ ] T007 `make/milestone.ts` · `make/backlog.ts` 에 ID 부여 통합 — frontmatter `id:` + 레지스트리
      append. *테스트: e2e*
- [ ] T008 `reap sequence [type]` — 레지스트리 조회. `ds-007 이 뭐지?` 에 답하는 자리.
      *테스트: e2e*
- [ ] T009 e2e — 세 `make` 가 번호를 **각자 유형에서** 매기는지, 유형이 섞이지 않는지

### C. 첫 소비자 — milestone→goal (T010~T013)

- [ ] T010 `parseGoals` — `` `goal-NNN` `` 을 `id` 로 분리하고 `title` 에서 제거. ID 없는 줄도 파싱
- [ ] T011 `validateForMain` — `knownGoals: string[]`(제목) → **goal ID 집합**으로 교체.
      `goalIdentifiers` 는 `goalIds` 가 된다
- [ ] T012 milestone 파일에 `id:` 추가 · `goal:` 이 ID 를 담는다 · `parseMilestone` 갱신
- [ ] T013 **역방향 관측자** — goal **제목을 바꿔도** `milestone main` 이 통과하는지 단언.
      제목 매칭이 남아 있으면 red 가 된다. "통과한다"만 보면 제목 매칭이 살아 있어도 통과한다

### D. 파서 증상 2·3 (T014~T015)

- [ ] T014 `readBullets` · `readGenerations` — `- ` 로 시작하지 않는 후속 줄을 직전 항목에 이어 붙인다.
      빈 줄과 다음 `##` 이 종료 조건
- [ ] T015 unit + **negative** — 두 줄짜리 exit criterion 이 온전히 읽히는지. 되돌려 red 확인.
      **증상 3 은 완료 판정 기준을 잘라먹었으므로** exit criteria 케이스를 반드시 둘 것

### E. 검사 (T016~T017)

- [ ] T016 `src/core/integrity.ts` — 중복 ID · ID 없는 항목 · 끊어진 참조. 전부 warning.
      `fixProject` 에 대응물 없음
- [ ] T017 unit — **각 조건을 개별 케이스로.** 중복 ID 는 *두 브랜치가 같은 번호를 끝에 덧붙이면
      git 이 충돌 없이 병합*하는 경로를 재현할 것 — 이것이 이 검사의 존재 이유다

### F. 구조·전파·시나리오 (T018~T020)

- [ ] T018 `init/common.ts` · `update.ts` · `migrate.ts` 에 `sequence/` 생성 +
      **이 저장소의 기존 항목에 ID 부여** (goal 23 · ms 2 · bl 2 · ds 4)
- [ ] T019 `.reap/genome/application.md` · `evolution.md` ×2 · `reap-guide.md` ×2 · `help.ts` topic
- [ ] T020 scenario — goal 생성 → milestone 이 그것을 가리킴 → **goal 제목 변경** → 참조 유지 →
      goal 삭제 → 끊어진 참조 경고 → 새 goal 생성 시 **지워진 번호가 안 나옴**

## 테스트 영향 — 기존 것 중 고쳐야 할 것

| 기존 테스트 | 왜 |
|---|---|
| `tests/unit/milestone.test.ts` § validateForMain | 인자가 제목 목록 → ID 집합. 6 케이스 |
| `tests/e2e/milestone.test.ts` | `goals.md` fixture 에 ID 가 필요하다 |
| `tests/e2e/milestone-start.test.ts` · `scenario/milestone.test.ts` | 위와 같음 |
| `vision.test.ts` 계열 (`parseGoals`) | 제목에서 ID 가 빠진다. **ID 없는 줄이 그대로 파싱되는 케이스를 추가** |
| `integrity` 계열 | 검증 대상이 는다 |

**"ID 가 없으면 이전과 동일"** 을 각 지점에서 단언한다 — 기존 프로젝트가 이 세대로 깨지지 않아야 한다.

## Additional Findings

- `.reap/` 안에서 점으로 시작하는 것은 `.index/` 와 `.session-state.md` 뿐이고 **둘 다 gitignore** 다.
  레지스트리는 반대로 반드시 커밋돼야 하므로 `.reap/sequence/` 로 둔다
- **중복 ID 는 조용히 생긴다.** 두 브랜치가 각각 마지막 줄에 행을 덧붙이면 git 이 충돌 없이 둘 다
  병합한다. ID 를 넣으면 검사가 줄 것 같지만 **오히려 하나 늘어난다**
- `reap make goal` 은 REAP 이 사용자 소유 파일에 쓰는 첫 경로다. **append 만** 하고 기존 줄을 고치지
  않는 것이 그 경계를 지키는 방법이다 (longterm: "파괴적 동작의 안전은 플래그가 아니라 구조에 둔다")
