# Shortterm Memory

## 세션 요약 (gen-099, 2026-08-22)

### carrier 표식 ID 가 `<slug>-<hash8>` 이 됐고 검사가 강제한다

`scripts/list-carriers.sh` 재작성. **관대한 패턴으로 걷고 나서 가른다** — 좁힌 패턴으로 걸으면
해시 없는 표식이 아예 안 보여 검사가 자기 목적에 침묵한다. 유효 / **언급**(`<`·`>`·공백 포함 →
무시) / 위반. `--check` 는 표식이 숨는 **4가지**를 잡고 exit 1, `ci.yml` 이 `npm ci` **앞에서**
돌린다. `--new <slug>` 가 hash 를 뽑고 `--root <dir>` 가 테스트를 가능하게 한다.
상세는 `environment/summary.md`, 경위는 lineage.

**14 → 13개.** 사라진 `id` 는 처음부터 표식이 아니라 산문의 자리표시자였다 — 세 세대가
헷갈렸던 것. **표식 3개는 값 옆이 아니라 예시 옆에 있었고**, 옮기자
`memory-tier-classification` 이 12 → **11 로 줄었다**. 줄어든 것이 맞다.

### adapt 에서 genome 을 둘 고쳤다

1. **§ 독립 검토에 항목 추가** — evaluator 무응답도 `report-evaluator` 로 남길 것.
   **fallback 이 조용하면 그것은 fallback 이 아니라 침묵이다** (fitness 지적을 규칙으로 고정)
2. **`### Clarity 판단 기준` 목록이 코드와 어긋나 있었다** — genome 은 "backlog 에 task 있음 →
   high", 코드(`src/core/clarity.ts`)는 **high-priority 2건 이상**. 목록을 지우고 소유자를
   가리킨다. **shipped `src/templates/evolution.md` 에도 같은 목록이 배포되고 있었다** —
   즉 모든 신규 프로젝트가 코드와 모순되는 genome 을 받고 있었다. 함께 고쳤고, 기존
   프로젝트에는 migration note 로만 도달한다(v0.18 릴리즈 세대).
   **`evolution.md` 가 301줄이 되어 줄이려 훑다가 나온 발견이다 — 크기 경고가 내용 검토를
   강제했다.**

### 지금 상태

- unit **791** / e2e **379** / scenario **62**, 전부 0 fail
- typecheck · typecheck:docs · build · self-diagnosis(8절) · `--check` · `--orphans` 통과
- `fix --check` 0 error / 2 warning (gen-052 상속분)
- genome: `application.md` **249**/250 · `evolution.md` **297**/300 (adapt 후)
- 잔여 backlog **9 → 8건** · **미푸시 7 커밋**, push 는 사용자 확인 후

### 다음 세션이 알아야 할 것

- **(최우선) evaluator 가 왜 조용히 아무것도 안 했는지 조사.** fitness 가 이것을 지목했다 —
  남은 4세대가 전부 자기검토만 받는 것을 막으려면 원인부터. 조사 방향 셋은 gen-099 의
  05-completion hints 1 (agent 정의 설치 / 호출 코드 경로 / Agent 도구 부재 fallback)
- **e2e 1 fail 미재현은 flake 이전에 명령 문제였다** — `| grep "^ [0-9]+ (pass|fail)"` 가
  `(fail)` 줄을 버렸다. bun 은 이름을 이미 출력하고 있었다. **항상 `tee` 로 남기고 grep 은
  로그에 대고 할 것.** flake 유도는 `npx bun test <dir> --rerun-each 5` (존재 확인함)
- **산문에서 표식 토큰을 인용할 땐 닫힌 형태 + 꺾쇠 자리표시자**로 쓸 것. 이 세대가 두 번
  걸렸다(environment 와 memory). 여는 괄호만 붙은 조각은 그 자체로 결함 신호다
- **milestone 의 다음 항목**: `지식 축 경계 통합 설계` (milestone·idea·memory 3축).
  seed 는 `vision/design/backlogs_v0.18/`. **Exit Criteria 는 아직 하나도 충족되지 않았다**
