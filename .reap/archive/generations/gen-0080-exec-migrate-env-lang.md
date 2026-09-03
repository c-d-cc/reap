---
id: gen-0080-exec
slug: migrate-env-lang
type: exec
milestone: ms-018
title: 이주 매핑 보강 — environment/ 이주와 ctx 언어 줄, 실물 재검증
startedAt: 2026-09-03T15:09:27Z
startCommit: 9839459
status: closed
closedAt: 2026-09-03T15:32:14Z
endCommit: 9dee591
---
## Intent

ms-018 task 1(environment/ 부분)·2 — migration-map에 `environment/` 매핑(#10)을 더하고, `ctx`가 `config.language`를 "응답 언어" 한 줄로 낸다. 실물(`~/cdws/reap_v17/.reap` 복사 표본)로 8단계를 다시 돌려 environment/가 옮겨지는 것을 확인한다. hooks 매핑은 ms-017 merge 뒤 다음 세대.

수행: worktree `../reap-wt-migrate`(브랜치 `ms-018-migrate`)에서 subagent.

## Outcome

**A. ctx 응답 언어 줄** (5fab2f5) — `src/ctx.ts`의 `status()`가 `config.language`가 비어 있지 않으면 상태 블록 첫 줄로 `응답 언어: <code>`를 낸다. `--hook`은 같은 조립을 쓰므로 자동 포함. 테스트 세 개 추가(있음·없음·`--hook`). `06-agent.md`의 상태 줄 예시에 그 줄과 규범 문장 한 줄을 더함.

**B. migration-map 보강** (d95d4b5) — `migration-map.md`에 매핑 #10(`environment/`: summary·source-map·resources는 그대로, domain/docs는 resources/ 아래로) 추가. 실물 검증 중 `reap-guide.md`가 매핑 표 열 곳 어디에도 없는 것을 발견해 매핑 #8(lineage/sequence — 승계하지 않음)에 합류시킴. 매핑 번호 "아홉"→"열"(SKILL.md 6/8, map.md 머리) 갱신, SKILL.md 3/8 실측 항목에 environment 파일 수 추가, 기록 파일 템플릿의 "옮긴 것"·"이행 안내 대상"에 environment 명시. hooks(#9)는 손대지 않음 — `detect-version.sh`는 이미 hooks/ 디렉토리를 표지에서 뺀 상태(87791b6)라 이번 표본(v0.18 init이 아직 `conditions/always.sh`를 시딩하지 않음)에서는 문제가 드러나지 않았다 — ms-017이 그 시딩을 추가하면 `find "$r/hooks" -type f`가 다시 걸릴 수 있다는 것은 ms-017 쪽 기록(tasks/2-fire-doctor-init.md)이 이미 알고 있다.

**C. 실물 재검증** — `~/cdws/reap_v17/.reap`을 scratchpad 표본(`git init`, 전부 commit)에 복사해 8단계를 그대로 수행:
- 1/8 `detect-version.sh` → `v017`, 근거 `lineage/ vision/memory/shortterm.md hooks/ 안의 파일` — 정확
- 2/8 `git status --porcelain` 비어 있음, `life/current.yml` 없음 — 차단 없이 통과
- 3/8 고지 실측: memory 168줄(longterm 49·midterm 69·shortterm 50), lineage 216개, backlog 9개, environment 파일 2개
- 4/8 `git mv .reap .reap-v0_17` — 격리 성공
- 5/8 `./dist/reap init`을 표본 루트에서 실행(산출 경로가 표본 아래인지 확인) — `language: ko`·`agentClient: claude-code` 승계(원본이 korean·claude-code라 변환표와 일치)
- 6/8 migration-map.md 전체를 지시로 준 subagent(Task)가 수행 — 주 세션은 이주 데이터를 읽지 않음. genome 3종 diff 동일, memory 34→lessons 선별, backlog 9/9 재발급, milestones 0(원본에 없음), goals 초안, design 10/10→idea, config 폐기 필드 8개 기록, lineage/sequence/reap-guide.md 미승계, hooks 폐기(내용만 기록), **environment: summary.md·source-map.md 옮긴 뒤 원본과 diff 완전 동일, resources/domain/docs는 원본에 없어 "없음"으로 기록**
- 7/8 `./dist/reap doctor` → **결함 0**, 참고 5(genome·environment·lessons 크기 안내선 — 실물 특성)
- 8/8 기록 파일 `.reap/archive/migration-v0_17.md` 작성(옮긴 것·옮기지 않은 것·이행 안내 대상·검증·홈 정리 다섯 절), doctor 결함 0 출력 포함, 되돌리기 한 줄 명시
- 끝 확인: `.reap/environment/summary.md` == 원본(diff), `.reap-v0_17/` 무손상(`git status --porcelain` 비어 있음), `reap ctx`에 `응답 언어: ko`가 상태 블록 첫 줄로 나옴(`--hook`도 포함)
- 표본 경로: `/private/tmp/claude-501/-Users-hichoi-cdws-reap/914296f2-726f-4898-a743-f0894f15c233/scratchpad/migrate-verify/specimen`(4커밋 — 표본·격리·이주+기록·건수 오타 수정·map 갱신 반영)

테스트: `bun test` 197 pass · `bun run typecheck` 통과 · `tests/hook.test.sh` 전부 통과.

## Dead Ends

- **subagent의 기록 파일 초안이 design 문서 건수를 9로 잘못 적었다**(실제 10건 — 최상위 4 + `backlogs_v0.18/` 6, bullet 목록 자체는 10개였다). 산문과 목록이 어긋나면 산문 쪽이 틀렸을 확률이 높다 — 목록을 세어 확인하고 주 세션에서 고쳤다.
- **reap-guide.md는 매핑 표에 없던 항목이다.** 상상으로 쓴 아홉/열 매핑도 실물 한 번에 새 마찰이 나온다(gen-0073의 language 형식 차이와 같은 패턴) — 이번엔 파일 하나가 표 밖에 있었다. 발견 즉시 이 세대에서 매핑 #8에 합류시켰다.

## References

- 커밋: 5fab2f5(A) · d95d4b5(B)
- 표본: scratchpad/migrate-verify/specimen (C)
