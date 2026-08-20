# Validation

> gen-092 — auto-update 가 어느 버전을 읽고 어디에 설치하는가

이 문서는 **evaluator 3회를 거친 뒤 다시 측정해 다시 쓴 것**이다.
round 1 수치를 그대로 둔 채 "다시 돌렸다"고 적은 것이 round 2 의 L1 지적이었고,
게이트 미도달의 근거를 로컬 환경 기준으로만 적은 것이 round 3 의 L3 지적이었다 —
lineage 에 남는 것이 이 파일이므로 낡은 숫자도, 한쪽 환경에서만 참인 근거도 남기지 않는다.

## Commands (fresh 실행)

| 명령 | 결과 |
|---|---|
| `npm run typecheck` | pass (출력 없음) |
| `npm run build` | pass — `index.js 0.63 MB`, grammars 15 |
| `npm run test:unit` | **620 pass / 0 fail** (49 files, 1594 expects) |
| `npm run test:e2e` | **329 pass / 0 fail** (35 files) |
| `npm run test:scenario` | **44 pass / 0 fail** (4 files) |
| `reap fix --check` | `status: ok`, **0 error / 2 warning** |
| `bash scripts/check-self-diagnosis.sh` | **전 절 통과** (opencode 1.3.16 포함) |
| `bash scripts/check-docs-version.sh` | 전 항목 통과 (로케일 parity 24/24) |
| `cd docs && npx vite build` | `✓ built` |
| `bash scripts/list-carriers.sh --orphans` | 기존 1건만 (`RELEASE_NOTES.md` 산문) |

baseline 은 **unit 585 / e2e 329 / scenario 44**. 즉 **unit 만 +35** (이번 세대 신규 테스트),
e2e·scenario 는 개수와 결과가 모두 동일하다 — 기존 동작을 바꾸지 않았다는 것이 그쪽에서 보인다.

`fix --check` 의 warning 2건은 gen-052 lineage parent 쌍으로 **상속분**이며 이번 변경과 무관하다.

라운드별 unit 추이: 585(baseline) → 611(round 1) → 619(round 2) → **620**(round 3~4).
round 4 는 주석·문서만 고쳤으므로 개수가 변하지 않았다.

## Completion Criteria (02-planning.md 대조)

| # | 기준 | 판정 | 근거 |
|---|---|---|---|
| 1 | PATH shim 이 있어도 자기 버전을 읽는다 — **red 먼저** | ✅ | **[negative]** 수정 전 red 확인 → green. 통제 단언(shim 이 정말 PATH 앞인가)도 함께 통과하며, **첫 시도에서는 그 통제 단언이 red 를 내 접근법을 바꾸게 했다** |
| 2 | 비-global kind 에서 전역 설치 seam 미호출 — **red 먼저** | ✅ | **[negative]** seam-only 상태에서 정확히 4건 red → guard 후 green |
| 3 | `global` 은 기존대로 업그레이드 + hand-off | ✅ | **[실행]** `calls == ["npm install -g"]`, `action: "upgraded"`. evaluator 가 5 kind × 2 floor 전수 probe 로 독립 재측정 |
| 4 | `reap update` 의 버전 값이 baseline 과 동일 | ✅ | **[실행]** e2e `update-migration.test.ts` **무수정 통과** + 임시 프로젝트 직접 실행 → `packageVersion: 0.17.6` |
| 5 | 세 스위트 0 fail | ✅ | **[실행]** 620 / 329 / 44 |
| 6 | 자기진단 게이트 + 문서 게이트 | ✅ | **[실행]** 위 표. 두 게이트 모두 최종 빌드 기준으로 재실행 |
| 7 | `fix --check` 0 error / 2 warning | ✅ | **[실행]** 위 표 |

## Evaluator

`evaluator: true` — 독립 검토 **3회**.

### Round 1 → severity **high** (blocking 2건)

| | 내용 | 처리 |
|---|---|---|
| F1 | `runningVersion()` 의 `"0.0.0"` 이 truthy 라 `getInstalledVersion()` 이 null 을 못 돌려주고, `version-unknown` 분기가 죽어 **매 postinstall·매 세션마다 거짓 breaking-change 경고**. 옛 코드는 그 자리에서 조용했다 | `UNKNOWN_VERSION` + `runningVersionOrNull()` 도입. 되돌림 주입으로 red 1건 확인 |
| F2 | 릴리즈 문서 7파일이 비-global 설치에 "맞는 명령을 안내받는다"고 적었으나 실제로는 **완전 무음** | 6파일 문구 철회 |
| F3 | 파일 상단 주석의 도달 주장이 낡음 | 정정 |
| F4 | 주입 seam 의 **기본값**이 아무 테스트로도 고정돼 있지 않음 | 테스트 3종 추가 |
| F5 | guard 위치 근거가 비용 절반만 | 메시지 도달 논거 추가 |

**두 blocker 모두 이 세대의 수정 자체가 만들어낸 것**이다. `reap run back` 으로 정식 회귀해 고쳤다.

### Round 2 → severity **low** (blocking 0)

L1(04 가 round-1 수치) / L2(`UNKNOWN_VERSION` 주석이 무해하지 않은 소비자를 지목) /
L3(`"0.0.0"` 리터럴 중복) / L4(uninstall 이 조용히 timeout 을 얻음) / L5(marker 분기 단언이 약함) /
L6(이동 중 근거 주석 소실). **여섯 전부 처리했다** — 상세는 `03-implementation.md` Round 3.

두 가지는 evaluator 의 서술을 그대로 받지 않았다:
- **L3**: `"0.0.0"` 은 **서로 다른 두 사실**("버전을 모른다" / "한 번도 migration 안 됨")의
  철자다. 통합하면 안 되며, 내 이동이 만든 중복 1건만 상수화하고 나머지는 backlog 로 넘겼다.
- **L4**: 제안된 테스트를 그대로 쓰자 **red 가 났다** — `detectInstallKind` 는 provider 예외를
  전파한다(기본 provider 는 자기 안에서 잡으므로 **실제 timeout 은** `unknown` 으로 간다).
  틀린 것은 "어느 층이 잡는가"였고, 그 red 를 근거로 호출 지점을 감쌌다.

### Round 3 → severity **low** (blocking 0)

**세 건 모두 내가 쓴 문장이 틀렸다는 지적**이며, 이번 세대의 주제(주장과 측정의 불일치)와 같다:
L1(`package-info.ts` 헤더가 이동을 "unchanged" 라고 적었으나 timeout·catch·주석이 추가됐다) /
L2(새 uninstall 테스트의 docblock 이 **실제 timeout 경로를 덮는다고 적었으나 덮지 않는다** —
그 경로는 기존 테스트가 덮고, 새 테스트가 덮는 것은 주입 provider 경로다) /
L3(이 문서 2번 항목의 근거가 로컬 전용이었다). L4(catch 의 근거가 wrap 보다 넓음 — 문구 축소),
L5(`reap uninstall` 의 `unknown` 문구가 판정을 단정 — **gen-090 기존 문구, backlog**).

round 4 에서 전부 처리했다. **코드 동작 변경 없음** — 문장만 고쳤다.
그리고 그 라운드에서 **같은 종류를 셋 더 자기 점검으로 잡았다**
(`performAutoUpdate` doc 의 조건 목록이 3개 / `checkAutoUpdateGuard` doc 의 "매 세션 실행" /
`execute` 의 "always attempt" 근거 누락). 상세는 `03-implementation.md` Round 4.

**round 4 수정분에 대한 확인 요청은 evaluator 에게 보냈으나 이 stage 를 닫는 시점까지
응답이 오지 않았다.** round 3 판정이 이미 blocker 0 이었고 round 4 는 주석·artifact 만
건드렸으므로 진행한다 — 다만 **"4차 확인을 받았다"고 적지 않는다.** 응답이 오면 그 내용을
completion 에 반영한다.

## 이 검증이 **증명하지 않는 것**

통과는 "검사 범위 안에서 문제없음"일 뿐이다.

1. **실제 `npm install -g` 는 한 번도 실행되지 않았다.** guard 가 그것을 호출하는지/않는지를
   seam 으로 관측했을 뿐이다.
2. **자기진단 게이트는 install-kind guard 를 실행하지 않는다 — 그리고 그 이유가 환경마다 다르다.**
   - 개발자 머신: tarball 이 로컬 pack 이라 `dist/.dev-build` 를 갖고 있어 **2단계**(dev-build)에서 반환.
   - **CI / release**: `scripts/build.sh:60-64` 가 `CI` 가 설정돼 있으면 마커를 찍지 않으므로
     2단계를 통과하고 네트워크를 질의한 뒤 **4단계**(up-to-date, 작업 버전이 발행본 이상)에서 반환.

   결론은 양쪽 다 같지만 **근거가 다르며, publish 를 막는 것은 CI 쪽 실행이다.** 처음에는
   로컬 근거만 적었다(evaluator round 3 L3). 게이트가 증명하는 것은 *"설치된 번들이 pack 한
   그것과 같다"* 이지 *"어느 분기를 탔다"* 가 아니다. 그 sha 단언은 **결함 1 의 회귀 검사로는
   유효하다**(값이 틀리면 다시 덮어써진다).
3. **네트워크(`npm view`) 응답**은 어느 검사도 실행하지 않는다.
4. **실제 postinstall 환경의 `npm root -g`** 는 내 검사가 닿지 않았으나 **evaluator 가 쟀다** —
   로컬 설치 postinstall → 진짜 전역 루트(98ms) → `local`; `--prefix` 전역 설치 →
   `/var` vs `/private/var` 가 갈리고 `sameDirectory` 의 realpath 가 그것을 붙여 `global`.
   중첩 npm 은 hang 하지 않았다. **내 세대의 검사 자산이 아니라 1회성 측정이다.**
5. **SessionStart hook 의 실제 발화.**
6. **Windows 및 실제 심볼릭 링크 환경.** `sameDirectory` 는 가짜 realpath 로만 덮인다
   (gen-090 이 남긴 상태 그대로, 이번에 넓히지 않았다).
7. `checkAutoUpdateGuard` 의 문구 수정은 **프로덕션에서 도달하지 않는다** — 호출자가 없다.
   unit 은 함수를 직접 부르므로 green 이지만 그것이 사용자 경험을 의미하지 않는다. backlog 있음.
8. **설치된 사본에서 버전을 읽어보는 상시 검사가 없다.** e2e 는 체크아웃의 번들을 직접 돌리고
   (`node dist/cli/index.js`), 자기진단 게이트는 설치본의 `--version` 을 단언하지 않는다.
   `node_modules/@c-d-cc/reap/` 배치에서의 해석은 이 세대에서 **두 번 실측했지만**(내가 번들을
   임시 위치로 옮겨 `3.2.1` 을 확인, evaluator 가 실제 설치 배치에서 확인) **둘 다 1회성이고
   자산으로 남지 않았다.**

9. **`installedVersion` 기본값 테스트는 marker 유무로 갈리며 두 분기의 강도가 다르다.**
   강한 쪽(`from` 이 선언 버전과 일치)은 marker 가 없는 곳(CI)에서만 돈다. 빌드를 한 개발자
   머신에서는 "`+dev` 가 붙었다"만 확인한다 — 옛 코드는 배제하지만 임의의 잘못된 기본값은 아니다.

## Verdict

**pass** — 위 9항목을 함께 읽을 것.
