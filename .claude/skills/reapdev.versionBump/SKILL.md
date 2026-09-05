---
name: reapdev.versionBump
description: Use when developing REAP itself and a release is being prepared - analyzes changes since the last release tag, proposes patch/minor/major, bumps every version statement (package.json, plugin.json, RELEASE_NOTES.md, site release notes), runs the version and package gates, and leaves tag+push to the human. Trigger on "versionBump", "버전 올리자", "릴리즈 준비", "bump".
---

# versionBump — 릴리즈 하나를 준비한다

REAP를 만드는 사람만 쓴다. **여기서 하는 것은 bump 커밋까지다.** 태그와 push는 사람이 결정하고, 그 앞에 서 있는 게이트가 전부 초록이어야 한다.

## 0. 문서가 먼저다

bump 전에 [docsUpdate](../reapdev.docsUpdate/SKILL.md)를 돌린다. 문서가 코드와 어긋난 채로 릴리즈 노트를 쓰면 노트가 문서를 가리키고 문서가 옛것을 말한다. docsUpdate가 "변경 없음"이거나 사람 확인을 받은 뒤에만 1로 간다.

## 1. 마지막 릴리즈 이후의 변경

```bash
git describe --tags --abbrev=0 --match 'v[0-9]*.[0-9]*.[0-9]*'   # 마지막 릴리즈 태그
```

**`--match 'v*'`로는 안 된다** — 이 리포에는 `v0.18_autorun` 같은 릴리즈가 아닌 `v` 태그가 실재한다. 기준점이 틀리면 아래 분석이 통째로 어긋난다. v0.18 브랜치에서 처음 bump할 때 기준은 `v0.17.7`이고, 그 뒤부터는 직전 `v0.18.x`다.

```bash
git log <tag>..HEAD --oneline
awk -v d="$(git log -1 --format=%cs <tag>)" -F'|' '{c=$4; gsub(/ /,"",c)} c > d' .reap/sequence/generation.md   # 그 뒤의 세대
```

세대 기록의 **Outcome**을 읽는다 — `archive/generations/`(닫힌 것)와 `life/generations/`(열린 것). 커밋 메시지보다 거기에 "사용자에게 무엇이 달라졌는가"가 있다.

## 2. 분류와 제안

| 유형 | 무엇 |
|---|---|
| **patch** | bugfix, 성능, 내부 리팩토링, 문서, 스킬 텍스트만 바뀜 |
| **minor** | 새 명령·플래그·이벤트·skill, 기존 기능 확장 (하위 호환) |
| **major** | 저장 규약이 바뀜, 명령이 사라짐, 이주가 필요함 |

**plugin skill만 바뀌어도 bump다.** 플러그인은 `plugin.json`의 `version`으로 갱신 여부를 판단한다 — 버전이 같으면 마켓플레이스가 새 파일을 내려주지 않는다(localUpdate가 재설치를 쓰는 이유가 그것이다). CLI가 안 바뀌었어도 skill이 바뀌었으면 patch는 올려야 사용자에게 닿는다.

사람에게 보인다:

```
현재 버전: 0.18.0
마지막 태그: v0.17.7
변경 사항:
- ...
추천: patch → 0.18.1
```

그리고 묻는다 — patch / minor / major / skip. **skip이면 여기서 끝이다.**

## 3. bump — 버전을 말하는 곳 넷을 전부

| 어디 | 무엇 | 누가 읽나 |
|---|---|---|
| `package.json` `version` | `npm version <type> --no-git-tag-version` | npm, `reap --version` |
| `plugin/.claude-plugin/plugin.json` `version` | 같은 값으로 손으로 | 마켓플레이스 — 이게 다르면 플러그인이 갱신되지 않는다 |
| `RELEASE_NOTES.md` | 맨 위에 `## v<new>` 블록 **추가** | `release.yml`이 **첫 `## ` 블록만** 잘라 GitHub release 본문으로 발행한다 |
| `site/src/i18n/translations/<locale>.ts` `releaseNotes` | `version`·`summary`·`changed`·`removed`·`goodToKnow`를 새 버전 것으로 | reap.cc 릴리스 노트 페이지 |

`package.json`의 `reap.autoUpdateMinVersion`은 **올리지 않는다** — 0.17 사용자의 자동 갱신 floor이고 소비자는 0.17 쪽이다([release-policy](../../../docs/release-policy.md)). 새 버전이 이 값보다 낮으면 게이트가 막는다.

### 릴리즈 노트에 무엇을 쓰는가 — RELEASE_NOTES.md와 사이트 둘 다

**REAP를 쓰는 사람에게 실제로 의미 있는 것만 쓴다.** 기준은 하나다: *"이 사람이 이걸 읽고 무언가를 하거나, 하지 않던 것을 할 수 있게 되는가?"* — 아니면 뺀다.

**쓴다**: 새 명령·플래그·설정·skill·이벤트 / 동작이 달라진 것 / 사용자가 해야 할 일(`npm i -g @c-d-cc/reap@next`, 플러그인 갱신, `/reap:migrate`) / breaking change / 조용히 망가져 있던 것이 이제 동작한다는 사실.

**쓰지 않는다**: 문서 사이트 내부(라우팅·prerender·로케일) / 왜 망가졌는지의 서사 — 고쳐졌다는 사실만 / 게이트·테스트·CI·리팩토링 / 세대 번호와 그 세대가 겪은 것 / issue 번호 나열(링크 하나면 된다).

**분량**: 한 버전이 한 화면을 넘지 않게. 넘으면 거의 항상 위의 "쓰지 않는다"가 섞인 것이다. **CLI가 안 바뀐 릴리즈면 그렇게 쓴다** — "CLI는 달라진 것이 없습니다. 플러그인 skill만 갱신됐습니다" 한 줄이 정직하다.

`RELEASE_NOTES.md` 형식은 기존 `## v0.18.0` 블록을 따른다 — 한 줄 요약, `**Changed**`·`**Removed**` 목록, 필요하면 `### Coming from v0.17`·`### Good to know`. 사이트 쪽 문체는 [docsUpdate](../reapdev.docsUpdate/SKILL.md)의 규칙(합니다체, 사용자 관점)대로.

**사이트 릴리스 노트 페이지는 한 버전 구조다** (`version` 하나, `changed`/`removed` 목록). 여러 버전을 쌓는 페이지로 바꾸는 것은 사이트 구조 변경이라 사람 검토를 받는다 — 그 전까지는 최신 버전 하나를 보여 주고 이전 버전은 `RELEASE_NOTES.md`(GitHub)에 있다고 `sourceNote`가 말한다.

커밋:

```bash
git add package.json plugin/.claude-plugin/plugin.json RELEASE_NOTES.md site/src/i18n/translations/
git commit -m "chore: v<new> <type> bump"
```

## 4. 게이트 — 커밋 뒤, 태그 앞

```bash
bash scripts/check-release-version.sh   # 넷이 같은 버전을 말하는가 · floor 위인가
bash scripts/verify-package.sh          # npm pack → 임시 prefix 설치 → Bun 없는 PATH에서 명령 전부
bash scripts/check-docs-prerender.sh    # 사이트 릴리스 노트를 고쳤으면 — 라우트별 정적 html이 나오는가
bash tests/hook.test.sh                 # SessionStart 훅이 어떤 경우에도 exit 0
```

`check-release-version.sh`는 `release.yml`의 `npm publish` 앞에서도 돈다 — 여기서 건너뛰면 태그를 push한 뒤에 배포가 막힌다. 되돌리기가 번거로우니 이 시점에 통과시킨다.

> **왜 스크립트인가**: v0.17.1 때 지시문에 "5개 로케일을 갱신하라"가 있었는데도 누락됐고, 그 전에는 en/ko만 갱신해 로케일마다 changelog가 달랐다. 지시문은 막지 못한다. 실행 가능한 검사가 막는다.

플러그인 쪽은 [localUpdate](../reapdev.localUpdate/SKILL.md)로 재설치해 `claude plugin list`에 새 버전이 보이는지 본다. 헤드리스 agent를 띄우는 v0.17의 통합 게이트는 v0.18에 없다 — skill은 파일이고, 파일이 캐시에 복사됐는지가 곧 노출이다.

## 5. 태그와 push — 사람의 결정

여기서 멈추고 묻는다: "`v<new>` 태그를 만들고 push할까요?" push 전 사람 확인은 세션을 넘어 유효한 규칙이다 — 자율 모드에서도 건너뛰지 않는다.

yes면:

```bash
git tag v<new> && git push origin <branch> v<new>
```

`release.yml`은 `v0.18.*` 태그에서 돈다 — 브랜치는 상관없다. npm은 **`--tag next`**로 나간다(latest 승격은 별도 결정). 그 뒤 마켓플레이스: `~/cdws/ctod-plugins`에서 `plugins/reap` submodule 포인터를 그 태그로 옮기고 `python3 tools/validate_marketplace.py` 뒤 커밋·push — 이것도 사람 확인이다.

**v0.18.0 첫 발행은 순서가 있다.** 0.17.8이 먼저 latest에 있어야 한다. 절차는 `.reap/archive/milestones/ms-019-v018-verify-release/handoff.md`에 있다 — 이 스킬은 그 순서를 대신하지 않는다.

no면: "태그를 건너뜁니다. 나중에: `git tag v<new> && git push origin <branch> v<new>`"라고 남기고 끝.
