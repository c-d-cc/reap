# v0.17에서 이주

v0.17.7 이하는 세션 시작 시 자동 갱신으로 먼저 0.17.8이 되고, 거기서부터 사람이 손대는 지점은 하나뿐이다.

```bash
reap update          # 0.17.8에서 — upgrade agent를 설치한다
/reap:migrate         # 넘겨받은 agent가 부른다
```

upgrade agent가 v0.18 CLI와 플러그인을 설치한 뒤 `migrate` skill로 넘긴다. 그 뒤는 `migrate` skill이 여덟 단계로 진행한다 — 각 단계 시작마다 "단계 N/8: <이름>"이 사용자에게 보인다.

## 8단계

1. **판정** — 스크립트가 v0.17/v0.18/none/mixed/unknown 중 무엇인지 표지 파일로 가른다. 아직 아무것도 옮기기 전이다
2. **사전 차단** — uncommitted 변경이나 열린 generation이 있으면 여기서 멈춘다
3. **고지와 동의** — 단계별 분량 실측, 토큰 사용량이 클 수 있다는 고지, 비파괴 약속을 보여주고 명시적 동의를 받는다
4. **격리** — `.reap`를 `.reap-v0_17`로 이름만 바꾼다
5. **새 구조** — `reap init`으로 새 `.reap/`를 세우고, `config.yml`의 `language`·`agentClient`만 구 값을 이어받는다
6. **이주** — subagent가 매핑 표(`migration-map.md`)를 따라 데이터를 옮긴다. 주 세션의 컨텍스트는 구 데이터로 채우지 않는다
7. **검증** — `reap doctor`가 결함 0이어야 다음으로 간다. `.reap-v0_17/`이 무손상인지도 확인한다
8. **기록과 홈 정리 안내** — `archive/migration-v0_17.md`에 기록을 남기고, 홈 디렉토리 정리 목록을 사람 동의 후에만 실행한다

## 원본은 보존된다

**원본 비파괴가 불변식이다.** 어느 단계도 구 데이터를 수정하지 않는다 — `.reap-v0_17/`로 자리만 옮겨 통째로 남는다.

되돌리기는 한 줄이다.

```bash
rm -rf .reap && mv .reap-v0_17 .reap
```

## 무엇을 잃는가

v0.18은 v0.17의 여러 기능을 상당물로 대체하거나 폐기했다.

- **5단계 lifecycle과 그 흐름 명령** — `run start/next/back/abort/early-close`, `/reap.*` 7종. 흐름은 이제 `evolve`·`complete` skill의 판단이다
- **`/reap.evolve`의 자율 실행 subagent 위임** — v0.18의 `evolve`는 주 세션이 직접 세대를 연다
- **`merge`/`pull`/`push` lifecycle** — `orchestrate` skill과 git 직접 사용으로 대체
- **`reap-evaluate` evaluator agent** — `orchestrate`의 한 사용 사례로 흡수
- **`status`·`config`·`check-version`·`uninstall` 명령** — `ctx` 상태 줄·`doctor`·config 직접 편집·플러그인 제거로 대체
- **`update`·이주 안내 레이어** — `migrate` skill이 0.17→0.18 이주를 한 번만 처리하고, 그 뒤는 `doctor`·`init --check`가 맡는다
- **`fix --check`·`clean`·`destroy`** — `doctor`·`cleanup` skill·`rm -rf .reap` + 플러그인 제거로 대체
- **`install-skills`·`load-context`·`dump-state`, opencode/codex adapter** — 플러그인 설치·`ctx --hook`으로 대체, 나머지는 없음
- **`/reap.help` 16주제, 다국어 `reap help`** — README와 skill 본문으로 대체
- **`vision/goals.md`·`lineage/`·3단 memory·`current.yml`** — plan source·`lessons.md` 선별·`.session`으로 대체. 승계되지 않는 것도 있다
- **다국어 지원** — v0.18은 한국어 전용이다

전체 대조표는 [`docs/reap-plan/reap_v_0_18_release/01-gap.md`](https://github.com/c-d-cc/reap/blob/main/docs/reap-plan/reap_v_0_18_release/01-gap.md)에 있다.
