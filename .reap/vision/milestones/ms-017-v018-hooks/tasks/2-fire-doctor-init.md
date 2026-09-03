# 2 — 발화·doctor·init

## 손댈 곳

| 파일 | 무엇 |
|---|---|
| `src/entries.ts` | `makeGeneration` 끝에 `gen.made`, `markGeneration --closed` 끝에 `gen.closed`, `makeMilestone`에 `milestone.made`, `markMilestone --closed`에 `milestone.closed` — 반환값에 훅 출력을 실어 cli가 메시지 뒤에 붙인다 |
| `src/orch.ts` | claim 성공 → `orch.claimed`, barrier 해제 → `orch.barrier.released` |
| `src/cli.ts` | 결과 message 뒤에 `--- hooks ---` 구분과 outputs, failures는 stderr |
| `src/doctor.ts` | hooks/ 검사: 파일명 규약, 이벤트 여섯, 조건 스크립트 실재 → 결함 |
| `src/store.ts` | `init`이 `hooks/conditions/always.sh` 씨앗을 놓는다 (SEEDS) |

## 함정

- `mark generation --archived`·`--aborted`는 이벤트가 없다 — spec의 여섯뿐
- `init --check`는 씨앗 비교다 — `always.sh`도 씨앗 목록에 들어가면 사용자가 안 고치는 게 정상이라 "씨앗인 채"로 계속 보고된다. **씨앗 목록(지식 파일)에는 넣지 않고** 디렉토리 생성 시 놓기만 한다
- migrate의 `detect-version.sh`는 "hooks 안의 파일"을 0.17 표지로 쓴다. v0.18 init이 `conditions/always.sh`를 놓으면 **판정이 mixed로 뒤집힌다** — 스크립트의 표지를 `hooks/*.{sh,md}`(이벤트 파일)로 좁히거나 `conditions/`를 제외한다. 6케이스 재검증

## 완료 판정

- 이 리포에서 `make hook --event gen.made --name echo --type sh`로 훅을 만들고 `make generation --fix --title t` 출력에 훅 stdout이 붙는다 (그 뒤 세대 abort·훅 삭제)
- `detect-version.sh` 6케이스 정답 유지
- doctor 결함 0
