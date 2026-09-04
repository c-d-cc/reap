# 설치

REAP는 두 가지를 따로 설치한다 — CLI 바이너리와 Claude Code 플러그인. 둘 중 하나만 있어도 정상 상태다.

## CLI

```bash
npm i -g @c-d-cc/reap@next
```

npm `next` 태그로 나간다. `latest`가 아니므로 `@next`를 붙여야 한다.

## Claude Code 플러그인

```bash
claude plugin marketplace add c-d-cc/plugins
claude plugin install reap@ctod-plugins
```

## 확인

```bash
reap --version
```

새 Claude Code 세션을 열면 `/reap:` skill 10종이 보이고, 세션 시작 시 상태 줄이 뜬다. 둘 다 안 보이면 플러그인 설치가 안 된 것이다.

## 제거

```bash
claude plugin uninstall reap@ctod-plugins
npm rm -g @c-d-cc/reap
```

프로젝트에서 REAP를 걷어내려면:

```bash
rm -rf .reap
```

## v0.17에서 왔다면

v0.17.7 이하는 세션 시작 시 자동 갱신으로 0.17.8이 된다. 0.17.8에서 `reap update`를 치면 upgrade agent가 설치되고, 그 agent가 v0.18 CLI와 플러그인을 설치한 뒤 `/reap:migrate`로 넘긴다. `migrate` skill이 데이터를 옮기고, 원본은 `.reap-v0_17/`에 그대로 보존한다 — 되돌릴 수 있다.

다음은 [첫 사용](/quick-start)으로.
