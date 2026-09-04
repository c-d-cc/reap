# Handoff — task 2 (selfview 재이주)로

gen-0100-exec가 task 1(migration-map·SKILL 개정)을 끝냈다. task 2는 selfview를 **처음부터 다시** 이주하고 milestone의 Exit Criteria를 전부 만족하는지 대조하는 것.

## 시작 전에

- selfview는 이미 한 번 이주됐다(`/Users/hichoi/cdws/selfview/.reap/`가 1차 결과, `.reap-v0_17/`이 원본). **1차 결과를 지우고 원본에서 처음부터 다시** 돌려야 tasks/2의 뜻대로다 — 1차 결과 위에 이어 붙이면 #6(디렉토리 이동 vs idea)·#11(milestone)이 이미 잘못 자리 잡은 것과 충돌한다.
- `git -C /Users/hichoi/cdws/selfview status`로 1차 이주 커밋 여부 확인 후, 되돌리는 방법(`rm -rf .reap && mv .reap-v0_17 .reap`가 SKILL 4/8이 보장하는 그 한 줄) 적용.

## 갱신된 문서

- `plugin/skills/migrate/SKILL.md` — 1/8 표 문구 정합, 3/8 측정 추가, 6/8 "매핑 열둘", 7/8에 `verify-migration.sh` 게이트, 8/8에 `## 다음 세션이 볼 것` 절 신설.
- `plugin/skills/migrate/references/migration-map.md` — #1·#2·#3·#5·#6 재정의, #11·#12 신설. #1·#6·#11·#12의 실행 절차는 표 아래 `## Detail — mapping #N` 절에.
- `plugin/skills/migrate/scripts/verify-migration.sh` — 신설. `REAP_BIN=<dist/reap 경로> bash .../verify-migration.sh <project-root>`로 호출, 여섯 줄 전부 `ok:`가 나와야 통과.

## 확인이 필요한 것

- **`tests/migrate-scripts.test.sh`가 커밋되지 않았다.** `tests/` submodule이 이번 delegate 범위에서 불가침이라 판단해 작업 트리에만 파일을 남겼다(`bash tests/migrate-scripts.test.sh`로 로컬 실행, 10개 PASS 확인됨). `tests-submodule` agent가 있으면 그쪽에 맡기거나, 주 세션이 직접 submodule 커밋 여부를 판단할 것.
- **`ci.yml`·`release.yml`에 `hook.test.sh` 줄이 원래 없다** — 둘 다 테스트를 이 리포에서 안 돌리고 private `reap-test`로 dispatch만 한다. brief의 "hook.test.sh 줄 옆에 한 줄 추가" 전제가 실물과 안 맞아 워크플로 파일은 안 건드렸다. 이 판단이 맞는지 재확인 필요하면 `.github/workflows/ci.yml`·`release.yml`을 직접 보라.

## task 2가 할 일 (milestone.md Exit Criteria 그대로)

1. selfview를 원본부터 다시 이주(SKILL 1/8~8/8, 8/8에서 `verify-migration.sh`까지).
2. `## 다음 세션이 볼 것`(ctx 상태 줄)을 사람에게 보여주고 "지워도 되는가" 판정을 구한다.
3. 만족 못 하면 migration-map·SKILL로 돌아가 고치고(1↔2 반복) — 이번 task 1 개정이 실물과 안 맞는 대목이 나오면 그 자리에서 고친다.
4. 끝나면 milestone을 닫기 전 "이 milestone이 끝나면 물어볼 것" 두 질문(`.reap-v0_17` 삭제 여부, 다음 evolve가 안 묻고 다음 task로 갔는가)에 답한다.
