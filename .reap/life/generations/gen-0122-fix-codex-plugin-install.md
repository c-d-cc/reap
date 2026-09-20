---
id: gen-0122-fix
slug: codex-plugin-install
type: fix
title: Codex 플러그인 설치 판정과 개발 설치 경로 복구
startedAt: 2026-09-20T05:31:47Z
startCommit: bd0c16c
status: open
---

## Intent

Codex에서도 기존 REAP 플러그인과 SessionStart·setup·init을 실제로 사용하도록 복구한다. 미설치 목록을 설치 증거로 오인하지 않고, 로컬 개발 설치가 Codex도 갱신하며, 새 Codex 앱 세션에서 스킬과 주입을 독립 검증한다.

## References

- ps-4f2a91:08-delivery.md — 두 호스트 지원과 같은 skill 원본
- gen-0121-exec — 상태 주입은 됐지만 Codex 스킬 설치는 미완성이었던 작업

## Outcome

Codex 개발 설치를 복구했다. `scripts/local-install.sh`가 CLI와 동일한 `plugin/` 원본을 Claude Code·Codex 모두에 설치하고, Codex 캐시를 재설치로 갱신한다. 이 머신의 `reap@reap-dev`는 활성 상태이며 캐시와 원본의 `diff -rq`가 같다.

- `setup`은 Codex의 `plugin list --json`에서 실제 설치·활성 상태를 읽는다. 목록에만 보이는 항목은 설치하지 않았다고 판단하고 제거 대상으로 삼지 않는다.
- 활성 개발 플러그인이 있으면 원격 등록을 건너뛴다. 원격 등록·설치가 실패해도 CLI에 걸리는 Codex 훅은 별도로 등록한다.
- `hooks.json`의 JSON 타입과 SessionStart 구조를 검사하고 잘못된 파일은 보존한다.
- `init`·`doctor`는 현재 Codex/Claude 세션의 플러그인 상태를 확인한다. 다른 호스트의 설치나 비활성 항목으로 미설치를 가리지 않는다.
- 설치 안내에 Codex의 스킬 호출 방법과 `/hooks` 검토를 명시했다. REAP가 신뢰 해시를 대신 쓰지는 않는다.

## Verification

- 실패 테스트를 먼저 추가: 미설치·비활성 오인, 잘못된 훅 구조, 현재 호스트 판정, 오프라인 개발 설치.
- `bun test`: 282 pass, 0 fail. `bun run typecheck`: 통과. `./tests/hook.test.sh`: 전체 통과. 두 빌드 통과.
- 실제 Codex 0.155.1 + 격리된 CODEX_HOME + 로컬 ctod-plugins 테스트 마켓플레이스: `setup` 설치 → 재실행 → `--remove` 성공. 기존 SessionStart·Stop 훅 파일이 바이트 단위로 원복됐다.
- 실제 `scripts/local-install.sh`를 두 번 실행해 두 호스트 캐시 갱신과 재실행을 확인했다.
- 별도 Codex CLI 세션: 어떤 도구도 부르기 전에 스킬 10종, 언어 ko, milestone ms-022, gen-0122-fix 및 genome 주입을 보고했다.
- 별도 Codex **앱** 작업 `01a0bd4e-776f-7941-9734-120c1e7e4f32` (`REAP 설치 검증 — 새 Codex 앱 세션`): 시작 주입과 스킬 10종 확인, 설치 캐시의 help·init 파일 읽기 성공, version/init --check/doctor 모두 exit 0, 결함 0·참고 3.
- 두 번째 독립 Codex 세션에서 자동 주입을 다시 확인하고 실제 complete 스킬로 gen-0001-fix 종료·archive 이동·커밋까지 성공했다. 커밋 ec5aa0b → 34414df → 9698d0f. 최종 작업 트리 깨끗함, doctor 결함 0·참고 0, invariants 해시 보존.
- 새 임시 프로젝트: 실제 설치된 init 스킬로 초기화, flux 생성, 정본 지식 세 파일 작성, ctx·doctor·plan sources·seq·orch status 실행 성공. invariants·lessons·map 씨앗은 그대로 보존.

**독립 리뷰** — verify_codex_support가 설치 분기·타입·셸을 검토했다. 개발 설치가 원격 마켓플레이스에 불필요하게 의존하는 P2를 발견해 수정하고 회귀 테스트를 추가했다. 재검토는 차단 결함 없음. orchestrate의 기존 호스트 제약은 README에도 명시했다.

**summary.md: 갱신** (두 호스트 개발 설치·현재 호스트 판정·테스트 수). **genome: 해당 없음** — 호스트 둘이라는 기존 의도를 복구했다. invariants는 수정하지 않았다.

## Limits

- 공개 `c-d-cc/plugins` 릴리스 마켓플레이스 갱신은 기존 `bk-b53de4`의 별도 배포 작업이다. 이번 검증과 이 머신의 설치는 작업 트리를 쓰는 `reap-dev` 경로이며 공개 npm/마켓플레이스를 배포한 것이 아니다.
- 기존 spec대로 `orchestrate`의 세션 로스터·메시징은 Claude Code 전용이다. Codex에 스킬이 보이는 것과 모든 호스트 전용 동작을 지원하는 것은 구분한다.
- Codex 기본 훅 출력 제한을 넘으면 전체 본문은 spill 파일 경로로 제공된다. 토큰 제한·신뢰 설정을 몰래 변경하지 않았다.

## Dead Ends

- 최초 임시 Codex 세션의 workspace-write 모드는 `.git` 쓰기를 막아 커밋을 수행하지 못했다. 초기화는 성공했지만 종료를 성공으로 세지 않았고, 같은 버리는 프로젝트에서 Git 쓰기가 허용된 독립 세션으로 이어서 검증했다.
- 작업 트리 복사로 요청한 앱 검증은 queued client id 상태로 남아, 읽기 전용 검증을 원본 프로젝트의 별도 앱 작업으로 실행했다. 그 작업은 실제 완료됐다.
