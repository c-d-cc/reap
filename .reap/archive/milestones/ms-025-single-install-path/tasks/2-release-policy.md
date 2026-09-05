# 2 — 배포 정책·워크플로·발행 절차

- `.github/workflows/release.yml`: `npm publish --access public` (`--tag next` 제거, 주석 수정)
- `docs/release-policy.md` 재작성: latest 직접 발행, floor가 안전장치, 0.17.8 다리 은퇴(발행 안 함), 0.17 사용자의 길(blocked 메시지 → 손 설치 → shim → setup → migrate)
- `docs/reap-plan/reap_v_0_18_release/06-release.md`·`05-open.md`: 발행 순서 재작성(0.17.8 단계 삭제), 결정 기록
- `.reap/archive/milestones/ms-019-.../handoff.md`는 archive라 손대지 않는다 — 새 순서는 06-release.md가 정본
- reap_v17: 은퇴 사실만 이 리포 문서에 적는다. 그쪽 리포는 건드리지 않는다
