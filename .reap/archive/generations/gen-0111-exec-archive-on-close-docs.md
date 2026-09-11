---
id: gen-0111-exec
slug: archive-on-close-docs
type: exec
milestone: ms-028
title: 문서·사이트가 '닫히면 바로 archive'를 말한다; 이 리포 life의 옛 잔여 정리
startedAt: 2026-09-05T08:39:32Z
startCommit: 957697b
status: closed
closedAt: 2026-09-05T08:41:34Z
endCommit: fd76b49
---

## Intent

ms-028 tasks/3. README en·ko(skill 표에서 cleanup 행 삭제, 10종·agent 둘)와 사이트(소개·storage·closing milestone·generation·backlog·flux·skill 표·상세·v018change·릴리스 노트)가 "life는 열린 것, 닫히면 archive"를 말한다. ClosingMilestonePage의 cleanup 절 삭제. 이 리포의 life에 옛 규칙으로 남은 닫힌 세대 7·소비된 backlog 6·닫힌 flux 2를 archive로 내린다(세대·backlog는 `--archived`, flux는 git mv — `mark flux --archived`는 없다).

## References

- gen-0109·0110 Outcome · ms-028 Exit Criteria 4·5

## Outcome

commit fd76b49. plugin-skills·docs-surface ok, site typecheck, prerender PASSED(29쪽), doctor 결함 0, 플러그인 재설치.

- README en·ko: cleanup 행 삭제, "10종 — 여덟/둘". 사이트 ko.ts: 소개 카드 둘·홈 문구·storage 페이지(intro·트리·표)·closing milestone(설명·순서 2단계·cleanup 절과 타입 삭제·handoff 문구)·carve 페이지 종료 단계·generation closeDesc·backlog lifeDesc·flux stayOpenDesc·skill 표·상세·nav·소개 카드 "10종"·v018change 행 둘·릴리스 노트 저장소 문구. ClosingMilestonePage.tsx cleanup 절 제거
- 이 리포 life: 닫힌 세대 7(ms-022)과 소비된 backlog 6은 `--archived`로, 닫힌 flux 2는 git mv로 archive. 지금 life에는 열린 것만(이 세대 1, flux-0004 1)
- summary.md: 해당 없음. 독립 검증: 생략 — 문서·기록

## Dead Ends

- `mark flux --archived` 추가 — 옛 잔여가 이 리포의 flux 둘뿐이라 명령을 늘릴 값이 없다. git mv
