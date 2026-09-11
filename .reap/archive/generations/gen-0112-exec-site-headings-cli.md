---
id: gen-0112-exec
slug: site-headings-cli
type: exec
milestone: ms-022
title: 개념 페이지 — 명령 블록을 끝의 'CLI 명령' 절로, 절 제목을 자연스러운 한국어로
startedAt: 2026-09-05T08:48:14Z
startCommit: 5b88e45
status: closed
closedAt: 2026-09-05T08:56:01Z
endCommit: b40bb0b
---

## Intent

ms-022 검수 피드백(사람, 2026-09-05): 개념 페이지에 CLI 명령이 절 앞머리로 노출돼 있고, "엽니다"·"유형 넷" 같은 절 제목이 어색하다. 사람이 읽는 문서이므로 본문은 서술로, 명령은 페이지 끝 한 곳으로, 제목은 자연스러운 한국어로.

## Outcome

commit b40bb0b. site typecheck, prerender PASSED(29쪽).

- `site/src/components/CliSection.tsx` 신설 — 제목 "CLI 명령", 안내 한 줄(보통 skill이 대신 부른다), cli-reference 링크, 코드 블록. 번역 키 `cliSection`
- 여덟 쪽(flux·plan·idea·carve·generation·backlog·orchestrate·claim-barrier)에서 명령 블록을 본문에서 빼고 `cliCode`로 모아 페이지 끝에. 명령 플래그를 설명하던 본문(openDesc·closeDesc·registerDesc·makeDesc·consumeDesc·bindingDesc 등)은 "무엇이 일어나는가"로 다시 씀. 예시 출력 블록(실제 예시)은 남김
- 절 제목: 엽니다→flux를 여는 시점/세대 열기, 닫습니다→닫히는 조건/세대 닫기/닫기, 유형 넷→네 가지 유형, 셋→세 가지 종류/세 파일, 만듭니다→idea를 남기는 시점/항목을 남기는 시점, 등록합니다→plan 등록, 인용합니다→plan 인용, 자릅니다→자르기, 무엇을 씁니다→milestone에 적는 내용, 소비합니다→소비, 실물→실제 예시/출력, 그 밖에 한다체 제목 여덟 곳
- orchestrate·claim-barrier 본문을 합니다체로(다른 쪽과 결이 달랐다)
- summary.md: 해당 없음. 독립 검증: 생략 — 문서

## Dead Ends

- 명령을 접이식(details)으로 절 안에 남기는 안 — 접혀 있어도 절마다 명령이 반복되고, 사람 문서에 두 번 나온다. 끝 한 곳으로
