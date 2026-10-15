---
title: "nvim-edu를 만들며: 브라우저 Vim 연습장을 진짜 Neovim에 맞추기"
description: 브라우저에서 Vim·Neovim·tmux 단축키를 연습하는 nvim-edu의 제작 기록. CodeMirror Vim 에뮬레이터와 실제 Neovim 사이의 선택, nvim --headless와 동작을 비교하는 CI, 에뮬레이터 패치, vim.wasm 진짜 Vim 모드, tmux 시뮬레이터를 정리했다.
publishedAt: 2026-10-14
updatedAt: 2026-10-14
summary: 브라우저 Vim 연습기의 동작은 실제 Neovim 0.11.0과 같은 키 입력을 비교하는 테스트로 계속 맞출 수 있다.
appliesTo: CodeMirror Vim 에뮬레이터를 실제 Neovim 동작에 맞춰야 하는 브라우저 연습기
testedWith:
  - Neovim 0.11.0
sources:
  - title: nvim-edu repository
    url: https://github.com/s3onghyun/nvim-edu
  - title: nvim-edu Neovim differential test
    url: https://github.com/s3onghyun/nvim-edu/blob/main/tests/nvim-diff.mjs
tags:
  - neovim
  - vim
  - tmux
  - codemirror
  - open-source
category: tech
draft: false
---

# nvim-edu를 만들며: 브라우저 Vim 연습장을 진짜 Neovim에 맞추기

> 이 글은 같은 프로젝트를 다룬 글을 블로그용으로 다시 쓴 제작 기록이다.
> 만든 사람이 자기 레벨을 못 푼 이야기 위주의 짧은 버전은 [velog](https://velog.io/@s3onghyun/Vim-%EB%AA%BB-%EC%93%B0%EB%8A%94-DevOps%EA%B0%80-AI%EB%9E%91-Vim-%EC%97%B0%EC%8A%B5%EC%9E%A5-%EB%A7%8C%EB%93%A4%EB%8B%A4%EA%B0%80-%EB%82%B4%EA%B0%80-%EB%A7%8C%EB%93%A0-%EB%A0%88%EB%B2%A8%EC%9D%84-%EB%AA%BB-%ED%91%BC-%EC%8D%B0),
> [dev.to](https://dev.to/s3onghyun/i-can-barely-use-vim-so-i-built-a-vim-trainer-with-ai-then-i-failed-my-own-level-4aid),
> [Zenn](https://zenn.dev/s3onghyun/articles/fb0f2c16d35e24), [Qiita](https://qiita.com/s3onghyun/items/7966ac7e6a534a84f9db)에도 올렸다.

요즘은 IDE보다 터미널을 여는 날이 많다. Claude Code나 Codex 같은 에이전트를 tmux 창에 띄워 놓고 결과를 본다.
그래도 에이전트가 고친 코드를 사람이 마지막에 손보는 순간은 남아 있고, 그때 손이 가는 건 터미널 안의 Neovim이다.
문제는 내가 Vim을 잘 못 쓴다는 점이었다. `:wq`에서 거의 멈춰 있었다.

그래서 연습장을 만들었다. [nvim-edu](https://s3onghyun.github.io/nvim-edu/?ref=blog)는 설치 없이 브라우저에서 Vim·Neovim·tmux 키를 연습하는 사이트다.
[LearnGitBranching](https://learngitbranching.js.org/)처럼 목표 상태를 보여 주고, 그 차이를 키보드로 메우게 한다.
2026년 10월 13일에 첫 커밋을 했고, 처음부터 Claude Code와 같이 만들었다. 커밋 메시지에 Claude 공동 작성자 표기와 세션 링크가 남아 있다.

## 만들고 싶었던 것

| 요구 | 지금 모습 |
|------|-----------|
| 목표를 보고 차이를 메우는 방식 | 왼쪽은 내 버퍼, 오른쪽은 목표. 아직 다른 줄은 빨갛게 표시 |
| 잘 푼 정도를 숫자로 | 레벨마다 모범 답안의 키 수(par)를 두고 ★1~3 |
| 에이전트 옆에서 실제로 쓰는 상황 | 실전 챕터의 보스가 "리뷰 코멘트 반영"이고, tmux 챕터가 따로 있음 |
| 손버릇을 바로잡기 | 1장(이동)에서는 방향키와 마우스를 막고, NORMAL 모드에서 한글 IME로 치면 한/영 전환 안내 |
| Neovim처럼 보일 것 | neo-tree 사이드바, bufferline, lualine, 상대 줄 번호, `:colorscheme tokyonight` 같은 테마 전환 |

지금은 레벨 41개가 있다. 이동, 편집, 텍스트 오브젝트, 비주얼·매크로, 실전(`:%s`, `:g`), tmux, 구루 콤보 순서이고 챕터마다 초보부터 구루까지 난이도 배지를 붙였다.
레벨 사이에는 랜덤 10라운드 미션과 날짜를 시드로 쓰는 오늘의 미션이 있다.

## 가장 큰 선택: 에뮬레이터냐 진짜 Neovim이냐

브라우저에서 Vim을 돌리는 방법은 크게 두 가지다.

| 방식 | 장점 | 단점 |
|------|------|------|
| [@replit/codemirror-vim](https://github.com/replit/codemirror-vim) 같은 에뮬레이터 | 바로 뜨고 가볍다. 화면과 채점을 JS에서 마음대로 다룰 수 있다 | 진짜 Vim과 동작이 조금씩 다르다 |
| [vim.wasm](https://github.com/rhysd/vim.wasm)으로 실제 Vim 실행 | 동작이 진짜다 | 첫 로딩이 무겁고, 상태를 JS로 꺼내기 까다롭다. `SharedArrayBuffer`가 필요하다 |

연습장은 키 한 번에 바로 반응해야 해서 기본은 에뮬레이터로 갔다. [CodeMirror 6](https://codemirror.net/)에 codemirror-vim을 얹었다.
걸리는 건 "에뮬레이터가 틀리면 틀린 습관을 가르치게 된다"는 점이었다. 그래서 실제 Neovim을 정답지로 두고 차이를 계속 재기로 했다.

## 깊이 보기 1: 같은 키를 `nvim --headless`에 넣어 비교하기

`tests/nvim-diff.mjs`는 같은 키 입력을 실제 Neovim과 사이트 에디터에 넣고 텍스트, 커서, 모드를 비교한다.
케이스는 `:help`의 motion.txt, change.txt 등에서 자주 쓰는 명령과 모든 레벨의 모범 답안이다.

Neovim 쪽은 Lua 스크립트 하나로 돈다. 케이스마다 새 버퍼를 열고, 키를 넣고, 결과를 JSON으로 적는다.

```lua
-- nvim --clean --headless -l runner.lua in.json out.json
for _, c in ipairs(cases) do
  vim.cmd('enew!')
  vim.bo.undolevels = -1 -- 초기 텍스트는 undo 대상이 아니게
  vim.api.nvim_buf_set_lines(0, 0, -1, false, vim.split(c.text, '\n', { plain = true }))
  vim.bo.undolevels = 1000
  vim.api.nvim_win_set_cursor(0, { c.cursor[1] + 1, c.cursor[2] })
  local ok, err = pcall(vim.api.nvim_feedkeys, vim.api.nvim_replace_termcodes(c.keys, true, false, true), 'xtn', false)
  -- 텍스트, 커서(바이트가 아니라 글자 단위 열), 모드를 기록
end
```

사이트 쪽은 빌드한 결과를 vite preview로 띄우고 Playwright로 같은 키를 실제로 누른다. 레지스터나 매크로가 섞이지 않게 케이스마다 페이지를 새로 연다.
CI에는 이 비교만 하는 잡이 따로 있고, 로컬에서 쓰는 것과 같은 Neovim 0.11.0을 받아서 돌린다. 이 잡이 깨지면 배포가 되지 않는다.

```yaml
- name: Neovim 0.11.0 설치 (로컬 비교 기준과 같은 버전)
  run: |
    curl -fsSL https://github.com/neovim/neovim/releases/download/v0.11.0/nvim-linux-x86_64.tar.gz | tar xz -C "$RUNNER_TEMP"
    echo "$RUNNER_TEMP/nvim-linux-x86_64/bin" >> "$GITHUB_PATH"
- run: npm run test:nvim
```

처음 돌렸을 때는 169개 중 130개만 일치했다. 39개가 달랐다.

## 깊이 보기 2: 에뮬레이터를 Neovim 쪽으로 고치기

차이는 대부분 Neovim 기본값이나 경계 조건에서 나왔다. 몇 가지를 꼽으면 이렇다.

- 검색과 `:s`가 대소문자를 항상 무시했다. `ignorecase`·`smartcase`(기본 꺼짐)와 `\c` `\C`를 따르게 고쳤다.
- `dG`가 빈 줄을 남겼고, `v$d`는 줄바꿈을 지우지 않았다.
- `Ctrl-a`가 `007`을 8진수로 봤다. Neovim 기본값은 `nrformats=bin,hex`라서 8진수로 보지 않는다.
- Neovim 기본값인 `nostartofline`을 따르지 않아 `G`, `gg`, `>>` 뒤에 커서 열이 달라졌다.
- 첫 줄에서 `k`, 마지막 줄에서 `j`는 실패해야 하고, 매크로는 이동이 실패하면 멈춰야 한다.
- `df`에 없는 글자를 주면 실제 Vim은 아무것도 안 하는데, 에뮬레이터는 제자리를 돌려줘서 한 글자를 지웠다.

수정은 포크하지 않고 [patch-package](https://github.com/ds300/patch-package)로 `patches/`에 두었다. `npm install`의 postinstall에서 자동으로 적용된다.
업스트림 버전이 오르면 패치가 깨질 수 있지만, 그때는 nvim-diff가 바로 알려 준다.
나중에 구루 챕터를 만들면서 정규식 그룹(`\( \)`, `\1`)이 매치되지 않는 것도 찾았다. 에뮬레이터가 JS 정규식 문법을 쓰고 있어서 실제 Vim 문법을 따르도록 바꿨다.
케이스가 늘어 지금은 180개 모두 일치한다.

## 깊이 보기 3: 진짜 Vim 모드와 titlestring

그래도 "진짜로 해 보고 싶다"는 사람을 위해 vim.wasm으로 실제 Vim 8.2를 띄우는 진짜 Vim 모드(beta)를 붙였다.
Neovim 기본값에 맞추려고 vimrc에 `nostartofline`, `nrformats=bin,hex`, `nnoremap Y y$` 같은 설정을 넣는다.

어려웠던 건 채점이었다. 버퍼 상태를 JS에서 꺼내야 하는데, 명령 도중에 JS가 cmdline을 넣으면 Vim이 멈췄고, autocmd 안에서 내보내면 교착 상태가 됐다. 둘 다 실제로 돌려 보고 알았다.
결국 Vim이 화면을 다시 그릴 때 스스로 보고하게 했다. 창 제목을 상태 JSON으로 만드는 방법이다.

```vim
function! EduState()
  return json_encode({'lines': getline(1, '$'), 'line': line('.') - 1,
        \ 'col': strchars(strpart(getline('.'), 0, col('.') - 1)), 'mode': mode(1)})
endfunction
set title titlelen=0 titlestring=%{EduState()}
```

`SharedArrayBuffer`를 쓰려면 COOP/COEP 헤더가 필요한데 GitHub Pages는 이 헤더를 붙일 수 없다. 그래서 `/real/` 페이지에만 [coi-serviceworker](https://github.com/gzuidhof/coi-serviceworker)를 적용해 우회했다.
Safari에서는 이 우회가 첫 방문에만 동작해서, 오류 대신 안내 문구를 띄운다.
첫 로딩은 처음에 약 2.1MB였는데, 빌드할 때 Vim 런타임에서 레벨에 필요한 파일(js, py, yaml, txt용)만 남겨 0.8MB로 줄였다.

## 깊이 보기 4: tmux는 시뮬레이터로

tmux는 브라우저에서 돌 수 없다. 키 바인딩은 수백 개지만, 에이전트를 돌리면서 사람이 실제로 누르는 키는 몇 개 안 된다.
세션 만들기와 떼고 붙기, 화면 나누기와 이동, `C-b z` 확대, 그리고 copy mode로 긴 에이전트 로그를 스크롤해서 에러를 복사하는 것 정도다.

그래서 이것만 흉내 내는 시뮬레이터를 따로 만들었다. `src/tmux.js`는 DOM이 없는 순수 상태 머신이고, 세션·윈도우·pane 트리와 prefix `C-b`, vi copy mode, 붙여넣기, 작은 셸을 갖고 있다.
화면 그리기는 `src/tmux-view.js`가 맡는다. 상태 머신이 DOM과 떨어져 있어서 `node --test`로 바로 테스트하고, 모든 tmux 레벨 답안을 브라우저 없이 검증한다.
명령 프롬프트(`C-b :`), 마우스, pane 크기 조절은 일부러 넣지 않았다.

## 무엇이 잘못됐나

- 레벨을 다 만들고 직접 눌러 보라는 확인 요청을 받았는데, 모범 답안 `3lxfmx`를 못 읽었다. Claude가 키 → 뜻 → 결과 단계표로 풀어 주고 나서야 이해했다. 지금 사이트의 풀이 해설도 같은 형식으로, 클리어한 뒤 내 키와 모범 답안을 Vim 명령 단위로 끊어 다시 실행해 보여 준다.
- 한글 입력 상태로 NORMAL 모드에서 `jjl`을 치면 커서는 그대로고 `ㅓㅓㅣ`가 찍혔다. 처음엔 트랜잭션을 거부했는데, 커서가 줄 끝으로 튀고 이후 영문 키가 글자로 들어갔다. 지금은 inputHandler로 받아서 조합을 강제로 끝낸다. 이런 버그는 `tests/regress.e2e.mjs`에 재현 테스트로 남겼고, 고치기 전 버전에서 14개 중 9개가 실패하는 걸 확인했다.
- `u`가 동작하지 않았다. CodeMirror의 history 확장을 빠뜨렸던 것이다.
- 진짜 Vim 모드에 키를 0ms 간격으로 넣으면 vim.wasm이 순서를 섞었다. 사람 속도인 40ms 간격에서는 문제가 없어서 테스트도 그 속도로 입력한다.

## 테스트로 지키는 것

CI는 chromium, firefox, webkit 세 브라우저에서 모든 레벨 답안과 미션 150라운드를 실제 키 입력으로 풀어 보고, 영어 화면에 한글이 남지 않았는지도 본다.
레벨을 추가하려면 `src/levels.js`에 객체 하나를 넣으면 되고, `solution`이 곧 par가 된다. `npm test`가 그 답안으로 실제로 클리어되는지 확인한다.

## 다음 할 일

- 물리 키보드가 있어야 한다. 모바일 터치 입력은 아직 안 된다.
- 진행 상황은 브라우저 localStorage에만 저장된다.
- Safari의 진짜 Vim 모드는 헤더를 붙일 수 있는 호스팅으로 옮기면 풀린다.
- "이런 상황이 레벨로 있었으면 좋겠다"는 제안은 이슈나 PR로 받는다.

## 써 보기

- 사이트: [s3onghyun.github.io/nvim-edu](https://s3onghyun.github.io/nvim-edu/?ref=blog) (한국어·영어)
- 저장소: [github.com/s3onghyun/nvim-edu](https://github.com/s3onghyun/nvim-edu?ref=blog)
- Neovim 비교 테스트: [tests/nvim-diff.mjs](https://github.com/s3onghyun/nvim-edu/blob/main/tests/nvim-diff.mjs?ref=blog)
- 에뮬레이터 패치: [patches/](https://github.com/s3onghyun/nvim-edu/tree/main/patches?ref=blog)

`:wq`에서 멈춰 있던 사람이 만든 연습장이라, 비슷한 자리에 있는 사람에게 먼저 쓸모가 있으면 좋겠다.
