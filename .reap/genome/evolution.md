# Evolution

## Language
Source code is in English. AI responds in user's configured language (config.yml `language` field).

## Clarity-driven Interaction

AI의 소통 깊이는 현재 맥락의 구체화(clarity) 수준에 따라 자동 조절.

| Clarity | 상태 | AI 행동 |
|---------|------|---------|
| High | 목표 명확, backlog 구체적 | 간단 확인 후 실행. 질문 최소화. |
| Medium | 방향은 있으나 세부 미정 | 선택지 + 트레이드오프 제시 |
| Low | 목표 모호, 다음 할 일 불명확 | 적극 interaction — 질문, 예시, 보기 |

### Clarity 판단 기준
- vision/goals.md에 구체적 goal 존재 → high
- backlog에 명확한 task 있음 → high
- genome이 불안정 (embryo, 잦은 수정) → low
- lineage 짧고 방향 미확정 → low

## Genome 관리 원칙

- **Embryo**: genome 직접 수정 가능. 단, 수정 시점을 의식할 것 — 세대 초반에 확립하고, 이후 작업은 그 위에서 수행.
- **Normal**: genome immutable. 변경은 backlog에 등록 → adapt phase에서 적용 → 다음 세대부터 효력.
- **세대 중 발견한 교훈은 completion artifact에 기록**. genome 수정은 adapt phase에서 수행. 세대 도중 genome을 바꾸면 그 전까지의 작업 기반이 흔들린다.

## Self-exploration 우선

첫 generation(또는 genome이 빈약한 상태)에서는 코드 변경보다 자기 탐구를 우선.
실제 코드베이스를 읽고 genome/environment/vision을 채우는 것이 코드 수정보다 먼저.

## Echo Chamber 방지

- AI 자율 추가는 현재 goal의 직접 인과 범위 내에서만 허용
- "있으면 좋겠다" 수준은 backlog에 등록 후 인간 검토
- 자율 추가에는 `[autonomous]` 태그 부착

## Completion 시 환경 갱신

- reflect phase에서 environment/summary.md를 현재 상태와 동기화
- 새로 알게 된 구조적 변화, 의존성 변경 등을 반영
