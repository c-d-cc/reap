---
type: task
status: consumed
consumedBy: gen-013-d38c9a
consumedAt: 2026-03-25T15:55:58.900Z
priority: high
createdAt: 2026-03-25T15:41:30.625Z
---

# Test Phase 2: 테스트 구조 설계 및 실행 환경 구성

## Problem
tests/ submodule이 설정된 후, 내부 디렉토리 구조와 실행 환경을 설계해야 함.

## Solution
- tests/unit/ — bun:test 또는 vitest 기반 unit test runner 설정
- tests/e2e/ — shell script 또는 test runner 기반 e2e test
- tests/scenario/ — sandbox 환경 구성 (temp dir + reap init + lifecycle 실행)
- package.json scripts: `test:unit`, `test:e2e`, `test:scenario`, `test:all`
- CI 실행 가능한 구조

## Files to Change
- tests/package.json (또는 root package.json에 test scripts 추가)
- tests/unit/, tests/e2e/, tests/scenario/ 디렉토리 구조
