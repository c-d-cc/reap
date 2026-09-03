# handoff

## gen-0080-exec-migrate-env-lang — 끝냈다 · 남은 것

**끝냈다**: task 1의 environment/ 매핑(#10, migration-map.md)과 실물 재검증, task 2(ctx 응답 언어 줄). 실물 표본과 검증 로그는 gen-0080 기록의 `## Outcome`.

**남은 것**:
- **hooks 매핑(#9 갱신)은 이 세대가 손대지 않았다.** ms-017(`reap-wt-hooks` worktree)이 hooks runner·`make hook`·이벤트 발화를 끝내고 merge된 뒤, 다음 세대가 migration-map.md #9를 "대응 2종 이주(`onLifeStarted`→`gen.made`, `onLifeCompleted`→`gen.closed`) + `conditions/` 복사 + 나머지 기록"으로 고친다. `04-migrate-docs.md`가 그 지시를 담고 있다.
- **`detect-version.sh`의 잠재 마찰.** ms-017 task 2(`tasks/2-fire-doctor-init.md`)가 이미 적어뒀듯, v0.18 `init`이 `hooks/conditions/always.sh`를 씨앗으로 놓기 시작하면 지금의 `find "$r/hooks" -type f` 표지가 갓 init한 프로젝트를 `mixed`로 오판할 수 있다 — 이 세대 시점엔 그 씨앗이 아직 없어 드러나지 않았다. hooks 매핑을 고치는 다음 세대가 함께 검증한다.
- task 3(README·RELEASE_NOTES)은 gen-0078이 이미 초안을 냈다 — 아래 가정 목록 참고.

## gen-0078-exec-readme-notes — 가정 목록

- **마켓플레이스 항목 이름.** [05-open.md](../../../../docs/reap-plan/reap_v_0_18_release/05-open.md) Q5(reap2 리포·마켓플레이스 항목 정리)가 아직 안 답해서, README·RELEASE_NOTES는 항목 이름을 `reap`으로 가정했다(`claude plugin install reap@ctod-plugins`) — 04-migrate-docs·task 3이 이미 그렇게 지시했다. Q5의 답이 A(추천)와 다르면(항목 이름이 바뀌거나 `reap2`가 유지되면) 두 파일의 설치·제거 절 명령을 고친다.
- **hooks 6종.** RELEASE_NOTES가 "hooks 6이벤트 + `make hook`을 제공한다"고 적었다. 이 세대 시점에 `src/cli.ts`에 `make hook`이나 이벤트 발화가 아직 없다 — ms-017(hooks-runner 세대)이 만드는 중이라는 전제로 적었다. 발행 전에 ms-017이 닫혔는지, 실제로 그 문구가 참인지 확인한다.
- **`bun run build:node`.** README 개발 절에 이름만 적었다("npm 배포용 node 번들"). 이 세대 시점에 `package.json`의 `scripts`에 아직 없다 — ms-016(npm-package 세대)이 만드는 중이라는 전제다. 스크립트 이름이 다르게 확정되면 README를 고친다.
- **upgrade agent 3단계와의 정합.** `~/cdws/reap_v17/docs/upgrade-agent/reap-upgrade.md` 3단계는 "설치된 패키지의 README를 따라 플러그인을 설치하라"고만 하고 구체적 명령을 담지 않는다 — README의 설치 절(`claude plugin marketplace add c-d-cc/plugins` → `claude plugin install reap@ctod-plugins`)이 그 자리를 채우므로 고칠 필요가 없었다.
