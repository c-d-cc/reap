## What's New

- **Generation ID 체계 전환**: `gen-NNN` → `gen-NNN-{hash}` — content hash 기반 전역 고유 ID. 멀티머신 환경에서 ID 충돌 방지
- **DAG Lineage**: 선형 세대 구조에서 그래프(DAG) 구조로 전환. 각 generation이 `parents` 배열로 부모를 참조
- **자동 Migration**: `reap update` 실행 시 기존 legacy lineage를 새 형식으로 자동 변환 (parent chain 자동 구성)
- **Backward Compatibility**: 구 형식(`gen-NNN`) current.yml 읽기 지원, compression regex 호환

## Generations
- **gen-042**: Generation ID hash 기반 전환 + DAG lineage + backward compatibility/migration

## Breaking Changes
- Generation ID 형식이 `gen-NNN`에서 `gen-NNN-{hash}`로 변경됨
- Lineage 디렉토리명에 hash가 포함됨 (예: `gen-042-a3f8c2-goal-slug`)
- `reap update` 실행으로 자동 마이그레이션 필요 (기존 데이터 무손실)
