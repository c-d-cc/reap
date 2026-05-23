# REAP Daemon — 미결 의사결정

> 2026-05-24 | Status: Open
>
> daemon은 Phase 1-4까지 구현 완료(116 tests pass)되었으나, 가치 명제 검증과 외부 노출 전략에 대한 핵심 결정이 미루어진 상태다. 현재는 자동 인덱싱만 수행되며 인덱스 데이터를 활용하는 자동화된 경로가 없다.
>
> 이 문서는 결정 자체보다 결정에 필요한 정보를 모으는 것이 목적이다. 자연스러운 트리거(첫 외부 사용자, 다른 우선순위 정리, AI 생태계 변화 등)가 발생하면 다시 열어 결정한다.
>
> 관련 문서:
> - [indexer.md](./indexer.md) — 구현 설계 (how-to-build)
> - phase{1,2,3,4}-plan.md — Phase별 구현 계획

## 배경

daemon이 풀려는 문제: **AI agent가 큰 codebase를 이해할 때 grep/Read로 매번 탐색하는 토큰/시간 비용을 줄인다.**

그러나 다음 두 가지 변화가 이 가치 명제를 잠식할 수 있다:

1. **AI 모델의 코드 이해 능력 향상** — 1M 컨텍스트, 강력한 reasoning, 빠른 grep/Read 도구. 작은~중간 codebase는 사실상 풀로드 가능.
2. **IDE LSP 통합의 보편화** — IDE 사용자는 이미 LSP로 심볼/참조 탐색 가능.

따라서 daemon이 unique value를 제공하는 영역은:
- **대규모 codebase** (LSP/IDE 활용도 낮은 CLI agent 환경)
- **LSP가 다루지 않는 분석** (blast radius BFS, community detection, process tracing)
- **다국어 통합 인덱스**

이 좁아진 가치 영역이 daemon 유지 비용(코드 복잡도, 의존성, 동기화, 사용자 환경 부담)을 정당화하는지는 외부 사용 데이터 없이는 알 수 없다.

## Q1. 활용 통로 — AI agent가 daemon을 어떻게 query 하는가?

현재는 인덱싱 trigger만 자동이고, 데이터를 자동 소비하는 경로가 없다.

### 옵션

| 옵션 | 설명 | 구현 비용 | 효과 가시성 |
|---|---|---|---|
| **A. MCP wrapper** | HTTP API 위에 thin MCP server. Claude Code/Cursor에서 직접 query | 중 (스펙은 단순, 표준화 트래킹 필요) | 가장 자연스러움 — 외부 AI client가 직접 사용 |
| **B. REAP 자체 활용 (prompt injection)** | generation의 planning/implementation phase에서 daemon query 결과를 subagent prompt에 자동 주입 | 중~높음 (어떤 query를 언제 주입할지 설계 필요) | REAP 워크플로우에 직접 통합 — 측정 용이 |
| **C. CLI 노출만** | `reap daemon query <q>` 명령으로 노출. AI가 Bash tool로 호출 | 0 (이미 구현됨) | AI가 매번 호출 결정해야 함 — 활용도 낮을 가능성 |
| **D. 위 조합** | 예: A + B 동시 — MCP는 외부, prompt 주입은 내부 | 높음 | 가장 포괄적이지만 둘 다 검증 안 됨 |

### Trade-off 핵심
- A는 **외부 가치 검증**에 적합 (사용자가 직접 query → 만족도/활용도 관찰)
- B는 **REAP 자체 가치 검증**에 적합 (generation 작업 품질 변화 측정)
- C는 sunk cost만 안고 가는 path — daemon 진가는 못 드러냄

### 결정 트리거
- MCP 프로토콜이 더 안정화되면 A 비용 감소
- REAP가 첫 외부 사용자를 만나면 A vs C의 가치 차이 명확해짐
- REAP의 generation 품질에 정량 메트릭 도입 시점에 B 검증 가능

---

## Q2. 타겟 codebase 규모 — 어느 크기부터 가치 명확한가?

daemon이 grep/Read 대비 명확히 우위인 codebase 사이즈가 어디서부터 시작되는지에 대한 데이터 없음.

### 가설 (검증 안 됨)

| codebase 규모 | AI 탐색 부담 | daemon 가치 |
|---|---|---|
| 1만 lines 미만 | 거의 없음 (풀로드 가능) | 거의 없음 |
| 1만 ~ 10만 lines | 중간 | 중간 (blast radius 등 정밀 분석에서) |
| 10만 ~ 100만 lines | 큼 | 큼 (전 구조 파악 어려움) |
| 100만 lines 초과 | 매우 큼 | 매우 큼 (단, cold start 부담 ↑) |

### 결정 트리거
- 첫 외부 사용자의 workspace 사이즈 데이터 수집
- "1만 미만에서는 daemon 자동 시작 안 함" 같은 threshold 정책 가능성
- REAP 사용 사례가 SaaS / monorepo / library 등 어느 쪽인지에 따라 분포 다름

### 미수집 데이터
- 사용자 workspace 분포 (없음)
- daemon vs no-daemon 시 generation 토큰 비교 (없음)
- 큰 codebase에서 daemon query 응답 시간 (벤치마크 없음)

---

## Q3. Cold start 비용 — 큰 codebase 첫 인덱싱

증분 갱신은 설계되어 있으나 첫 인덱싱 부담은 미평가.

### 미확정 사항
- **소요 시간**: 100만 line codebase에서 Tree-sitter 풀 파싱 + SQLite 영속화는 몇 분? 몇 십 분?
- **메모리 사용**: 인메모리 그래프가 큰 codebase에서 얼마나 차지?
- **차단성**: 첫 인덱싱이 진행되는 동안 REAP의 다른 작업은 어떻게? 현재는 silently fail이지만, 명시적 차단/대기 UX 필요한가?
- **API-level incremental**: 메모리에 "남은 작업"으로 기록됨. file 단위 incremental만 있고 함수/심볼 단위 incremental 없음

### 가능한 완화 전략
- Cold start 백그라운드 (사용자 작업 차단 안 함)
- 일부 파일만 우선 인덱싱 (entry point 우선)
- 사용자가 daemon 활성화를 explicit opt-in
- threshold 기반 자동 skip (Q2와 연결)

### 결정 트리거
- 실제 큰 codebase 벤치마크 데이터 확보
- 사용자 feedback ("첫 setup이 너무 느리다" 등)

---

## Q4. 포지셔닝 — 핵심 feature / 옵션 / 별도 패키지?

현재 daemon은 publish되지 않은 상태. `package.json` files 필드에 미포함, `file:./daemon` 의존성. 이 상태를 어떻게 풀어낼지에 대한 결정 미정.

### 옵션

| 옵션 | 설명 | 사용자 경험 |
|---|---|---|
| **A. 모노패키지 (REAP 안에 daemon 포함)** | `@c-d-cc/reap` 설치 시 daemon 같이 설치 + 자동 spawn | 가장 매끄러움. 단, 설치 크기 ↑, tree-sitter WASM 15개 언어 포함 |
| **B. 별도 패키지 (opt-in)** | `@c-d-cc/reap-daemon`을 별도 npm publish. REAP는 `optionalDependencies`로 참조. 사용자가 명시적으로 설치 | 작게 시작하고 싶은 사용자에게 부담 적음. 발견 가능성 ↓ |
| **C. 동봉만, 자동 시작 안 함** | 모노패키지지만 `reap daemon start` 같은 명시 명령으로만 동작 | A와 B의 중간. 발견은 가능, 부담은 opt-in |

### Trade-off
- A는 daemon이 REAP 핵심 가치라는 선언 (commit)
- B는 daemon이 옵션이라는 선언 (hedge)
- C는 결정을 미루면서 사용자에게 노출 (실험)

### 의존성 부담 비교

```
@c-d-cc/reap (현재):       yaml 1개
@c-d-cc/reap + daemon:     yaml + better-sqlite3 + tree-sitter-wasms + web-tree-sitter (+ WASM 바이너리 15개)
```

설치 시간/디스크 영향 실측 안 됨.

### 결정 트리거
- Q1에서 활용 통로가 정해지면 자연스럽게 포지셔닝도 결정됨 (예: B를 택하면 별도 패키지가 자연스러움)
- 첫 외부 사용자 시점에 자동 spawn 부담을 어떻게 느끼는지 관찰

---

## 결정을 미루는 비용

미루는 것 자체의 비용도 인지해 둘 것:

1. **Sunk cost 확대** — 시간이 지날수록 폐기하기 어려워진다
2. **코드 stale** — Phase 1-4 완료 후 2개월간 진전 없음. 의존성 update 등 유지 비용 발생
3. **방향 결정 지연** — 4가지 질문이 서로 연결되어 있어 하나 결정하면 나머지가 따라옴. 모두 미정이면 어느 것도 진행 못 함
4. **AI 생태계 변화** — 모델/도구 발전으로 daemon 가치가 더 잠식될 가능성

## 다시 열어볼 자연스러운 시점

- REAP 첫 외부 사용자 등장 (workspace 데이터 확보)
- MCP 프로토콜 표준화 진전 (Q1-A 비용 감소)
- 6개월 경과 시점 정기 재평가 (모멘텀 회복 또는 폐기 결정)
- REAP 핵심 lifecycle 안정화 후 (다음 큰 작업으로 daemon 활용 통로 구현)

## 폐기 시 처리 방침 (참고)

폐기 결정이 내려질 경우 다음 절차:
1. `daemon/` 폴더 + 관련 CLI integration (`src/cli/commands/daemon/`) 제거
2. `package.json`의 `@c-d-cc/reap-daemon` 의존성 제거
3. `src/cli/commands/run/start.ts:101`, `completion.ts:348`의 `triggerIndexing` 호출 제거
4. 관련 commits를 `archive/daemon-experiment` 브랜치로 보존 (history 손실 방지)
5. `vision/design/daemon/` 폴더 전체를 `vision/design/archive/daemon/`로 이동
