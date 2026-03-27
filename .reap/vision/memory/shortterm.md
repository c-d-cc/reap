# Shortterm Memory

## 세션 요약 (2026-03-27)

### gen-043: autoUpdate 자동 업데이트 구현
- check-version.ts에 자동 업데이트 로직 추가 (queryLatestVersion, readAutoUpdateConfig, performAutoUpdate)
- SessionStart/postinstall에서 npm latest 조회 → autoUpdate true이면 자동 설치 + reap update
- +dev, -alpha 빌드 skip, autoUpdateMinVersion guard, 네트워크 실패 silent skip
- unit test 6개 추가 → 417 pass

### 다음 세션에서 할 것
- auto-update 결과를 SessionStart 출력에 반영하는 연동 검토
- docs 페이지에 environment resources/docs 설명 추가
- README v0.16 재작성

### Backlog 상태
- autoUpdate 자동 업데이트: 이번 gen에서 소비 예정

### 미결정 사항
- Embryo -> Normal 전환 시점
- auto-update 결과의 SessionStart 출력 연동 방법
