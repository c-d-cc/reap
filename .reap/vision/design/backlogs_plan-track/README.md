# plan 트랙 — v0.18 에서 제외됨

**사용자 결정 (2026-08-21)**: v0.18 은 `plan` 을 제외하고 나머지를 전부 반영한다.

두 건은 **한 몸이다** — `/reap.plan` skill 은 `.reap/plan/` 자리가 있어야 채울 수 있고,
그 의존은 `reap-plan-skill-...md` 자신이 선행 조건으로 명시한다. 따라서 함께 나왔다.

## 왜 나머지는 영향을 받지 않는가

착수 전에 실측했다 — **`idea` 와 `interview` 는 `plan` 을 한 번도 참조하지 않는다.**
의존은 `/reap.plan → plan` 한 방향뿐이다.

한 가지만 바뀐다: `plan` backlog 가 지식 축을 **넷**(genome / environment / plan / vision)으로
그리고 있었다. `plan` 이 빠지면 v0.18 의 "지식 축 경계 통합 설계" 세대는 **3축**
(milestone · idea · memory)을 다룬다.

## 다시 열 때 볼 것

- **`.reap/plan/` 이 아직 필요한가.** v0.18 이 `idea` 와 `interview` 를 넣고 나면 "무엇을 만들
  것인가"의 일부가 이미 다른 자리에 담긴다. 남는 빈자리가 무엇인지 다시 재라
- **`plan` 이 `vision/design/` 과 무엇이 다른가.** plan backlog 자신이 "vision 은 방향이고
  짧다, plan 은 방대한 정본" 으로 갈랐다. 그 구분이 v0.18 이후에도 성립하는지 확인할 것
- **결정 로그를 두지 않기로 한 판단**(사용자, 2026-08-19)은 그대로 유효하다 — REAP 은 이미
  lineage·artifact·backlog 로 "왜 그렇게 정했는가"를 기록한다
- `/reap.plan` 의 기반 방법론 문서는 `~/cdws/autoknowme6/temp/docs/methodology-ko.md` (688줄)
