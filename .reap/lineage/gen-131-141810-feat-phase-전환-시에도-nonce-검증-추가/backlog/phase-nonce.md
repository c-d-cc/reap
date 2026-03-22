---
type: task
status: consumed
priority: low
consumedBy: gen-131-141810
---

# Phase 전환 시에도 nonce 검증 추가

## 검토 사항

현재 nonce는 stage 전환에만 사용. stage 내 phase 전환(work → complete 등)에는 검증 없음.
artifact 존재 검증이 gate 역할을 하고 있어 실익이 크지 않을 수 있으나, completion stage는 phase가 여러 개(retrospective → feedKnowledge → commit)이므로 순서 강제가 유의미할 수 있음.
