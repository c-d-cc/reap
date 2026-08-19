# Completion

## Summary

**Goal**: daemon 버전 판정을 신뢰할 수 있게 만든다 — `semverGte` 의 prerelease 오판 수정, `MIN_DAEMON_VERSION` 발행 여부 게이트, 그리고 도달 불가로 미뤄졌던 세 번째 항목의 착수 판단.

**결과**: 셋 다 완료. 착수 판단은 **착수 쪽으로 뒤집었고 그 근거를 실측으로 세웠다.**

세 결함은 하나의 사슬이었다 — 하한을 올릴 때 **재는 자**가 틀렸고, **하한 자체**가 허구일 수 있었고, 못 넘었을 때의 **안내**가 막다른 길이었다.

### 1. 재는 자 — 구현이 둘이었고 둘 다 틀렸다

backlog 은 `check-version.ts` 의 `semverGte` 를 지목했다. `src/core/migration.ts` 에 **두 번째 구현**이 있다는 것은 적혀 있지 않았다. SemVer 2.0.0 §11 의 공식 순서 예제로 재보니 인접쌍 7개에 대해 **check-version 7 오답 / migration 7 오답** — 어느 쪽도 "맞으니 그대로 둔다"의 후보가 아니었다.

`src/core/semver.ts` 하나로 통합했다. 소비자 넷이 그것을 쓴다.

### 2. 통합이 드러낸 숨은 회귀 — `releaseLineGt`

정본을 그대로 적용하면 `semverGt("0.17.6", "0.17.6-alpha.3")` 이 true 가 되어 `detectPendingMigrations` 의 "아직 배포 안 됨" 필터에 걸린다. → **alpha 를 테스트하는 사람에게 그 릴리즈의 migration note 가 숨는다.**

이 조합은 가상이 아니다 — 유저는 `reapdev.alphaPublish` 로 **실제로 alpha 를 발행하고 그것을 깔아 테스트한다.** 그리고 **alpha 를 테스트하는 사람이 곧 migration note 를 확인할 사람**이다. 오늘 그 조합을 겪는 사용자는 없지만(발행된 prerelease 는 `0.16.0-alpha.*`, note 는 전부 그 위) 다음 alpha 에서 생긴다.

`releaseLineGt(a,b) = semverGt(semverCore(a), semverCore(b))` — 1줄. 구현은 여전히 하나다. 종전 `parseInt` 구현이 우연히 코어 비교와 같은 답을 냈으므로 **기존 동작을 유지하는 쪽**이기도 하다.

**근거의 성질을 구분해 둔다.** 처음 나는 "되돌리면 3건 red 니까 실재하는 회귀다"라고 적었는데, **그 3건의 이름을 읽지 않았다** — 전부 이 정책을 위해 방금 쓴 테스트였고 기존 테스트는 0건 깨졌다. red 는 "이 동작을 지키는 테스트가 있다"만 말한다. **이 정책의 근거는 red 개수가 아니라 위의 시나리오다.**

### 3. 하한의 실재성 — 게이트 신설, 그리고 게이트 자신의 구멍

`scripts/check-version-floors.sh` 를 만들어 `release.yml` 의 `npm publish` 앞에 두었다. 값은 소스에서 읽고(carrier 표식 2쌍), 네트워크 실패는 amber SKIP.

**evaluator 가 그 게이트의 구멍을 찾았다**: 패키지 **이름**이 틀리면 `E404` 가 stderr 로 나가는데 `2>/dev/null` 이 그것을 버려 SKIP(exit 0)으로 읽혔다. 즉 **버전은 검사하고 패키지는 검사하지 않았다.** 게이트를 처음 만드는 세대가 게이트에 구멍을 남기면 다음 사람은 그 구멍을 신뢰한다. 고쳤다.

같은 형태의 상수가 하나 더 있었다 — `reap.autoUpdateMinVersion`. 그리고 **본 세대가 그 파급력을 키웠다**(prerelease 가 이제 미달로 떨어진다). 인과로 묶였으므로 게이트를 넓혔다(이름도 `check-version-floors.sh` 로 — 두 floor 를 검사하는데 `check-daemon-floor` 는 거짓말이 된다).

### 4. 안내 — 미뤄진 판단을 뒤집고, 그 근거가 가리킨 곳을 처음엔 빠뜨렸다

gen-084 는 "도달 불가능한 분기라 어떤 테스트도 실행할 수 없고, 검증되지 않은 코드를 배포하게 된다"며 의도적으로 미뤘다. **추론은 옳았고 전제가 틀렸다:**

- **[실행]** `daemon/package.json` 은 오늘 아침까지 `0.1.0` 이었다 (`git log` — 커밋 2개뿐). **체크아웃은 발행되지 않는다.**
- (1) 을 고치는 순간 모든 `0.2.0-x` prerelease 가 미달이 된다. **(1) 만 하고 (3) 을 안 하면 도달 가능해진 분기를 미검증인 채 배포**하게 된다 — gen-084 가 피하려던 그 상태를 우리가 만든다.
- gen-084 가 **수용한 한계**(명시 경로는 존재만 보고 신원은 안 봄)가 검증 수단이 됐다. 조작된 0.1.0 패키지로 게이트가 실제로 분기를 실행한다.

**그런데 첫 구현은 근거 1이 가리킨 `checkout` 경로를 빠뜨렸다.** 그리고 테스트로 `expect(warnings[0]).toContain("npm i -g")` 를 걸어 **누락이 아니라 주장으로 만들었다.** evaluator 가 잡았다. `staleDaemonRemedy(source, bin)` 로 4-source 를 갈랐다.

## Lessons Learned

### L1. 미뤄진 판단은 목록에 있다는 이유로 만료되지 않는다 — 다시 재야 한다

gen-084 의 보류 근거는 문서에 남아 있었고 읽으면 설득력이 있었다. 뒤집을 수 있었던 건 **주장을 다시 잰 것**뿐이다 (`git log -- daemon/package.json` 한 번). 두 세대 연속 backlog 의 단정이 실측으로 반증됐다 — gen-084 는 "원리적으로 불가능", gen-085 는 "도달 불가능".

공통 형태: **발행 이력에 대해서는 맞고 디스크 위의 파일에 대해서는 틀린 주장.**

### L2. 자기 착수 근거가 가리킨 곳을 정작 안 고칠 수 있다

근거 1이 `checkout` 이었는데 구현은 `env`/`config` 만 덮었다. 더 나쁜 건 테스트가 나머지를 **"옳다"로 고정**한 것 — 누락은 다음 사람이 발견하지만 **주장은 다음 사람을 설득한다.**

처방: **착수 근거로 든 시나리오를 완료 기준에 1:1 로 옮겨 적어라.** "근거 1이 말한 경로가 수정 대상에 있는가"는 자문할 수 있는 질문이었고, 하지 않았다.

### L2b. negative test 가 red 인 것은 결함의 증거가 아니다 — **어느 것이 red 인지**가 증거다

`releaseLineGt` 를 넣으면서 "통합이 숨은 회귀를 드러냈다"고 적었고 근거는 **되돌리면 3건 red** 였다. 그 3건은 **전부 그 정책을 지키려고 방금 쓴 테스트**였고, 기존 테스트 중 깨지는 것은 0건이었다. 나는 그 사실을 출력으로 보고 있었고(테스트 이름이 다 찍혀 있었다) **읽지 않았다.**

결론적으로 그 정책은 유지됐다 — 근거가 red 개수가 아니라 **"유저가 실제로 alpha 를 내고 그것을 테스트한다"** 는 시나리오였기 때문이다. 즉 **결론은 맞았고 내가 댄 근거가 틀렸다.** 그 상태가 위험한 이유는, 근거가 검증되지 않은 채 결론만 남으면 다음 사람이 그 근거를 재사용하기 때문이다.

물었어야 할 질문 둘: **"red 인 것이 누가 쓴 테스트인가"**, 그리고 **"이 시나리오를 실제로 만드는 절차가 이 저장소에 있는가"**(있었다 — `reapdev.alphaPublish`).

### L3. 검사를 만들 때, 검사 자신에도 같은 결함이 있는지 본다

`check-version-floors.sh` 는 "설정이 가리키는 대상이 실재하는가"를 묻는 검사였는데, 정작 **자기가 묻는 대상(패키지)이 실재하는지는 확인하지 않았다.** 버전은 물었고 이름은 안 물었다.

genome 에 이미 "먼저 실패시켜라"가 있고 나는 그렇게 했다 — 그러나 **내가 상상한 실패 방식으로만** 실패시켰다(미발행 버전, 선언부 이동). 상상하지 못한 실패 방식(이름 오타)은 negative test 목록에 없었다.

처방: negative test 를 만들 때 **"이 검사가 fail-open 하는 입력이 있는가"** 를 별도로 자문한다. fail-closed 를 기본으로 하고, fail-open 은 각각 왜 안전한지 적는다.

### L4. 부수 효과의 크기를 재지 않고 서술했다

`semverGte` 를 고치면서 "autoUpdate 사용자가 blocked 된다"고 적었다. **`performAutoUpdate` 는 `-alpha` 를 비교 전에 early-return 한다.** 코드를 읽었으면 15초에 알 수 있었고, 그러지 않고 "이 함수가 semverGte 를 쓴다"에서 결론까지 갔다.

genome longterm § "Check, don't reason about it" 의 사례가 하나 더 늘었다. 이번엔 **결론이 아니라 그 결론의 크기**를 추론했다.

### L5. 테스트가 대리물을 재면서 실물을 잰다고 적을 수 있다

`passesFloor = (a,b) => semverGte(a,b)` 를 자체 정의하고 주석에 "the exact expression at both call sites" 라고 썼다. 식은 정확했다. **도달 가능성은 재지 않았고, 그것이 그 테스트가 말하지 않은 전부였다.**

두 guard 는 `execSync`/`npm view` 를 주입 없이 부르므로 직접 테스트가 불가능하다. 선택지는 (a) 주입 가능하게 리팩터링, (b) 주석을 정직하게. (b) 를 택했다 — 리팩터링은 본 세대 범위 밖이고, **과잉 주장을 남기는 것보다 한계를 적는 게 낫다.**

### L6. `[실행]`/`[negative]`/`[독해]` 표기가 실제로 작동했다

gen-084 가 genome 에 넣은 규칙이다. 이번에 **표기하려다 근거가 부실한 것을 두 번 발견**했다 — AF2 의 "npm 이 문자열을 돌려준다"(실측하니 배열), D3 의 autoUpdate 서술(코드를 읽으니 도달 불가). **적으려고 하는 순간 재게 된다.**

## 지시 변경 이력 — `releaseLineGt` (세대가 오락가락한 것이 아니다)

이 항목만 **상위 지시가 두 번 바뀌었고**, 그때마다 lifecycle 을 정식으로 되돌렸다. 기록해 두지 않으면 세대가 스스로 흔들린 것으로 읽힌다.

| 시점 | 지시 | 세대의 대응 |
|---|---|---|
| planning 승인 | **유지** — "정책을 `semver.ts` 주석에 남기고 미래 통합 시도를 막아라" | `releaseLineGt` + 회귀 가드 3건 구현 |
| 1차 정정 | **제거** — "과교정했다. 지금 존재하는 사용자에게 일어나지 않는 시나리오다" | completion → implementation 회귀, 정책·테스트 제거, 전 스위트 재검증 (unit 545 → 538) |
| 2차 정정 | **유지** — "제거를 중단하라. 그 판단은 autoUpdate 쪽에 해당하는 것이었고 migration 에까지 확대 적용한 것이 실수다" | 다시 회귀·복원, 주석만 14줄 → 4줄로 축약, 전 스위트 재검증 (538 → 545) |

**최종 상태는 유지**이며 판단 근거는 "유저가 `reapdev.alphaPublish` 로 실제 alpha 를 내고 테스트한다" 이다. 1차 정정의 "가상"이라는 판단은 **autoUpdate 의 alpha 차단**에는 맞았고(그쪽은 `performAutoUpdate` 의 early-return 때문에 애초에 성립하지 않았다) migration note 은닉에는 맞지 않았다.

**세대가 얻은 것**: 되돌림 두 번의 대가로 그 정책의 근거가 red 개수에서 시나리오로 바뀌었다(§ L2b). 지시가 바뀌지 않았다면 근거는 검증되지 않은 채 남았을 것이다.

## Evaluator 의 값

세 세대 연속으로 **모든 검사가 초록인 상태에서** blocking 결함을 냈다. 이번 3건(C1/C2/C3)은 전부 "테스트도 게이트도 통과하는데 틀린" 종류였고, 그중 둘은 **내가 이번 세대에 새로 만든 것**이었다.

evaluator 가 소스를 한 번 수정했다가 복원하고 **스스로 절차 위반을 신고**했다. 확인 결과 잔여 오염 0. 판단 근거로서의 가치는 실제로 있었고(C1 은 그 실측 없이는 안 나왔다), read-only 로도 같은 결론이 가능했다는 자기 지적도 맞다. **advisor 가 자기 한계를 보고하는 것이 advisor 모델이 작동한다는 신호다.**

## 수용된 한계 (유저 판단 필요)

1. **낡은 daemon 시나리오는 조작된 `package.json` 을 쓴다.** 진짜 낡은 발행본은 존재한 적이 없다. 실물과 다른 점은 버전 문자열의 출처뿐이고 `resolveDaemonAvailability` 는 그 파일만 읽지만, **"npm 에서 낡은 daemon 을 실제로 받은 사용자"는 여전히 미검증**이다. 0.3.0 을 내는 날 실물로 바꿀 수 있다.
2. **`checkout` 분기는 실물에서 실행되지 않았다.** workspaces 심링크 때문에 **이 저장소조차 `package` 로 간다** — dog-fooding 이 그 분기를 한 번도 밟지 않는다. backlog 등록. 그 문구가 틀렸다면 소스 clone 사용자가 오안내를 받는다.
3. **autoUpdate guard 자체는 테스트되지 않는다** (비교식만). 두 guard 가 주입 불가능하기 때문. 틀렸다면 `checkAutoUpdateGuard` 가 alpha 사용자에게 부적절한 경고를 낼 수 있으나, 현 floor(0.16.0)에서는 무발생.
4. **리눅스 미확인.** 본 세대는 push 하지 않으므로 reap-test dispatch 가 돌지 않았다. 로컬 macOS 만 — **표본 1**.
5. **Windows 미검증** (gen-084 부터 이어짐, 확인 수단 없음).

## Reflect — environment / memory 갱신

### environment/summary.md

- Tests baseline **unit 493 → 545** (전 세대가 갱신을 빠뜨려 낡아 있었다), e2e 279 / scenario 44 / daemon 130
- `src/core/semver.ts` · `scripts/check-version-floors.sh` 추가, `migration.ts` 의 release-line 정책 명시
- `DaemonAvailability` 에 `explicitLabel` / `staleRemedy` 반영 + **낡은 daemon 안내가 출처에 달렸다**는 서술
- CI 표에 버전 하한 게이트
- **Carrier Markers 절의 "현재 셋: …" 열거를 지웠다** — 그 절 자신이 "여기 옮겨 적으면 곧 어긋난다"고 말하는데 열거가 있었고, 실제로 어긋나 있었다(지금 6종)
- **세대별 changelog 접기**: Source Structure 의 `gen-0XX부터…` 접두를 현재형으로. 낡은 수치 정정(`25 modules` → 29)
- **자기진단 daemon 절 8불릿 → 5불릿**: 각 § 가 왜 그 형태인지는 스크립트 자신의 주석이 더 자세히 갖고 있었다. 스크립트를 열지 않고 알아야 할 것만 남겼다

**남은 초과 — 273줄 / 가이드라인 250.** 중복·낡은 서술은 다 걷었고, 남은 것은 **처방적 설계 근거가 environment 에 들어앉아 있는 것**이다(`Types` 절의 daemon 4항목, CI 게이트 절의 설계 판단들). genome § "genome vs environment 경계" 상 그것들은 application.md 로 가야 하는데 **genome 은 세대 중 immutable** 이라 지금 옮길 수 없다. genome 을 손대지 않고 줄 수만 맞추려면 유효한 현재-상태 서술을 지워야 하고, 그것은 genome 이 명시적으로 금지한다("do not hand-delete to silence a warning"). **adapt 후보로 넘긴다.**

### memory

- **shortterm** — 전면 교체(58 → 36줄). gen-084 핸드오프는 전부 처리됨: daemon 발행은 완료됐고, npm 토큰 문제도 해소됐다
- **midterm** — 65줄로 정상화(73 → 65, 경고 해소). 겹치던 두 절(`릴리즈 배분` / `0.17.5 / 0.17.6`)을 하나로 합쳤다 — **양쪽이 gen-085 를 서로 다른 작업에 배정하고 있었다**(0.18 시퀀스는 plugin, 0.17.6 절은 floor). 세대 번호를 실행 순서로 쓰던 것을 **묶음 이름**으로 바꿔 같은 충돌이 재발하지 않게 했다. floor 트랙은 완료 표기
- **longterm** — 50줄로 정상화(51 → 50, 경고 해소). 삭제 3건 · 병합 1건 · 신규 2건:
  - **같은 교훈이 두 번 쓰여 있었다** (`A dependency also supplies…` / `Removing a dependency also removes…`) → 병합
  - `Build the check first and watch it fail` → **genome evolution.md § "검사를 만들 때 — 먼저 실패시켜라" 에 명문화됨** → 중복 삭제
  - `Declare shared facts where they live` → **genome application.md § "여러 곳이 아는 사실 — 표식으로 찾는다" 에 명문화됨** → 중복 삭제
  - 검증 주장에 관한 두 교훈을 하나로 병합
  - 신규: L2(물려받은 보류는 다시 재야 할 주장이며, 그 근거가 가리킨 곳이 수정 범위에 있어야 한다) / L3(검사가 자기가 검사하는 결함을 가질 수 있고, negative test 는 상상한 실패만 덮는다)
  - `Check, don't reason about it` 에 L4 를 접어 넣었다 — **메커니즘은 맞게 파악하고 그 파급 범위를 지어낼 수 있다**

## Adapt — genome 변경 없음

**genome 을 수정하지 않는다.** embryo 라 자유롭게 고칠 수 있지만, 유저 fitness 가 지적한 것이 정확히 이것이다 — *"검증을 강화하는 일 자체가 새 작업을 낳는 순환"*. 규칙을 더하는 것도 같은 순환의 한 형태다.

세대 중 genome 후보로 적어둔 둘은 **longterm memory 에 이미 들어갔고 그쪽이 맞는 자리**다:

- L2b(negative test 가 red 인 것이 아니라 **어느 것이 red 인지**가 증거다) — 반복 참조할 설계 교훈이며 genome § "검사를 만들 때 — 먼저 실패시켜라" 의 **구체화**다. genome 에 또 적으면 중복이고, memory pruning 정책이 다음 세대에 그것을 지우라고 지시하게 된다
- L3(검사가 자기가 검사하는 결함을 가질 수 있다) — 동일

기존 genome 규칙 중 **본 세대가 위반한 것은 없다**. 오히려 두 규칙이 제 역할을 했다: `[실행]`/`[negative]`/`[독해]` 표기(gen-084 신설)가 근거 부실을 **적으려는 순간** 두 번 잡아냈고, Echo Chamber 방지 조항이 정책 철회 논의의 기준이 됐다.

### Embryo → Normal 전환 — 이번에도 보류

| 항목 | 상태 |
|---|---|
| genome 수정 빈도 | 감소 추세 — 본 세대는 **0건** |
| application.md 안정성 | 정체성·아키텍처 확립됨 |
| abort 빈도 | 최근 없음 |
| vision/goals 명확성 | 충분 |

**조건은 충족한다.** 그럼에도 보류하는 이유는 2026-03-26 유저 판단과 같다 — REAP 자신이 self-evolving 중이다. 그리고 지금은 **릴리즈로 가는 국면**이라 새 결정을 얹을 자리가 아니다. 유저가 명시적으로 검토할 때 다시 올린다.

## Next Generation Hints

> 유저 지시: 인접 개선 제안을 나열하지 않는다. daemon 파생 작업은 이번 세대로 정리하고 릴리즈로 간다.

- **0.17.5 릴리즈 문서 보강** — 본 세대 내용(semver 통합 / 버전 하한 게이트 / 출처별 낡은 daemon 안내)이 RELEASE_NOTES · NOTICE · 5 로케일에 아직 없다. 세대 밖, main agent 소관.

### 본 세대가 해소한 backlog (파일 정리는 유저가 함)

| backlog | 해소 |
|---|---|
| `semvergte-가-prerelease-를-구분하지-못한다-…` (source, consumed) | **예** |
| `mindaemonversion-을-올릴-때-그-버전이-실제로-발행됐는지-검사하는-게이트` | **예** |
| `낡은-daemon-안내가-명시-경로를-무시한다-…` | **예** |
| `daemonnotinstallederror-가-명시-경로를-무시한다-…` | **아니오** — 본 세대가 *만든* backlog 다. 미설치 경로(gen-084 범위)이고 손대지 않았다 |

### 완료 artifact 에만 적는 잔여 발견 (backlog 화하지 않음)

- **`checkout` 분기가 dog-fooding 에서 죽어 있다** — `workspaces` 심링크가 `package` 로 잡혀 이 저장소조차 그 경로를 밟지 않는다. 본 세대가 그 분기에 문구를 넣었으나 unit 주입으로만 확인됐다. (backlog 는 이미 만들어 둔 상태)
- **`list-carriers.sh` 가 산문 속 예시 문법을 carrier 로 센다** — `--orphans` 에 상시 오탐 1건. (backlog 는 이미 만들어 둔 상태)
- **`sort -V` 가 bash 쪽 네 번째 비교기** — 정식 버전에서만 돌아 현재 무해. (backlog 는 이미 만들어 둔 상태)
- **autoUpdate guard 자체는 테스트되지 않는다** — 두 guard 가 `execSync`/`npm view` 를 주입 없이 부른다. 비교식만 잰다는 한계를 테스트 주석에 명시했다.
