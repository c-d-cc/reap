# Implementation

## Changes
### `src/cli/commands/update.ts`
- `selfUpgrade()` 함수 추가: npm view로 최신 버전 확인 → npm update -g 실행
- `SelfUpgradeResult` 인터페이스 export

### `src/cli/index.ts`
- update command action에서 `selfUpgrade()` 먼저 호출
- description 업데이트: "Upgrade REAP package and sync..."
