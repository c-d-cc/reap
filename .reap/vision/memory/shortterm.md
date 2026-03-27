# Shortterm Memory

## 세션 요약 (2026-03-27)

### gen-041: environment 구조 개선
- paths.ts에 environmentResources, environmentDocs 경로 추가
- init에서 environment/resources/, environment/docs/ 디렉토리 생성
- migrate에서 v0.15 resources/docs 방어적 복사 추가
- integrity 검증에 optional dirs로 추가
- reap-guide.md (template + 로컬) 구조 설명 업데이트
- 테스트: 406 pass (변경 없음)

### 다음 세션에서 할 것
- docs 페이지에 environment resources/docs 설명 추가
- npm publish 후 registry에서 autoUpdateMinVersion 필드 조회 실동작 확인
- README v0.16 재작성

### Backlog 상태
- environment 구조 개선 backlog: consumed (gen-041)

### 미결정 사항
- Embryo -> Normal 전환 시점
- cruise mode 리팩토링 구체 설계
