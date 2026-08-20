# Shortterm Memory

## 세션 요약 (gen-090, 2026-08-20)

### 규칙이 자기 전제를 만들지 않고 있었다

gen-089 직후 `environment/source-map.md` 를 분리하고 그것을 읽으라는 규칙을 REAP 의 genome 에
넣었는데, 그 규칙이 배포 템플릿에는 없었다. 그대로 옮기면 더 나빠질 상황이었다 —
`adoption` 은 source-map 을 만들지만 **`greenfield` 는 만들지 않는다.**

사용자 지시("greenfield 일때도 정상동작 해야 한다")대로 **S2**: greenfield 가 스텁을 쓴다.
스텁은 **서술하지 않고 가르친다** — 스캔할 코드가 없고, `--mode greenfield` 는 코드가 있는
디렉토리에 강제될 수 있어 트리에 대해 아무것도 주장하면 안 된다.

기존 프로젝트 도달은 `migration/v0.17.6.md` **§6** 뿐이다 (`update`/`--repair` 는 environment
파일을 보충하지 않는다). 3분기 판정 + 대조용 원본 전문을 실었다.

### 강도가 채널마다 다른 것은 의도다

배포 genome 의 부재 절은 **조건부**("없으면 summary.md 가 갖고 있다"), migration note 는
**무조건형**("파일을 써라"). 전자의 대상은 코드가 없는 새 프로젝트고 후자는 코드가 있는 기존
프로젝트다. 그래서 `fix --check` 에 "source-map 없음" 경고를 **넣지 않았다** — 규칙이 부재를
견디는데 checker 가 부재를 문제로 보고하면 issue #22 의 형태가 된다. backlog 에 재개 조건 2개.

### 세대 안에서 한 번 되돌아왔다 — 읽기 의무에 쓰기 의무가 없었다

fitness 직전에 evaluator 가 잡았다: 규칙은 *"source-map 을 읽어라"* 인데 같은 genome 이 한 절 아래에서
*"구조는 summary.md 에 갱신하라"* 고 말하고 있었다. **읽기 의무만 있고 쓰기 의무가 없었다.**
사용자 결정 **B** — `reap run back` 으로 implementation 까지 내려가 고치고 다시 올라왔다.

**scope 는 못박혔다: 모순만 멈추고 소유 모델은 정하지 않는다.** 문구는 *"갖고 있는 쪽을 갱신하라,
양쪽에 두지 마라"* 까지다. 어느 파일이 소유해야 하는가는 다음 세대 몫이다.

carrier 집합 `environment-refresh-targets` 4파일 (+ 한국어 genome 은 adapt 에서 5번째).

### 지금 상태

- unit **585** (575→) / e2e **329** (326→) / scenario 44, 전부 0 fail
- 자기진단 게이트 전 절 통과 (opencode 1.3.16). **§3 에 source-map assertion 추가, 두 분기 모두
  수정 전 fail 을 확인했다**
- `fix --check` 0 error / 3 warning — 전부 상속 (lineage parent 2 + evolution.md 302줄)
- `package.json` **0.17.6 유지**. push·tag 없음. **로컬 macOS 에서만 돌았다**

### 다음 세션이 알아야 할 것

- **0.17.6 릴리즈가 다음이다.** 문서 3종에 이 건까지 반영됐고 문서 게이트가 통과한다.
  남은 것은 `scripts/check-agent-integration.sh`(층2, ~$0.25) 후 태그 push.
  **OIDC 로 발행하는 첫 시도**이며, main 에 미push 커밋이 7개다
- **migration note 를 따르는 동작은 어느 층도 검증하지 않는다.** 층2 는 slash command 노출만 본다.
  note 가 계속 늘어나므로 한 번은 실제 수행을 검증할 가치가 있다 (05-completion.md hint 1)
- **`summary.md` 와 `source-map.md` 의 경계가 genome 어디에도 없다.** 다음에 summary 가 커지면
  같은 판단을 다시 하게 된다 (hint 2)
- **끊긴 것은 evaluator 가 아니라 agent 간 반환 경로다.** evaluator 는 라운드 2 서면 리뷰를 세 번
  냈고 매번 "이 세션에 SendMessage 가 없다"고 적었다 — 팀 리드가 전달해 준 것이 유일하게 작동한
  채널이다. 초안이 이것을 "evaluator 신뢰성"으로 진단했던 것은 **측정하지 않은 원인에 이름을 붙인
  것**이라 정정했다. 사용자 지시로 이 건 자체는 **별개 처리** (코드리뷰에서도 나온 사안)
- **`report-evaluator` 는 validation 에서만 쓸 수 있다.** completion 에 도착한 판정은 채널에 못
  담는다. fitness evaluator 의 concern 을 담을 곳도 없다 (05 § L7)
