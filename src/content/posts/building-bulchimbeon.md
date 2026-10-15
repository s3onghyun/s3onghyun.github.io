---
title: "불침번을 만들며: AI 에이전트가 일하는 동안만 Mac을 깨워 두는 법"
description: AI 에이전트가 실제로 일하는 동안에만 macOS 잠자기를 막는 메뉴바 앱 불침번의 제작 기록. caffeinate 자식 프로세스와 CPU로 작업 여부를 판단한 방법, 덮개 모드 원복 감시병, 발열·배터리 안전장치, 실기기에서 드러난 버그를 정리했다.
publishedAt: 2026-10-14
tags:
  - macos
  - swift
  - ai-agent
  - developer-tools
  - open-source
category: tech
draft: false
---

# 불침번을 만들며: AI 에이전트가 일하는 동안만 Mac을 깨워 두는 법

> 이 글은 같은 프로젝트를 다룬 글을 블로그용으로 다시 쓴 제작 기록이다.
> 실전 사고 위주의 짧은 버전은 [velog](https://velog.io/@s3onghyun/AI-%EC%9D%B4%EB%93%B1%EB%B3%91%ED%95%9C%ED%85%8C-%EB%B6%88%EC%B9%A8%EB%B2%88-%EC%84%B8%EC%9B%A0%EB%8D%94%EB%8B%88-%ED%85%8C%EC%8A%A4%ED%8A%B8-70%EA%B0%9C-%ED%86%B5%EA%B3%BC%ED%95%98%EA%B3%A0-%EC%8B%A4%EC%A0%84%EC%97%90%EC%84%9C-%EC%82%AC%EA%B3%A0-%EC%B9%9C-%EC%8D%B0),
> [dev.to](https://dev.to/s3onghyun/i-put-a-night-watch-soldier-on-my-mac-for-ai-agents-70-green-tests-3-real-world-incidents-34in),
> [Zenn](https://zenn.dev/s3onghyun/articles/1ec9856f1fb32e), [Qiita](https://qiita.com/s3onghyun/items/859634847409298199de)에도 올렸다.

자기 전에 Claude Code에 긴 리팩터링을 맡겨 두면 아침에 둘 중 하나를 본다.
Mac이 잠들어서 작업이 중간에 멈춰 있거나, 잠자기 방지를 켜 둔 채 잊어서 밤새 화면이 켜져 있거나.

```bash
caffeinate -d                 # 끄는 걸 잊는다
sudo pmset disablesleep 1     # 되돌리는 걸 잊으면 배터리 0%
```

[불침번(Bulchimbeon)](https://github.com/s3onghyun/bulchimbeon?ref=blog)은 이 두 줄을 대신하는 macOS 메뉴바 앱이다.
에이전트가 일하는 동안에만 Mac을 깨워 두고, 일이 끝나면 픽셀아트 이등병이 "근무 교대합니다!" 하고 잠자기 방지를 푼다.
2026년 10월 13일 첫 커밋부터 이틀 동안 0.6.9까지 나왔고, 개발은 처음부터 끝까지 Claude Code와 같이 했다.
커밋 30개 모두 Claude가 공동 작성자로 올라가 있다.

## 먼저 정한 제약

같은 문제를 먼저 푼 앱으로 [Adrafinil](https://github.com/kageroumado/adrafinil)이 있다.
에이전트 설정에 hook을 넣어서 프롬프트를 제출할 때 잠자기 방지를 잡고 응답이 끝나면 놓는 방식이라, 시점이 정확하다.
대신 macOS 26.4 이상이 필요하고, 사용자 데몬과 root 도우미를 설치한다.

불침번은 반대쪽을 골랐다.

| 제약 | 이유 |
|------|------|
| hook·데몬·root 도우미를 설치하지 않는다 | 에이전트 설정 파일을 건드리지 않고, 설치해도 시스템에 바뀌는 것이 없게 |
| macOS 13부터 동작 | 아직 macOS 13~15를 쓰는 Mac에서도 돌게 |
| 대화 내용은 읽지 않는다 | 프로세스 명령줄을 읽는 앱이라 개인정보 경계를 먼저 그어 둠 |
| 네트워크 통신 없음, 서드파티 의존성 0개 | 관리자 권한 `pmset`을 다루는 앱이라 공격면을 줄이려고 |

이 제약 때문에 "에이전트가 지금 일하는 중인가"를 밖에서 관찰해서 알아내야 했다.
hook을 쓰면 에이전트가 직접 알려 주지만, 관찰 방식은 추론이다. 이 글의 대부분이 그 추론을 맞추는 과정이다.

## 깊이 보기 1: "일하는 중"을 밖에서 알아내기

### 프로세스 찾기: ps 대신 libproc

처음엔 `ps` 출력에서 `argv[0]`이 `claude`인 프로세스를 찾았다.
실측해 보니 Claude Code 네이티브 설치본은 실행 파일 이름이 `2.1.296` 같은 버전 번호였고, 전체 경로로 실행하거나 npm 전역 설치(`node /opt/homebrew/bin/claude`)로 띄우면 `argv[0]` 하나로는 잡히지 않았다.

그래서 libproc으로 바꿨다. `proc_listpids(PROC_UID_ONLY)`로 현재 사용자 프로세스만 모으고, 신호 네 개를 교차한다.

| 신호 | 잡는 경우 |
|------|-----------|
| 실행 파일 이름 | Homebrew, IDE 확장에 내장된 바이너리 |
| `argv[0]` 이름 | 실행 파일 이름이 버전 번호인 네이티브 설치본 |
| 실행 파일 경로의 설치 마커 | 전체 경로로 실행돼 `argv[0]`도 버전 경로인 경우 |
| node·bun·deno의 스크립트 이름과 패키지 경로 | npm 전역 설치, npx |

부분 문자열 매칭은 일부러 하지 않았다. Claude Code hook이 `node -e "...'.claude'..."` 같은 인라인 스크립트를 띄우는데, 문자열에 `claude`가 들어 있다고 에이전트로 세면 오탐이 난다.
대소문자도 구분해서 데스크톱 앱 `Claude.app`은 제외했다.

### 열려 있는 것과 일하는 것은 다르다

v0.1은 에이전트 프로세스가 떠 있으면 근무로 쳤다. 그리고 교대가 영원히 일어나지 않았다.
Claude Code 창을 여러 개 열어 두는 게 보통이라, 열려만 있는 세션까지 세면 근무가 끝날 수가 없었다.

세션 7개를 놓고 재 보니 차이가 분명했다. 실제로 작업 중인 1개만 자식 프로세스로 `caffeinate -i -t 300`을 띄우고 CPU 10% 정도를 썼고, 입력을 기다리는 나머지는 `caffeinate`가 없고 CPU 0~0.1%였다.
Claude Code가 작업하는 동안 스스로 `caffeinate`를 띄운다는 점이 가장 확실한 신호였다.

```swift
public static func isBusy(_ agent: ProcessSnapshot, children: [Int32: [ProcessSnapshot]], cpu: [Int32: Double]) -> Bool {
    if children[agent.pid, default: []].contains(where: { AgentCatalog.basename($0.executablePath) == "caffeinate" }) {
        return true
    }
    var total = cpu[agent.pid] ?? 0
    var queue = children[agent.pid, default: []], visited: Set<Int32> = [agent.pid]
    while let next = queue.popLast(), visited.count < 512 {
        guard visited.insert(next.pid).inserted else { continue }
        total += cpu[next.pid] ?? 0
        queue += children[next.pid, default: []]
    }
    return total >= cpuThreshold
}
```

`caffeinate` 자식이 없으면 자신과 자손 프로세스의 CPU를 합쳐 2% 이상인지 본다. 에이전트가 띄운 빌드나 테스트도 이걸로 잡힌다.
claude-mem 같은 플러그인이 상시 띄워 두는 헤드리스 도우미 세션(`--tools=`)은 목록에서 뺐다.

이 기준을 넣고도 두 번 더 고쳤다.

- 시간 근무에서 에이전트 근무로 바꾸자마자 교대했다가 8초 뒤 다시 투입됐다. Claude Code가 `caffeinate -t 300`을 다시 띄우는 사이에 잠깐 공백이 생기는데, 유예 시간을 셀 기준 시각이 없었다. 지금은 "지금 일하는 중"일 때만 투입하고, 교대는 마지막 작업 시각과 근무 시작 시각 중 늦은 쪽부터 5분 넘게 조용할 때만 한다.
- 18분 동안 교대가 안 됐다. 에이전트가 띄워 둔 15초 주기 감시 스크립트가 5초 단위로 재면 CPU 2~6%로 튀었다. 개발 서버나 파일 감시자도 같은 모양이라, CPU는 60초 평균으로 판단하게 바꿨다.

### 검토했지만 넣지 않은 신호

대화 기록 파일(transcript)의 수정 시각도 후보였다. 그런데 쉬고 있는 Claude Code 세션 4개의 기록 파일이 같은 초에 갱신되는 걸 봤다. 내용은 작업이 아니라 관리용 기록이었다.
걸러 내려면 기록 내용을 읽어야 하고, 그건 "대화 내용은 읽지 않는다"는 제약과 부딪친다. `caffeinate` 신호로 이미 정확했기 때문에 넣지 않았다.
이런 결정은 [설계 문서](https://github.com/s3onghyun/bulchimbeon/blob/main/docs/design.md?ref=blog)에 이유와 함께 남겨 두었다.

## 깊이 보기 2: 덮개를 닫아도 깨어 있게, 그리고 반드시 되돌리기

잠자기 방지는 IOKit power assertion으로 건다. `PreventUserIdleSystemSleep`이 `caffeinate -i`와 같다.
문제는 덮개였다. power assertion은 유휴 타이머만 막고, 덮개 닫힘은 하드웨어 트리거라서 막지 못한다. 덮개를 닫아도 깨어 있으려면 `pmset -a disablesleep 1`이라는 전역 플래그가 필요하다.
이 플래그는 프로세스가 죽어도 남는다. 앱이 강제 종료되면 가방 속 Mac이 잠들지 않고 뜨거워진다.

그래서 덮개 모드를 켤 때 "당직 감시병"을 같이 띄운다. 앱 PID가 사라지면 5초 안에 설정을 되돌리는 root 셸이다.
처음엔 `nohup`으로 띄웠는데, 실제 관리자 권한으로 돌려 보니 `do shell script ... with administrator privileges`가 끝나면서 감시병도 같이 사라졌다. 가짜 `pmset`으로 돌린 테스트에서는 재현되지 않던 문제였다.
`setsid`로 새 세션을 만들었더니 이번엔 `A && B &`의 하위 셸이 osascript 출력 통로를 쥐고 기다려서 osascript가 끝나지 않았다.

최종 형태는 시스템 perl이 fork하고, 자식이 `setsid()`를 마쳤다는 걸 파이프로 확인한 뒤에야 부모가 끝나는 방식이다.

```swift
let watch = ": \(marker(pid)); while /bin/kill -0 \(pid) 2>/dev/null; do /bin/sleep 5; done; \(pmset) -a disablesleep 0"
let detach = "pipe(my $r, my $w); my $p = fork(); die unless defined $p; "
    + "if ($p) { close $w; <$r>; exit 0 } close $r; POSIX::setsid(); close $w; exec @ARGV"
return "\(pmset) -a disablesleep 1 && /usr/bin/perl -MPOSIX -e '\(detach)' /bin/sh -c '\(watch)' </dev/null >/dev/null 2>&1"
```

몇 가지를 일부러 지켰다.

- 스크립트를 파일로 두지 않고 인라인 문자열로 넘긴다. 사용자 권한으로 고칠 수 있는 파일을 root로 실행하면 권한 상승 통로가 된다. 같은 이유로 앱 바이너리 자체는 root로 실행하지 않고, SIP로 보호되는 `/usr/bin/perl`만 쓴다.
- 명령에 끼어드는 가변 값은 정수 PID 하나뿐이라 셸 인젝션 여지가 없다.
- 감시병 확인용 `pgrep -f` 패턴은 `bulchimbeon-watchdo[g]-<pid>`처럼 써서 확인하는 셸 자신과 매칭되지 않게 했다.

실제 관리자 권한에서 앱을 `kill -9` 해 보면 3초 만에 `SleepDisabled`가 0으로 돌아온다.
재시작 후에는 로그인 직후 암호 창이 뜨지 않도록 덮개 근무를 시스템 근무로 낮춰 복귀시키고 다시 승인하라고 안내한다.

## 깊이 보기 3: 발열과 배터리는 근무보다 먼저

덮개를 닫은 채 무거운 작업을 오래 돌리면 열이 난다. 그래서 `ProcessInfo.thermalState`를 네 단계로 나눠 본다.
`serious`면 "폭염 주의보"로 한 번 경고하고, `critical`이면 근무를 멈추는 "전투휴식"에 들어간다. 열이 `fair` 이하로 내려간 상태가 2분 이어지면 알아서 근무에 복귀한다. 온도가 경계에서 오락가락할 때 근무가 켜졌다 꺼졌다 하지 않게 하려는 유예다. 모르는 단계가 오면 가장 뜨거운 쪽으로 취급한다.
배터리로 돌아가는 중에 잔량이 기준(기본 20%) 이하로 떨어지면 근무를 철수한다. 폭염이나 배터리 부족 상태에서는 새 근무 투입도 막는다.

잠자기 방지가 어떤 이유로든 풀려 있으면 바로 다시 잡는 "근무지 이탈 감지"도 있다. 비슷한 앱들의 이슈에서 "가끔 혼자 꺼진다"는 보고를 보고 넣었다.

## 판단과 실행을 나눈 구조

이런 규칙이 늘어나면서 근무 판단을 `DutyEngine`이라는 순수 상태 머신으로 뺐다(#2).
엔진은 시각, 배터리, 발열, 에이전트 상태, assertion 존재 여부 같은 관찰값을 받아서 할 일(`acquire`, `release`, `enableLid`, `restoreLid`, `notify`, `log` …)만 돌려준다. 실제 시스템 호출은 `DutyController`라는 얇은 껍데기가 한다.
덕분에 가짜 시계로 "응답이 끝나고 `caffeinate`가 만료된 뒤 5분이면 교대", "폭염 경보 후 식으면 2분 뒤 복귀" 같은 시나리오를 테스트로 고정할 수 있었다.

## 그래도 실기기에서 깨진 것들

테스트 70개가 모두 통과한 상태에서 실제로 써 보니 세 군데가 깨졌다.

1. 위에서 쓴 감시병 문제. 가짜 `pmset`으로는 관리자 셸의 프로세스 정리 동작을 재현할 수 없었다.
2. 재시작하면 저장된 근무가 사라졌다. 컨트롤러 `init`에서 저장을 먼저 호출해 빈 상태로 덮어쓴 뒤 복원을 하고 있었다. 엔진은 테스트했지만 껍데기의 초기화 순서는 테스트 밖이었다.
3. 알림이 한 번도 오지 않았다. macOS는 Developer ID로 서명하지 않은 앱에 알림 권한을 주지 않는데, 권한 요청 콜백을 `{ _, _ in }`으로 받아 실패를 그냥 버리고 있었다. 지금은 권한이 없으면 `osascript`의 `display notification`으로 대신 보내고, 문구는 argv로 넘겨 AppleScript 인젝션을 막았다.

세 개 모두 "무엇을 할지"는 맞았고 "OS가 실제로 그렇게 해 주는지"가 틀렸다. AI와 같이 만들면서 가장 효과가 컸던 질문은 "이거 실제로 확인했어?"였다.

## 다음 할 일

- Apple 공증과 Homebrew 공식 cask. 지금은 ad-hoc 서명이라 첫 실행 때 "그래도 열기"를 눌러야 하고, 알림도 "스크립트 편집기" 이름으로 뜬다.
- Privileged helper로 덮개 모드의 관리자 암호 창을 없애기.
- 1.0 호환성 약속. 설정 키, 실행 인자, 근무일지 형식을 [문서](https://github.com/s3onghyun/bulchimbeon/blob/main/docs/compatibility.md?ref=blog)로 고정하고, 바뀌면 실패하는 테스트를 붙였다.

## 써 보기

```bash
brew install --cask s3onghyun/tap/bulchimbeon
```

내 환경에서 에이전트가 제대로 잡히는지는 `--diagnose`로 볼 수 있다. Docker 컨테이너나 SSH 원격 서버에서 도는 에이전트는 이 Mac의 프로세스가 아니라서 잡히지 않는다.

- 저장소: [github.com/s3onghyun/bulchimbeon](https://github.com/s3onghyun/bulchimbeon?ref=blog)
- 변경 내역: [CHANGELOG](https://github.com/s3onghyun/bulchimbeon/blob/main/CHANGELOG.md?ref=blog)
- 위협 모델: [SECURITY.md](https://github.com/s3onghyun/bulchimbeon/blob/main/SECURITY.md?ref=blog)
- 먼저 나온 비슷한 앱: [Adrafinil](https://github.com/kageroumado/adrafinil)

hook으로 더 정확하게 맞물리길 원하고 macOS 26.4 이상을 쓴다면 Adrafinil이 맞고, 설치 흔적 없이 macOS 13부터 쓰고 싶다면 불침번이 맞다.
