# Shortterm Memory

## 세션 요약 (2026-03-27)

### gen-040: autoUpdateMinVersion guard 구현
- `check-version.ts`에 npm registry의 `reap.autoUpdateMinVersion` 조회 + semver 비교 + 경고 출력 로직 추가
- `package.json`에 `reap.autoUpdateMinVersion: "0.16.0"` 필드 추가
- 기존 SessionStart hook + postinstall 인프라를 그대로 활용
- 테스트: 406 pass (unit 231, e2e 134, scenario 41)

### 다음 세션에서 할 것
- npm publish 후 registry에서 autoUpdateMinVersion 필드 조회 실동작 확인
- README v0.16 재작성
- Cruise mode 구조 변경 (parent가 cruise loop 관리)

### Backlog 상태
- pending 없음 (autoUpdateMinVersion guard는 이번 generation에서 완료)

### 미결정 사항
- Embryo -> Normal 전환 시점
- cruise mode 리팩토링 구체 설계
