# Completion

## Summary

**Goal**: REAP 이 자기 사용자에게 잘못 말하거나 자기 문서를 못 지키는 결함 3건을 고친다.

**결과**: 셋 다 완료. 소스 5파일 / 테스트 5파일, **backlog 신설 0 / 게이트·스크립트 신설 0 / 버전 무변경.**

세 결함의 공통 형태는 하나다 — **원인을 아는 쪽이 그것을 버리고, 사용자에게는 그 자리를 메운 추측이 남는다.**

### 1. `gitPush` — 정보는 손 안에 있었고 버려지는 중이었다

`execSync("git push", { stdio: ["pipe","pipe","pipe"] })` 가 stderr 를 **잡아둔 뒤** `catch { return false }` 가 버렸다. 사용자가 받는 것은 `"git push failed. Check remote configuration and network."` — 2026-08-19 실사례에서 그 두 가지가 **모두 정상**이었고, 진짜 원인(OAuth 토큰의 `workflow` scope 부재)은 직접 `git push` 를 쳐야 나왔다. `--dry-run` 은 성공까지 해서 안내를 따랐다면 엉뚱한 곳을 팠을 것이다.

`GitPushResult { success, error }` + `describeExecError`(stderr → stdout → `err.message`). 그리고 **옛 문구를 삭제**했다. 원인을 `context` 에만 싣고 문구를 남기는 안은 기각 — `emitError` 는 `message` 만 내보내고 사용자가 읽는 것은 그 문장이다. **그 문장이 틀렸다는 것이 결함의 내용이므로 남기면 고친 것이 아니다.**

### 2. validation work 재진입 — REAP 이 자기가 낸 명령을 거부했다

backlog 은 "evaluator prompt 를 회수할 수 없다"로 적고 있었다. 재현하다 **더 강한 형태**가 나왔다:

```
$ reap run validation
status: artifact-incomplete   nextCommand: reap run validation
$ reap run validation          # 시킨 대로 따랐다
error | No pending transition for validation:entry …
```

이 분기는 evaluator 와 무관하다. **evaluator 를 켜지 않은 사용자도 겪는다.** 그리고 `genome/evolution.md` § *중단된 Generation 복구* 는 "중단된 시점의 phase 부터 다시 실행"하라고 지시하는데, validation 에서 그 지시가 성립하지 않았다.

수정은 두 graph 의 `validation:entry` 에 **self-loop 1개씩**. `stage-transition.ts` 도 `validation.ts` 도 손대지 않았다 — `completion:fitness` 가 이미 같은 형태를 갖고 있고, `setTransitionNonces` 가 호출마다 목록대로 재발급하므로 nonce 는 여전히 매번 발급·검증·소비된다.

**본 세대가 자기 수정의 첫 사용자다.** validation 에서 `run validation` 을 두 번 불러 evaluator prompt(10,924자)를 두 번 받았다. gen-084 는 손으로 재구성했고 gen-085 는 `/tmp` 에 저장해야 했던 일이다.

### 3. `DaemonNotInstalledError` — 셋 중 하나만 안 갈렸다

`ensureDaemon` 이 `resolveDaemonBin()` 을 불렀고, 그것은 `locateDaemon` 의 `source`/`explicitMiss` 를 **버리고 `.bin` 만 남긴다.** 그래서 `daemonBin` 을 설정했는데 그 자리가 빈 사용자도 "전역 설치하라"는 무관한 안내를 받았다.

`locateDaemon()` 직접 호출 + `missingDaemonRemedy` 신설(= gen-085 의 `staleDaemonRemedy` 대응물). `daemon/index.ts` 의 인라인 문구도 그것으로 교체해 **미설치 문구 조립 지점을 2 → 1** 로 줄였다.

**값어치를 정직하게 적는다**: `daemonRequest` 소비처를 전수 확인한 결과 이 메시지가 **오늘 사용자 화면에 뜨는 경로는 없다** — 셋은 앞서 걸러지고 나머지는 의도적 silent-fail 이다. 전역 catch 가 없으므로 새 소비처 하나면 그대로 노출된다. **오늘의 증상이 아니라 짝이 맞지 않던 상태의 교정**이며, 그래서 이 항목에는 사용자 대면 `[실행]` 증거가 없고 만들 수도 없다.

## 검증

| 스위트 | 기준선 | 결과 |
|---|---|---|
| unit | 545 | **555** / 0 fail |
| e2e | 279 | **287** / 0 fail |
| scenario | 44 | **44** / 0 fail |
| daemon | 130 | **130** / 0 fail (무변경) |

typecheck 0 error, build 통과, `fix --check` 0 error / 3 warning(전부 기존).

**기준선을 실측한 것이 값을 했다** — 상위 지시가 준 unit 538 은 낡은 값이고 실제는 545 였다. 그대로 믿었으면 "10 늘었어야 할 것이 17 늘었다"로 잘못 읽었을 것이다.

negative 3종 모두 수행 — 고의로 깨뜨려 fail 을 보고 복원. 상세는 04-validation.md.

## Lessons Learned

### 검사를 만들고 바로 green 을 보면 그 검사를 실제보다 신뢰한다

daemon 항목 첫 negative 에서 **fail 이 1건뿐**이었다. 보완으로 넣은 `expect(message).toContain(DAEMON_BIN_ENV)` 가 **무력**했기 때문 — `DAEMON_LOCATE_HINT` 가 이미 그 변수명을 철자하므로, `explicitMiss` 를 통째로 무시한 메시지도 그 단언을 통과한다. 경로 문자열로 바꾸니 2건이 됐다.

evaluator 가 **같은 모양을 하나 더** 찾았다(`toContain("daemonBin")`). 즉 이 실수를 한 번 잡고도 같은 파일에 한 번 더 저질렀다.

**단언이 두 상태를 가르기 위해 존재한다면, 한쪽에만 있는 것을 이름으로 대야 한다.** longterm 에 기록.

### backlog 은 결함을 안다. 결함의 가장 강한 증거는 모를 수 있다

결함 2 의 backlog 서술은 evaluator prompt 회수였다. 재현해보니 **artifact 미작성 분기가 스스로 낸 `nextCommand` 를 거부**하는 형태가 있었고, 이쪽이 사용자 범위가 넓다. "backlog 의 주장을 검증하라"의 변형 — 주장이 **틀린** 것이 아니라 **좁은** 경우다.

### 범위 고정은 유지 비용이 든다

evaluator 가 낸 6건 중 3건(L1 dead code / 범위 밖 `pull.ts` / L4)은 **고치지 않는 것이 옳은 판단**이었고, 그 판단을 매번 기록해야 했다. 유저가 명시하지 않았다면 셋 다 "인과로 묶였다"로 정당화 가능했다 — gen-083~085 가 18건을 쌓은 경로가 정확히 그것이다.

**고치지 않기로 한 것을 이유와 함께 적어두는 것**이 backlog 을 만들지 않으면서 기록을 남기는 방법이다. 03-implementation.md § Deferred Items 가 그 자리다.

### `resolveDaemonBin` 이 죽었다 — 리팩터가 남긴 흔적

`ensureDaemon` 이 `locateDaemon` 으로 옮겨가면서 유일한 프로덕션 소비자가 사라졌다. export 와 자기 테스트만 남았다. **제거하지 않았다** — 범위 밖이고, 판단 근거를 여기 적어 다음 사람이 결정하게 한다.

## Next Generation Hints

- **0.17.5 릴리즈 문서 보강 → 태그.** 본 세대 내용을 gen-084·085 와 함께 RELEASE_NOTES / NOTICE / 5 로케일에. 세대 밖, main agent 소관.

(gen-085 fitness 지시대로 hints 는 이 한 줄로 유지한다. 미처리 항목은 shortterm § 열려 있는 갭에 있으며 backlog 화하지 않았다.)

## Adapt 후보 — 인간 판단 사안

**새 backlog 을 만들지 않았다.** 아래는 완료 artifact 안의 기록일 뿐이며, 무엇이 backlog 이 될지는 인간이 정한다.

- `environment/summary.md` 272줄(가이드라인 250). **손으로 지워 경고를 끄는 것은 genome 이 금한다** — 근본 정리는 처방적 서술(설계 근거)을 genome 으로 옮기는 작업이며 gen-085 부터 미완이다. `longterm.md` 도 50줄로 가이드라인 경계에 닿았다.
- `src/cli/commands/run/pull.ts:22` 에 이번에 지운 문장(`"...Check remote configuration and network."`)이 fetch 경로에 그대로 있다. `git.ts` 의 나머지 `catch { return false }` 래퍼들도 같은 형태다.
- merge lifecycle 에는 e2e 가 하나도 없다. 본 세대의 merge graph 수정은 unit 단언으로만 확인됐다.

---

## Adapt

### Genome 변경

**없음.** 본 세대는 규칙을 바꾸는 사안이 아니라 코드가 사용자에게 말하는 내용을 고치는 사안이었다. `evolution.md` § *중단된 Generation 복구* 는 이미 옳게 적혀 있었고 — **코드가 그 문서를 못 지키고 있었을 뿐**이다. 문서를 코드에 맞추는 것이 아니라 코드를 문서에 맞췄다.

### Embryo → Normal 전환 판정 (85 generations)

| 항목 | 상태 |
|---|---|
| genome 수정 빈도 | 감소 추세. 최근 5세대(082~086) 중 genome 을 바꾼 것은 gen-083 하나 |
| application.md 안정성 | 정체성·아키텍처 서술이 안정. 최근 추가는 규칙이 아니라 사례 축적 |
| abort 빈도 | 최근 구간 0 |
| vision/goals 명확성 | 미완 항목이 구체적이고 backlog 과 대응됨 |

**조건은 충족한다.** 그러나 유저 판단(2026-03-26, midterm 기록)으로 embryo 를 유지 중이며 — 근거는 "REAP 자신이 self-evolving 중이라 예기치 못한 genome 변경이 더 있을 수 있다" — 그 근거가 아직 유효하다. 0.18 이 지식 축을 셋에서 넷으로 늘리고 배포 형태를 바꾸므로 **genome 변경이 예정돼 있다.** 이번에도 전환을 제안하지 않고 유지한다. 다음 판단 시점은 0.18 이 안착한 뒤다.

### Project Diagnosis

정량 점수를 쓰지 않는다.

1. **Core functionality** — lifecycle 5단계 + merge + 두 종료 경로가 85세대에 걸쳐 자기 자신 위에서 동작 중. 본 세대가 그중 하나(validation 재진입)의 구멍을 메웠다.
2. **Architecture stability** — 4층(adapter/CLI/core/state) + transition graph 가 여러 세대 유지. 본 세대는 graph **데이터** 2줄만 바꿨고 엔진은 손대지 않았다 — 구조가 확장을 흡수했다는 신호.
3. **Modularity** — 문구·판정을 함수로 소유시키는 패턴이 자리잡았다(`staleDaemonRemedy` 에 `missingDaemonRemedy` 가 짝으로 붙었다). `core` 가 `cli` 를 import 하지 않는 경계는 이번에도 지켜졌고, 그 대가로 `integrity.ts` 가 미설치 문구를 따로 조립한다.
4. **Error handling** — **본 세대의 주제였고 개선됐으나 균질하지 않다.** `git.ts` 의 나머지 래퍼들은 여전히 원인을 버린다.
5. **Test coverage** — unit 555 / e2e 287 / scenario 44 / daemon 130. 다만 **merge lifecycle e2e 가 0건**이고, 본 세대의 merge graph 수정도 unit 단언까지만 닿았다.
6. **Documentation** — reap-guide / 5 로케일 문서 사이트 / RELEASE 문서가 게이트로 묶여 있다. 0.17.5 릴리즈 문서 보강이 미완.
7. **Security** — 자격증명 노출을 실측 확인(evaluator): git 이 transport 에러에서 URL 토큰을 지운다. production dependency 는 `yaml` 하나.
8. **Performance** — CLI 단일 번들 0.60 MB, 스위트 전체 1분대. 문제 신호 없음.
9. **Deployment readiness** — 0.17.5 는 태그만 남았다. daemon 은 별도 발행(0.2.0)으로 분리 완료.
10. **Code quality** — 기존 패턴을 따랐고 새 메커니즘을 만들지 않았다. `resolveDaemonBin` 이 dead code 로 남은 것이 이번 세대가 만든 유일한 흠.
11. **User experience** — 세 결함 모두 UX 결함이었다. 사용자가 받는 문장이 실행 가능해졌다.
12. **Visual verification** — 해당 없음 (CLI).
13. **Integration layer** — daemon HTTP / git subprocess / npm registry. 본 세대가 git subprocess 쪽의 오류 전달을 고쳤다.
14. **Domain maturity** — environment 가 현재 구조를 서술하나 272줄로 가이드라인을 넘었다. 처방적 서술이 섞여 있는 것이 원인.
15. **Governance compliance** — 범위 고정·backlog 금지·버전 무변경·push 금지 전부 준수. negative 검증과 증거 태그 구분도 genome 규칙대로.
16. **Genome stability** — 본 세대는 genome 을 한 줄도 바꾸지 않았다. 그 자체가 안정 신호.

### 조치하지 않고 기록만 남기는 것

유저 지시에 따라 backlog 화하지 않는다. **제안이 아니라 사실 기록이다.**

- `resolveDaemonBin` 이 프로덕션 dead code 가 됐다 (`ensureDaemon` 이 `locateDaemon` 으로 옮겨가면서).
- `src/cli/commands/run/pull.ts:22` 에 이번에 지운 문장이 fetch 경로에 그대로 있고, `git.ts` 의 나머지 `catch { return false }` 래퍼들도 같은 형태다.
- `environment/summary.md` 272줄 / `longterm.md` 50줄 — 가이드라인 경계. 손으로 지워 경고를 끄는 것은 genome 이 금하며, 근본 정리는 처방적 서술을 genome 으로 옮기는 작업이다.
- **adapt phase 도 재진입이 안 된다.** 본 세대가 방금 겪었다 — prompt 를 두 번째로 읽으려 하니 `No pending transition for completion:adapt`. validation 과 같은 형태(`completion:adapt` 에 self-loop 이 없다)이며, `completion:fitness` 만 self-loop 을 갖는다. 조치하지 않는다.

### Next Generation Hints

- **0.17.5 릴리즈 문서 보강 → 태그.**
