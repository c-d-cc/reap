---
description: "Local Install — 로컬 빌드 후 글로벌 설치 (테스트용)"
---

# Local Install

로컬 소스를 빌드하고 글로벌에 설치합니다. 배포 전 테스트용.

## Steps

1. `npm run build`
2. `npm pack`
3. `npm install -g ./c-d-cc-reap-*.tgz --force`
4. `rm c-d-cc-reap-*.tgz`
5. `node dist/cli/index.js install-skills`
6. 설치 확인: `reap status`
