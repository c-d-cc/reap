# Completion

## Summary

**Goal**: GitHub issue #21 해결 — v0.17.1 이 도입한 content-type memory 분류 + reflect pruning 정책을 규칙의 모든 carrier 에 동기화하고, 이미 구버전 텍스트를 받아간 기존 프로젝트까지 도달시킨다. 버전 0.17.2.

**결과**: 완전 구현. Scope A(규칙 동기화) / B(크기 검사) / D(migration note) 모두 완료. Scope C 는 adapt phase 대상.

**핵심 변경**:
- `src/cli/commands/run/completion.ts` — reflect prompt step 2/3 재작성. content-type 분류 + 4단계 decision tree + tier 별 prune 지시 + environment superseded 제거
- `src/templates/evolution.md` — § Memory / § Memory Classification Decision Tree(신설) / § Memory Update Criteria / § Environment Refresh 갱신
- `src/templates/migration/v0.17.2.md` (신규) — 기존 프로젝트 genome 도달 채널. 3분기 판정 + 대조용 baseline 전문
- `src/core/integrity.ts` — `MEMORY_LINE_WARNING_THRESHOLDS`(50/70/60) + `ENV_SUMMARY_LINE_WARNING_THRESHOLD`(250) + `checkMemorySize` (warnings only)
- `package.json` 0.17.2 / `RELEASE_NOTICE.md` v0.17.2 (en/ko)

**테스트**: typecheck pass / build 0.77MB / unit 454-0 (+9) / e2e 263-1 (+14, pre-existing 1건 유지) / scenario 35-5 (pre-existing, backlog 등록)

## Lessons Learned

### 잘 된 것 — 규칙의 carrier 를 전수 조사한 것

이슈는 carrier 2곳(prompt, evolution 템플릿)을 지적했지만, 실제로 조사해보니 **세 번째 문제가 더 컸다**: 템플릿은 `initCommon` 단 1곳에서만 소비되어 기존 프로젝트에 도달하지 않는다. 이슈가 제안한 Scope A 만 적용했다면 기존 사용자는 "genome=lifespan vs prompt=content-type" 모순 상태에 빠졌을 것이다. 개선을 배포하면서 모순을 남기는 것은 개선하지 않는 것보다 나쁘다.

`grep -rn "evolution" src/cli/commands/init/` 로 소비 지점을 전수 확인한 것이 이 판단의 근거였다. 추론이 아니라 실제 호출부를 읽은 것.

### 잘 된 것 — warning-only 를 플래그가 아닌 구조로 보장

`checkIntegrity`(진단)와 `fixProject`(자동 수정)가 별개 함수라는 점을 이용해, 크기 검사를 전자에만 추가하고 후자를 건드리지 않았다. 조건 분기로 "auto-fix 안 함"을 구현하면 나중에 뒤집힐 수 있지만, 애초에 그 코드 경로에 없으면 뒤집힐 여지가 없다.

41 KB longterm 을 가진 사용자가 `reap fix` 한 번으로 수십 generation 분 기록을 잃는 시나리오를 e2e negative test 로 영구 차단.

### 개선점 — 릴리즈 버전을 테스트에 하드코딩하지 말 것

`update-migration.test.ts` 가 `expect(...).toBe("0.17.1")` 로 패키지 버전을 하드코딩해 0.17.2 bump 만으로 4건이 일제히 실패했다. **버전 bump 는 릴리즈마다 일어나므로 이 실패는 매번 반복된다.** assertion 값만 갱신하는 것은 workaround 이므로 `package.json` 에서 읽도록 근본 수정했다.

구분 기준: 그 assertion 의 대상이 "현재 릴리즈"인가 "특정 버전의 산출물"인가. 전자는 동적으로 읽고, 후자(v0.17.1 note 의 존재/내용 검증)는 하드코딩이 옳다.

### 개선점 — baseline 없는 테스트 스위트는 판단 불가를 만든다

scenario 5건 실패를 만났을 때 `environment/summary.md` 에 scenario baseline 이 없어 **pre-existing 인지 신규 회귀인지 알 수 없었다.** unit/e2e 는 수치가 기록돼 있어 즉시 판단됐지만 scenario 는 `git stash` 까지 동원해야 했다.

실패를 방치한 채 baseline 도 기록하지 않으면 다음 세대가 같은 비용을 다시 치른다. 본 세대 reflect 에서 scenario 수치를 추가한다.

### 잘 된 것 — 새 정책이 자기 자신에게 즉시 작동했다

본 세대의 reflect phase 가 새 prompt 의 첫 사용자였고, 실제로 다음이 일어났다:

1. `environment/summary.md` § Tests 절이 **정확히 새 정책이 금지하는 형태**였다 — "신규 (gen-066)", "신규 (gen-067)", "신규 (gen-069)" 3줄의 per-generation changelog + 낡은 수치(427/239, 실제 454/263). step 2 의 "changelog 누적 금지" 지시대로 현재 상태 서술 + baseline 표로 교체
2. `reap fix --check` 가 **longterm.md 55줄 > 50** 을 경고 — 새로 추가한 검사가 자기 프로젝트를 잡았다
3. 정책의 "genome 에 이미 있으면 중복 → 삭제" 기준을 적용해 § Absolute Principles 3건을 검증 후 삭제. 셋 다 `reap-guide.md` Principles/Critical Rules 와 `evolution.md` § Workaround 금지에 명문화돼 있었다. 48줄로 복귀

정책을 만든 세대가 그 정책의 첫 위반자였다는 점이 이 접근의 유효성을 보여준다. 만들고 끝냈다면 이 3건은 계속 남았을 것이다.

### 개선점 — 자기 도구로 자기를 재면 안 맞는 경우가 있다

genome line threshold(100)가 REAP 자신이 배포하는 템플릿(175줄, 이전 146줄)보다 작아, `reap init` 직후 첫 `fix --check` 에서 사용자가 아무 잘못 없이 warning 을 받는다. 크기 검사 e2e 의 **대조군 테스트**(정상 프로젝트는 조용해야 함)를 쓰다가 발견했다.

본 세대의 memory threshold 는 guide 에 문서화된 범위의 상한을 채택했으나(longterm 50 = "30~50"의 상한), genome 의 100 은 근거가 코드에도 문서에도 없다. **임계값에는 근거가 함께 있어야 한다.**

## Next Generation Hints

1. **release 문서 검증 + reap.cc 갱신** (backlog 있음) — 0.17.1 이 문서에 미반영이고 로케일 drift(de/ja/zh-CN 에 0.16.5 누락)도 존재. 본 세대가 0.17.2 를 만들었으므로 함께 반영. `scripts/check-docs-version.sh` + release 게이트 신설. **본 세대의 `RELEASE_NOTES.md` / `docs/` 미갱신은 이 backlog 담당으로 의도적 유보**
2. **backlog interview 기능** (backlog 있음) — 0.18.0 예정. clarity/maturity 연동 설계가 관건이며 cruise mode 와의 충돌 해소 필요
3. **scenario 테스트 복구** (backlog 있음) — gen-065 backlog gate 반영 + scenario baseline 기록
4. **genome threshold** (backlog 있음) — 근거 있는 수치로 재설정
5. daemon 2건은 유저 판단으로 보류 중

## Change Proposals

### adapt 결과 (수행 완료)

**genome 수정** — `.reap/genome/application.md` § Dog-fooding 확장 (embryo 모드):

1. 대응 관계에 2줄 추가 — `.reap/genome/evolution.md` ↔ `src/templates/evolution.md`, **agent 행동 규칙 텍스트 ↔ `src/cli/commands/run/*.ts` prompt 문자열**
2. § "규칙 변경 시 carrier 3중 확인" 신설 — guide / genome 템플릿 / phase prompt 3곳 모두 확인. 3번이 가장 놓치기 쉬움. 텍스트는 창작하지 말고 한 곳 기준으로 복제
3. § "규칙 변경이 기존 프로젝트에 도달하는가" 신설 — 템플릿은 신규 프로젝트에만 반영되며, 기존 프로젝트의 유일한 채널은 migration note. migration note 의 3분기 판정 규칙 포함

이 세 항목이 본 이슈의 근본 원인(대응표가 prompt 코드를 carrier 로 인식하지 않음 + 도달 경로 미고려)에 대한 직접적 대책이다.

`application.md` 는 대응 템플릿이 없다 (`genome-suggest.ts` 가 init 시 생성) — dog-fooding 동기화 대상 아님을 확인.

**Vision goals**: 변경 없음. gen-072 는 유지보수 성격이라 goals 의 어떤 항목도 직접 완료하지 않았다.

**Embryo → Normal**: **embryo 유지 권장.** 본 세대에서 실제로 genome(application.md)을 수정했다는 것 자체가 genome 이 아직 진화 중이라는 증거다. 사용자 판단(2026-03-26, midterm 기록)도 "REAP 자신은 더 관찰" 이며 그 근거가 여전히 유효하다.

### Scope C 상세 (위 adapt 에서 적용됨)

`.reap/genome/application.md` § Dog-fooding 대응표 확장. 현재는 **파일 ↔ 파일** 대응만 명시하고, prompt 코드 안에 하드코딩된 규칙 텍스트는 동기화 대상으로 인식되지 않는다. 이것이 gen-070 이 규칙을 바꾸면서 reflect prompt 를 놓친 이유다.

추가할 대응 관계:
- `.reap/genome/evolution.md` ↔ `src/templates/evolution.md`
- **lifecycle 규칙 텍스트 ↔ `src/cli/commands/run/*.ts` 의 prompt 문자열**

판단 기준: "이 규칙이 agent 행동을 좌우하는가?" → Yes 면 **guide / genome 템플릿 / phase prompt 3곳 모두** 확인. 규칙의 carrier 는 문서만이 아니다.

여기에 더해, 규칙 변경 시 **그것이 기존 프로젝트에 도달하는 경로가 있는지** 확인하는 항목도 필요하다. 템플릿 수정만으로는 신규 프로젝트에만 반영되며, 기존 프로젝트에는 migration note 가 유일한 채널이다.

### 신규 backlog (본 세대 중 발견, 2건)

- `genome-line-threshold100-가-배포-템플릿evolutionmd-175줄보다-작아-신규-init-이-즉시-warning.md` — A/B/C/D 4개 방향 제시
- `scenario-multi-generation-5건-실패-gen-065-backlog-gate-도입-후-테스트-미갱신.md` — 테스트 갱신 + scenario baseline 기록
