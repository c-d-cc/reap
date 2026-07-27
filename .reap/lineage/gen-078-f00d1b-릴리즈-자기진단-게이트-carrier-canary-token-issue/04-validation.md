# Validation Report

## Result

**pass**

모든 검증을 fresh 실행했다.

## Checks

### 게이트

| 항목 | 명령 | 결과 |
|---|---|---|
| 자기진단 | `bash scripts/check-self-diagnosis.sh` | **pass** (exit 0) |
| 문서 정합성 | `bash scripts/check-docs-version.sh` | **pass** (exit 0) |
| carrier 고아 | `bash scripts/list-carriers.sh --orphans` | **고아 0** |
| TypeCheck | `npm run typecheck` | **pass** (error 0) |

### 테스트

| 스위트 | baseline (gen-077) | 현재 | 판정 |
|---|---|---|---|
| unit | 470 / 0 | **470 / 0** | pass |
| e2e | 272 / 0 | **272 / 0** | pass |
| scenario | 44 / 0 | **44 / 0** | pass |

본 세대는 스크립트·workflow·주석 표식이 주 변경이며 런타임 로직은 `integrity.ts` 의 placeholder 판정 1건뿐이다. 수치 불변이 예상된 결과이고 실제로 일치한다.

### 완료 기준 (02-planning.md)

| # | 기준 | 결과 |
|---|---|---|
| 1 | 스크립트 양방향 | **pass** — 아래 별도 |
| 2 | HOME/전역 미오염 | **pass** — 전체 스위트 실행 전후 `~/.claude/commands/` 19 → 19 |
| 3 | release publish 앞 | **pass** |
| 4 | ci 매 push | **pass** |
| 5 | carrier 2건 추적 | **pass** — 9 / 10 files |
| 6 | 고아 탐지 | **pass** |
| 7 | genome 재작성 | adapt phase |
| 8 | 회귀 없음 | **pass** |

### 기준 1 — 게이트가 실제로 무엇을 잡는가

통과만 확인하면 검사가 동작하는지 알 수 없으므로(gen-073 § "먼저 실패시켜라"), **과거 사고를 재현**했다.

| 상태 | 결과 |
|---|---|
| 정상 | exit 0, no findings |
| **#22 재현** (canonical 위치를 legacy 로 플래그) | **exit 1, 19건 검출** |
| 복원 | exit 0 |

1차 시도는 `isCanonical` 만 false 로 바꿨는데 exit 0 이었다 — gen-076 이 해당 검사 자체를 제거했으므로 그 방법으로는 재현되지 않았다. **내 코드 이해의 부정확함이 negative test 로 드러난 것**이며, 통과만 봤다면 게이트가 무력한 줄 몰랐을 것이다.

### 게이트가 첫 실행에서 잡은 것 (의도적 파괴 이전)

| 발견 | 판정 | 처리 |
|---|---|---|
| `invariants.md` placeholder 오판 | **REAP 결함** — 배포 파일이 자기 검사를 통과 못 함 | 본 세대에서 수정 (인과) |
| `application.md` / `goals.md` 미작성 | **정당한 경고** — init 은 뼈대만 만듦 | 시나리오에서 대화 부분을 채우도록 정제 |

두 번째에서 허용 목록 대신 시나리오 수정을 택했다. 허용 목록은 늘어나며 게이트를 무력화한다(gen-075 § "경고 상시 → 신호 가치 0").

## Edge Cases

- **`npm pack` 사용**: publish 후에만 검증되는 순환 회피. gen-074 의 daemon 배포 결함(`files` 누락 → 끊긴 심링크)이 이 방식으로 잡힌다
- **로컬 실행 안전성**: CI 러너는 일회용이지만 같은 스크립트가 로컬에서도 안전해야 개발 중 확인이 가능하다. HOME/prefix override 로 보장하고 실측 확인
- **`list-carriers.sh` 자기 제외**: 주석의 예시가 grep 에 걸려 자기 자신을 carrier 로 셌다. `--exclude` 로 제외
- **lineage/life 제외**: 과거 artifact 사본이 carrier 로 잡히면 노이즈가 된다

## Issues

### CI 에 테스트를 넣지 못함 — 별도 backlog

`tests/` 가 private submodule(`c-d-cc/reap-test`)이고 기본 `GITHUB_TOKEN` 으로 접근할 수 없다. **backlog 작성 시점에 몰랐던 제약**이며 유저 결정으로 분리했다(`ci-에서-테스트-실행-...`).

`ci.yml` 주석에 사유를 남겨 다음 사람이 재조사하지 않게 했다.

### 자기진단이 못 잡는 것 — 명시

게이트 통과는 "검사 범위 안에서 문제없음"일 뿐이다:

| 사고 | 잡는가 |
|---|---|
| #22 (installer ↔ checker 불일치) | **잡음** (실증) |
| gen-074 daemon 배포 결함 | **잡음** (npm pack 설치) |
| #21 (규칙 텍스트 미갱신) | 못 잡음 — carrier 표식의 영역 |
| gen-063 (slash command 미노출) | 못 잡음 — agent 실행 필요, 층 2 |

4건 중 2건. 나머지는 각각 다른 대책이 담당하며, 이를 기록해 다음 사람이 게이트를 실제보다 신뢰하지 않게 한다.

## Notes

`config.evaluator: true` 이나 부모 에이전트가 직접 검증했다. advisor 모델이므로 허용된다.
