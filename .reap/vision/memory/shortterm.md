# Shortterm Memory

## 세션 요약 (gen-079, 2026-07-28)

### gen-079: agent 관점 검증(층2) — 0.17.3 묶음 3/3 완료

backlog 는 "설계 필요, A/B/C/D 미확정"이었으나 **실측으로 A 를 확정하고 구현까지** 갔다.

`scripts/check-agent-integration.sh` — 헤드리스 `claude -p` 로 `/reap.start` 를 시키고 **`current.yml` 생성 여부로 판정**(자연어 미파싱). slash command 인식 / `@` import / hook 발화 / CLI 를 한 번에 검증.

**설계가 두 번 되돌아갔다**:
1. 격리 HOME → *"Not logged in"*. Claude Code 는 로그인을 slash command 와 같은 `~/.claude/` 에 둔다. **층2 는 격리가 애초에 불필요** — 현재 설치를 읽기만 하면 된다
2. 1차 검사가 gen-063 을 **못 잡았다** — slash command 를 지웠는데 agent 가 CLI 를 직접 실행해 통과. 프롬프트로 우회 금지 + sentinel 로 3차에 해결

검증: 게이트 4종(typecheck/자기진단/docs/층2) 전부 pass, 고아 0, unit 470-0 / e2e 272-0 / scenario 44-0.

### 다음 세션 — 0.17.3 릴리즈부터

1. **릴리즈** — 3건 완료, 노트 3세대분 보강됨. 절차:
   ```
   reap install-skills
   bash scripts/check-agent-integration.sh   # 층2 최종 확인
   reap run push
   git tag v0.17.3 && git push origin v0.17.3   # 유저 확인 필수
   ```
2. **issue #22 코멘트** — 제보자가 물은 것에만 (gen-072 때 지적받음)
3. `ci-에서-테스트-실행-...` — **PAT 발급은 사용자 작업**. 단계적 도입 계획 backlog 에 있음
4. interview 재설계 / daemon 2건

### 알아둘 것

- **층1 vs 층2**: 층1(무료·CI)은 파일 배치, 층2($0.25·릴리즈 전)는 클라이언트가 읽는가. **후자는 전자로부터 추론 불가** — gen-063 이 그 증거
- **`claude -p` 는 stdin 을 3초 기다린다** → `< /dev/null` 필수. 없으면 경고가 JSON 앞에 붙어 파싱이 깨진다
- **부수 효과가 결정적이라는 것과 목표를 증명한다는 것은 다르다** — slash command 는 CLI wrapper 라 결과가 같다
- **OpenCode adapter 는 층2 미검증** — adapter 가 둘이므로 갭도 둘

### Backlog 상태

pending 4건 (interview / daemon 2 / CI 테스트). consumed: `agent-관점-검증-층2-...` (gen-079).
