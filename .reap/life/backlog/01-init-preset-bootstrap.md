# 부트스트랩 프리셋 설계

## 목표
`reap init` 시 --preset 옵션으로 genome을 자동 채움

## 설계안
```
reap init <name> --preset bun-hono-react
reap init <name> --preset node-express-react
reap init <name> --preset spring-react
reap init <name>  (프리셋 없음 → 현재처럼 placeholder)
```

### 프리셋 구조
```
src/templates/presets/
├── bun-hono-react/
│   ├── principles.md
│   ├── conventions.md
│   └── constraints.md
├── node-express-react/
│   └── ...
└── spring-react/
    └── ...
```

### 동작
1. `--preset` 지정 시 해당 프리셋의 genome 파일을 복사
2. 프리셋 없으면 기존 placeholder 복사 (현재 동작 유지)
3. 프리셋 genome에는 Tech Stack, Validation Commands, Enforced Rules가 이미 채워져 있음

## 우선순위
다음 세대 (Gen-003) 구현 예정
