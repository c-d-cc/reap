# Invariants

절대 제약. **사람만 수정한다.**

- REAP는 사용자의 설정 파일을 편집하지 않는다 — **`setup`이 호스트에 REAP를 등록하는 것만 예외다.** 넣은 것은 `setup --remove`가 되돌릴 수 있어야 하고, `setup`이 넣지 않은 것은 건드리지 않는다
- SessionStart 훅은 어떤 이유로도 세션 시작을 막지 않는다
- `doctor`는 보고만 하고 파일을 쓰지 않는다
