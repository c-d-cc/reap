---
id: gen-0062-exec
slug: rename-reap
type: exec
milestone: ms-013
title: 개명 — reap를 reap으로, 코드와 저장소를 함께
startedAt: 2026-08-30T23:29:13Z
startCommit: f6259bc
status: closed
closedAt: 2026-08-30T23:33:53Z
endCommit: 66ebd32
---
## Intent

ms-013 task 2 — v0.18 브랜치에서 reap → reap 전수 개명. 코드(store 경로 `.reap/`→`.reap/`, orch `~/.reap/`→`~/.reap/`, 바이너리·플러그인·skill 접두사·carrier 이름공간)와 저장소(브랜치의 `.reap/` 디렉토리 자체)를 한 세대에서 함께 옮긴다. 끝은 브랜치에서 `grep -ri reap src plugin tests` 0건 + 테스트 전체 통과.

## Outcome

v0.18 브랜치 **c1bc027** — 48파일 개명 + `.reap/`→`.reap/` git mv. 가드 정규식 `(?<![0-9A-Za-z_-])reap(?!\d)`로 기계 치환(lessons의 한글 `\b` 함정 회피), 기록·docs는 역사라 제외. 검증: bun test 172 · hook.test.sh 전부 통과 · tsc · build → `dist/reap` 89MB. 코드 영역 잔여 reap **0건**.

## Dead Ends

- 소스 코드 `"...}\nreap:..."`처럼 이스케이프 `\n` 뒤의 reap는 가드 lookbehind('n'이 낱말문자)에 걸러졌다 — carrier 테스트 픽스처 한 줄을 손으로 고침. 기계 치환 뒤 전수 grep이 필수인 이유
- spec(ps-4f2a91)의 REAP 표기는 개명하지 않았다 — 소비 완료된 역사 문서이고, REAP vs REAP 비교 서술이 개명되면 뜻이 무너진다. task 표의 "spec 자기 지칭"보다 좁게 잡은 의도적 이탈

## References

- reap v0.18: c1bc027. bun.lock은 재생성으로 갱신(치환이 아니라)
