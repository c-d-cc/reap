# Planning

## Tasks

### Task 1: 현재 genome/environment 상태 점검
- .reap/genome/ 전체 파일 읽기 (principles, conventions, constraints, source-map, domain/)
- .reap/environment/ 전체 파일 읽기
- 현재 소스 코드 구조와 비교하여 outdated/missing 항목 식별

### Task 2: reap run sync-genome + sync-environment 실행
- `reap run sync-genome` 실행하여 JSON 출력 확인
- `reap run sync-environment` 실행하여 JSON 출력 확인
- AI가 해석해야 하는 prompt 내용이 충분한지 평가

### Task 3: 직접 sync 수행
- genome 파일들을 현재 코드베이스 기준으로 업데이트
- environment 파일들을 현재 상황 기준으로 업데이트
- 특히 gen-087~096에서 변경된 Script Orchestrator 아키텍처 반영

### Task 4: sync command 개선 (필요 시)
- sync-genome.ts / sync-environment.ts의 prompt가 충분한 context를 제공하는지 검토
- 부족하면 수정 + 테스트
