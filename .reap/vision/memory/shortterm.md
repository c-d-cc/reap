# Shortterm Memory

## 세션 요약 (gen-077, 2026-07-27)

### gen-077: e2e init-repair 해소 — 0.17.3 묶음 1/3

6세대 방치된 e2e 1 fail 해소. **e2e 268-1 → 272-0. gen-072 이래 처음으로 세 스위트 모두 green.**

learning 은 "(a) 테스트가 낡았다"로 판정했고 맞았으나, **테스트를 코드 경로별 4 case 로 쪼개면서 계획에 없던 구현 결함이 드러났다** — `repair.ts` 가 `ensureClaudeMd` 의 `"updated"` 를 `skipped` 로 분류해, 파일을 갈아엎고도 "이미 있어서 건너뜀"으로 보고하고 있었다. 부정형 분기(`=== "skipped"` 만 skipped)로 수정.

`integrity` 와 `ensureClaudeMd` 의 판정 비대칭은 **통합하지 않았다** — 전자는 경고 여부(느슨해야), 후자는 덮어쓸 위치(엄격해야). 목적이 다르므로 통합하면 한쪽이 부적절해진다. 상호 참조 주석으로 근거를 남겼다.

### 다음 세션 — 0.17.3 묶음 계속

1. **`릴리즈-자기진단-게이트-...`** (2/3) — **두 선행 조건 모두 충족됨**: `fix --check` 경고 0(gen-076) + 테스트 0 fail(gen-077). 이제 자기진단과 **테스트를 CI 게이트에 넣을 수 있다**
2. `agent-관점-검증-층2-...` (3/3) — 설계 세대라 코드 변경이 없을 수 있음
3. **0.17.3 릴리즈** — 3건 완료 후 릴리즈 노트 일괄 보강 → 태그 (**유저 확인 필수**)
4. interview 재설계 / daemon 2건은 이번 묶음 제외

### canary token 설계에 반영할 것

"한쪽만 갱신됨"이 **세 번째**다:

| 이슈 | 늘린 것 | 안 고친 것 |
|---|---|---|
| #21 | memory 분류 규칙 | reflect prompt / evolution 템플릿 |
| #22 | 설치 경로 | integrity checker |
| gen-077 | `ensureClaudeMd` 반환값 `"updated"` | `repair.ts` 분기 |

**반환값 union 확장도 "여러 곳이 아는 사실"의 한 종류**다. 다음 세대 설계에 포함할 것.

### 6세대 방치의 구조적 원인

`.github/workflows/ci.yml` 은 `npm ci` + `npm run build` 만 돌린다 — **테스트를 안 돌린다.** e2e 1 fail 이 아무것도 막지 않았다. 다음 세대에서 CI 에 테스트 추가.

### Backlog 상태

pending 5건. consumed: `e2e-init-repair-...` (gen-077).
