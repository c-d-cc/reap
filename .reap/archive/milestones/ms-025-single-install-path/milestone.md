---
id: ms-025
slug: single-install-path
title: 설치 경로 단일화 — npm 하나, reap setup이 플러그인을 설치, latest 직접 발행
from: loop-0004-plan
refs:
  - ps-5e948f:02-distribution.md
status: closed
focus: true
openedAt: 2026-09-05T01:09:31Z
closedAt: 2026-09-05T02:40:12Z
---
## Background

사람 결정(2026-09-05): 설치 경로를 **npm 하나**로 통일하고, 0.18.0은 **`next` 없이 latest로 직접** 발행한다. 지금은 CLI(npm)와 플러그인(claude marketplace)이 별개 설치이고 문서가 두 경로를 나란히 보여 준다. `next`는 latest를 0.17.8(이행 다리)에 두어 기존 사용자에게 안내 경로를 주려던 장치였는데, latest 직접 발행이면 0.17.8은 아무에게도 닿지 않으므로 다리는 은퇴한다. 0.17.7 이하의 `check-version`은 floor(`autoUpdateMinVersion: 0.18.0`) 미달로 자동 설치 대신 "Breaking change detected … Run: npm i -g …"를 찍으므로 사용자는 손으로 0.18을 설치하게 되고, 그 뒤 v0.17의 SessionStart 훅이 부르는 `reap check-version`·`reap load-context`에 0.18이 답해야 다음 길이 보인다.

## Exit Criteria

- `npm i -g @c-d-cc/reap` 뒤 `reap setup`(또는 `reap init`)이 마켓플레이스 `c-d-cc/plugins` 등록과 `reap@ctod-plugins` 설치를 대신한다. 재실행해도 안전하고, `claude`가 없으면 그렇게 말한다. `doctor`가 플러그인 부재를 참고로 보고한다
- 0.18 바이너리가 v0.17 명령(`check-version`·`load-context`·`update`·`run`·`status`·`install-skills`)에 한 줄 안내(`reap setup` → 새 세션 → `/reap:migrate`)로 답하고 훅 문맥에 그것이 들어간다
- release.yml이 `--tag next` 없이 발행한다. `autoUpdateMinVersion`은 유지(그것이 latest를 안전하게 만드는 장치). release-policy.md·06-release·ms-019 발행 절차가 새 순서(0.17.8 없음)로 다시 쓰였다
- README(en·ko)·사이트(quick start·이주·v018change·릴리스 노트)·RELEASE_NOTES·훅 안내·migrate 2/8·genome application.md가 설치 경로 하나(`npm i -g @c-d-cc/reap` → `reap setup`)만 말한다. `@next`가 리포 어디에도 없다(`grep -rn '@next' --exclude-dir=node_modules`)
- `bun test`·`verify-package.sh`·`hook.test.sh`·`check-docs-surface.sh`·`check-release-version.sh` 통과

## Out of Scope

- 플러그인에 node 번들을 싣는 것(B안) — 기각
- npm postinstall — 쓰지 않는다(CI·sandbox에서 홈을 건드린다)
- latest 승격 뒤 0.17.8 다리 리포(reap_v17)의 정리 — 발행 안 함으로 끝. 코드는 남긴다
- 사이트 en 확장 — ms-022

## Plan Items

1. `reap setup` + `init` 연동 + doctor 참고 + v0.17 명령 shim (tasks/1)
2. 배포 정책·워크플로·발행 절차 재작성 (tasks/2)
3. 문서 하나의 경로로 — README·사이트·RELEASE_NOTES·훅·migrate·genome (tasks/3)

## 이 milestone이 끝나면 물어볼 것

- 0.17 사용자가 안내 없이도 `npm i -g` → `reap setup` → `/reap:migrate`까지 도달했는가(첫 실물 보고)
- 문서에서 "플러그인"이라는 말이 설치 지시 없이 개념으로만 남았는가

## Fitness (사람, 2026-09-05)

"ms-025·026·027 닫자." — 설치 경로 단일화 완료로 판정. 물어볼 것 둘은 첫 실물 보고(0.17 사용자의 안내 없는 도달, 문서에서 '플러그인'이 개념으로만 남았는가) 전이라 답할 수 없다 → 발행 뒤 첫 사용자 보고가 오면 그때 본다. idea로 두지 않는다 — 발행 자체가 그 관찰 지점이다.

크기 소급: 세대 둘(gen-0104·0105). carve-milestone의 하한에 걸리는 크기였다 — backlog 항목 둘이면 충분했다(gen-0108이 규칙을 제품에 옮겼다).
