# Planning

## Goal

issue #21/#22 가 같은 유형("하나의 사실을 여러 곳이 아는데 일부만 갱신됨")으로 반복된 것에 대한 구조적 대책을 만든다. 두 축:

1. **자기진단 게이트** — REAP 을 실제로 설치해 `fix --check` 경고 0 을 CI·release 양쪽에서 강제
2. **carrier canary token** — 열거 대신 파일에 표식을 심어 `grep` 으로 찾게 하고, genome 을 그에 맞게 재작성

0.17.3 묶음 2/3.

## Completion Criteria

1. `scripts/check-self-diagnosis.sh` — **현재 상태에서 pass**, 의도적으로 깨뜨리면 **fail** (양방향)
2. 스크립트가 사용자 `~/.claude/`·전역 node_modules 를 **건드리지 않음**
3. `release.yml` — `npm publish` **앞**에서 실행
4. `ci.yml` — 매 push 에서 실행
5. 최소 2개 carrier 에 표식이 심어지고 `grep -rn "reap:carrier"` 로 전부 찾힘
6. `scripts/list-carriers.sh` — carrier ID 별 파일 목록 출력 + **고아 표식**(1개 파일에만 있는 ID) 탐지
7. genome § carrier 절이 **열거 → 표식 찾는 방법**으로 재작성 (adapt phase)
8. typecheck + unit/e2e/scenario 회귀 없음 (470-0 / 272-0 / 44-0)

## Background

01-learning.md 참조. 핵심:
- 선행 조건 2건 충족 (경고 0, 테스트 0 fail) — **지금이 게이트를 걸 유일한 시점**
- **`tests/` 는 private submodule** 이라 CI 에서 테스트를 못 돌린다. 자기진단은 tests/ 불필요하므로 이번 범위
- 자기진단이 과거 사고 2건(#22, gen-074 daemon 배포)을 잡는다

## Approach

### S1. 자기진단 스크립트

```bash
# scripts/check-self-diagnosis.sh
FAKE_HOME=$(mktemp -d); PREFIX=$(mktemp -d); PROJ=$(mktemp -d)

npm pack                                      # 실제 publish 대상 tarball
HOME=$FAKE_HOME npm i -g --prefix $PREFIX ./c-d-cc-reap-*.tgz

cd $PROJ && git init -q
HOME=$FAKE_HOME $PREFIX/bin/reap init selftest
HOME=$FAKE_HOME $PREFIX/bin/reap fix --check   # errors 0 && warnings 0 요구
```

**왜 `npm pack` 인가**: publish 후에만 검증되는 순환을 피한다. gen-074 가 발견한 daemon 배포 결함(`files` 에 `daemon/` 누락 → 끊긴 심링크)이 정확히 이 방식으로 잡힌다.

**왜 HOME/prefix override 인가**: `install-skills` 는 `~/.claude/commands/` 에 19개를 쓰고 postinstall 은 `~/.reap/`·`~/.claude/settings.json` 을 건드린다. 격리 없이 돌리면 **개발자 환경을 덮어쓴다.** CI 러너는 깨끗하지만 같은 스크립트가 로컬에서도 안전해야 개발 중 확인이 가능하다.

**판정**: `fix --check` 의 `context.errors` / `context.warnings` 가 모두 비어야 pass. 항목이 있으면 나열하고 non-zero exit.

### S2. carrier canary token

**형식** — 사실마다 ID 를 주고, 아는 파일마다 표식:

```ts
// reap:carrier(claude-code-commands-path)
export function claudeCodeCommandsDir(home = homedir()): string { ... }
```

```markdown
<!-- reap:carrier(memory-tier-classification) -->
```

**사용**: `grep -rn "reap:carrier(memory-tier-classification)" .` → 그 사실을 아는 모든 파일. 코드·문서·테스트·로케일을 가리지 않는다.

**초기 대상 2건**:

| ID | 아는 곳 |
|---|---|
| `claude-code-commands-path` | `adapters/claude-code/install.ts`(소유), `adapters/claude-code/index.ts`, README, docs 5로케일 |
| `memory-tier-classification` | `reap-guide.md`, `templates/evolution.md`, `run/completion.ts` reflect prompt, docs 5로케일 |

**gen-077 이 세 번째 종류를 보여줬다** — `ensureClaudeMd` 반환 union ↔ `repair.ts` 분기. backlog 작성 시점에 없던 유형이며, **"열거는 새 종류를 못 잡는다"가 backlog 자신에게도 적용됐다.** 이번엔 표식만 심고 이 사례는 genome 서술에 근거로 인용한다.

### S3. carrier 목록 스크립트

```bash
bash scripts/list-carriers.sh          # ID 별 파일 목록
bash scripts/list-carriers.sh --orphans  # 1개 파일에만 있는 ID
```

**고아 탐지가 핵심 기능이다.** 표식이 한 곳에만 있으면 (a) 불필요한 표식이거나 (b) **다른 carrier 를 빠뜨린 것**이다. 후자가 바로 #21/#22 의 상태다.

"일부 파일만 변경됨" 경고(git hook)는 **하지 않는다** — 의도적 부분 변경에서 오탐하고, 오탐하는 검사는 무시된다(gen-075 교훈).

### S4. genome 재작성 (adapt phase)

`application.md` 의 § "규칙 변경 시 carrier 4중 확인" 을 대체:

- **열거 → 판정 기준 + 찾는 방법**: "이 사실을 아는 다른 곳이 또 있는가?" → `grep -rn "reap:carrier(<id>)"`
- **SSOT 우선**: 같은 *값*을 두 코드가 알면 공유(DI·상수)로 carrier 수를 줄여라. 표식은 공유 불가능한 경우(문서·다국어·prompt 문자열·반환값 union)를 위한 것
- **gen-076/077 사례를 근거로 인용** — DI 로 푼 것과 표식이 필요한 것의 구분

## Risk Assessment

| 리스크 | 대응 |
|---|---|
| 게이트를 걸었는데 통과 못 하는 상태 | 선행 조건 충족 확인됨(경고 0). 스크립트 작성 후 즉시 실행해 확인 |
| 스크립트가 개발자 HOME 오염 | HOME/prefix override + 실행 전후 `~/.claude/commands/` 개수 비교로 검증 |
| CI 시간 증가 (`npm pack` + 설치) | 측정 후 판단. 과하면 release 에만 남기고 CI 는 소스 트리 검사만 |
| 검사가 아무것도 안 잡음 | **먼저 실패시켜라**(gen-073) — 의도적으로 경고를 만들어 fail 확인 |
| 표식이 노이즈로 인식됨 | 초기 2건만. 형식을 grep 가능한 단일 패턴으로 통일 |

## Scope

**변경 대상**
- `scripts/check-self-diagnosis.sh` (신규)
- `scripts/list-carriers.sh` (신규)
- `.github/workflows/release.yml` — publish 앞
- `.github/workflows/ci.yml` — 매 push
- carrier 표식: `adapters/claude-code/install.ts`, `adapters/claude-code/index.ts`, `core/integrity.ts`, `templates/reap-guide.md`, `templates/evolution.md`, `run/completion.ts`, docs 5로케일
- `.reap/genome/application.md` — carrier 절 재작성 (adapt)
- `reap-guide.md` ×3 — carrier 표식 사용법

**out of scope**
- **테스트를 CI 에 추가** — private submodule 접근에 PAT 필요. 유저 결정(2026-07-27)으로 **별도 backlog 분리**
- 층 2 (agent 관점 검증) — 분리된 backlog
- "일부만 변경됨" git hook 경고 — 오탐 위험

## Tasks

- [ ] T001 `scripts/check-self-diagnosis.sh` 신규
- [ ] T002 현재 상태에서 **pass 확인** + HOME 미오염 확인
- [ ] T003 의도적으로 경고를 만들어 **fail 확인** (negative test)
- [ ] T004 `release.yml` — publish 앞 게이트
- [ ] T005 `ci.yml` — 매 push
- [ ] T006 `scripts/list-carriers.sh` 신규 (목록 + `--orphans`)
- [ ] T007 carrier 표식 심기 — `claude-code-commands-path`
- [ ] T008 carrier 표식 심기 — `memory-tier-classification`
- [ ] T009 `list-carriers.sh` 로 2건 전부 찾힘 + 고아 0 확인
- [ ] T010 `reap-guide.md` ×3 — carrier 표식 절
- [ ] T011 테스트 CI 추가 backlog 생성 (분리 결정 기록)
- [ ] T012 빌드 + typecheck + 회귀 확인
- [ ] T013 genome carrier 절 재작성 (adapt phase)

## Dependencies

T001 → T002 → T003 → T004~T005
T006 → T007~T008 → T009
T012 는 전부 이후, T013 은 adapt
