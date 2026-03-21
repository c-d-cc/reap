## What's New

- Slash command 전면 정리: hook 실행을 각 stage command 말단으로 이동, reap.next는 stage 전환 전용으로 축소
- reap.completion이 archiving + 커밋을 직접 처리 (reap.next에서 이동)
- 모든 hook은 커밋 전 실행 (hook 결과물이 같은 generation 커밋에 포함)
- reap.next에 onLifeTransited/onMergeTransited hook 실행
- reap.merge.completion 단일 커밋으로 통합
- Submodule commit check 추가 (archiving 시)
- 3-Layer Model: Genome → Knowledge Base (Genome + Environment)
- docs: mobile sidebar scroll fix, genome/environment/lifecycle 페이지 개선
- E2E command template 구조 검증 58개 테스트 추가

## Generations

- **gen-085-b07ba0**: slash command 전면 정리 — 책임 분리 + hook 배치 + 일관성
- **gen-086-bc3af7**: E2E 테스트 — command template 구조 검증
