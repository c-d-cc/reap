# 2 — 레퍼런스 쪽

- `skills.md` — 10종 표(README의 표와 같은 내용) + 각 절: 언제 부르는가·무엇을 하는가·부르지 않는 경우. SKILL.md 본문을 옮겨 적지 않는다 — 한 절이 열 줄을 넘으면 옮겨 적고 있는 것이다
- `cli.md` — `reap` usage 원문 + 명령마다 두 줄(무엇을, 언제)
- `hooks.md` — 이벤트 여섯, 파일 규약, 조건·순서, `make hook`, `.md`/`.sh` 차이, 실패해도 명령은 성공
- `code-index.md` — `index` 하위 명령, 언제 index고 언제 grep인가, 해석률
- `orchestrate.md` — worktree로 가른다, claim·barrier, id 발급은 조율자
- `migration.md` — v0.17에서: 0.17.8 → `reap update` → agent → `/reap:migrate` 8단계, 원본 보존, 무엇을 잃는가(01-gap "만들지 않는다" 요약)
- `release-notes.md` — `<!--@include: ../RELEASE_NOTES.md-->`가 리포 밖을 못 가리키면 빌드 스크립트가 복사

완료: `bun run site:build` dead link 0, 열두 쪽 전부 sidebar에, handoff에 "사람 검수 대기 — 검수 뒤 en 확장"
