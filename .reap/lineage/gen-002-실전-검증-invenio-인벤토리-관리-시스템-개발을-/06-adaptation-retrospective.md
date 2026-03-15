# Adaptation Retrospective — Gen-002

## Part A: 회고

### 교훈
1. **실전 검증이 핵심**: 이론적 설계만으로는 워크플로우 문제를 발견할 수 없었음. invenio 개발 과정에서 4건의 실질적 문제 발견
2. **첫 세대 부트스트랩**: genome이 전부 placeholder인 상태에서 시작하는 것은 에이전트에게 큰 부담. 프리셋 시스템이 필요
3. **자동 아카이빙 누락**: advance()와 complete()가 분리되어 있어 Legacy 진입 후 수동 아카이빙이 필요했음 → 코드 수정으로 해결
4. **서브에이전트 위임 시 산출물 갱신**: Growth에서 서브에이전트에게 구현을 위임하면 REAP 산출물을 모름. 갱신 시점을 유연하게 해야 함

### Genome 변경 제안
- conventions.md: mutation 기록 기준 추가 (어느 수준부터 기록할지)
- principles.md: "examples/로 실전 검증" 패턴 ADR 추가

## Part B: 가비지 컬렉션

### 코드베이스 건강 점검
- convention 위반: 없음
- 기술 부채: `generation.ts`의 `complete()` 메서드가 60줄로 다소 김 → 분리 고려
- 불필요 복잡도: 없음

## Part C: Backlog 정리

### 다음 세대 후보
1. `reap init --preset` 구현 (부트스트랩 프리셋)
2. invenio Gen-002 (카테고리 관리 + 입출고 트랜잭션)
3. mutation 기록 기준을 conventions.md에 추가
4. `reap complete` CLI 명령어 추가 (수동 아카이빙 옵션)
5. generation.ts complete() 리팩토링
