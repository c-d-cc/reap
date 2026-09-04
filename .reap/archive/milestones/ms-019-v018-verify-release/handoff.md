# handoff — ms-019

gen-0092가 task 5(최종 재검증)를 끝냈다. gen-0092는 milestone을 닫지 않았다 — 발행 자체는 사람의 결정이다.

## Exit Criteria 대조표 (milestone.md 기준)

| Exit Criterion | 상태 | 근거 |
|---|---|---|
| tarball 설치 → 빈 리포 왕복(init→make→complete→doctor 0), en 출력 | 완료 | gen-0082에서 최초 확인, gen-0092에서 en으로 재확인(`scripts/verify-package.sh` exit 0 · `proj-en`에서 `reap init`·`doctor` 0 · `reap ctx --hook` 직접 캡처로 `Response language: en` 확인) |
| 같은 왕복을 `REAP_LANG=ko`로 | 완료(결과: 프로젝트 안에서는 config가 이긴다) | `config.language: en`인 리포 안에서 `REAP_LANG=ko`는 영어 usage를 낸다 — `resolveLanguage`의 `config → REAP_LANG → en` 우선순위, README의 "REAP_LANG=ko outside a project"와 일치. `.reap/` 없는 디렉터리에서는 REAP_LANG이 정확히 한국어를 낸다(둘 다 확인) |
| v0.17 표본 이주 왕복, `language: ko` 프로젝트가 한국어 출력 | 완료 | `migrate-ko` 표본에서 migrate SKILL 8단계 전부, `reap doctor` 결함 0(참고 5, 전부 크기 안내선), `reap ctx --hook` 직접 캡처로 `응답 언어: ko` 등 한국어 상태 줄 확인 |
| `--plugin-dir` 세션이 상태 줄·skill 10종을 낸다(en·ko 각 1회) | 완료 | `claude -p` 2회(en 1·ko 1) 모두 skill 10종 정확히 열거. 주의: `claude -p`의 "verbatim" 답 자체는 이 세션의 응답언어 지시로 en 왕복에서 한국어로 번역되고 ko 왕복에서 한 줄이 누락됐다 — 원문 진위는 `reap ctx --hook` 직접 캡처로만 확인했다(gen-0092 Dead Ends) |
| `reap_v17`: 0.17.8 bump·RELEASE_NOTES·check-docs-version.sh·전 스위트 초록·커밋 | 완료 | task 3(커밋 `0f25750`)에서 bun test 1047 pass·check-docs-version.sh·check-self-diagnosis.sh 확인 기록됨. gen-0092에서는 브리핑 지시로 `npm pack --dry-run`만 재확인(exit 0, `@c-d-cc/reap@0.17.8`) — bun test는 v0.17 바이너리가 홈에 자체 설치하므로 재실행 안 함 |
| upgrade agent URL 결정·문서화 | 완료 | `docs/release-policy.md`·`06-release.md` 둘 다 "main 유지" 결정과 근거를 담고 있다. `curl -f`로 지금 404 확인(main merge 전이라 정상 — 아래 발행 순서 1·2 참고) |
| `ctod-plugins`: `reap` 항목 로컬 커밋 | 완료(로컬만) | `ctod-plugins` 커밋 `0cde4bb`. submodule 포인터는 `71d5681`(오늘 기준 이미 `origin/v0.18`에 존재 — `git branch -r --contains 71d5681`로 확인). **push 뒤 반드시 `git -C plugins/reap pull origin v0.18 && git add plugins/reap`로 최신 커밋까지 올릴 것** — v0.18을 push하면 이 리포의 HEAD가 71d5681보다 앞서 있으므로(gen-0092의 커밋 포함) 포인터를 다시 갱신해야 한다 |
| `release-policy.md`·`06-release.md` 순서 일치, 발행 직전 체크 명령이 실제로 돈다 | 완료 | gen-0092에서 D 대조(전부 일치, `site/migration.md` 어긋남 1건 발견·수정) + C에서 06-release 코드 블록 5개 명령 전부 실행, 출력은 gen-0092 기록의 Outcome 참고 |
| loop-0004를 닫을 수 있다 | **사람 판단** | 05-open의 미답은 `idea/research/`로 옮기는 것이 조건 — 이 세대에서 손대지 않음 |

## 발행 시 사람이 할 것 (순서대로, 06-release.md 기준)

**1. 0.17.8을 먼저 latest로**

```bash
cd ~/cdws/reap_v17
git checkout v0.17
git log --oneline -3   # be2664a가 HEAD인지 확인
git tag v0.17.8
git push origin v0.17.8   # release.yml이 latest로 publish
```

publish 후 확인:

```bash
npm view @c-d-cc/reap dist-tags   # latest가 0.17.8인지
```

**2. upgrade agent 본문을 main에 올린다**

브랜치 흐름 결정(release-policy.md)대로 "0.17.8 발행 = v0.17 → main merge"다. 태그를 밀기 **전에** 파일이 main에 있어야 한다(0.17.8의 `reap update`가 이 경로를 fetch한다).

```bash
cd ~/cdws/reap_v17
git checkout main
git merge v0.17   # 또는 사람이 정한 merge 방식
git push origin main
curl -fsI https://raw.githubusercontent.com/c-d-cc/reap/main/docs/upgrade-agent/reap-upgrade.md   # 200 확인
```

**3. 0.18.0을 next로**

```bash
cd ~/cdws/reap
git checkout v0.18
git log --oneline -3   # 0687b7f(gen-0092 마지막 커밋)가 HEAD인지 확인
git push origin v0.18   # 아직 안 올라간 로컬 커밋들 반영(gen-0092 포함)
git tag v0.18.0
git push origin v0.18.0   # release.yml이 --tag next로 publish
npm view @c-d-cc/reap dist-tags   # latest 여전히 0.17.8, next가 0.18.0인지 다시 확인
```

태그를 밀기 전에 마지막 push의 `dispatch-tests`(reap-test 쪽 워크플로) 결과를 확인할 것 — `06-release.md`의 G6 참고.

**4. 마켓플레이스**

```bash
cd ~/cdws/ctod-plugins
git -C plugins/reap fetch origin
git -C plugins/reap checkout v0.18.0   # 또는 v0.18 브랜치의 최신 push된 커밋
git add plugins/reap
git commit -m "..."   # 이미 있는 0cde4bb 위에 포인터 갱신 커밋
git push
```

marketplace push 자체(`c-d-cc/plugins`로의 push)는 Q5 답 A 뒤 이미 로컬에 있는 커밋 위에 이 갱신을 얹어 사람이 push.

**5. latest 승격은 별도 결정**

release-policy.md 참고 — 이 milestone의 범위 밖.

## 그 밖에 사람이 볼 것

- **loop-0004 닫기**: 05-open의 미답을 `idea/research/`로 옮긴 뒤 milestone 종료 절차(cleanup skill)를 밟을 것
- gen-0092가 찾은 마찰(en 왕복에서 `claude -p`의 "verbatim" 답을 못 믿고 `reap ctx --hook` 직접 캡처로만 검증할 수 있었던 것, 백그라운드 `claude -p`가 20분 넘게 멈추는 것)은 gen-0092 기록의 Dead Ends에 있다 — 코드로 못 막은 마찰로 다음 사람이 볼 것

## cleanup (닫을 때)

archive로 내림: gen-0091·0092 — 산출물이 리포·handoff에 있다. 이 handoff의 "사람이 할 것"이 발행 절차의 정본이다(archive에서 읽는다).
