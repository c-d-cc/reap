# Planning

## Summary
`updateProject()`에 npm 패키지 자체 업그레이드 단계를 추가. 새 버전 감지 시 `npm update -g @c-d-cc/reap` 실행.

## Tasks
1. `src/cli/commands/update.ts`에 self-upgrade 함수 추가
   - `npm view @c-d-cc/reap version`으로 최신 버전 확인
   - 현재 버전과 비교하여 다르면 `npm update -g @c-d-cc/reap` 실행
   - 업그레이드 후 `updateProject` 재실행 (새 버전의 템플릿 동기화)
2. CLI 출력에 업그레이드 결과 표시
3. 빌드 + 테스트
