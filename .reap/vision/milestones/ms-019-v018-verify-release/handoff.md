# handoff — ms-019

gen-0082가 task 1·2(왕복 검증)를 끝냈다. task 3·4는 아직 손대지 않았다.

## 남은 것

**task 3 — 0.17.8 준비** (`~/cdws/reap_v17`, `docs/upgrade-agent/reap-upgrade.md`는 이번에 읽기만 했다)
- `package.json` 0.17.8 bump + `RELEASE_NOTES.md` 첫 블록 + `scripts/check-docs-version.sh` 통과
- upgrade agent URL(`src/cli/commands/update.ts`의 `UPGRADE_AGENT_URL`) 결정 — 06-release의 "main은 발행 상태" 사람 결정에 따라 main URL이 성립한다는 쪽으로 이미 방향이 서 있다. gen-0082에서 실제로 읽은 `reap-upgrade.md` 본문 자체는 v0.18 쪽(README·SKILL.md·migration-map.md)과 정합했다 — 이번 왕복에서 그 문서의 내용을 고칠 필요는 없었다(고쳐야 했다면 task 3에서, agent 본문은 다른 세대 몫이라 gen-0082는 손대지 않았다)
- 전 스위트 초록 — 파이프 없이 exit 받을 것
- tests 서브모듈(`v0.17-bridge`) 포인터 stage 잊지 말 것

**task 4 — 마켓플레이스와 최종 체크**
- `~/cdws/ctod-plugins`의 submodule 교체, Q5 답 전이면 커밋 보류
- 06-release "발행 직전 체크" 명령 전부 실행해 출력 세대 기록에 붙이기

## gen-0082에서 발견한 마찰 (사람이 볼 것)

- **`ctx --hook`의 JSON은 정상인데, zsh `echo`로 캡처하면 깨진다.** 코드 결함이 아니라 검증 방법의 함정이었다 — 왕복 1의 Dead Ends 참고. 앞으로 이 프로젝트에서 훅 JSON을 스크립트로 확인할 때는 리다이렉트(`>`)나 `printf '%s'`를 쓰고 `echo`는 피할 것.
- **세대를 열고 바로 닫는 시험(훅 발화 확인 등)은 doctor가 "커밋 없이 닫힌 generation"으로 잡는다.** 의도한 대로 동작하는 것이지만, 표본을 doctor 결함 0으로 유지하려면 시험 뒤 `mark ... --aborted`로 정리하거나 닫기 전에 더미 커밋을 끼워야 한다. 다음에 비슷한 실물 확인을 할 때 참고.
- README·SKILL.md·migration-map.md·`detect-version.sh` 사이의 실측 가능한 어긋남 셋을 이번 세대에서 고쳤다(migrate SKILL.md 1/8 표·32행, migration-map.md #9) — Outcome 참고. upgrade agent 본문(`reap_v17`)에서는 이번 왕복 범위 안에서 어긋남을 못 찾았다.

## 표본 위치 (지우지 않음)

- 왕복 1: `/private/tmp/claude-501/-Users-hichoi-cdws-reap/914296f2-726f-4898-a743-f0894f15c233/scratchpad/roundtrip/proj` (+ `prefix/`, `pack/`)
- 왕복 2: `/private/tmp/claude-501/-Users-hichoi-cdws-reap/914296f2-726f-4898-a743-f0894f15c233/scratchpad/roundtrip/migrate-sample`
