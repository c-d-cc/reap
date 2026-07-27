# Shortterm Memory

## 세션 요약 (gen-076, 2026-07-27)

### gen-076: issue #22 — install-skills/fix --check 불일치 (0.17.3)

`fix --check` 가 `install-skills` 의 정식 설치 위치를 "legacy" 로 오탐하던 문제. **본 repo 경고 19 → 0.**

경고 한 줄 삭제로 끝내지 않고 **경로를 DI 로** 넘겼다 — adapter 가 `userLevelDirs()` 로 소유하고 호출부(`fix.ts`)가 checker 에 주입. `core → adapters` 의존 없음. 앞으로 경로를 옮기면 양쪽이 함께 따라온다.

이슈는 "어느 쪽이 옳은지는 저자 판단"이라 했으나 **답이 코드 안에 있었다** — `integrity.ts` 가 자기 파일 안에서 모순(L772-774 "정식 위치" vs L715-722 "legacy"). "Phase 2" 는 `git log -S` 로 추적해 v0.15 의 `~/.reap/commands/` 이전 작업명임을 확인하고 문구를 제거했다.

검증: unit **470-0**(+9) / e2e **268-1**(+5) / scenario 44-0 / 문서 게이트 pass.

### 다음 세션

1. **0.17.3 릴리즈** — 문서 정합 완료. `git tag v0.17.3 && git push origin main v0.17.3` (**유저 확인 필수**) + issue #22 코멘트
2. **`릴리즈-자기진단-게이트-...` backlog** — **본 세대가 선행 조건이었고 충족됐다**(경고 0). 이제 "경고 0" 게이트를 걸 수 있고 canary token 설계도 여기 포함
3. 나머지: `e2e-init-repair-...`(신규) / `agent-관점-검증-층2` / interview 재설계 / daemon 2건

### 알아둘 것 — bun 의 homedir() 는 $HOME 을 무시한다

```
node: HOME 변경 → homedir() 반영
bun : HOME 변경 → homedir() 불변
```

gen-069 daemon e2e 가 HOME override 로 된 건 **child process spawn** 이라서다. in-process 단위 테스트는 `home` 을 인자로 주입해야 한다. 본 세대에서 그렇게 처리했다.

### interview 재설계 (gen-076 abort 분)

abort 된 세대의 v2 설계는 lineage 에 없다(abort 이므로). 재착수 시 backlog 문서에 **v1 가정이 그대로 남아 있음**에 주의. 확정된 방향: 고정 6각도(Motivation/Grounding/Boundary/Blast radius/Failure modes/Alternatives) + seed 고유 각도, 상태표(resolved/assumed/open)로 종료 판정, `assumed` 남용 방지 2장치.

### Backlog 상태

pending 7건. consumed: `resolve-22-...` (gen-076).
