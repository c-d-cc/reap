---
name: loop-to-flux
description: Use once, in a project that started on REAP v0.18 before loop was renamed to flux, to move its existing loop artifacts over. Renames life/loops and archive/loops, the record files, the sequence registry, and every loop-NNNN-<type> id the records reference. Shows what it will change and applies nothing until you say so. Trigger on "loop-to-flux", "loop을 flux로", or a project whose .reap/ still has life/loops/.
---

# loop-to-flux — 일회용 이주

**배포하지 않는다.** 마켓플레이스에도 `plugin/skills/`에도 없다. 사람이 직접 지정해 그 프로젝트에서 한 번 돌린다. 끝나면 이 디렉토리는 지워도 된다.

## 무엇이 바뀌었나

REAP v0.18에서 **plan 축의 단위 이름이 `loop`에서 `flux`로 바뀌었다.** `loop`은 명시적인 순환을 뜻하는데 그 단위가 실제로 하는 일은 기획을 증진하는 것이라 이름이 일을 잘못 가리켰다. 그리고 `loop`이라는 낱말은 다른 개념(ralph, 진짜 무한 루프)이 쓰도록 비웠다.

**하위 호환이 없다.** 새 바이너리는 `make loop`·`mark loop`를 모르고, `life/loops/`를 읽지 않으며, `loop-0001-plan`을 id로 인정하지 않는다. 그래서 옛 데이터는 손대지 않으면 **끊긴 참조**가 된다 — `doctor`가 결함으로 잡는다.

## 언제 쓰나

`.reap/life/loops/`나 `.reap/archive/loops/`가 아직 있으면 쓴다. 없으면 할 일이 없다.

## 절차

### 1. 먼저 멈춘다

```bash
git status --porcelain     # 비어 있어야 한다
```

**되돌릴 수 없는 일이다.** 미커밋 변경이 있으면 그것부터 정리한다 — 이 스크립트가 바꾼 것과 원래 있던 것을 나중에 못 가른다. 열린 세대가 있으면 그것도 먼저 닫는다.

### 2. 무엇을 바꿀지 본다

```bash
node <이 디렉토리>/migrate.mjs --root "$(git rev-parse --show-toplevel)"
```

옮길 파일과 고칠 파일을 전부 낸다. **아무것도 바꾸지 않는다.**

목록을 사람에게 그대로 보인다. 볼 것 셋이다.

- `life/loops/`·`archive/loops/`의 기록이 전부 나오는가
- `sequence/loop.md`가 나오는가
- 고칠 목록에 그 loop을 `from:`으로 가리키는 milestone이 들어 있는가

### 3. 사람의 동의를 받는다

**동의 없이 `--apply`를 치지 않는다.** 묻는 법은 [interview](../../../plugin/skills/interview/SKILL.md)다.

### 4. 적용한다

```bash
node <이 디렉토리>/migrate.mjs --root "$(git rev-parse --show-toplevel)" --apply
```

### 5. 확인하고 커밋한다

```bash
reap doctor          # 결함 0 이어야 한다
reap ctx             # 열린 flux가 제 이름으로 나오는가
```

`doctor`가 끊긴 참조를 내면 **그것을 고치기 전에는 커밋하지 않는다.** 스크립트가 못 본 자리가 있다는 뜻이다 — 어디인지 사람에게 말한다.

```bash
git add -A && git commit -m "chore: loop을 flux로 — REAP v0.18 이름 변경에 맞춘다"
```

## 무엇을 바꾸지 않나

- **slug는 안 바꾼다.** `gen-0047-exec-loop-도구.md` 같은 이름은 그대로 둔다 — slug는 이름표이지 키가 아니고, 그 세대가 실제로 loop 도구를 만든 것은 사실이다
- **리포의 코드와 문서는 안 본다.** `.reap/` 아래만 본다. 프로젝트 소스에 `loop`이라는 낱말이 있으면 그것은 이 스크립트의 일이 아니다
- **`reap` 바이너리를 갱신하지 않는다.** 새 바이너리는 따로 설치한다

## 막히면

- `.reap/ 가 없다` → `--root`가 리포 루트를 가리키는지 본다
- 고칠 목록이 비었는데 `life/loops/`가 있다 → 파일이 `.md`가 아니다. 손으로 본다
- 적용 뒤 `doctor`가 끊긴 참조를 낸다 → 되돌리려면 `git checkout -- .reap`. 1에서 트리를 깨끗이 해두는 이유가 이것이다
