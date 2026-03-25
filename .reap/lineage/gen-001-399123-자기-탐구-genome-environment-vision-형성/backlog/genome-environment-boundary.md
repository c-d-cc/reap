---
type: genome-change
status: pending
priority: high
---

# genome/environment 경계 정리 및 갱신 전략 수립

## Problem
- application.md에 descriptive 정보(Tech Stack, Testing 등)가 섞여 있음
- application.md와 summary.md 간 정보 중복 (tech stack, dependencies)
- environment 갱신 전략이 없음 — "reflect에서 갱신"이라고만 적혀 있고 무엇을/어떻게 갱신할지 미정의

## Solution
1. **application.md**: prescriptive 정보만 — Identity, 핵심 메타포, 설계 결정(왜 이렇게 했는가), Conventions, Genome Rules
2. **environment/summary.md**: descriptive 정보만 — 현재 tech stack, 소스 구조, 빌드, 테스트, 의존성
3. **갱신 전략**: reflect phase에서 implementation 변경 파일 목록 기반으로 environment 중 영향받는 부분만 점진적 업데이트
