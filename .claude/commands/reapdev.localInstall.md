---
description: "Local Install — 로컬 빌드 후 글로벌 설치 (테스트용)"
---

# Local Install

로컬 소스를 빌드하고 글로벌에 설치합니다. 배포 전 테스트용.

## Steps

1. `npm run build`
2. `npm uninstall -g @c-d-cc/reap`
3. `npm install -g "file:$(pwd)"`
4. 설치 확인: `reap --version` (0.16.0+dev.{hash} 형태여야 함)
