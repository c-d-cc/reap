---
description: "Version bump — 변경 분석 후 bump 유형을 제안, 유저가 최종 결정"
---

# Version Bump

## Steps

### Pre-check: Docs Consistency Gate

version bump 전에 `/reapdev.docsUpdate` 스킬을 실행하여 문서 일관성을 확인하라.
- `/reapdev.docsUpdate`를 실행
- 불일치가 발견되면 먼저 수정하고 유저 확인을 받아라
- 문서가 최신 상태임이 확인된 후에만 아래 Step으로 진행

0. **배포 산출물 일관성 검증** (bump 실행 전 필수):

   아래 cross-check를 수행하고, 불일치가 하나라도 있으면 목록을 유저에게 보여준 뒤 "계속 진행 / 중단" 선택을 받는다. 모두 통과하면 "모든 검증 통과" 메시지를 출력하고 Step 1로 진행한다.

   a. **README ↔ Genome**: 핵심 개념, 커맨드 목록, 워크플로우가 genome과 일치하는지
   b. **reap.help.md ↔ 실제 스킬**: help topic 목록이 `src/adapters/claude-code/skills/reap.*.md`와 일치하는지

1. 마지막 릴리스 태그 이후 변경사항 분석:
   - `git describe --tags --abbrev=0`으로 마지막 태그 확인
   - `git log {tag}..HEAD --oneline`으로 커밋 목록 확인
   - `.reap/lineage/`에서 해당 기간 generation들의 01-objective.md 스캔

2. 변경 유형 분류:
   - **patch**: bugfix, 성능 개선, 내부 리팩토링, 설정 변경, 문서 수정
   - **minor**: 새로운 기능 추가, 기존 기능 확장 (하위 호환)
   - **major**: breaking change, API 변경, 대규모 구조 변경

3. 분석 결과를 유저에게 제시:
   ```
   현재 버전: v{current}
   마지막 태그: v{tag}
   변경 사항:
   - [변경 1]
   - [변경 2]

   추천: {patch/minor/major} bump → v{next}
   ```

4. 유저에게 질문: "patch / minor / major / skip 중 선택해주세요"

5. 유저가 선택하면:
   - `npm version {type} --no-git-tag-version` 실행
   - RELEASE_NOTES.md 갱신 (**추가가 아니라 승격 구조**):

     이 파일은 `.github/workflows/release.yml` 의 `body_path` 로 지정되어 **GitHub release body 로 그대로 발행**된다. 최상단 `## What's New` 가 곧 이번 릴리즈의 본문이며, 버전 번호가 적혀 있지 않다.

     a. 기존 `## What's New` 본문을 그 아래 `## v{직전버전}` 섹션으로 **승격**(이동)한다
     b. `## What's New` 를 이번 버전 내용으로 새로 채운다
     c. 마지막 태그 이후의 `.reap/lineage/` 를 시간순 스캔해 각 generation 의 01-learning.md(Goal)과 05-completion.md(Summary)에서 변경 내용을 파악
     d. 형식:
        ```
        ## What's New

        - **[주요 변경 1]** — [사용자 관점 설명]
        - **[주요 변경 2]** — [사용자 관점 설명]

        ---

        ## v{직전버전}
        [승격된 이전 내용]
        ```
     e. Breaking change 가 있으면 What's New 안에 명시

     승격을 빠뜨리면 GitHub release 가 **직전 버전 내용으로 발행**된다. Step 5-1 의 검사가 이를 잡는다.
   - RELEASE_NOTICE.md 업데이트:
     a. 파일 상단 (`# Release Notices` 아래, 기존 첫 번째 `## vX.Y.Z` 위)에 새 버전 섹션 추가
     b. 형식:
        ```
        ## v{new}
        ### en
        [영문 1-2줄 요약]
        ### ko
        [한국어 1-2줄 요약]
        ```
   - docs release notes 페이지 업데이트:
     a. `docs/src/i18n/translations/` 아래 5개 파일 (en, ko, ja, de, zh-CN)
     b. 각 파일의 `releaseNotes.versions` 배열 맨 앞에 새 엔트리 추가:
        ```
        { version: "{new}", notes: "[해당 언어로 변경 요약]" },
        ```
   - `git add package.json RELEASE_NOTES.md RELEASE_NOTICE.md docs/src/i18n/translations/ && git commit -m "chore: v{new} {type} bump"`

5-1. **문서 일관성 검증** (커밋 후, 태그 전 — 필수):

   ```bash
   bash scripts/check-docs-version.sh
   ```

   이 스크립트가 `RELEASE_NOTICE.md` / `RELEASE_NOTES.md` / 5개 로케일이 `package.json` 과 일치하는지, **로케일 간 항목 집합이 동일한지**까지 검사한다. non-zero exit 면 태그를 만들지 말고 지적된 항목을 먼저 고쳐라.

   같은 스크립트가 `.github/workflows/release.yml` 의 `npm publish` 앞에서도 실행되므로, 여기서 건너뛰면 태그를 이미 push 한 뒤에 배포가 막힌다 — 되돌리기가 번거로우니 이 시점에 통과시켜라.

   > **왜 이 단계가 있는가**: v0.17.1 릴리즈 때 Step 5 에 5개 로케일 갱신 지시가 이미 있었는데도 누락됐다. 그리고 그 이전에는 en/ko 만 갱신하고 ja/de/zh-CN 을 빠뜨려 changelog 가 로케일마다 달라진 적도 있다. 지시문만으로는 막지 못하므로 실행 가능한 검사로 대체한다.

5-2. **agent 통합 검증** (태그 전 — 권장):

   ```bash
   reap install-skills                        # 현재 소스로 갱신
   bash scripts/check-agent-integration.sh
   ```

   헤드리스 agent 를 실제로 띄워 **slash command 가 인식되는지** 확인한다. 파일이 올바른 위치에 있어도 클라이언트가 그것을 명령으로 노출하지 않으면 사용자는 REAP 을 부를 수 없다 — gen-063 이 그 상태로 릴리즈됐고 사용자가 fitness 에서 발견했다.

   **약 $0.25 가 들고 수십 초 걸린다.** CI 에는 없다(비용 + agent 응답 시간의 비결정성). `claude` 가 없으면 SKIP 을 출력하고 통과시키므로 환경에 따라 건너뛸 수 있다 — 그 경우 **검증되지 않았음**을 인지할 것.

   현재 설치된 REAP 을 검사하므로 **`reap install-skills` 를 먼저 돌려야** 소스 변경분이 반영된다.

6. **태그 생성 및 배포** (유저 컨펌 필수):
   - 유저에게 질문: "`v{new}` 태그를 생성하고 push할까요? (yes / no)"
   - yes: `git tag v{new} && git push origin main v{new}` 실행
   - no: "태그 생성을 건너뜁니다. 나중에 수동으로: `git tag v{new} && git push origin main v{new}`" 안내

7. skip 선택 시: 아무것도 하지 않음
