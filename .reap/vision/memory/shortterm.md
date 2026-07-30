# Shortterm Memory

## 세션 요약 (gen-081 + gen-082, 2026-07-29)

### 검사 두 개가 붙었고, 둘 다 붙자마자 결함을 잡았다

**gen-081 — 테스트가 CI 에서 돈다.** `reap-test`(private)의 CI 가 reap 을 checkout 해 돌린다. reap 이 public 이라 거기서 돌리면 공개 로그로 테스트셋이 새고 되돌릴 수 없기 때문. reap 은 `repository_dispatch` 만 보낸다 (secret `TEST_DISPATCH_TOKEN`).
→ 잠복 버그 3종: git identity 미설정 / `init.defaultBranch` 의존 / `mock.module` 전역 누수.

**gen-082 — OpenCode 가 REAP 이 쓴 파일을 읽는지 검사한다.** `check-self-diagnosis.sh` 확장. `opencode agent list` 의 exit code **+ 목록에 두 agent 가 있을 것**. 모델 호출이 없어 무료라 CI 에 있다.
→ **REAP 의 실제 사용자 버그**: `XDG_CONFIG_HOME` 을 설정한 사용자에게 slash command 19개 + agent 2개가 조용히 사라졌다. 오류도 없다.

### 지금 상태

- reap CI green (opencode 1.18.9 로 실제 실행). reap-test dispatch green (473 / 278 / 44)
- **unit baseline 470 → 473** (XDG 해석 검증 3건 추가)
- gen-082 는 **completion reflect 진행 중**. 소스 변경은 이미 push 됨
- `TEST_DISPATCH_TOKEN` 은 유저가 재발급해 교체 완료

### 다음 — pending backlog 3건

- **interview 기능 재설계** — gen-076 에서 abort. 방향은 "모호성을 측정해 임계 이하로 낮추는 반복 질문"이지 템플릿 슬롯 채우기가 아니다
- **daemon 배포 결함** — npm 설치 시 daemon 이 끊긴 심링크. `daemon: true` 사용자가 못 쓴다
- **daemon SCIP 검토** — 위 결함 수정 후

daemon 2건은 유저 판단으로 보류 중.

### 여전히 열려 있는 갭

- **(b) opencode agent 구동 검증** — "slash command 가 사용자에게 실제로 노출되는가"가 opencode 쪽에서 미검증. gen-063 이 claude-code 에서 겪은 실패 양상. 유료라 CI 불가, `opencode run` 의 판정 용이성 미확인
- **slash command 파일 검증 불가** — `opencode command list` 가 없다. gen-080 이 command 에 `mode: subagent` 를 붙이던 결함은 코드를 읽다 발견했고 검사로는 안 잡힌다
