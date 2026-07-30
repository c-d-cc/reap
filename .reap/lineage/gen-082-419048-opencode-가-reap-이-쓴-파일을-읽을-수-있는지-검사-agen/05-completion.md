# Completion

## Summary

**Goal**: OpenCode 가 REAP 이 쓴 파일을 읽을 수 있는지 검사로 만든다.

**결과**: 완료. `check-self-diagnosis.sh` 가 두 클라이언트를 본다. CI 에서 실제로 돈다 (opencode 1.18.9).

**변경**:
- `scripts/check-self-diagnosis.sh` — OpenCode 절 추가 (151 → ~265줄)
- `.github/workflows/{ci,release}.yml` — `npm i -g opencode-ai` (미고정)
- `src/adapters/opencode/install.ts` — **`XDG_CONFIG_HOME` 준수** + slash command 과잉 변환 제거
- tests — `HOME` 격리에 `XDG_CONFIG_HOME` 동반 + XDG 해석 검증 3건

**검증**: 완료 기준 6/6. negative test 2종. unit 473 / e2e 278 / scenario 44, **XDG 설정·미설정 양쪽 0 fail**.

## Lessons Learned

### 잘 된 것 — 검사가 첫 실전에서 실제 사용자 버그를 잡았다

인위적 negative test 2개를 통과시킨 뒤 CI 에 올렸고, **첫 실행에서 red 가 됐다.** 원인은 우리 검사의 결함이 아니라 REAP 의 결함이었다:

> `XDG_CONFIG_HOME` 을 설정한 사용자에게 REAP 은 `$HOME/.config/opencode/` 에 쓰고 opencode 는 `$XDG_CONFIG_HOME/opencode/` 를 읽는다. slash command 19개 + agent 2개가 **오류 없이** 사라진다.

계획은 "adapter 코드 변경은 범위 밖"이라 적었는데 검사가 그 전제를 깼다. genome 의 *"인과로 묶인 검증 동작 fix 는 본 generation 에서 처리"* 에 따라 수정했다.

**진단 출력을 미리 보강해 둔 것이 결정적이었다.** 첫 실패에서는 "agent 를 나열하지 않는다"만 알 수 있었다. 파일 목록·설치 보고·환경 변수를 출력하도록 고친 뒤 한 번 더 돌리자 `XDG_CONFIG_HOME=/home/runner/.config` 가 나왔고 원인이 확정됐다. 검사의 실패 메시지는 검사 본체만큼 중요하다.

### 개선점 — 없는 변수의 영향을 측정하려 했다

설계 단계에서 `XDG_CONFIG_HOME` 을 쓸까 검토했다가 **불필요하다고 판단했다.** 근거는 실측이었다 — fake HOME 에서 사용자 agent 가 보이지 않았으므로 "opencode 는 HOME 을 따른다"고 결론했다.

관찰은 맞았지만 결론이 틀렸다. 내 로컬에 그 변수가 없었으므로 **"HOME 을 따른다"와 "XDG 가 없어서 HOME 으로 fallback 한다"가 구분되지 않았다.**

genome 에 "추론하지 말고 확인하라"가 있는데, 이번엔 확인을 했는데도 틀렸다. 확인이 답할 수 있는 질문의 범위를 함께 봐야 한다. **변수가 없는 환경에서 그 변수의 영향은 측정되지 않는다.**

### 개선점 — 테스트도 같은 결함을 갖고 있었다

`XDG_CONFIG_HOME=/tmp/probe` 로 CI 조건을 재현하니 unit 4 + e2e 8건이 즉시 실패했다. `HOME` 만 바꾸고 `XDG_CONFIG_HOME` 은 상속시켰기 때문이다.

gen-081 의 "격리 메커니즘을 프로세스 경계에 맞춰라"와 같은 종류다. 그때는 port/path 축이었고 이번엔 env 변수 두 개다. **한 세대 전의 교훈이 다른 옷을 입고 다시 나타났다** — 축을 열거하는 것으로는 부족하고 "프로세스가 무엇을 읽는가"를 물어야 한다.

### 잘 된 것 — 원인을 하나씩 배제했다

CI(1.18.9) 실패 / 로컬(1.3.16) 통과라 버전을 의심했다. 1.18.9 를 임시 prefix 에 설치해 로컬에서 돌리니 통과 → 버전 배제. docker 리눅스에서도 통과 → 플랫폼 배제. 남은 것이 환경 변수였다.

의심을 하나씩 죽이는 편이 가장 그럴듯한 가설을 붙잡고 있는 것보다 빨랐다.

### 개선점 — 치환 대상을 확인하지 않았다

negative test 를 만들 때 `toOpenCodeAgent(source)` 를 단순 치환했는데 **첫 매치가 slash command 쪽**이었다. 그대로 뒀으면 "검사가 gen-080 을 못 잡는다"는 잘못된 결론이 나왔다.

`grep -n` 으로 바뀐 줄을 확인해 알아챘고, **그 확인이 gen-080 의 과잉 변환 결함까지 드러냈다** — command 파일 19개에 `mode: subagent` 가 붙어 있었다. 실수를 확인하는 과정이 별개의 결함을 찾았다.

## Next Generation Hints

1. **pending backlog 3건** — interview 재설계 / daemon 배포 결함 / daemon SCIP. 뒤 2건은 유저 보류 중
2. **(b) opencode agent 구동 검증이 남아 있다** — "slash command 가 사용자에게 실제로 노출되는가"는 opencode 쪽에서 미검증. gen-063 이 claude-code 에서 겪은 실패 양상이 열려 있다. 유료 + `opencode run` 의 판정 용이성 미확인
3. **slash command 파일은 검사로 잡히지 않는다** — `opencode command list` 가 없다. 이번에 고친 과잉 변환도 코드를 읽다 발견했다
4. **CI red 를 볼 때 순서**: (a) 우리가 바꾼 것 → (b) upstream opencode 스키마 변경 → (c) 환경 변수. opencode 버전 미고정은 의도된 선택이므로 (b)가 실재한다
5. **릴리즈 노트에 XDG 수정을 반영할 것** — 사용자 영향이 있는 버그 수정이다. 0.17.4 (또는 다음 버전) 노트 필수

## Change Proposals

### environment 갱신 (완료)

- "자기진단은 두 클라이언트를 본다" 절 — 판정 기준, 격리, CI 편입, **잡지 못하는 것**
- "OpenCode 경로는 `XDG_CONFIG_HOME` 을 따른다" 절 — 소유 함수, 테스트에서의 주의, 재현 방법
- baseline 470 → **473**
- pruning: dispatch 다이어그램을 산문으로, baseline 표를 한 줄로, **carrier 표를 `list-carriers.sh` 포인터로 교체**(표가 곧 어긋날 목록이라는 원칙 자체에 위배됐다). 크기 경고 0

### memory 갱신 (완료)

- shortterm 전면 교체 (gen-081+082)
- longterm: gen-082 교훈 1건 추가, gen-081 의 격리 교훈과 **병합**(같은 원칙), 중복 1건 삭제(릴리즈 버전 하드코딩 — environment 에 있음)

### genome 변경 없음

XDG 준수는 OpenCode 의 사실이므로 environment 에 뒀다. "없는 변수의 영향은 측정되지 않는다"는 longterm 교훈으로 충분하다 — genome 의 "추론하지 말고 확인하라"를 대체하는 게 아니라 그 한계를 보태는 것이라, 원칙을 고칠 일은 아니다.
