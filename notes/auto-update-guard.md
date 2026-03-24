# Auto-Update Guard 구현

## 배경
- REAP에 auto-update 기능이 있는데, breaking change (major 또는 minor) 시 자동 업데이트를 차단하는 기능이 필요
- 이전 세션에서 설계 합의 완료, 구현만 남음

## 설계: `autoUpdateMinVersion`

package.json에 커스텀 필드 추가:
```json
{
  "reap": {
    "autoUpdateMinVersion": "0.15.0"
  }
}
```

auto-update 전에 `npm view @c-d-cc/reap reap.autoUpdateMinVersion`으로 확인:
- installed >= minVersion → 업데이트 진행
- installed < minVersion → 차단, "Breaking change 포함. 수동 업데이트 필요" 경고

예시:
| installed | latest | minVersion | 결과 |
|-----------|--------|------------|------|
| 0.15.13 | 0.15.14 | 0.15.0 | 업데이트 |
| 0.15.13 | 0.16.0 | 0.16.0 | 차단 |
| 0.16.0 | 0.16.3 | 0.16.0 | 업데이트 |
| 0.16.3 | 1.0.0 | 1.0.0 | 차단 |

## 구현 할일

### 1. package.json에 필드 추가
```json
"reap": {
  "autoUpdateMinVersion": "0.15.0"
}
```
현재 버전은 0.15.x이므로 초기값은 "0.15.0".

### 2. `src/cli/commands/update.ts` — `selfUpgrade()` 수정
- `npm view @c-d-cc/reap reap.autoUpdateMinVersion` 조회
- semver 비교: installed < minVersion이면 업데이트 차단
- 차단 시 SelfUpgradeResult에 blocked 상태 + 메시지 반환
- `reap update`에서 blocked일 때 경고 출력 + 수동 업데이트 안내

### 3. `src/templates/hooks/session-start.cjs` 수정
- auto-update 분기 (131번줄 부근)에서 `npm view` 체크 추가
- 차단 시 `autoUpdateMessage` 대신 경고 메시지 설정

### 4. `src/templates/hooks/opencode-session-start.js` 수정
- session-start.cjs와 동일한 로직 적용 (44번줄 부근)

### semver 비교 유틸
간단한 semver 비교 함수 필요 (외부 dep 없이):
```ts
function semverGte(a: string, b: string): boolean {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) > (pb[i] ?? 0)) return true;
    if ((pa[i] ?? 0) < (pb[i] ?? 0)) return false;
  }
  return true; // equal
}
```
session-start hook은 CJS이므로 동일 로직을 인라인으로 작성.

### 5. versionBump 스킬 업데이트
`/reapdev.versionBump` 스킬에서 breaking change 시 `autoUpdateMinVersion`을 새 버전으로 올리는 단계 추가.
