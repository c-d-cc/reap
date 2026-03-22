# Recovery Generation

> 기존 generation의 산출물에 오류·불일치가 발견되었을 때, 정정된 흐름으로 검토·교정하는 특수 generation 타입.

## 정의

Recovery generation은 `type: recovery`를 가지는 generation으로, 하나 이상의 기존 generation을 대상으로 산출물을 검토하고 교정한다. `recovers` 필드에 대상 generation ID 목록을 기록한다.

## 트리거 조건

`/reap.evolve.recovery <target-gen-id> [, <target-gen-id>...]` 명령어로 시작. 검토 결과 교정이 필요한 경우에만 recovery generation이 생성된다.

## 검토 기준 (3가지)

1. **Artifact 간 불일치**: 동일 generation 내 artifact 간 내용 모순 (예: objective와 implementation의 설계 불일치)
2. **구조적 결함**: artifact의 누락 섹션, 불완전 내용, 형식 오류
3. **사람 지정 교정**: 사용자가 직접 지정한 교정 사항

## 프로세스

```
/reap.evolve.recovery gen-XXX
  → 대상 generation lineage artifact 로드
  → 3가지 기준으로 검토 수행
  → 교정 사항 발견 → recovery generation 자동 개시 (type: recovery)
  → 교정 사항 없음 → "no recovery needed" 종료 (generation 미생성)
```

## evolve-recovery 명령어 흐름

1. **review phase**: 대상 generation의 lineage artifact를 로드하여 검토 기준 3가지로 분석
2. **create phase**: 교정 사항 발견 시 `createRecoveryGeneration()` 호출하여 recovery generation 개시. objective에 원본 objective + completion 자동 인용 및 검토 결과 요약 포함

## Artifact 규칙

- Recovery generation은 normal generation과 동일한 5개 artifact를 생성한다
- Objective에 대상 generation의 원본 objective + completion을 인용한다
- `recovers` 필드는 `current.yml`과 `meta.yml` 모두에 기록된다

## current.yml 확장

```yaml
type: recovery
recovers:
  - gen-XXX-hash
parents:
  - gen-YYY-hash  # DAG 부모는 기존 규칙 유지
```

`parents`는 DAG 구조 유지, `recovers`는 교정 대상을 별도로 참조.

## Stage 목적 비교

| Stage | Normal | Recovery |
|-------|--------|----------|
| Objective | 새 목표 정의 | 정정된 목표/설계 재정의 (원본 인용 + 검토 결과) |
| Planning | 태스크 분해 | 검토 대상 파일/로직 목록 + 검증 기준 |
| Implementation | 코드 작성 | 기존 코드 검토 & 교정 |
| Validation | 검증 | 교정 후 검증 |
| Completion | 회고 | 회고 + 원본 generation에 대한 정정 기록 |

## 기타

- 기존 normal/merge generation에 영향 없음
- lineage 압축 시 recovery generation도 동일 규칙 적용
