---
type: task
status: consumed
consumedBy: gen-144-e63e59
---

# localInstall이 nvm 경로가 아닌 .npm-global에 설치되는 문제

## 문제

`npm install -g`가 `.npm-global/lib/node_modules/`에 설치되지만, `which reap`는 nvm 경로(`~/.nvm/versions/node/v22.22.0/bin/reap`)를 가리킴. 결과적으로 `reap` 바이너리가 업데이트되지 않음.

## 원인

nvm 사용 환경에서 `npm config prefix`가 `.npm-global`로 설정되어 있어 글로벌 설치 경로가 nvm bin 경로와 다름.

## 수정 방향

`.claude/commands/reapdev.localInstall.md` 스킬에서 nvm 환경 감지 후 올바른 prefix로 설치:
- `which reap`의 경로에서 prefix를 역산
- 또는 `NPM_CONFIG_PREFIX=$(dirname $(dirname $(which node)))` 사용
