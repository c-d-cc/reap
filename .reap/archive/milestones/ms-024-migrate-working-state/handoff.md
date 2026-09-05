# Handoff — 사람 판정 대기 (gen-0102 이후)

## 어디까지 왔나

- gen-0100(매핑 재정의·verify)·gen-0101(lineage 승계)·**gen-0102(issue #25·#30 해소)** 로 tasks/1이 세 번 개정됐다. 마지막 개정은 사람이 selfview 실물 이주(2026-09-05)에서 올린 issue 일곱 건(#25에 #26~29, #30에 #31 합침)을 전부 반영한 것이다
- 스킬 표면: 8단계 + `scripts/{detect-version,measure,verify-migration}.sh` + `migrate-lineage.mjs`, 매핑 13, 기록 파일에 `## 사람 판단`·`## 다음 세션이 볼 것`
- selfview는 사람이 직접 `/reap:migrate`를 돌린 결과가 `dev`에 미커밋으로 있다(verify 9/9·doctor 0). **selfview는 사람이 별도 세션에서 다룬다 — 이 리포 세션은 손대지 않는다**

## 다음에 먼저 볼 것

- 사람의 판정. "지워도 된다"면 tasks/2 끝 → milestone 종료 절차([carve-milestone]). 아니면 지적을 tasks/1로 되돌린다 — 새 issue가 올라오면 `/reapdev.resolveIssue`로 받는다
- 개정된 스킬(#25·#30 반영)은 아직 실물 이주에 한 번도 쓰이지 않았다. selfview 재이주가 그 첫 검증이다

## 미결

- milestone.md "끝나면 물어볼 것" 두 질문: `.reap-v0_17` 삭제 여부, 첫 evolve가 안 묻고 다음 task로 갔는가 — 둘 다 사람 답 대기

## cleanup (닫을 때, 2026-09-05)

archive로 내린 세대: gen-0100·0101·0102·0103 — 매핑·스크립트·검사가 전부 `plugin/skills/migrate/`에 반영됐고, 남은 판단(경계 사례의 plan 우선, invariants.md 참고 처리, 정리 시점 8/8)은 각 기록의 Dead Ends와 migration-map 본문에 있다. 열린 세대 없음.
