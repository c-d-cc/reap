---
id: gen-0057-exec
slug: doctor
type: exec
milestone: ms-006
title: doctor — 확정 검사와 안내선
startedAt: 2026-08-30T16:51:52Z
startCommit: 20b6cff
status: closed
closedAt: 2026-08-30T16:56:05Z
endCommit: 09e0f82
---
## Intent

`ms-006` 6.4·6.5·6.6 — `doctor`의 확정 검사와 안내선, 이 리포에 돌려본다.

## Outcome

- `src/doctor.ts` — **결함**(id 형식·중복·레지스트리 불일치, 끊긴 참조 `from`·`refs`·`milestone`·`backlog`·`consumedBy`·`milestones`, 커밋 없이 닫힌 generation, focus 둘, 깨진 상대 링크, carrier 충돌)과 **참고**(열린 채 바인딩 안 된 generation, `map.md` 씨앗 불일치, 크기·누적 안내선, 졸업 조건·출처 없는 idea, carrier 고아). 파일을 쓰지 않는다. 결함이 있으면 실패로 끝난다
- **안내선은 실측이다** — genome 파일 6KB, 주입 합계 16KB, lessons 16KB/24항목, milestone.md 10KB. 지금 실물(3.3·8.6·11.7/16·6.5)의 두 배 안팎
- 테스트 8개, 156 통과
- **이 리포에 돌렸다: 결함 0 · 참고 0.** 커버리지는 실제다(milestone 12·generation 56·backlog 15·idea 4, 상대 링크 26개 전부 실재). "커밋 없이 닫힌 generation"은 57세대 중 **0** — 근본 거래의 첫 성적표다
- 6.6이 잡은 것은 `doctor`가 아니라 **`carrier --check`가 잡았다** — spec 예시의 같은 slug에 해시 둘(`03-storage` a3f8c2 vs `05-knowledge` a1b2c3)과 테스트 리터럴이 표식으로 세이는 것. 전자는 spec을 고쳤고 후자는 테스트가 문자열을 이어붙이게 했다

## Dead Ends

**`map-seed` 표식을 `map.md` 씨앗 본문에 넣기.** 템플릿을 통해 모든 사용자 프로젝트에 고아 표식이 퍼진다 — 테스트가 임시 프로젝트에서 그것을 잡았다. 표식은 REAP 리포 쪽 자리에만 둔다.
