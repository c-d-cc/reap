---
name: negative-test-discrimination
description: When verifying a generation's tests, check which assertions can actually fail in the broken state — and cross-check the builder's reported negative-run fail counts against the test files
metadata:
  type: feedback
---

For every new test a generation adds, ask whether it can fail in the pre-fix
state. Then cross-check the builder's reported negative-run counts ("reverted X,
saw N fail") against the actual test files — the count should equal the number of
*discriminating* assertions, with regression guards and success-path tests
surviving.

**Why:** this project has already shipped an assertion that could not tell the
fixed state from the broken one — `toContain(DAEMON_BIN_ENV)` passed on a message
that ignored the very input it was meant to prove was honoured, because a generic
hint string already spelled that variable name. The genome rule *"검사를 만들 때
먼저 실패시켜라"* exists for this. A green check whose failure mode was never
observed is indistinguishable from a check that is inert.

**How to apply:** for each new test file, classify assertions as discriminating
(fail without the fix) vs guard (pass either way). Guards are legitimate — they
protect properties the fix must not break — but they are not evidence the defect
is fixed, and should not be counted as such. Matching fail counts is strong
evidence of an honest negative run; a mismatch is worth asking about.

Related: [[no-scope-expansion-in-evaluation]]
