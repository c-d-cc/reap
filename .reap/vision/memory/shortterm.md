# Shortterm Memory

## 세션 요약 (2026-03-28)

### v0.16.1 ~ v0.16.2 배포
- npm README 이미지 경로 수정 (상대 → GitHub raw URL)
- docs SPA 라우팅 복원 (404.html fallback, v0.16 rewrite 시 누락된 것)
- README docs 링크 수정 (merge-lifecycle → merge-generation, agent-integration 제거)
- README에 누락된 docs 링크 4건 추가 (introduction, quick-start, command-reference, migration-guide)
- README 언어 링크를 GitHub 절대 URL로 변경 (npm 호환)
- docs workflow 트리거 경로 추가 (README, workflow 자체)
- docs Advanced에서 outdated Presets 섹션 제거
- docs Hook Reference/Hooks에서 Session Context Loading 섹션 제거
- versionBump 스킬에 RELEASE_NOTICE + docs release notes 업데이트 단계 추가

### Hook 시스템 복원
- 기본 conditions 복원 (always, has-code-changes, version-bumped) + 예시 템플릿
- `reap make hook` CLI 커맨드 추가
- `reap make`를 확장 가능한 디렉토리 구조로 리팩토링 (make/index.ts + make/backlog.ts + make/hook.ts)
- reap init 시 hook conditions + examples 자동 설치
- reap-guide에 hook 생성법 문서화 + prompt emit

### 브랜치 정리
- 로컬 브랜치: v0.16.0 → main, 기존 main → legacy

### 다음 세션
- 외부 프로젝트에서 core lifecycle 검증
- Embryo → Normal 전환 검토
- docs 사이트 실제 접속 확인 (SPA 라우팅 복원 검증)
