# reap v0.16.0 Spec 2 — Post-Core 고도화

> spec1(reap-se-spec.md)의 핵심 기능이 gen-026~042에서 완성됨. 이 문서는 남은 고도화 작업을 정의.
> 작업 대상: ~/cdws/reap/ (branch: v0.16.0)

## 0. 핵심 원칙: Clarity-driven Interaction (구체화 수준에 따른 소통 자동 조절)

> 모든 stage, 모든 유저 대면 상황에서 적용되는 기본 원칙.

### 원칙
AI의 interaction level은 **현재 맥락의 구체화(clarity) 수준**에 의해 자동으로 결정된다.

| Clarity Level | 상태 | AI Interaction |
|---------------|------|----------------|
| **High** | 목표 명확, 세부사항 정의됨, 다음 할 일 분명 | 간단 확인 후 실행. 질문 최소화. |
| **Medium** | 방향은 있으나 세부사항 미정의 | 선택지 제시 + 트레이드오프 설명. 유저가 판단할 재료 제공. |
| **Low** | 목표 모호, 다음 할 일 불명확 | 적극적 interaction — 질문, 예시, 보기 제시. 유저와 함께 구체화. |

### 적용 범위
- **learning**: 프로젝트 상태 파악이 불충분하면 더 많이 탐색하고 질문
- **planning**: 목표가 명확하면 바로 task 분해, 모호하면 brainstorming 세션
- **adapt**: vision이 갖춰져 있으면 gap 기반 제안, 없으면 유저와 방향 논의
- **evolve**: clarity 높으면 자율 실행, 낮으면 매 stage에서 확인

### Clarity 판단 기준
- vision/goals.md 존재 + 구체적 goal 정의 → high
- backlog에 clear task 있음 → high
- genome이 아직 불안정 (embryo, 잦은 수정) → low
- lineage가 짧고 방향 미확정 → low
- 유저 피드백에 "잘 모르겠다", "고민 중" 등 → low

### 구현
- evolve prompt에 clarity-driven interaction 원칙 주입
- 각 stage handler prompt에 "assess clarity before proceeding" 가이드
- evolution.md 기본 내용에 이 원칙 포함

## 1. Git 연동 강화

### 1.1 Generation commit 자동화 ✅ (gen-043)

### 1.2 Restart = git reset + 임시 diff backup
- `reap run restart` 시:
  1. uncommitted 파일의 diff를 모아서 임시 파일에 저장 (`.reap/restart-backup-{timestamp}.diff`)
  2. `git reset --hard` to last completion commit
  3. 새 generation 시작
  4. 사용자가 restart 이후 작업을 승인하면, backup diff 삭제
  5. backup이 필요하면 `git apply`로 복원 가능
- **임시 backup** — archiving 대상 아님. 용도가 끝나면 삭제.

### 1.3 reap.push 구현 ✅ (gen-043)

## 2. 성숙도 시스템

### 2.1 Embryo → Normal 전환 제안

adapt phase에서 AI가 genome 수정 빈도 + 종합 판단 후 전환 제안. generation 수에 따른 적극성 차이:

| Generation 수 | 수준 | 동작 |
|---------------|------|------|
| ≤ 5 | **Soft** | AI가 조건 충족 시 전환 제안 *가능* (강제 아님). 충분히 명확하다고 판단하면 제안. |
| 6~9 | **Hard** | 매 adapt에서 반드시 체크. 조건 충족 시 전환 제안. |
| ≥ 10 | **Mandatory** | 무조건 전환 제안. embryo를 10세대 넘게 유지하는 건 비정상. |

전환 제안 시 AI가 판단 근거를 제시 (최근 N세대 genome 수정 횟수, application.md 안정도 등).
최종 결정은 인간 승인.

### 2.2 성숙도별 prompt 톤 + Clarity 연동

성숙도와 §0의 clarity level이 결합하여 AI의 소통 방식이 결정됨.

| 성숙도 | 기본 톤 | Clarity와의 관계 |
|--------|---------|-----------------|
| **Bootstrap** (embryo) | 협업자 — 질문 60, 제안 40 | clarity가 낮을 확률 높음 → 적극 interaction이 자연스러움 |
| **Growth** (normal, 초~중기) | 주도자 — 질문 30, 제안 70 | vision 있으므로 gap 기반 제안 가능 |
| **Cruise** (normal, cruise mode) | 자율 — 질문 10, 제안 90 | clarity 높아야 cruise 진입 가능 |

#### Bootstrap 상세
- 전체 소스 + lineage 스캔하며 "소프트웨어 완성 기준"과 비교
- 부족한 기준들을 유저와 interactive하게 채워나감
- 구체화 과정을 유저가 인식할 수 있도록 충분히 소통
- "지금 이런 것들이 부족합니다. 이것부터 정해볼까요?" 스타일

#### Growth 상세
- 전체 스캔 불필요 — vision/goals.md + lineage 기반
- 현재 기준에 미흡한 것을 식별하고, gap을 채우기 위한 상세 정의/지시를 유저에게 가이드
- "vision에 X가 있는데, 현재 Y까지 됐고, 다음에 Z를 하면 gap이 좁혀집니다" 스타일

#### 구현
- evolve prompt에 성숙도 + clarity 가이드 주입
- 각 stage handler에도 maturity context 전달

### 2.3 소프트웨어 완성 기준 사전 정의

AI가 프로젝트의 "완성"을 판단하기 위한 기준점 (최소 10개). Bootstrap에서 유저와 함께 구체화.

**사전 정의 기준 (초기 내장):**
1. Core functionality — 핵심 기능이 동작하는가
2. Architecture stability — 아키텍처가 안정적으로 완성되었는가
3. Modularity — 코드 확장을 위한 공통화, 모듈화가 충분한가
4. Error handling — 에러 처리가 적절한가
5. Test coverage — 테스트가 충분한가
6. Documentation — 사용자/개발자 문서가 있는가
7. Security — 기본 보안 요건을 충족하는가
8. Performance — 성능이 허용 범위 내인가
9. Deployment readiness — 배포 가능한 상태인가
10. Code quality — 코드 품질/컨벤션이 일관적인가
11. User experience — 사용자 경험이 수용 가능한가
12. Visual verification (UI apps) — UI가 있는 경우, 사용자가 실제 화면을 확인하며 시각적으로 검증했는가
13. Integration layer — 타 시스템과 연계가 있는 경우, 연계 공통 레이어/로직 구현이 충분한가
14. Domain maturity — 프로젝트가 요구하는 도메인 기능의 spec(environment)과 impl(code)이 갖춰져 있는가
15. Governance compliance — governance guideline이 있는 경우, 충분히 준수하였는가
16. Genome stability — genome(application, evolution, invariants)이 안정적인 것으로 충분히 검증되었는가 (단순 존재가 아닌, generation을 거치며 증명)

- 이 기준은 genome/evolution.md에 포함
- Bootstrap에서 AI가 이 기준으로 현재 상태를 진단하고, 유저와 소통하며 프로젝트에 맞게 customize
- 모든 기준에 "현재 수준" + "목표 수준"을 유저와 정의

## 3. Gap-driven Evolution 고도화

### 3.1 adapt에서 목표 제안 — Clarity 연동

**Clarity High** (목표 명확):
- vision/goals.md + backlog 확인 → 간단 확인 후 다음 backlog 선택

**Clarity Medium** (방향은 있으나 세부 미정):
- vision + lineage 분석 → gap 식별 → 선택지 제시 ("A, B, C 중 어떤 gap을 먼저?")

**Clarity Low** (다음 할 일 불명확):
- 유저와 interaction 늘림 — 현재 상태 요약 → "어떤 방향으로 가고 싶으세요?" → 구체화 대화
- §2.3의 완성 기준으로 현재 상태 진단 → 부족한 영역 제시

### 3.2 Vision 연동 강화
- adapt에서 vision/goals.md 체크 상태 자동 업데이트
- 완료된 goal은 adapt에서 체크 마킹

## 4. Lineage Compression Level 2 ✅ (gen-043)

## 5. Self-Hosting 준비

### 5.1 전환 조건 체크리스트
- [ ] core lifecycle 안정적 동작 (외부 테스트 프로젝트에서 검증)
- [ ] reap 자신의 `.reap/` 구조 보유
- [ ] validation에서 자기 CLI 명령어 검증 가능
- [ ] 인간 승인

### 5.2 Self-hosting invariants
- core lifecycle 보호 규칙을 invariants.md에 추가
- stage 순서, nonce 검증, commit 전략 등 core 로직 보호

### 5.3 점진적 전환
- Phase 2 진입 시: 안전한 영역부터 (prompt 개선, environment 구조)
- 문제 없으면 범위 확대 (lifecycle 로직, genome 구조)
- rollback: git reset to last completion commit

## 6. Agent Client 확장

### 6.1 OpenCode adapter
- skill 파일 구조 + session hook 방식이 다름
- adapter/opencode/ 디렉토리 구조 정의

### 6.2 Codex CLI adapter
- 동일한 adapter 패턴

## 7. 배포 & 운영

### 7.1 E2E 테스트 강화 ✅ (gen-043)

### 7.2 npm 배포 준비
- **README**: v0.15의 톤 기반으로 새로 작성 (영어 우선, 최종 컨펌 후 다국어)
  - Installation section 다음에 "Breaking Changes from v0.16" 섹션
  - reap이 "self-evolving pipeline"으로 바뀌었다는 요약 + docs 링크
- **docs**: "Self Evolving" 가이드 — v0.16에서 무엇이 달라졌는지, 사용 방법
- .npmignore / files 정리
- CI/CD (GitHub Actions)

### 7.3 Update Agent
> 의존: 7.2 (npm 배포) 완료 후 진행

#### Update 경로 2가지

**경로 A: `/reap.update` (AI agent 내)**
1. `npm update -g @c-d-cc/reap` 실행 → 새 버전 설치 (기존 reap 패턴 계승)
   - breaking change 시: `npm install -g @c-d-cc/reap@{version}` (forceUpgrade)
2. **새 버전의 update agent가 즉시 실행** → 마이그레이션 수행
3. 결과 리포트

**경로 B: `npm update -g @c-d-cc/reap` (터미널에서 직접)**
1. 패키지만 업데이트됨, 프로젝트에는 미적용
2. 다음 AI agent 세션 시작 시 **session init hook**에서 버전 불일치 감지
3. 설치된 CLI 버전 vs `.reap/config.yml`의 `lastCliVersion` 비교
4. 불일치 시 update agent 자동 실행

#### 버전 추적: `lastCliVersion` in config.yml
- `.reap/config.yml`에 `lastCliVersion: "0.16.0"` 필드 관리
- session init hook에서: 설치된 version vs lastCliVersion 비교
- 불일치 → update agent 실행 → lastCliVersion 갱신

#### Update agent 역할
- `.reap/` 구조 마이그레이션 + `lastCliVersion` 갱신
- Breaking change 감지 및 자동 적용
- deprecated skill 안내
- 마이그레이션 결과 리포트

#### 핵심 원칙
- 항상 **새 버전의 코드**가 마이그레이션을 수행 (v-1 문제 원천 차단)
- 어떤 경로로 업데이트하든 update agent가 반드시 동작
- 마이그레이션은 멱등(idempotent) — 여러 번 실행해도 안전

#### 기존 reap 0.15 update 시스템 참조
- `selfUpgrade()`, `forceUpgrade()`, `updateProject()`, `MigrationRunner`, `detectMigrationGaps()`
- v0.16.0에서는 이 구조를 계승하되 v-1 문제 해결 원칙 강화

---

## 완료된 항목

| 항목 | Gen | 비고 |
|------|-----|------|
| 1.1 Generation commit 자동화 | gen-043 | completion commit에서 auto git commit |
| 1.3 reap.push 구현 | gen-043 | active gen 없을 때만 push |
| 4.1 Level 2 compression | gen-043 | 100+ → epoch.md |
| 7.1 multi-gen E2E | gen-043 | 34 assertions |

---

## 우선순위

| 순위 | 항목 | 비고 |
|------|------|------|
| 1 | §0 Clarity-driven Interaction | 모든 것의 기반 원칙 — evolve prompt + evolution.md에 반영 |
| 2 | §1.2 Restart = git reset + backup | safety 정책 확정됨 |
| 3 | §2.1~2.3 성숙도 시스템 | 전환 제안 + 톤 + 완성 기준 |
| 4 | §3.1~3.2 Gap-driven evolution | clarity 연동 adapt |
| 5 | §7.2 npm 배포 준비 | README + docs + CI |
| 6 | §7.3 Update Agent | 7.2 이후 |
| 7 | §5 Self-hosting | 궁극적 목표 |
| 8 | §6 Agent client 확장 | 당장 불필요 |
