---
type: task
status: consumed
consumedBy: gen-026
---
# OpenCode 플러그인 autoUpdate PATH 문제 조사

OpenCode 세션 시작 시 autoUpdate가 동작하지 않는 문제. OpenCode 플러그인 내에서 `npm`/`reap` 명령어의 PATH가 사용자 쉘과 다를 수 있음. PATH 주입 또는 절대 경로 사용 검토 필요.
