# Shortterm Memory

## 세션 요약 (gen-081, 2026-07-29)

### v0.17.3 릴리즈 완료

gen-076~080 묶음. 릴리즈 노트가 gen-079 시점에 쓰여 **gen-080(OpenCode 기동 불능 수정)이 빠져 있었고** 보강 후 태그. 세 workflow 성공, issue #22 답변 게시.

### gen-081: 테스트가 CI 에서 돈다

`reap-test`(private)의 CI 가 reap 을 checkout 해 테스트를 돌린다. reap 이 public 이라 거기서 돌리면 **공개 로그로 테스트셋이 새고 되돌릴 수 없기** 때문. reap 은 `repository_dispatch` 만 보낸다 (secret `TEST_DISPATCH_TOKEN`).

붙이자마자 **테스트 스위트의 잠복 버그 3종**이 드러났다 — git identity 미설정 / `init.defaultBranch` 의존 / `mock.module` 전역 누수. 셋 다 개발자 머신에서만 통과하던 것.

### 지금 상태

- CI 전 경로 검증 완료 (470 / 278 / 44, 리눅스, daemon e2e 포함)
- 토큰은 유저가 재발급해 교체 완료 — 교체 후에도 정상 확인
- gen-081 은 **completion reflect 진행 중**

### 다음 — pending backlog 3건

- **interview 기능 재설계** — gen-076 에서 abort. 유저가 원한 방향은 "모호성을 측정해 임계 이하로 낮추는 반복 질문"이지 템플릿 슬롯 채우기가 아니다
- **daemon 배포 결함** — npm 설치 시 daemon 이 끊긴 심링크. `daemon: true` 사용자가 못 쓴다
- **daemon SCIP 검토** — 위 결함 수정 후

daemon 2건은 유저 판단으로 보류 중. 재개 지시가 있을 때.

### 미해결 갭

**층2(agent 통합) 검증이 opencode adapter 를 커버하지 않는다.** gen-080 이 정확히 그 갭에서 터졌다. OpenShell 샌드박스 접근은 네트워크 정책에 막혀 보류.
