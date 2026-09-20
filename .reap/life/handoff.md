## sess-9bf47826 · gen-0124-exec · 2026-09-21T08:55:00Z

**둘이 남았다 — ms-022 사람 검수, 그리고 아직 안 민 커밋.**

`git status`는 깨끗하고 `origin/v0.18`보다 **앞서 있다.** push는 사람의 것이므로 물어본다.

**ms-022 문서 사이트 — 사람 검수 대기.** 28쪽 전부 작성됐고 마지막 10쪽의 검수가 남았다.
사이트는 `http://localhost:5174`에 이미 떠 있다(다른 세션이 띄운 Vite dev, 같은 리포).
이 절은 ms-022의 `handoff.md`(12.8KB·헤딩 13)에서 살아 있는 부분만 옮긴 것이다 —
나머지 열둘은 `지난 …(기록)`이거나 대체된 상태여서 버렸다. `git log`로 찾을 수 있다.

gen-0099-exec가 task 6(협업 3 + 레퍼런스 4 + 기타 3)을 전부 마쳤다 —
`git log --oneline -2`: 신설 네 쪽(`b3fdf55`, Claim과 Barrier·설정·
Doctor·비교) → 톤·목차 맞춤(`fddfbd5`, orchestrate·skill 10종·CLI
레퍼런스·이주) 두 커밋. 이로써 목차의 28쪽 전부가 placeholder 없이
작성됐다(`grep -c PlaceholderPage site/src/routes.ts` = 0,
`PlaceholderPage.tsx` 삭제됨). 세대는 닫지 않았다 — 사람 검수 대기.

**검수할 것**
- Claim과 Barrier(`/docs/claim-barrier`) — orchestrate에서 옮겨온 claim·
  barrier 상세가 실물 출력과 맞는지, orchestrate 쪽 요약+링크가 자연스러운지
- 설정(`/docs/configuration`) — config.yml 세 필드 설명, 언어 해석 순서가
  `src/i18n.ts`의 `resolveLanguage`와 일치하는지
- Doctor(`/docs/doctor`) — `src/doctor.ts`의 결함 11종·참고 7종 표가
  실제 kind와 어긋나지 않는지, GUIDE 안내선 다섯 값이 최신인지, 실물
  출력(결함 1·참고 2)이 읽기에 자연스러운지
- 비교(`/docs/comparison`) — 다섯 항목이 규범을 옮겨 적지 않고 REAP
  자신의 관찰로 읽히는지, "vs" 구성이 과장되지 않았는지
- orchestrate(`/docs/orchestrate`) — claim/barrier를 들어낸 뒤에도 절
  흐름이 자연스러운지, submodule `--force` 한 줄의 위치
- skill 10종(`/docs/skill-reference`) — evolve 항목에 더한 위임 문장이
  `/docs/delegation`과 중복되지 않으면서도 정확한지
- CLI 레퍼런스(`/docs/cli-reference`) — `ctx` usage 수정이 실제 usage와
  맞는지
- v0.17에서 이주(`/docs/migration`) — selfview 실물 이주에서 배운 세
  항목(기록 파일 실례·backlog 판단 기준·design 하위 문서 링크)이 옮겨
  적기가 아니라 요약으로 읽히는지

세부는 `.reap/life/generations/gen-0099-exec-site-collab-ref.md`의
Outcome·Dead Ends·판단이 갈렸던 곳에. 특히 Dead Ends의 두 번째 항목 —
이 세대 도중 다른 milestone(ms-024)이 같은 작업 트리에서 동시에 진행돼
`07ad883` 커밋이 이 세대의 미커밋 편집분(ko.ts 인터페이스)을 함께 실어간
사실을 확인할 것. 콘텐츠는 최종 diff로 의도와 같음을 확인했지만 커밋
이력이 지저분하다 — 정리(reword 등) 여부는 사람 판단.
