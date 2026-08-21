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
   - `git describe --tags --abbrev=0 --match 'v*'` 로 마지막 **릴리즈** 태그 확인.
     `--match` 없이 쓰면 릴리즈가 아닌 태그를 잡을 수 있다 — 이 저장소에는 `v*` 가
     아닌 태그가 실재한다 (`git tag --list | grep -v '^v'`). 기준점을 잘못 잡으면
     변경 분석이 통째로 어긋난다.
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

   > ### 릴리즈 노트에 무엇을 쓰는가 — 세 문서 전부에 적용된다
   >
   > **REAP 을 쓰는 사람에게 실제로 의미가 있는 것만 쓴다.** 판단 기준은 하나다:
   > *"이 사람이 이걸 읽고 무언가를 하거나, 하지 않던 것을 할 수 있게 되는가?"* — 아니면 빼라.
   >
   > **쓴다**: 새 명령·플래그·설정 / 동작이 달라진 것 / 사용자가 해야 할 일 (`npm uninstall -g …`,
   > `reap install-skills` 재실행) / breaking change / 조용히 망가져 있던 것이 이제 동작한다는 사실.
   >
   > **쓰지 않는다**:
   > - **문서 사이트(`docs/`) 이야기.** 사이트 구조·라우팅·SEO·prerender·로케일 URL — 사용자는
   >   문서를 읽으러 오지 문서 사이트의 내부를 알고 싶어 오지 않는다. 사이트 주소가 **바뀌어**
   >   사용자의 링크가 깨지는 경우만 예외이고, 그때도 **바뀐 주소 한 줄**이지 왜 바꿨는지가 아니다
   > - **왜 망가졌는지의 서사.** "resolver 가 `./x.js` 를 `x.ts` 에 대응시키지 못했고 5개월간
   >   테스트가 초록이었다" 는 우리에게 교훈이지 사용자에게는 소음이다. **고쳐졌다는 사실**만 남긴다
   > - 내부 게이트·테스트·CI·검토 라운드·리팩토링·genome 내부 논의
   > - 세대 번호(`gen-0XX`)와 그 세대가 무엇을 겪었는지
   >
   > **분량**: 로케일 엔트리 하나가 대략 **한 화면**을 넘지 않게 한다. 넘으면 거의 항상 위의
   > "쓰지 않는다" 가 섞여 들어간 것이다. v0.17.6 이 2,533자였고 그중 사용자에게 필요한 것은
   > 3분의 1이 안 됐다.
   >
   > **사용자에게 달라진 것이 하나도 없으면 항목을 쓰지 않는다.** 억지로 채우지 마라. 다만
   > **"안 썼다"와 "잊었다"는 게이트에서 구분되지 않으므로 선언해야 한다** — `RELEASE_NOTES.md` 의
   > `## What's New` 아래에 정확히 이 한 줄을 둔다:
   >
   > ```
   > <!-- no-user-facing-change -->
   > ```
   >
   > 그러면 `check-docs-version.sh` 가 5개 로케일 항목 생략을 허용한다. **다섯 곳 전부 생략해야 한다** —
   > 하나만 빼면 로케일 동일성 검사가 잡는다. 선언이 없으면 정확 일치를 그대로 요구한다.
   > 그 검사는 gen-073 에서 **릴리즈하면서 로케일 changelog 갱신을 통째로 잊은** 사고 뒤에 생겼다.
   >
   > 애매하면 짧게라도 쓰는 쪽이 낫다 — 무언가 바뀌었는지 확신이 안 서면 대개 바뀐 것이다.

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

   **약 $0.25 가 들고 수십 초 걸린다.** CI 에는 없다(비용 + agent 응답 시간의 비결정성).

   <!-- reap:carrier(agent-integration-gate-verdicts) -->
   **답이 셋이다 — pass / FAIL / SKIP.** SKIP 은 `claude` 나 `reap` 이 없을 때, 그리고 **`/reap.start` 가 시키는 `reap run` 명령이 거부되어 agent 가 막혔을 때** 나온다. 셋 다 exit 0 이며 amber 로 "agent integration was NOT verified" 라고 말한다 — **검증되지 않았음**이지 통과가 아니다. 태그를 밀기 전에 그 문구가 나왔는지 눈으로 확인할 것.

   FAIL 이 났다면 **문구를 먼저 읽어라.** 게이트는 원인을 단정하지 않고 열거한다(슬래시 커맨드 미노출 / CLI 실패 / init 상태 / agent 조기 중단). 0.17.6 릴리즈 직전에 이 게이트가 권한 거부를 gen-063 으로 단정해 **존재하지 않는 결함을 쫓게 만들었다** — 그 릴리즈의 층2 비용 $0.53 중 $0.26 이 거기 들어갔다. 그래서 지금은 단정하지 않는다.

   **통과가 증명하는 것은 하나 반이다.** CLI 동작은 생성된 generation 이 그 자체로 증명한다. **슬래시 커맨드 노출은 아니다** — 슬래시 커맨드는 CLI 의 wrapper 라, 그것을 못 찾고 `reap run start` 를 직접 부른 agent 도 **같은 파일**을 남긴다(gen-079 1차에서 실제로 일어났다). 그 절반은 agent 가 "우회하지 말라"는 지시를 지켰다는 것에 기댄다. `@` import 로드나 SessionStart hook 발화는 **둘 다 증명하지 않는다**(`/reap.start` 는 둘 없이도 성공한다).

   현재 설치된 REAP 을 검사하므로 **`reap install-skills` 를 먼저 돌려야** 소스 변경분이 반영된다.

6. **태그 생성 및 배포** (유저 컨펌 필수):
   - 유저에게 질문: "`v{new}` 태그를 생성하고 push할까요? (yes / no)"
   - yes: `git tag v{new} && git push origin main v{new}` 실행
   - no: "태그 생성을 건너뜁니다. 나중에 수동으로: `git tag v{new} && git push origin main v{new}`" 안내

7. skip 선택 시: 아무것도 하지 않음
