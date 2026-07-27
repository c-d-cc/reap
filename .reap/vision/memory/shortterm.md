# Shortterm Memory

## 세션 요약 (gen-078, 2026-07-28)

### gen-078: 자기진단 게이트 + carrier 표식 — 0.17.3 묶음 2/3

issue #21/#22 재발 방지. 두 축 완료:

- **자기진단 게이트** (`scripts/check-self-diagnosis.sh`) — `npm pack` → 격리 HOME/prefix 설치 → `init` → `fix --check` **경고 0** 요구. release + **CI 양쪽**에 연결
- **carrier 표식** (`scripts/list-carriers.sh`) — 열거 대신 파일에 `reap:carrier(<id>)` 를 심고 grep. 2 carrier / 19 files, 고아 0

**게이트가 만들어지자마자 실제 결함을 잡았다** — `invariants.md` 가 placeholder 로 오판되고 있었다(불릿 목록이라 산문이 없는데 검사가 `-` 줄을 제외). REAP 배포 파일이 REAP 검사를 통과 못 하는 상태로, gen-075 의 genome threshold 와 같은 유형. 인과로 묶여 본 세대에서 수정.

**negative test 가 내 오해도 드러냈다** — #22 를 재현하려 `isCanonical` 을 false 로 했는데 exit 0. gen-076 이 그 검사 자체를 제거한 걸 잊고 있었다. 정확히 재현하니 19건 검출 + exit 1.

검증: typecheck 0 / 자기진단 pass / docs gate pass / unit 470-0 / e2e 272-0 / scenario 44-0.

### 다음 세션

1. **`agent-관점-검증-층2-...`** (3/3) — 묶음 마지막. 설계 세대라 코드 변경이 없을 수 있음
2. **0.17.3 릴리즈** — 3건 완료 후 릴리즈 노트 일괄 보강 → 태그 (**유저 확인 필수**)
3. `ci-에서-테스트-실행-...` (신규) — **`reap-test` 를 private 으로 분리한 이유 확인이 선행.** 이유가 약하면 public 전환이 압도적으로 단순 (PAT 발급은 사용자 수동 작업)
4. interview 재설계 / daemon 2건은 묶음 제외

### 알아둘 것

- **CI 가 테스트를 안 돌리는 이유** = `tests/` 가 private submodule. 기본 `GITHUB_TOKEN` 으로 접근 불가. `ci.yml` 주석에 사유 기록됨
- **자기진단이 못 잡는 것**: #21 유형(규칙 텍스트) → carrier 표식 영역 / gen-063 유형(slash command 미노출) → 층 2 영역. 게이트 통과 = "검사 범위 안에서 문제없음"일 뿐
- **carrier 표식의 효과는 미검증** — "값 옆의 주석을 본다"는 가정에 기대고 있다. 노이즈로 인식되기 시작하면 재검토 필요

### Backlog 상태

pending 5건. consumed: `릴리즈-자기진단-게이트-...` (gen-078).
