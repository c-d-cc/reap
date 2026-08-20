# Completion

## Summary

**Goal**: daemon 상주 프로세스를 폐기하고 indexer 를 reap 패키지에 내장한다.
인덱싱 주기를 git commit 에 맞추고, blast radius 분석을 `reap index` CLI tool 로 제공한다.

**결과**: 달성. 소스 신설 12파일(`src/indexer/` 1,400여 줄) + CLI 1 / 삭제 `daemon/` 전체 + reap 쪽
845줄 / 테스트 신설 6파일·삭제 8파일 / 문서 20여 파일 / 버전 0.17.5 → **0.17.6**.

### 무엇이 결함이었나

**상주 프로세스가 아무것도 벌지 못하고 있었다.** `runIncrementalPipeline` 은 구현돼 있었지만
유일한 호출부가 인자를 넘기지 않아 **HTTP 로 도달 불가능**했고, 4개 lifecycle 진입점이 전부
full reindex 를 돌렸다. 그 6.2초의 92%는 tree-sitter 가 아니라 파일마다 도는 `git log -1` 이었다.
warm 그래프라는 존재 이유가 작동한 적이 없다.

**그리고 대표 기능이 5개월간 0을 반환하고 있었다.** blast radius 는 표준 TypeScript 프로젝트
전체에서 항상 0이었다 — resolver 가 `./x.js` specifier 를 그것을 만들어내는 `x.ts` 에
대응시키지 못했기 때문이다. **테스트 130개 통과, 자기진단 게이트 통과, CI 내내 초록.**
모든 검사가 "인덱싱이 돌았는가"를 물었고 "결과가 말이 되는가"는 아무도 묻지 않았다.

사용자는 없었다 — daemon 30일 다운로드 0회 vs reap 1,546회. **인과의 원천이 그것이다.**
소비자가 없으니 결과를 검증할 사람도 없었다.

### 무엇을 만들었나

- **`src/indexer/`** — parser(web-tree-sitter, WASM, **네이티브 빌드 0**) · scanner · CodeGraph ·
  import/call resolver · impact · JSON+gzip 스냅샷 store · pipeline
- **`reap index`** — `update` / `status` / `impact` / `search` / `callers` / `callees`
- **인덱스의 단위는 커밋이다.** `manifest.lastIndexedCommit` 이 신원이고, 무엇을 다시 읽을지는
  `git diff` 한 번, 다시 읽을 필요가 있는지는 문자열 비교 한 번. 질의가 HEAD 이동 시 스스로 갱신하므로
  eager 트리거는 커밋을 만드는 두 곳(completion commit, early-close)만 남았다
- **`reap index status` 가 import 해석률을 보고한다.** 이 한 줄이 P2 를 첫날 잡는다
- 인덱스는 `.reap/.index/`, gitignore. `reap init` 과 `reap update` 가 항목을 쓴다

**측정**: full 인덱싱 6,672 ms → **345 ms**. 다운로드 227 kB → 약 2.7 MB(grammar 15개 동봉).
네이티브 빌드가 사라진 것이 크기보다 중요하다.

### 게이트를 "돌았는가"에서 "답이 맞는가"로 바꿨다

자기진단 §5 는 daemon 을 격리 설치해 **심볼 수 > 0** 을 물었다. 그 assertion 이 걸려 있는 동안
blast radius 가 5개월간 0을 반환했다. 새 §5 는 NodeNext fixture 를 **설치된 번들 + node**
(가짜 `bun` 을 PATH 에 넣어 강제)로 돌린 뒤 **알려진 관계**(`leaf → middle → top`)와
**해석률 2/2**를 요구한다. 수정 전 상태에서 `import resolution is 0/2` 로 fail 하는 것을 확인했다.

## Fitness

**사용자 피드백 원문: `ok`**

한 단어다. 팀 리드가 (1) 목표 4가지 달성 여부 (2) evaluator 3라운드를 어떻게 보는지
(3) 안 고치고 남긴 것들(게이트 §5 의 incremental 미검증 · 이식 모듈 unit 32개 미복원 ·
macOS 단독 실행)이 수용 가능한지 — 세 축을 제시하고 "바로 adapt 로 넘기고 싶으면 짧게 주셔도
된다"고 안내한 뒤 받은 답이다.

**읽는 방식**: 간결한 승인 — 결과 수용, 남긴 한계도 수용, 진행하라.
**그 이상은 적지 않는다.** 짧은 승인을 긴 만족으로 옮겨 적는 것이 곧 self-fitness 이고,
genome 이 금지하는 것이다(`Self-fitness Prohibited`). 이 세대가 네 라운드에 걸쳐 고친 것이
"검사가 실제로 관측한 것보다 많이 주장하는" 문제였으므로, 마지막 칸에서 같은 일을 하지 않는다.

## Lessons Learned

### 독립 검토는 모든 검사가 초록일 때 값을 한다 — 세 번 연속으로

evaluator 를 3회 돌렸고 3회 다 `reap run back` 으로 회귀했다. **매번 세 스위트·네 게이트가
전부 통과한 상태에서 시작했고, 매번 사용자에게 도달하는 결함이 나왔다.**

| 라운드 | 찾은 것 |
|---|---|
| 1 | incremental 이 CALLS edge 를 영구 삭제 / agent 템플릿 2개가 삭제된 daemon 을 curl 하라고 지시 / `reap init` 이 8곳에서 약속한 `.gitignore` 를 쓰지 않음 / 게이트 능력 거짓 주장 |
| 2 | **1회차 수정 안**: incremental 이 full 에 없는 CALLS edge 를 추가 / `.gitignore` 검사가 fail-open / 쓰기 unguarded → 크래시 / 내 테스트의 실패할 수 없는 단언 |
| 3 | **round-3 수정 안**: IMPORTS 가 CALLS 와 같은 결함 / 문서 12곳의 예시가 재현 불가 |

**2·3·4 라운드의 결함은 전부 직전 라운드의 수정 안에 있었다.**

### 이 세대의 명제가 이 세대 안에서 네 번 재현됐다

"모든 검사가 '돌았는가'를 묻고 '답이 맞는가'를 묻지 않았다" — 그것을 고치는 작업이 같은 모양을
네 번 만들었다:

1. 내가 쓴 incremental e2e 가 `mode === "incremental"`, `filesProcessed === 1` 만 물었다
2. `startsWith(".reap/.index")` 가 **막으려던 방향으로** 열렸다 — 하위 파일 규칙을 디렉토리 규칙으로 오인
3. rename 테스트가 같은 응답 객체를 자기 자신과 비교해 **실패할 수 없었다**
4. "전체 그래프 pass 는 더하는 것이 아니라 교체하는 것"을 **두 edge 종류 중 하나에만** 적용했다

### 통과하는 negative 는 통과가 아니다

CALLS clear 를 제거해도 **처음엔 아무 테스트도 fail 하지 않았다**. 결정성 수정만으로 대부분이
덮이기 때문이다. 세 번 시도해 그것이 실제로 필요한 케이스(**정의가 새로 추가**될 때 —
낡은 edge 의 양 끝이 둘 다 unchanged 라 `removeByFile` 이 닿지 않는다)를 찾아 테스트로 만든 뒤에야
red 가 됐다.

**통과하는 negative 는 "그 수정이 불필요하다"가 아니라 "내 검사가 그 결함을 덮지 않는다"였다.**
전자로 읽었으면 필요한 수정을 되돌렸을 것이다.

### 같은 값을 여러 곳이 만들면 표식이 아니라 소유자를 만들어라

가장 비싼 결함(D1)의 근본 원인은 알고리즘이 아니라 **edge 식별 키를 네 곳이 조립했고 둘이
구분자를 다르게 썼다**는 것이었다(`\0` vs 공백). `removeByFile` 이 지운 edge 의 키가 남아
`addEdge` 가 그 edge 를 **영원히** 거부했다. 문자열을 맞추는 것이 아니라 `edgeKey()` 하나를
만들어 전부 경유시켰고, 나중에 여섯 번째 사본(`call-resolver` 의 `dedup`)도 찾아 합쳤다.

genome 이 이미 말하고 있던 것이다 — "공유 가능하면 표식보다 공유가 낫다". 표식은 사람이 기억해서
함께 고쳐야 하고, 공유는 애초에 어긋날 수 없다.

### 근거 없는 확신을 문장으로 남기지 않는다

`build.sh` 주석 초안에 "번들이 `web-tree-sitter` 를 인라인하면 gen-083 처럼 깨진다"고 썼다.
**negative 로 확인하니 깨지지 않았다** — gen-083 의 결함은 *네이티브* 모듈의 `bindings` 탐색이었고
WASM 은 그 실패를 하지 않는다. external 은 유지하되 이유를 아는 것으로 바꿨다(npm 이 보장하는
통상 해석 경로, 번들 0.11 MB 감소). "인라인하면 깨진다"는 **입증되지 않았고 그렇게 적지 않았다.**

같은 규율을 문서 12곳의 `status` 예시에도 적용했다 — 재현되지 않는 수치를 최신값으로 갱신하는 것은
답이 아니다(다음 커밋에 또 틀린다). **예시임을 명시**하고 실제 커밋을 가리키지 않게 했다.

### 검사의 범위를 좁히면 기준이 통과로 바뀐다

계획의 C6 은 `grep -rn daemon src/` 였는데 검증에서 `--include='*.ts'` 를 붙여 돌렸다.
**그 좁힘이 실패할 기준을 통과시켰고**, 놓친 두 파일은 `install-skills` 와 `reap update` 마다
사용자 홈에 배치되는 agent 정의였다. 그 안에 `?file=` — 전임 daemon 의 대표적
"문서에만 있고 실행된 적 없는" 오류 — 가 그대로 있었다.

**기준은 적힌 명령 그대로 돌려야 한다.** 그리고 사람이 기억해야 하는 절차는 검사로 만든다
(`shipped-docs-no-daemon.test.ts`).

## Project Diagnosis (adapt phase)

정량 점수 없이 현재 상태를 서술한다.

| 기준 | 상태 |
|---|---|
| **Core functionality** | 동작한다. lifecycle 5단계·merge·early-close·abort 가 88세대에 걸쳐 실사용됐고, 이번 세대가 code intelligence 를 본체로 들여왔다 |
| **Architecture stability** | 안정적. adapter dispatcher / transition graph + nonce / 파일 기반 상태는 여러 세대 동안 형태가 바뀌지 않았다. 이번 변경도 새 layer 를 만들지 않고 기존 CLI·core 경계 안에 들어갔다 |
| **Modularity** | 양호. `src/indexer/` 12모듈이 각각 한 가지를 하고, `core` 는 `cli` 를 import 하지 않는 규약이 유지된다 |
| **Test coverage** | 불균등. e2e 는 두텁고(326) **이식된 indexer 모듈의 unit 이 비어 있다** — `pickBestTarget`·`removeEdgesOfKind` 가 e2e 두 케이스로만 덮인다 |
| **Error handling** | 양호. 모든 CLI 출력이 JSON 이고 error 도 exit 0 이다. 이번 세대에 `.gitignore` 쓰기 실패가 예외 대신 보고로 바뀌었다 |
| **Documentation** | 두텁다. README 5개국어 + docs 사이트 5로케일 + guide + migration note. 문서 게이트가 로케일 drift 를 막는다 |
| **Build/Release** | 성숙. CI(매 push) / reap-test(전체 스위트) / release(문서·버전하한·자기진단) 3층. 이번에 `daemon-v*` 파이프라인이 사라져 단순해졌다 |
| **Dependency health** | **개선됐다.** 네이티브 의존 0. production 은 `yaml` + `web-tree-sitter` 둘 |
| **Observability** | **이번 세대의 핵심 개선.** `reap index status` 의 해석률이 "결과가 말이 되는가"를 처음으로 관측 가능하게 만들었다 |
| **Visual verification** | 해당 없음 (CLI 도구) |

### Embryo → Normal 전환 판단

88세대. **조건은 충족돼 있다** — application.md 는 여러 세대째 형태가 안정적이고, abort 는 최근
거의 없으며, vision/goals.md 에 실행 가능한 항목이 있다.

**그러나 이번 세대가 반대 근거를 하나 더 만들었다.** genome 을 두 곳 고쳤다 —
`application.md` 의 "zero dependency" → "zero *native* dependency"(설계 원칙 자체의 정정),
`evolution.md` 에 게이트 규율과 evaluator 라운드 규칙 추가. normal 이었다면 둘 다 backlog 를
거쳐 다음 세대에나 효력이 생겼을 것이고, **"개수를 지키느라 기능을 밖으로 밀어낸다"는 원칙이
한 세대 더 살아 있었을 것이다.**

**전환을 제안하지 않는다.** 사용자 판단(2026-03-26)의 근거 — "REAP 자신이 self-evolving 중이라
예기치 못한 genome 변경이 더 있을 수 있다" — 가 이번 세대에 그대로 재현됐다.
판단 시점은 여전히 "사용자가 명시 검토할 때"다.

### environment/summary.md 크기 — 이번에 한 것과 남긴 것

**한 것**: daemon 절 전체 삭제 / 처방적 서술(게이트 규율)을 `genome/evolution.md` 로 이관 /
죽은 예시를 담고 있던 절 3개 압축 / Tests baseline 갱신.

**남은 것**: 342 → 334줄 (가이드라인 250). 새 subsystem 이 들어온 만큼이 순증이라
**더 자르면 정확한 서술을 잃는다.**

**제안 — 다음 세대의 판단거리**: `## Source Structure` 트리 113줄은 `.reap/` 구조가 정의한
**`environment/source-map.md`(on-demand)** 의 내용이다. 현재 그 파일은 존재하지 않고 트리가
always-loaded 인 summary 에 있다. 옮기면 250 아래로 내려가고 아키텍처 정의와도 맞는다.
**다만 모든 세션의 기본 컨텍스트에서 소스 구조가 빠지는 변경이라 사람이 결정할 일이다** —
그래서 이번 세대가 임의로 하지 않았다.

## Next Generation Hints

> backlog 는 만들지 않는다 (adapt 규칙). 아래는 인간이 판단할 후보다.

### 1. plugin 전환 시 `reap uninstall` 은 어떻게 바뀌어야 하는가 (gen-088 fitness 요구사항)

사용자가 gen-088 fitness 에서 명시 요구한 항목이다.

현재 `reap uninstall` 은 **REAP 이 홈에 무엇을 썼는지 스스로 알고** 지운다 —
adapter 별 `removeUserLevelAssets` + `~/.reap/` allowlist + `settings.json` 의 개별 hook 필터.
plugin 배포로 가면 이 지분이 셋으로 갈린다:

- **클라이언트가 소유하는 것** — plugin 설치/제거는 클라이언트 명령(`claude plugin uninstall` 등)이
  한다. REAP 이 지우면 **클라이언트의 레지스트리와 어긋난다**. `reap uninstall` 은 이 부분을
  **지우지 말고 명령을 안내**해야 한다.
- **REAP 이 여전히 소유하는 것** — `~/.reap/` (guide, install-stamp), 프로젝트의 `.reap/`.
  이건 그대로 남는다.
- **경계가 모호한 것** — SessionStart hook. plugin 이 hook 을 등록하면 클라이언트 소유,
  REAP 이 `settings.json` 을 직접 쓰면 REAP 소유. **어느 쪽인지가 전환 설계의 산출물이어야 한다.**

**전환기가 진짜 문제다.** 0.17.x 로 설치한 사용자와 0.18 plugin 사용자가 공존하고,
전자는 홈에 흩어진 파일을, 후자는 plugin 디렉토리를 갖는다. `reap uninstall` 은 **둘 다** 처리하거나,
"구 자산 정리"를 별도 경로로 남겨야 한다 — 이번 세대가 `~/.reap/daemon/` 에 한 것과 같은 모양이다
(`reap update` 가 조용히 치우고, `uninstall` 도 명단에 유지).

**검사도 함께 바뀌어야 한다**: 자기진단 §8 은 지금 "19 command + 2 agent 가 사라졌는가"를 센다.
plugin 이면 셀 대상이 다르다. **숫자를 고치는 것이 아니라 무엇을 세는지를 다시 정해야 한다.**

### 2. IMPORTS/CALLS 를 넘어선 정확도 — call resolution 이 여전히 이름 기반이다

이번 세대가 import 해석을 0% → 100% 로 올렸고 `pickBestTarget` 에 import-aware tier 를 넣었지만,
**call resolution 은 근본적으로 이름 매칭**이다. 이 저장소에 이름 중복 심볼이 23개 있다(`execute` ×39).
evaluator 측정으로 참조 1583 중 56이 모호하다.

관련 backlog 2건을 신설했다(community detection / process tracing 재설계). 둘 다 **선결 조건이
call resolution 품질**이라고 적어 두었다. `vision/design/daemon/scip-and-scale.md` 의 SCIP 보류
결정은 유지된다 — 재검토 조건도 그 문서에 있다.

### 3. 이식된 모듈에 unit test 가 없다 (evaluator 지적)

폐기한 daemon 스위트 130 중 약 32개가 **삭제가 아니라 이식된** 모듈의 unit test 였다.
`pickBestTarget` 3-tier 규칙과 `removeEdgesOfKind` 는 지금 **e2e 두 케이스로만** 검증된다.
e2e 는 느리고 실패 시 원인을 좁혀주지 않는다.

### 4. shard 전환 임계 — 숫자는 이미 측정돼 있다

`manifest.json` 이 배치를 소유하므로 전환은 한 곳에서 끝난다. backlog 의 실측표가 임계를
**5만~10만 노드**로 지목한다. evaluator 가 지적한 대로 **`refs`+`specifiers` 가 스냅샷의 절반이 넘고
질의도 그것을 로드하므로 첫 shard 후보**다. 지금은 2.4 ms 라 무관하다.

### 5. 게이트 §5 가 incremental 을 건드리지 않는다

fixture 를 한 번만 커밋하므로 두 번째 `index update` 는 `up-to-date` 다.
이번 세대의 blocker 넷 중 셋이 incremental 경로였고, **게이트는 전부 통과시켰을 것이다.**
`lsof` 단언이 `command -v` 없이 fail-open 인 것도 같은 절에 있다.
