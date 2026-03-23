---
type: task
priority: high
status: consumed
consumedBy: gen-162-616395
---

# reap make backlog 커맨드 추가

## 문제
subagent가 backlog 파일을 직접 작성할 때 frontmatter 형식이 잘못되면 (--- 구분자 누락 등)
scanBacklog()에서 type/status 인식 실패 → consume/archiving 누락.

## 해결
`reap make backlog` 커맨드 추가:
- `make`는 범용 파일 생성 커맨드 (향후 hook 등 다른 파일 생성에도 확장 가능)
- `backlog`는 make의 첫 번째 하위 대상

### 사용법
```
reap make backlog --type genome-change --priority high --title "제목" --body "내용"
```

### 구현
- `src/core/backlog.ts`에 `createBacklog()` 함수 추가
- `src/cli/commands/run/make.ts` 생성 — `make backlog` dispatch
- type 검증 (genome-change, environment-change, task만 허용)
- 올바른 YAML frontmatter 형식 보장
- 파일명 자동 생성 (kebab-case from title)

## 추가 작업
- source-map-compression-constants.md 삭제 (잘못된 형식으로 생성된 파일, 이미 적용 완료)
