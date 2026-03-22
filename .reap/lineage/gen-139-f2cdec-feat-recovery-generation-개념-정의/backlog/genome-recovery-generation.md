---
type: genome-change
status: consumed
consumedBy: gen-139-f2cdec
---

# Recovery Generation 개념을 Genome에 반영

## 대상 파일 및 변경 내용

### 신규: domain/recovery-generation.md
- Recovery generation 정의, 트리거 조건, 프로세스, artifact 규칙
- evolve.recovery 명령어 흐름
- 검토 기준 3가지 (artifact 간 불일치, 구조적 결함, 사람 지정)
- stage 목적 비교 (normal vs recovery)

### 수정: constraints.md
- Slash Commands 목록에 `reap.evolve.recovery` 추가
- GenerationType에 `"recovery"` 추가 언급

### 수정: domain/lifecycle-rules.md
- recovery type의 stage 전환 규칙 추가
- `recovers` 필드 설명

### 수정: source-map.md
- evolve-recovery.ts 컴포넌트 추가
