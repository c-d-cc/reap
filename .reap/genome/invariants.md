# Invariants

절대 제약. **사람만 수정한다.**

- REAP는 사용자의 설정 파일(`~/.claude/settings.json` 등)을 편집하지 않는다
- SessionStart 훅은 어떤 이유로도 세션 시작을 막지 않는다
- `doctor`는 보고만 하고 파일을 쓰지 않는다
