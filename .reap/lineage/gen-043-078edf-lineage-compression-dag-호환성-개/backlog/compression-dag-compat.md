---
type: task
status: consumed
consumedBy: gen-043
priority: high
title: Lineage compression DAG 호환성 개선
---

# Lineage Compression DAG 호환성

## 문제

현재 compression 로직이 DAG 구조와 호환되지 않음:

1. **meta.yml 소실**: Level 1 압축 시 디렉토리 삭제 → parents/genomeHash 정보 소실
2. **Common ancestor 탐색 불가**: 압축된 generation에서 parent chain 역추적 불가
3. **genNum 정렬 한계**: 같은 seq의 병렬 generation 존재 시 비결정적 정렬
4. **"최근 3개 보호" 의미 변화**: DAG에서는 branch별 leaf node 기준이어야 함

## 해결 방향

- Level 1 압축 시 meta.yml 정보를 .md frontmatter로 보존
- genNum → completedAt 기반 정렬로 전환
- DAG leaf nodes 기준 보호 로직
