---
id: gen-0099-exec
slug: site-collab-ref
type: exec
milestone: ms-022
title: 문서 협업 3쪽·레퍼런스 4쪽·기타 3쪽
startedAt: 2026-09-04T15:52:02Z
startCommit: 0a68afb
status: open
---
## Intent

ms-022 task 6 — tasks/6-collab-reference-etc.md의 열 쪽(신설 4: Claim과 Barrier·설정·Doctor·비교, 맞춤 6). 끝은 28쪽 전부 자리 표시 없음, build·prerender 통과, 검수 대기.

## Delegation

brief로 subagent에게 — 주 트리(dev 서버 5174 유지). `make`·`mark` 금지.

## Outcome

tasks/6의 열 쪽 전부 작성. 커밋 둘(의미 단위로 나눔):

- `b3fdf55` 신설 네 쪽 — Claim과 Barrier(O_EXCL claim·roster/status 실물 출력,
  --expect/--timeout barrier의 timeout·통과 실물 둘), 설정(config.yml 세 필드,
  언어 해석 순서, .reap/templates/ 오버라이드, .gitignore 두 줄), Doctor
  (`src/doctor.ts`의 결함 11종·참고 7종 전부를 표로, GUIDE 안내선 다섯 값,
  결함 1·참고 2 실물 출력), 비교(v0.18 관점 다섯 항목 — 두 축·게이트 없는
  doctor·자연어 fitness·genome/environment 분리·claim/barrier). routes.ts의
  `makePlaceholderPage` 넷을 실제 컴포넌트로 바꾸고 `PlaceholderPage.tsx` 삭제
- `fddfbd5` 톤·목차 맞춤 — orchestrate에서 claim/barrier/roster 상세를
  새 쪽으로 옮기고 요약+링크만 남김, submodule worktree `--force` 한 줄 추가,
  skill 10종의 `evolve` 항목에 위임 판단 반영, CLI 레퍼런스 `ctx` usage를
  실제 출력과 맞춤, 이주 쪽에 selfview 실물 이주(2026-09-05)에서 배운 것
  셋(기록 파일 실례·backlog는 frontmatter 대신 lineage와 대조·design 하위
  문서군 상호 링크) 추가. hooks·릴리스 노트는 지시대로 손대지 않음

실물 예시는 임시 리포(`/private/tmp/.../scratchpad/site-examples/demo`,
`dist/reap` 바이너리)에서 뽑았다 — `orch claim/status/release`, 두 세션
`orch barrier`(timeout 2s·성공 5s 둘 다), `doctor`(조건 스크립트 없는 훅 +
키운 genome 파일로 결함 1·참고 2 재현), `REAP_LANG`/config.language 유무별
usage 첫 줄.

검증: `npx tsc --noEmit -p site/tsconfig.json` 무출력, `bun run --cwd site
build` 성공(30쪽 프리렌더), `bash scripts/check-docs-prerender.sh` exit 0,
dev 서버(5174)에서 열 라우트 전부 200, `grep -c PlaceholderPage
site/src/routes.ts` = 0, `./dist/reap doctor` 결함 0.

## 판단이 갈렸던 곳

- **orchestrate의 "메시지 kind 관례" 절**: claim/barrier 상세는 새 쪽으로
  옮기되, SendMessage kind 관례(claim-request·done·blocked·ask)는
  orchestrate에 남겼다 — claim/barrier의 부분이 아니라 협업 전반의
  메시징 관례라서다
- **Doctor의 결함/참고 분류**: `doctor.ts`를 직접 읽어 11개 결함·7개 참고를
  전부 나열했다. 원래 tasks/6은 "검사 항목 목록"만 요구했지만, 결함과
  참고를 섞으면 페이지 자체가 "결함이 참고를 묻는다"는 doctor의 원칙을
  어기게 돼서 표를 둘로 갈랐다
- **CLI 레퍼런스의 실물 usage와 기존 텍스트의 불일치**: 기존 `ctx
  [--milestone <ms-id>] [--hook]`이 실제 usage 출력(`| --hook`, 상호
  배타)과 달랐다 — "usage 원문 그대로"라는 지시를 따라 실물에 맞춰 고쳤다
- **CLAIM_BARRIER의 실물 출력에서 이미 잡힌 자원 재요청**: 실제로 다른
  세션 이름(REAP_AGENT)으로 재요청해 거부 메시지를 재현했다 — 문서에
  적힌 메시지 카탈로그 문자열과 정확히 일치하는지 실행으로 확인했다

## Dead Ends

- `git add -p` 없이 ko.ts 안의 "신설"과 "맞춤" 변경을 한 파일 diff에서
  분리하려다 실패 — hunk를 손으로 잘라 만든 patch가 컨텍스트 줄 개수가
  안 맞아 "corrupt patch"로 거부됐다. 대신 파일을 HEAD로 되돌린 뒤 두
  묶음의 편집을 순서대로 다시 적용해 각각 커밋했다(diff로 최종 결과가
  원래 의도와 동일함을 확인)
- 작업 중간에 확인해 보니 이 작업 트리에서 **동시에 다른 milestone
  (ms-024, migrate skill 2차 개정)이 진행 중**이었다 — `git log`에
  `07ad883`(ms-024 자름) 커밋이 이 세대의 `site/src/i18n/translations/ko.ts`
  인터페이스 편집분(당시 아직 미커밋 상태였던 것)을 함께 실어갔다. 내가
  일으킨 문제는 아니지만 커밋 이력이 지저분해졌다 — 사람이 볼 것.
  콘텐츠 자체는 멀쩡하다(diff로 최종 상태 확인함), 재작업 불필요
