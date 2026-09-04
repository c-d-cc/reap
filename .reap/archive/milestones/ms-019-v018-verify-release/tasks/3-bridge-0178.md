# 3 — 0.17.8 준비

`~/cdws/reap_v17` 브랜치 v0.17에서:
- `package.json` 0.17.8 (`.claude/commands/reapdev.versionBump.md`의 절차를 읽고 따른다 — docs 버전 정합 `scripts/check-docs-version.sh`)
- `RELEASE_NOTES.md` 첫 블록 = 0.17.8: 0.18이 `next`에 있고 자동으로 안 올라가며 `reap update`가 agent를 설치한다. Q2의 답(언어)을 적는다
- upgrade agent URL(`src/cli/commands/update.ts`의 `UPGRADE_AGENT_URL`) — 06-release 2번: main에 파일이 없다. 결정: URL을 `.../c-d-cc/reap/v0.17/docs/upgrade-agent/reap-upgrade.md`로 바꾼다(v0.17 브랜치는 push되어 실재) **또는** main merge를 전제로 둔다. 사람 결정 "main은 발행 상태" — 0.17.8 발행이 곧 v0.17→main merge이므로 main URL이 성립한다. 어느 쪽이든 발행 직전 `curl -f`가 체크에 있다
- 전 스위트(`bun test` unit·e2e·scenario) 초록 — **파이프 없이** exit를 받는다(lessons)
- 커밋. push는 사람

tests 서브모듈은 `v0.17-bridge` — 테스트를 고치면 그쪽 커밋과 포인터 stage([[feedback_submodule_pointer_staging]]).
