# 1 — 기능 대조 6건 판정

03-compat.md 미결 표의 6건을 판정하고, 결과를 규율할 자리에 반영한 뒤 미결 표를 제거한다.

| 기능 | 판정 방향(초안 — 세대가 근거와 함께 확정) |
|---|---|
| check-version/버전 안내 | 안 만든다 — latest 비사용 정책에서 자동 확인 대상이 없다. 필요 신호가 오면 backlog |
| uninstall | spec 결정 유지(플러그인 지우면 끝). 구 v0.17 자산 제거는 M3 migration skill의 경계로 |
| config 명령 | 안 만든다 — 직접 편집 + doctor 검증으로 충분 (YAGNI) |
| status 명령 | 안 만든다 — ctx 상태 줄·doctor·index status가 이미 있다 (YAGNI) |
| goal 개념 | 안 가져온다 — plan source가 그 자리. goals.md의 이주는 M3 매핑에 |
| notice·5로케일 | v0.18 브랜치에 틀을 남기지 않는다 — 배포 단계의 일. 0.17.8 다리는 main의 기존 기제 사용 |

## 완료 판정

- 6건 전부 판정 + 근거가 ps-4b485d(03-compat)에 반영, 미결 표 소멸
- 새 할 일이 생긴 판정은 backlog 항목으로. loop-0003 Dialogue에 위임 판정 기록
