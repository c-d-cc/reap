# Planning

## Summary
`reapdev.localInstall.md` 스킬의 `npm install -g` 명령에 `NPM_CONFIG_PREFIX` 환경변수를 추가하여 활성 node의 prefix에 설치되도록 수정한다.

## Technical Context
- **Tech Stack**: 해당 없음 (Markdown 스킬 파일 수정)
- **Constraints**: 기존 6단계 흐름 유지, step 3만 변경

## Tasks
- [x] T001 `.claude/commands/reapdev.localInstall.md` -- step 3의 `npm install -g` 앞에 `NPM_CONFIG_PREFIX=$(dirname $(dirname $(which node)))` 환경변수 추가

## Dependencies
없음 (단일 태스크)

