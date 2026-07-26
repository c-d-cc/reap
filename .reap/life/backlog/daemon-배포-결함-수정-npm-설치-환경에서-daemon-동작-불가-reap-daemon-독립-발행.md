---
type: task
status: pending
priority: high
createdAt: 2026-07-26T03:26:55.570Z
---

# daemon 배포 결함 수정 — npm 설치 환경에서 daemon 동작 불가 + reap-daemon 독립 발행

> **착수 시점: 0.17.2 릴리즈 이후.** 유저 결정(2026-07-26) — 0.17.2 는 issue #21(pruning policy) 범위로 마감하고, daemon 관련 작업은 그 다음 세대부터. 본 backlog 는 daemon 트랙의 **선행 조건**이며, `reap-daemon-개선-검토-...md`(SCIP 검토)보다 먼저 처리해야 한다.

## Problem

**npm 으로 설치한 사용자는 `daemon: true` 를 켜도 daemon 을 전혀 쓸 수 없다.** 실패가 전부 silent-fail 로 감싸여 있어 에러도 나지 않고 조용히 아무 일도 일어나지 않는다.

### 재현 (2026-07-26, 실제 실행 확인)

```bash
$ npm i @c-d-cc/reap@0.17.1
added 3 packages in 1s

$ ls node_modules/@c-d-cc/
reap
reap-daemon -> reap/daemon        # 심링크

$ ls node_modules/@c-d-cc/reap-daemon/
ls: No such file or directory     # 끊긴 심링크
```

### 원인 — 4개 사실의 조합

| 사실 | 확인 방법 |
|---|---|
| `dependencies` 에 `"@c-d-cc/reap-daemon": "file:./daemon"` 선언 | `npm view @c-d-cc/reap@0.17.1 dependencies` |
| `package.json` 의 `files` 에 `daemon/` **없음** — `dist/`, `scripts/postinstall.sh`, `README.md`, `RELEASE_NOTICE.md` 뿐 | `package.json` |
| 발행 tarball 53개 파일 중 daemon 항목 **0개** | `npm pack --dry-run --json` |
| `@c-d-cc/reap-daemon` 이 npm registry 에 **미발행** | `npm view @c-d-cc/reap-daemon` → **E404** |

npm 은 `file:./daemon` 선언을 보고 `node_modules/@c-d-cc/reap-daemon → reap/daemon` 심링크를 만들지만, tarball 에 `daemon/` 이 없어 **대상 없는 링크**가 된다.

그리고 `src/cli/commands/daemon/client.ts:70-76`:

```ts
function resolveDaemonBin(): string {
  try { return require.resolve("@c-d-cc/reap-daemon/dist/index.js"); }
  catch { return join(__dirname, "..","..","..", "daemon","dist","index.js"); }
}
```

- 1차 경로 → 끊긴 심링크라 실패
- 폴백 경로 → **소스 트리 기준 상대경로**. npm 설치 환경에는 존재하지 않음

`ensureDaemon` (`client.ts:41-58`) 이 이 경로로 spawn 을 시도하고 3초 대기 후 throw 하지만, **4개 lifecycle 진입점(start / learning / implementation complete / completion commit)이 전부 silent-fail 로 감싸여 있어** 사용자에게 아무것도 보이지 않는다.

### 영향 범위

- gen-060 / 068 / 069 에서 구축한 daemon 기능 **전체가 배포판에서 무효**. 자동 인덱싱 4개 지점, `lastIndexedCommit` staleness, agent prompt 의 Code Intelligence 절(`buildBasePrompt` 이 `config.daemon === true` 시 주입) 모두 실체가 없는 안내가 된다
- agent 는 prompt 에 적힌 대로 `curl localhost:17224` 를 시도하고 실패 → 헛수고
- **0.17.1 이 이미 배포된 상태**이므로 현재 진행형 결함

### 왜 지금까지 드러나지 않았나

본 repo 가 소스 트리에서 dog-fooding 중이라 `resolveDaemonBin` 의 **폴백 경로가 항상 맞는다**. 즉 개발 환경에서만 동작하는 dev-only 기능이었고, gen-069 의 daemon e2e 21개도 소스 트리에서 `bun src/index.ts` 를 직접 spawn 하는 helper(`tests/helpers/daemon.ts`)를 쓰므로 이 갭을 통과한다.

**교훈 후보(adapt 에서 판단)**: e2e 가 "소스 트리에서의 동작"만 검증하고 **배포 산출물(tarball)에서의 동작**을 검증하지 않으면 이 계열 결함은 계속 빠져나간다. gen-064 의 "e2e 가 일부 entry point 만 cover" 교훈과 같은 구조.

## Solution

### 방향 — daemon 을 npm 에 독립 발행 (진짜 분리)

세 안을 검토한 결과:

- **A. `files` 에 `daemon/` 추가해 번들** — 기각. daemon 소스 + wasm 이 모든 사용자 tarball 에 들어가고 `better-sqlite3` 네이티브 빌드가 **전원에게 강제**된다. 현재 잘 지켜지고 있는 zero-dependency(실측: npm 설치 시 `yaml` 만 설치됨, better-sqlite3/tree-sitter 미설치)를 스스로 깨는 선택. SCIP 도입 시 인덱서까지 붙으면 더 악화
- **B. `optionalDependencies` 로 이동** — 기각. `file:./daemon` 대상이 tarball 에 없는 건 그대로라 **여전히 설치되지 않는다**. 실패가 조용해질 뿐 daemon 은 계속 불가
- **C. npm 독립 발행 + `dependencies` 에서 제거** — **채택**

### C 채택 근거

- daemon 은 이미 opt-in 이고 기본 off. 기본 경로가 네이티브 모듈을 지고 갈 이유가 없다
- 릴리즈 주기가 이미 분리돼 있다 (reap 0.17.1 / daemon 0.1.0) — 실질적으로 다른 물건인데 배포만 묶여 있었다
- SCIP 방향으로 가면 daemon 이 더 무거워지므로, 번들 방향으로 결정하면 되돌리는 비용이 커진다
- 인프라가 이미 있다 — spawn / health check / 3초 타임아웃 / 전 호출부 silent-fail. **미설치를 감지해 안내하는 분기 하나만 추가**하면 된다

### S1. `@c-d-cc/reap-daemon` npm 발행

- daemon 의 `package.json` 정비 — `files`, `bin`(필요 시), `engines`, `publishConfig.access: public`
- 버전 정책 결정 필요: reap 버전과 **연동할지 독립할지** (Open Decision)
- 발행 자동화 — `.github/workflows/release.yml` 에 daemon publish 단계 추가할지, 수동 발행할지

### S2. reap 의 `dependencies` 에서 daemon 제거

- `package.json` 에서 `"@c-d-cc/reap-daemon": "file:./daemon"` 삭제 → `yaml` 만 남음 (environment/summary.md 의 "yaml v2 — 유일한 production dependency" 서술이 비로소 정확해진다)
- `resolveDaemonBin` 을 3단계로: (1) `require.resolve` (사용자가 설치한 경우), (2) 소스 트리 폴백(dev), (3) **둘 다 실패 → 미설치로 판정**

### S3. 미설치 시 UX — silent-fail 을 깨야 하는 유일한 지점

daemon 의 silent-fail 정책은 "daemon 이 죽어 있어도 lifecycle 을 막지 않는다"는 올바른 원칙이다. 그러나 **`daemon: true` 인데 패키지 자체가 없는 것**은 "일시적 장애"가 아니라 **설정과 환경의 불일치**이므로 조용히 넘기면 안 된다.

- `daemon: true` + 미설치 감지 → **1회 명확한 안내** (설치 명령 제시). lifecycle 은 계속 진행
- 매 호출마다 반복 출력하지 않도록 억제 (세션당 1회 등 — 설계 필요)
- `reap daemon install` 서브커맨드 신설 검토 (`daemon/index.ts` 에 start/stop/status/query 가 이미 있음)
- `reap fix --check` 에 "daemon: true 인데 미설치" 진단 추가 검토

**오프라인/폐쇄망 고려**: opt-in 시점에 네트워크가 필요해진다. 명시 명령 + 명확한 에러로 감당 가능한 수준이며, 현재처럼 조용히 아무 일도 안 일어나는 것보다 낫다. 사전 설치 안내를 문서에 포함.

### S4. 배포 산출물 검증 — 재발 방지

원인의 핵심은 **소스 트리에서만 검증했다**는 것이다. 다음 중 하나 이상 도입:

- `npm pack` 결과물을 실제로 설치해 `reap daemon status` 가 의미 있는 응답을 내는지 확인하는 e2e (tarball 설치 e2e)
- `.github/workflows/release.yml` 의 publish 전 검증에 포함 — **issue #21 backlog 의 `scripts/check-docs-version.sh` 와 같은 게이트 지점**이므로 함께 설계하면 중복이 없다
- 최소한: `npm pack --dry-run` 결과에 daemon 관련 파일이 기대대로 있는지/없는지 assert

## Files to Change

- `package.json` — `dependencies` 에서 `@c-d-cc/reap-daemon` 제거
- `daemon/package.json` — 발행 준비 (`files`, `publishConfig`, 버전 정책)
- `src/cli/commands/daemon/client.ts` — `resolveDaemonBin` 3단계화 (L70-76), `ensureDaemon` 의 미설치 분기 (L41-58)
- `src/cli/commands/daemon/index.ts` — `install` 서브커맨드 (채택 시)
- `src/cli/commands/daemon/lifecycle.ts` — `ensureRegistered` / `triggerIndexing` 의 미설치 시 안내 1회 노출 (silent-fail 정책과의 경계 설계)
- `src/core/integrity.ts` + `src/cli/commands/fix.ts` — "daemon: true 인데 미설치" 진단 (채택 시)
- `.github/workflows/release.yml` — daemon publish + tarball 검증
- `.reap/environment/summary.md` — daemon 배포 구조 갱신 (dependency 관계 변경)
- `src/templates/reap-guide.md` + `.reap/reap-guide.md` — § Code Intelligence 에 설치 요구사항 명시 (현재는 "opt-in 하면 동작한다"고만 되어 있어 사실과 다름)
- `docs/src/i18n/translations/*.ts` — daemon 설치 안내 (5개 로케일)
- 테스트 — tarball 설치 e2e (신규), 기존 daemon e2e 21개는 소스 트리 기준이므로 유지

## Verification

1. **재현부터**: 수정 전 `npm i @c-d-cc/reap@0.17.1` → `ls node_modules/@c-d-cc/reap-daemon/` 가 끊긴 링크임을 확인 (본 backlog 의 근거 재확인)
2. 수정 후 `npm pack` → 임시 디렉토리에 설치 → `npm i @c-d-cc/reap-daemon` → `daemon: true` 프로젝트에서 `reap daemon status` 가 **정상 응답**
3. daemon 미설치 + `daemon: true` → **명확한 안내 1회** 출력, lifecycle 은 정상 진행 (block 되지 않음)
4. daemon 미설치 + `daemon: false`(또는 미설정) → **출력 byte-identical**, 안내 없음 (회귀 0)
5. `npm i @c-d-cc/reap` 후 `node_modules` 에 `better-sqlite3` / `tree-sitter-*` 가 **없음** (zero-dependency 유지 확인)
6. 기존 daemon e2e 21개 회귀 없음 (소스 트리 spawn 방식 유지)
7. `.reap/environment/summary.md` 의 dependency 서술이 실제와 일치

## Open Decisions

- [ ] daemon 버전 정책 — reap 과 연동(0.17.2 ↔ 0.17.2)할지, 독립(0.1.0 → 0.2.0)할지. 연동하면 호환성 판단이 쉽고, 독립하면 불필요한 재발행이 없다
- [ ] 미설치 시 자동 설치를 시도할 것인가, 안내만 할 것인가 — 자동 설치는 편하지만 사용자 동의 없는 네트워크/설치 행위
- [ ] `reap daemon install` 서브커맨드를 만들 것인가, 안내 문구로 `npm i -g @c-d-cc/reap-daemon` 만 제시할 것인가
- [ ] tarball 설치 e2e 를 CI 에 상시 둘 것인가, release 게이트에만 둘 것인가 (설치 e2e 는 느리다)
- [ ] `daemon/` 을 본 repo 에 유지할 것인가, 별도 repo 로 분리할 것인가 — 발행만 분리하고 코드는 monorepo 유지가 무난해 보이나 명시 결정 필요

## Related

- `reap-daemon-개선-검토-scip-등-code-indexing-도구-조사-enterprise-규모-대응력-평가.md` — **본 backlog 가 선행**. SCIP 검토는 "분리된 daemon"을 전제로 설계해야 한다
- `release-직전-문서-버전-일치-검증-reapcc-문서-갱신.md` — S4 의 release 게이트가 같은 지점. 함께 설계하면 중복 없음
