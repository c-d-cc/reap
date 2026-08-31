---
id: gen-0065-exec
slug: total-rename
type: exec
milestone: ms-013
title: 전면 개명과 v0.18 재구축 — 커밋 트리에서 옛 이름을 지운다
startedAt: 2026-08-30T23:47:38Z
startCommit: 388c81b
status: closed
closedAt: 2026-08-30T23:52:15Z
endCommit: bcb71dc
---
## Intent

fitness 2의 사람 지시 — ① reap 리포 전체(기록·spec·경로·파일명 포함)를 대소문자 3형 무가드 치환으로 개명, ② v0.18을 apocalypse 시점으로 리셋해 깨끗해진 트리를 재적재, 새 커밋 메시지에도 옛 이름을 쓰지 않는다. 끝은 v0.18 트리·신규 커밋 메시지에서 옛 이름 0건 + 검증 전체 통과.

## Outcome

- **이 리포**: 8af9459(내용 98파일 + 경로 `.reap`·`specs/reap`·conventions·skill 디렉토리) + 1a0b8fe(한글 파일명 76파일 추가 치환). 내용·파일명 잔재 **-i grep 0건**. 빌드 산출물은 `dist/reap`
- **v0.18 재구축**: 9e19d78로 리셋 후 **1d1429b**(apocalypse, 옛 이름 없는 메시지) → **f164a05**(snapshot, 출처 1a0b8fe) → **9993230**(승계물, ref는 .txt·내용 치환). 트리 잔재 0 · 신규 커밋 메시지 잔재 0 · bun test 172 · hook.test.sh 전부 통과 · build
- 폐기된 이전 v0.18 커밋열(d3fa6e0~)은 어떤 브랜치도 가리키지 않는다 — reflog에만 남고 GC 대상

## Dead Ends

- **`git ls-files`는 비ASCII 파일명을 따옴표·8진수로 인용한다.** 첫 치환에서 한글 이름 90여 파일이 조용히 스킵됐고, 사후 전수 grep이 잡았다. `-z`로 받아야 한다 — lessons에 승격
- 체인에서 hook.test.sh를 빌드 전에 돌려 "실패 있음"이 났다 — dist가 필요한 검사가 있다. 검증 순서는 build 먼저

## References

- reap v0.18: 1d1429b · f164a05 · 9993230 (fitness 2 지시 이행)
