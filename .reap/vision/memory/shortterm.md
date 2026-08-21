# Shortterm Memory

## 세션 요약 (gen-098, 2026-08-21)

### 참조 ID 체계

한 항목이 다른 항목을 **제목이 아니라 ID** 로 가리킨다. 계열이 둘이다:

- **Numbered** (goal · milestone · design · idea · memory) — `.reap/sequence/<type>.md`,
  **append-only** 라 항목을 지워도 행이 남는다. **번호 재사용이 구조적으로 불가능**하고
  그래서 별도 카운터가 없다
- **Hashed** (backlog) — `bklog-a3f8c2`, 레지스트리 없음. 소비·삭제되는 유형에 영구 번호를 쓰면
  레지스트리가 죽은 행으로만 자란다

소비자도 둘이다 — milestone 의 `goal:`(한 종류) 과 backlog 의 `from:`(**가장 직접적인 원인 하나**,
종류는 열려 있음). 후자가 memory 의 `from` 이 쓸 모양이다.

**learning 이 문제를 한 곳으로 좁힌 것이 이 세대의 절반이었다** — REAP 의 기존 참조 다섯 중
넷은 이미 안정적이었고(파일 slug · 파일명 · `gen-` id · carrier), 불안정한 건 milestone→goal
하나뿐이었다. 이유는 `goals.md` 항목이 **파일이 아니라 줄**이라 가리킬 것이 제목밖에 없어서다.

**SQLite 는 도입하지 않았다.** 결정적인 건 성능이 아니라 **merge** — REAP 은 병렬 브랜치 merge 를
1급으로 갖고, 같은 번호 충돌은 사람이 풀 수 있어야 하는데 바이너리는 git 이 못 돕는다.

### 이 세대가 스스로에게 걸린 것 넷 (+ 사용자 지적 3회)

1. **헤드라인 테스트가 결함을 못 봤다** — `nextId` 를 `개수+1` 로 망가뜨려도 통과. 행이 연속이면
   개수 == 최대값이라서. negative 를 안 돌렸으면 몰랐다
2. **milestone 이 goals.md 항목 셋에 걸쳐 있었다** — 그 셋이 milestone 의 `## Generations` 와
   같은 내용. gen-097 의 경계를 goals.md 에도 적용해 covering goal 하나로 접었다
3. **자기진단 게이트가 "모든 새 프로젝트가 첫날부터 경고"를 잡았다** — 검사를 약화시키지 않고
   `init` prompt 가 `reap make goal` 을 쓰도록 고쳤다
4. **caller 전수 확인이 `createDeferredBacklog` 를 잡았다** — `reap make backlog` 만 고치고
   early-close 승계 경로를 놓쳤었다

### 지금 상태

- unit **771** / e2e **379** / scenario **62**, 전부 0 fail
- typecheck · typecheck:docs · build · self-diagnosis(8절) · `--orphans` 전부 통과
- `fix --check` 0 error / 2 warning (gen-052 상속분)
- genome: `evolution.md` **298**/300 · `application.md` **249**/250
- **커밋 안 됨.** validation 완료, completion reflect 진행 중
- 미푸시 **6 커밋** (gen-097 포함)

### 다음 세션이 알아야 할 것

- **다음은 `carrier ID 에 hash8`** (`bklog-76e909`). 이 세대가 만든 해시 생성·고유성 검사·레지스트리를
  재사용한다. `backlogs_v0.17_residual` 의 `list-carriers.sh 산문 오탐` 건을 **같은 세대에서** 처리할 것
- **`ds-`·`idea-`·`mem-` 은 prefix 만 예약**돼 있다. 실제 부여는 소비자가 생기는 세대가 한다 —
  `vision/design/` 은 frontmatter 가 없고 읽는 코드도 없어 지금 부여하면 닻을 못 내린다
- **idea 와 memory 가 어느 계열인지 미결이다.** 둘 다 backlog 과 같은 churn 을 갖는다
  (`freememo` 는 "어디로든, 또는 삭제", memory 는 reflect 마다 pruning). 지금은 numbered 에 있고,
  옮기는 것은 `HASHED_TYPES` 에 한 줄이며 **타입 시스템이 나머지 호출부를 짚어준다**
- **기존 프로젝트는 아직 이 버전을 받으면 ID 경고를 본다.** migration note 가 유일한 도달 채널이고
  버전 bump 를 동반해야 하므로 v0.18 릴리즈 세대가 쓴다
- **milestone 파일 항목은 한 줄로 쓸 것** — 이어진 줄은 이제 folding 되지만, HTML 주석 블록은
  버려진다(장문 메모는 거기 두라는 뜻)
