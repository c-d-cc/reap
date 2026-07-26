# Completion

## Summary

**Goal**: 0.17.2 를 깨끗이 릴리즈 가능한 상태로 만들고, 문서 누락이 재발하지 않도록 검증 장치를 릴리즈 경로에 심는다.

**결과**: 완전 구현. 세 축 모두 완료.

| 축 | 내용 |
|---|---|
| 소급 반영 | 5 로케일 changelog 에 0.17.2 + 0.17.1 추가, ja/de/zh-CN 의 0.16.5 누락 보정 → 전부 20 항목. `RELEASE_NOTES.md` 승격 |
| 오도 제거 | reap.cc 가 가르치던 폐기 lifespan 분류를 content-type + pruning 으로 교체 (**2곳 × 5 로케일 = 10개 위치**) |
| 재발 방지 | `scripts/check-docs-version.sh` 신규 + release.yml publish 전 게이트 + versionBump skill Step 5-1 |

**검증**: typecheck pass / CLI build 0.77MB / docs vite build 성공 / 문서 검증 전건 통과 / unit 454-0 / e2e 263-1 / scenario 35-5 (뒤 둘 pre-existing, baseline 동일)

## Lessons Learned

### 잘 된 것 — 검사를 먼저 만들고 fail 을 확인한 뒤 고쳤다

T001(스크립트) → T002(**8건 fail 확인**) → T003~T013(수정) → T017(pass) 순서로 진행했다.

수정을 먼저 하면 스크립트가 실제로 결함을 잡는지 알 수 없다. 통과하는 것만 보고는 "검사가 동작한다"와 "검사가 무력하다"가 구분되지 않는다. 집합 동일성 검사도 같은 이유로 negative test 를 돌렸다(ja 에서 0.16.5 제거 → fail 확인 → 복원).

실제로 이 순서 덕에 검사 2(NOTES 승격)의 한계를 발견할 수 있었다 — 아래 참조.

### 잘 된 것 — gen-072 의 baseline 기록이 한 세대 만에 효과를 냈다

gen-072 는 scenario 실패가 pre-existing 인지 판단할 수 없어 `git stash` 까지 동원했고, 그 교훈으로 environment 에 세 스위트의 baseline 을 기록했다.

이번 세대는 같은 5건 실패를 보고 **즉시 pre-existing 으로 판정**했다. 조치의 효과가 다음 세대에서 바로 확인된 사례다.

### 개선점 — "지시를 더 자세히 쓰자"는 이미 실패한 방법이다

backlog S4 는 "규칙이 어떤 carrier 에도 명문화돼 있지 않다"고 진단했으나 **사실이 아니었다.** `reapdev.versionBump.md` Step 5 는 이미 `docs/src/i18n/translations/` 5개 파일을 이름까지 명시하고 있었다. 그럼에도 0.17.1 에서 누락됐고, 그 이전에는 en/ko 만 갱신하고 3개를 빠뜨린 적도 있다.

지시문은 있었고, 구체적이었고, 지켜지지 않았다. 따라서 대책은 지시 강화가 아니라 **실행 가능한 검사로의 대체**다. skill 에는 이 판단 근거도 함께 적어, 다음에 누가 "지시를 더 자세히 쓰자"는 방향으로 가지 않도록 했다.

일반화: **사람이 매번 기억해야 하는 절차는 결국 누락된다. 반복되는 누락을 발견하면 문서를 고치지 말고 검사를 만들어라.**

### 개선점 — 내가 만든 검사의 한계를 스스로 확인해야 한다

검사 2(RELEASE_NOTES 승격)는 **이번 케이스를 잡지 못했을 것**이다. 승격 전 상태에서도 통과했다 — 최상단 아카이브가 `## v0.17.0` 으로 현재 버전(0.17.2)과 달랐고 What's New 에 항목이 있었기 때문이다.

즉 "현재 버전이 아카이브에 잘못 들어간 경우"는 잡지만 "직전 버전 승격을 건너뛴 경우"는 못 잡는다. 엄격히 하려면 직전 버전을 알아야 하는데(git tag 조회) 릴리즈 흐름에 따라 오탐 위험이 있어 **의도적으로 타협**했다.

중요한 것은 이 한계를 validation artifact 에 명시했다는 점이다. 검사가 통과했다고 "검증됐다"고 넘어갔으면 다음 사람이 이 검사를 과신했을 것이다.

### 개선점 — backlog 의 사실도 검증 대상이다

backlog Problem §1 의 "RELEASE_NOTES.md 최신 = 0.17.0 ❌" 는 틀렸다. `grep -n "^## "` 로 헤더만 보고 `## What's New` 의 의미를 놓친 결과다. 실제로는 정상 상태였고, 필요한 작업은 "추가"가 아니라 "승격"이었다.

backlog 를 아무리 상세히 써도 그것은 **조사 시점의 판단**이다. clarity 가 high 라고 해서 backlog 를 무비판적으로 실행하면 잘못된 전제 위에 작업하게 된다. learning 단계에서 각 주장을 재확인한 것이 이 오류를 잡았다.

## Next Generation Hints

1. **backlog interview 기능** (backlog 있음) — 3건 orchestrate 의 마지막. 0.18.0 예정. clarity/maturity 연동 설계가 관건이며 cruise mode 와의 충돌 해소 필요. **본 세대의 교훈이 직접 적용된다** — interview 는 "지시를 자세히 쓰는" 접근이 아니라 "빈칸이 남았는지 검사하는" 접근이어야 한다
2. **0.17.2 릴리즈** — 문서가 모두 정합하므로 태그 push 만 하면 된다. `git tag v0.17.2 && git push origin main v0.17.2`. issue #21 코멘트 + close 도 함께
3. **genome threshold / scenario 복구** (backlog 2건, gen-072 발견)
4. daemon 2건은 유저 판단으로 보류

## Change Proposals

### adapt phase 에서 처리 — carrier 목록에 docs 사이트 추가

gen-072 가 `.reap/genome/application.md` 에 넣은 "규칙 변경 시 carrier 3중 확인"은 guide / genome 템플릿 / phase prompt 를 나열한다. **docs 사이트가 빠져 있다.**

본 세대가 그 4번째 carrier 를 실증했다 — reap.cc 가 폐기된 lifespan 분류를 10개 위치에서 가르치고 있었고, `memoryRules` 에는 새 정책과 정면 배치되는 `"Place content in the tier matching its expected lifespan"` 까지 있었다. **신규 사용자는 reap.cc 로 배우므로 이것이 가장 직접적인 오도 경로**다.

adapt 에서 carrier 목록에 `docs/src/i18n/translations/*.ts` (5 로케일) 를 추가하고, "로케일이 여러 개면 전부"라는 점도 명시한다.

### adapt 결과 (수행 완료)

**1. `.reap/genome/application.md` — carrier 목록을 3곳 → 4곳으로 확장**

`docs/src/i18n/translations/*.ts` (5 로케일) 추가. 근거를 gen-073 실증으로 명시했다 — 신규 사용자는 reap.cc 로 배우므로, 코드와 genome 을 다 고쳐도 문서가 구버전이면 여전히 잘못 배운다. 로케일 5개이므로 일부만 고치면 drift 가 생기며, `check-docs-version.sh` 는 changelog 집합만 검사하고 본문은 검사하지 않는다는 한계도 함께 적었다.

**2. `.reap/genome/evolution.md` — § "반복 누락은 지시가 아니라 검사로 막는다" 신설**

본 세대의 핵심 교훈을 규칙화했다:
- 판단 기준: "이 절차를 사람이 매번 기억해야 하는가?" → Yes 면 검사를 만들어라
- 검사는 실행 가능해야 하고, 우회 불가능한 경로에 연결하며, **왜 지시문만으로 부족한지 근거도 함께 적는다**
- 하위 절 "검사를 만들 때 — 먼저 실패시켜라": 수정 전 fail 확인 + negative test + **검사가 못 잡는 것을 결과와 함께 기록**

**3. dog-fooding 동기화** — `src/templates/evolution.md` 에 대응 절(영문) 추가. genome 을 고쳤으므로 템플릿도 함께 고치는 것이 § Dog-fooding 규칙이며, 이번에는 그 규칙 자체가 4-carrier 로 확장된 직후라 즉시 적용했다.

빌드/타입체크/문서검증 재실행 통과.

**Vision goals**: 변경 없음. 릴리즈 인프라 정비라 goals 항목을 직접 완료하지 않았다.

**Embryo → Normal**: **embryo 유지.** 본 세대에서도 genome 2개 파일을 수정했다 — 여전히 진화 중이라는 증거다.

### 신규 backlog 없음

본 세대에서 발견한 문제(backlog 사실 오류, skill 형식 불일치, 검사 2 한계)는 모두 세대 내에서 처리하거나 artifact 에 기록했다. 별도 backlog 로 뺄 항목은 없다.
