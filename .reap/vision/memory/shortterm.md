# Shortterm Memory

## 세션 요약 (gen-089, 2026-08-20)

### daemon 을 폐기하고 indexer 를 내장했다 — 0.17.6

상주 프로세스·포트·registry·별도 npm 패키지가 전부 사라졌다. `reap index` 6개 verb 로 대체.
full 인덱싱 6.7초 → **0.35초**(파일별 `git log` 233회 제거). 네이티브 의존 0(WASM grammar).

**대표 기능이 5개월간 0을 반환하고 있었다** — resolver 가 `./x.js` → `x.ts` 를 못 찾았다.
테스트 130 통과, 게이트 통과, CI 초록. `reap index status` 의 **import 해석률**이 그 자리를 메운다.

### evaluator 3회 · 회귀 3회 — 매번 직전 라운드의 수정 안에서 나왔다

**매 라운드 세 스위트·네 게이트가 전부 통과한 상태에서 시작했고 매번 사용자 도달 결함이 나왔다.**
1회차 4건 → 2회차 4건(**1회차 수정 안**) → 3회차 4건(**2회차 수정 안**).

가장 비싼 것(D1)의 근본 원인은 알고리즘이 아니라 **edge 키를 네 곳이 조립했고 둘이 구분자를
달리 쓴 것**이었다. `removeByFile` 이 지운 키가 남아 `addEdge` 가 그 edge 를 영원히 거부했고,
일상적 커밋 5회에 call 그래프가 통째로 비었다 — `status` 는 내내 100%였다.

### 지금 상태

- unit **575** (600→) / e2e **326** (302→) / scenario 44 — 전부 0 fail
- 자기진단 8절 · 문서 게이트 · 버전 하한 · `vite build` · typecheck 전부 통과
- `fix --check` 0 error / 4 warning (lineage parent 2 + longterm + **summary.md 338줄**)
- `package.json` **0.17.6**. push·tag·publish 없음. **로컬 macOS 에서만 돌았다**

### 다음 세션이 알아야 할 것

- **`environment/summary.md` 가 338줄이다** (250 가이드라인). gen-087 이 넘긴 항목이 그대로
  살아 있고 이번에 더 늘었다. **근본 정리는 처방적 서술(게이트 원칙·검증 규율)을 genome 으로
  옮기는 것**이고, 이번 세대는 embryo 라 adapt 에서 착수 가능하다
- **이식된 모듈에 unit test 가 없다.** 폐기한 daemon 스위트 130 중 ~32개가 삭제가 아니라
  **이식된** 모듈의 unit test 였다. `pickBestTarget` 3-tier 와 `removeEdgesOfKind` 는 e2e 로만 덮인다
- **자기진단 §5 가 incremental 을 안 본다.** 이번 blocker 넷 중 셋이 그 경로였고 게이트는
  전부 통과시켰을 것이다. `lsof` 단언도 fail-open
- **0.17.6 은 문서까지 준비됐고 태그·발행만 남았다.** gen-088 `reap uninstall` 과 함께 나간다
