# migrate 보강과 사용자 문서

## migrate — 매핑에 빠진 것 둘

ps-4b485d `04-migration-skill.md`의 매핑 아홉에 **`environment/`가 없다.** gen-0073 실물 검증도 그것을 안 잡았다 — 표본의 environment/가 씨앗에 가까웠기 때문이다. 이주 후 v0.18 `ctx`가 매 세션 `environment/summary.md`를 주입하므로, 이것을 안 옮기면 **이주한 프로젝트의 첫 세션이 빈 환경 요약을 받는다.**

| 원본 (`.reap-v0_17/environment/`) | 어디로 |
|---|---|
| `summary.md` | `.reap/environment/summary.md`로 **그대로**. 5단계 lifecycle을 전제한 문구는 genome과 같은 "이행 안내 대상" |
| `source-map.md` | `.reap/environment/source-map.md`로 그대로 (v0.18에도 선택 파일로 있다) |
| `resources/` | `.reap/environment/resources/`로 그대로 |
| `domain/` · `docs/` | v0.18에 자리가 없다 — `resources/` 아래 `domain/`·`docs/`로 옮기고 기록 파일에 적는다. 내용을 고치지 않는다 |

둘째는 **hooks**다. 지금 매핑 9는 "폐기 — 기제 자체가 사라졌다"인데 [03-hooks.md](03-hooks.md)가 그것을 뒤집는다. 대응 이벤트가 있는 훅(`onLifeStarted`→`gen.made`, `onLifeCompleted`→`gen.closed`)은 파일명만 바꿔 옮기고 `conditions/`는 그대로 복사한다. 나머지는 "대응 없음"으로 기록.

셋째는 **정합**이다. upgrade agent 3단계가 "설치된 패키지의 README를 따라 플러그인을 설치하라"고 하므로 README에 그 절이 있어야 하고, 이주 뒤 첫 세션 안내(`/reap:evolve`)까지 README·migrate 8/8·upgrade agent 5단계가 같은 말을 해야 한다.

## ctx 언어 줄

`config.language`가 있으면 상태 줄 앞에 한 줄 — "응답 언어: ko" 형태로 언어 코드를 낸다. 문장은 agent가 해석한다. 없으면 내지 않는다. v0.17 `load-context`의 Language 절과 같은 자리다.

## README

`README.md`(한국어) 하나. 영어 병기는 [05-open.md](05-open.md) Q2의 답을 따른다. 담는 것:

1. 한 문단 — REAP가 무엇인가 (ps-4f2a91 README의 한 문장)
2. 설치 — `npm i -g @c-d-cc/reap@next` · 플러그인 `claude plugin marketplace add c-d-cc/plugins` → `claude plugin install reap@ctod-plugins` · 확인(`reap --version`, 새 세션에 `/reap:` skill)
3. 첫 사용 — `/reap:init` → `/reap:evolve` → `/reap:complete`. 상태 줄이 무엇을 보여주는지
4. v0.17에서 왔다면 — `reap update`(0.17.8) → upgrade agent → `/reap:migrate`. 잃는 것(G1 표의 "만들지 않는다" 요약 — 특히 자율 실행 subagent, merge lifecycle, 다국어)
5. 명령 표면 한 표 — `reap` usage와 같은 내용을 옮겨 적지 않고 `reap`을 치라고 한다. skill 10종 한 줄씩
6. 제거 — `claude plugin uninstall reap@ctod-plugins` · `npm rm -g @c-d-cc/reap` · 프로젝트는 `rm -rf .reap`
7. 개발 — `bun test` · `bun run build` · `--plugin-dir ./plugin`

**옮겨 적지 않는다.** map.md·skill 본문·spec에 있는 것은 링크한다. README가 규범을 복제하면 어긋난다.

## 릴리스 노트

`RELEASE_NOTES.md`를 v0.17 형식(첫 `## ` 블록이 현재 버전, release.yml이 그 블록만 GitHub Release 본문으로 뽑는다)으로 둔다. 0.18.0 절은 사용자에게 의미 있는 것만 — 무엇이 바뀌었나(플러그인 배포·3단 저장소·loop/milestone/generation·doctor·index 유지), 무엇이 사라졌나(01-gap의 "만들지 않는다"), 어떻게 오나(다리·migrate).
