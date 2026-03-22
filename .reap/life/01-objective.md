# REAP MANAGED — Do not modify directly. Use reap run commands.
# Objective

## Goal
`npm install -g`이 nvm이 관리하는 경로가 아닌 `~/.npm-global`에 설치되어, `which reap`가 가리키는 nvm 경로의 바이너리가 갱신되지 않는 문제를 수정한다.

## Completion Criteria
1. `reapdev.localInstall.md`의 `npm install -g` 명령이 활성 node와 동일한 prefix에 설치한다
2. nvm, volta, fnm 등 어떤 node 버전 매니저에서도 올바르게 동작한다
3. 기존 빌드/팩/삭제/확인 흐름은 유지된다

## Requirements

### Functional Requirements
1. FR-1: `NPM_CONFIG_PREFIX=$(dirname $(dirname $(which node)))`를 사용하여 활성 node의 prefix로 설치

### Non-Functional Requirements
1. NFR-1: 다른 단계(build, pack, rm, version check, update)는 변경하지 않는다

## Design

### Approaches Considered

| Aspect | Approach A: NPM_CONFIG_PREFIX 환경변수 | Approach B: --prefix 플래그 |
|--------|-----------|-----------|
| Summary | 환경변수로 prefix 오버라이드 | npm install -g --prefix 사용 |
| Pros | 깔끔, 한 줄 변경 | 명시적 |
| Cons | 없음 | -g와 --prefix 조합 시 동작 불안정 |
| Recommendation | **선택** | |

### Selected Design
`NPM_CONFIG_PREFIX=$(dirname $(dirname $(which node))) npm install -g ./c-d-cc-reap-*.tgz`

### Design Approval History
- 사용자가 태스크 설명에서 Approach A를 직접 지정

## Scope
- **Related Genome Areas**: 없음 (프로젝트 소스가 아닌 개발자 스킬 파일)
- **Expected Change Scope**: `.claude/commands/reapdev.localInstall.md` — 1파일 1줄 변경
- **Exclusions**: 빌드 스크립트, CLI 소스코드, 테스트

## Genome Reference
해당 없음 (genome 외부 파일 변경)

## Backlog (Genome Modifications Discovered)
None

## Background
`npm config prefix`가 `~/.npm-global`로 설정된 환경에서 nvm이 PATH에 자체 prefix를 삽입하면, `npm install -g`의 설치 경로와 `which reap`의 경로가 불일치하여 로컬 설치가 반영되지 않는다.

