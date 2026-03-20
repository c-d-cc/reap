# Objective

## Goal
REAP에서 malfunction 발생 시 에이전트가 GitHub Issue를 자동 등록하는 기능 추가.
gh CLI 감지, 개인정보 이중 검사, 유저 확인 후 등록.

## Completion Criteria
- reap init/update에서 gh CLI 감지 + config.yml에 autoIssueReport 설정
- issue report 슬래시 커맨드 또는 유틸 생성
- 개인정보 이중 검사 (pre-format instruction + post-format sanitization)
- 유저 confirm 필수
- 빌드/테스트 통과
