---
type: task
status: consumed
priority: high
createdAt: 2026-08-20T15:33:57.117Z
consumedBy: gen-094-61a545
consumedAt: 2026-08-20T15:35:47.656Z
---

# daemon 서술을 사용자 대면 문서에서 전부 제거한다 — 폐기된 기능의 설치 안내와 회고가 남아 있다

> **사용자 지시 (2026-08-21)**: *"daemon 과 관련된 서술 다 지웠으면 됨. **있다가 지웠음 이런 히스토리 서술 불필요.**"*
> 즉 "폐기됐다"는 회고도 남기지 않는다. 없던 것처럼 서술한다.

## Problem

gen-089 가 daemon 을 폐기했지만 **사용자 대면 문서에는 절반만 반영됐다.** 두 종류가 남아 있다.

### (1) 살아있는 설치 안내 — 결함

`RELEASE_NOTES.md` 의 `## Daemon Setup` 절이 아직 이렇게 지시한다:

```yaml
daemon: true   # default: false
```
```bash
reap daemon start
reap daemon status
```

**`reap daemon` 명령은 존재하지 않는다.** 지금 이 안내를 따르면 실패한다.

### (2) "있다가 지웠음" 회고 — 사용자가 불필요하다고 명시

| 위치 | 내용 |
|---|---|
| `README*.md` (5개) `:335` | `**Replacing the daemon (removed in v0.17.6).**` 문단 통째 — 무엇이었고 왜 지웠는지 |
| `README*.md` (5개) `:78` | uninstall 설명의 `(what the retired daemon left behind)` |
| `src/templates/reap-guide.md` + `.reap/reap-guide.md` `:472` | `### There used to be a daemon` 절 + `:470` 의 "retired daemon" 언급 + `:392` 의 "what the retired daemon left" |
| `docs/src/i18n/translations/*.ts` (5개) | `daemonPage.retiredTitle` / `retiredDesc` / `retiredCode` |

**`reap-guide.md` 가 가장 시급하다** — `~/.reap/` 로 배포되어 **모든 세션의 agent 가 읽는다.** 폐기된 기능의 회고 5건이 매 세션 컨텍스트에 들어간다.

### (3) 과거 버전 changelog — 판단 필요

`RELEASE_NOTICE.md` 와 5개 로케일의 `releaseNotes.versions[]` 에 v0.17.5 · v0.17.0 항목이 있고, 그 내용이 **daemon 설치를 안내한다**(`npm i -g @c-d-cc/reap-daemon`). 오늘 읽는 사람에게는 **deprecated 패키지를 설치하라는 지시**다.

사용자 지시는 "다 지워라"이므로 기본은 삭제다. 다만 changelog 를 지우는 것은 **역사 기록을 바꾸는 것**이므로 planning 에서 한 번 더 판단하고 근거를 남길 것. genome 의 *"낡은 서술은 제거한다 — 갱신은 append-only 가 아니다"* 가 근거가 될 수 있다.

## Solution

**daemon 을 없던 것처럼 서술한다.** 폐기 사실조차 적지 않는다.

단, **v0.17.6 migration note (`src/templates/migration/v0.17.6.md`) 는 예외다** — 그것은 산문이 아니라 **이미 `daemon: true` 를 가진 프로젝트에 도달해야 하는 실행 지시**다. 지우면 그 사용자들이 설정과 `~/.reap/daemon/` 을 안고 남는다. 판단 근거를 artifact 에 남길 것.

`docs/src/pages/DaemonPage.tsx` 는 gen-090 이 **의도적으로 유지**했다 — 라우트 `/docs/daemon` 을 살려 기존 링크가 404 나지 않게 하고 내용을 `reap index` 로 다시 썼다. **페이지는 유지하되 회고 절만 제거**하는 것이 그 결정과 일관된다. 라우트명 변경은 링크를 깨뜨리므로 하지 않는다.

## Files to Change

- `RELEASE_NOTES.md` — `## Daemon Setup` 절 삭제, `## What's New` 및 과거 항목의 daemon 서술
- `RELEASE_NOTICE.md` — en·ko, 0.17.6 본문 + 과거 항목
- `README.md` / `README.ko.md` / `README.ja.md` / `README.de.md` / `README.zh-CN.md` — **5개 전부**
- `src/templates/reap-guide.md` **및** `.reap/reap-guide.md` — 둘은 동일해야 한다 (게이트가 검사)
- `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` — **5개 전부**, `daemonPage.retired*` 키 제거
- `docs/src/pages/DaemonPage.tsx` — 회고 절 렌더링 제거 (라우트·페이지는 유지)
- `.reap/environment/summary.md` — 남아 있으면

**제외**: `src/templates/migration/v0.17.6.md` (위 근거), `.reap/lineage/**` (역사 기록)

## 검증

- [ ] `grep -ri daemon` 이 사용자 대면 문서에서 **0건** (migration note·lineage 제외)
- [ ] `bash scripts/check-docs-version.sh` 통과 — **로케일 간 항목 집합 동일성**을 검사하므로 5개를 정확히 맞춰야 한다
- [ ] `cd docs && npx vite build` 통과 — 로케일은 TS 객체라 키를 지우면 참조가 깨진다
- [ ] `.reap/reap-guide.md` == `src/templates/reap-guide.md` (바이트 동일)
- [ ] `/docs/daemon` 라우트 살아있음 (404 방지)
- [ ] 세 스위트 baseline 유지 (unit 627 / e2e 331 / scenario 44)

## 왜 generation 인가

파일 15개 + 로케일 5개 정합성 + 두 게이트다. 로케일 drift 는 이 저장소가 **검사까지 만든** 실패 유형이고(`check-docs-version.sh`), 문서 5개 중 일부만 고치는 것이 gen-073 의 교훈이다. minor fix 로 처리할 규모가 아니다.
