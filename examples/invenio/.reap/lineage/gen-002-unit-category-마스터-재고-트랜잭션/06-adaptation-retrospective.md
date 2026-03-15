# Adaptation Retrospective — Gen-002

## 잘된 점
- 백엔드/프론트엔드 분리 구현이 효율적
- 트랜잭션 기반 재고 계산 패턴이 견고함
- 마스터 데이터 CRUD 패턴 재사용 가능

## 개선할 점
- Bun 서버 hot reload 미적용 → 코드 변경 시 수동 재시작 필요
- vite proxy 설정과 서버 포트 불일치 가능성 → 환경 설정 중앙화 필요

## Genome 변경 제안
- conventions.md에 "마스터 데이터 CRUD 패턴" 추가 고려
- 없음 (현재 genome으로 충분)
