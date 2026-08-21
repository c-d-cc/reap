# Shortterm Memory

## 세션 요약 (gen-097, 2026-08-21)

### 자기진단이 이 세대를 낳았다

사용자 요청으로 "왜 이렇게 복잡해졌나"를 실측했다. **gen-071~096 (26세대) 중 새 사용자 기능은
0건** — 배포·설치 9 / 게이트·CI 7 / 자기 정합성 5 / daemon 청소 3 / 문서 1. 코드에서도
배포 세금(4,481줄)이 라이프사이클 코어(4,222줄)보다 크다. `lifecycle.ts` 86줄, `nonce.ts` 25줄 —
**코어는 건강하고 주변이 무겁다.**

결론: 재설계할 것은 코어가 아니라 **배포 형태(plugin)와 지식 축 개수**다.

### gen-097 — milestone

goal 과 generation 사이의 계획 단위. `vision/milestones/<slug>.md`.

**사용자가 설계를 두 번 바꿨다** — 둘 다 더 나은 방향이었다:
1. 완료본을 lineage 로 옮기지 않고 **제자리에 `status: completed`** 로 남긴다 (폴더의 값은
   draft 를 미리 여러 개 두는 것에 있고, 옮기면 코드 경로·경로 상수·양쪽 검증이 늘어난다)
2. **"활성 1개" 제약을 버리고 "main 1개 + 나머지는 소비 가능"** 으로 (뒤쪽 계획의 항목을
   앞당겨야 할 때가 있다). 이 변경으로 **상태가 오히려 하나 줄었다** — `draft` 가 필요했던 이유가
   "경계 없는 걸 활성화 못 하게"였는데 main 지정이 그 검증의 자리가 되면서 사라졌다

### 지금 상태

- unit **736** / e2e **355** / scenario **55**, 전부 0 fail
- typecheck · typecheck:docs · build · self-diagnosis(8절) · `list-carriers --orphans` 전부 통과
- `fix --check` 0 error / 2 warning (gen-052 상속분)
- **커밋 안 됨.** validation 까지 완료, completion reflect 진행 중
- `package.json` 0.17.7 (bump 없음)

### 다음 세션이 알아야 할 것

- **v0.18 milestone 을 만드는 것이 다음 할 일이다.** `reap make milestone` → 경계 채우기 →
  `reap milestone main <slug>`. generation 목록의 원본은 `vision/design/backlogs_v0.18/` 6건.
  **`goals.md` 에 plugin 전환 goal 이 없어서 신설해야 한다** (`milestone main` 이 goal 매칭을 요구)
- **milestone 은 midterm 에서 계획을 가져간다.** 계획에 속하는 것은 milestone 파일에 쓰고
  midterm 에 중복하지 마라 — genome·reap-guide 에 명문화했다
- **evaluator 를 안 띄웠다.** `evaluator: true` 이지만 이 세션은 subagent 호출을 사용자 명시
  요청 시에만 하도록 지시받았다. longterm 은 "독립 검토는 한 번으로 수렴하지 않는다"고 기록한다
- **docs 5 로케일과 migration note 는 의도적으로 안 했다.** v0.18 릴리즈 세대가 받는다 —
  `check-docs-version.sh` § 5 가 note 버전 > 패키지 버전을 막으므로 bump 와 note 는 같은 세대여야 한다
