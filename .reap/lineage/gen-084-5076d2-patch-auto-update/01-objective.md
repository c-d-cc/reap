# Objective

## Goal

reap.update: patch 버전 자동 업데이트 — 유저 확인 없이 바로 실행

## Completion Criteria
1. patch 버전 업데이트(x.y.Z만 변경) 시 유저 확인 없이 자동으로 Step 3(Perform Update)로 진행
2. minor/major 버전 업데이트 시 기존대로 유저 확인 요청
3. `bun test`, `bunx tsc --noEmit`, `npm run build` 모두 통과

## Requirements

### Functional Requirements
- Step 2에서 installed < latest일 때 semver 비교로 patch/minor/major 구분
- patch 업데이트: "Patch update: v{installed} -> v{latest}" 표시 후 자동 진행
- minor/major 업데이트: 기존 "Update available" 메시지 + 유저 확인 유지

### Non-Functional Requirements
- 기존 동작(installed == latest, Step 3, Step 4)에 영향 없음
- 슬래시 커맨드 템플릿(영어) 유지

## Design
- `reap.update.md`의 Step 2 "If installed < latest" 블록에 분기 추가
- patch 판별: major, minor가 동일하고 patch만 다른 경우
- 분기 1 (patch): 유저 확인 스킵, 바로 Step 3 진행
- 분기 2 (minor/major): 기존 유저 확인 flow 유지

## Scope
- **Related Genome Areas**: conventions.md (Template Conventions), constraints.md (Slash Commands)
- **Expected Change Scope**: `src/templates/commands/reap.update.md` 1파일
- **Exclusions**: CLI 소스 코드 변경 없음, 테스트 변경 없음

## Genome Reference
- conventions.md: 소스 템플릿은 영어 유지
- constraints.md: Slash Commands 목록에 reap.update 포함


## Backlog (Genome Modifications Discovered)
None

## Background

현재 `/reap.update` slash command는 모든 버전 업데이트에 유저 확인을 요청. patch 업데이트(x.y.Z)는 확인 없이 자동 실행하도록 변경. minor/major는 기존대로 유저 확인 필요.
