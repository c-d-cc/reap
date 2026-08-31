# 2 — v0.18 차단 이중화

## 무엇을

- v0.18 `package.json`에 `"reap": { "autoUpdateMinVersion": "0.18.0" }` — 0.17의 check-version이 latest의 이 필드를 읽는다(승격 사고 시 자동 설치 대신 blocked)
- 배포 정책 문서(v0.18의 docs/): **0.18은 latest로 올리지 않는다. `next` 태그로 발행하고, latest 승격은 별도 결정** + §9 대가(신규 사용자가 구버전을 받는 기간) 명시

## 함정

- 이 "reap" 필드는 v0.18 코드가 읽는 값이 아니라 **0.17 사용자용 신호**다 — v0.18 쪽에 소비자가 없다고 지우면 차단이 사라진다. 주석/문서로 이유를 남긴다

## 완료 판정

package.json 필드 존재 + 정책 문서 커밋. bun test 회귀 없음
