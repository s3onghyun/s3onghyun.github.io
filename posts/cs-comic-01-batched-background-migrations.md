# [CS 당직일지 1화] GitLab 업그레이드, 왜 1시간 넘게 기다려요?

URL: https://s3onghyun.github.io/posts/cs-comic-01-batched-background-migrations/
Markdown: https://s3onghyun.github.io/posts/cs-comic-01-batched-background-migrations.md
Published: 2026-11-03
Updated: 2026-11-03

[치즈 선배의 CS 당직일지](/series/cs-comic/) 1화. 헤드셋을 쓴 SRE 고양이 치즈 선배와 주니어 봄이 당직을 서며 장애 하나로 CS 개념 하나를 배운다.
이번 화는 GitLab 업그레이드 뒤에 남는 **배치 백그라운드 마이그레이션(Batched Background Migration, BBM)** 이야기다.

<figure class="comic">
<picture>
<source srcset="/comics/cs-comic/ep01-webtoon.avif" type="image/avif" />
<source srcset="/comics/cs-comic/ep01-webtoon.webp" type="image/webp" />
<img src="/comics/cs-comic/ep01-webtoon.png" width="1080" height="6370" loading="lazy" decoding="async" alt="6컷 세로 만화. 1컷: 노트북을 든 봄이 업그레이드 설치가 10분 만에 끝났다며 바로 다음 버전을 올리겠다고 하고, 커피를 든 치즈 선배는 관리자 화면의 Background migrations Active 37% 진행 막대를 가리킨다. 2컷: 칸이 많은 큰 테이블 상자를 치즈 선배가 컨베이어 벨트 위 batch 상자 몇 개로 나눠 옮기고, 봄이 그동안에도 GitLab이 멀쩡한 이유를 깨닫는다. 3컷: batch size와 interval 시계 두 개 아래로 상자가 흘러가고, 치즈 선배가 최근 배치 속도를 보고 크기를 자동으로 바꾼다고 설명한다. 4컷: 로봇 청소기가 테이블 위를 돌며 autovacuum 청소 중이라 일시정지 10:00이 표시되고, 눈을 감은 치즈 선배가 이것도 모니터링이라고 말한다. 5컷: x.2, x.5, x.8, x.11 필수 정류장 노선도에서 x.5 다음 구간에 빨간 X가 있고, finished가 아니라 active라는 오류 문구에 봄이 놀란다. 6컷: 업그레이드 대기 체크리스트 칠판 앞에서 봄이 두 팔을 들고, 치즈 선배는 커피를 마신다." />
</picture>
</figure>

<div class="learned">

## 이번 화에서 배운 것

- 패키지 설치가 끝나도 업그레이드는 끝나지 않았다. 큰 테이블 변경은 **BBM**으로 쪼개져 Sidekiq이 백그라운드에서 처리하고, 그동안 GitLab은 계속 돈다.
- batch 크기는 최근 job 속도를 보고 **자동으로 조절**되고, 동시에 도는 마이그레이션은 **기본 2개**다. DB 상태 지표(autovacuum, WAL 등)가 나쁘면 **10분 멈춘다**.
- 17.5 이후 필수 정류장은 **x.2 · x.5 · x.8 · x.11**이다. 정류장마다 BBM이 끝난 걸 확인하고 다음으로 가야 한다. 안 그러면 다음 버전이 "끝났지?" 확인하다 멈춘다.

</div>

## 대사 옮겨 적기

| 컷 | 상황 | 대사 |
|----|------|------|
| 1 | 업그레이드 설치 완료. 그런데… | **봄**: 선배! 설치 10분 컷! 바로 다음 버전 올릴게요!<br>**치즈 선배**: 잠깐. 관리자 화면부터 볼까. (화면: Background migrations · Active 37%) |
| 2 | BBM = 작업을 batch로 쪼개 Sidekiq이 백그라운드에서 실행 | **치즈 선배**: 통째로 고치면 DB가 버거워. 상자 몇 개씩 나눠서(batch) 뒤에서 처리하지.<br>**봄**: 그래서 그동안에도 GitLab이 멀쩡하구나! |
| 3 | batch 크기는 최근 job 속도로 자동 조절 · 동시 실행은 기본 2개 | **봄**: 한 번에 왕창 옮기면 더 빠르잖아요!<br>**치즈 선배**: 최근 배치 속도를 보고 크기를 자동으로 바꿔. |
| 4 | DB 상태 지표(autovacuum·WAL 등)가 나쁘면 10분 멈춤 | **치즈 선배**: DB가 청소 중이면 10분 쉬어. 서비스가 먼저야.<br>**봄**: …선배도 같이 쉬시는 거죠?<br>**치즈 선배**: 이것도 모니터링이야. |
| 5 | x.2 · x.5 · x.8 · x.11 — 정류장마다 BBM 완료 확인 후 다음으로 | (오류: `Expected batched background migration … to be marked as 'finished', but it is 'active'`)<br>**치즈 선배**: BBM 안 끝났는데 다음 정류장 가면, '다 끝났어?' 확인하다 업그레이드가 멈춰!<br>**봄**: 헉! |
| 6 | 운영 체크리스트 | (① Admin › Monitoring › Background migrations에서 Queued · Finalizing이 비었나, Failed → Retry ② `gitlab-rake gitlab:background_migrations:list` (18.8 이하는 `:status`) ③ 느리면 Sidekiq 워커 늘리기 ④ 계획표에 '대기 시간' 칸 만들기)<br>**봄**: 기다리는 것도 일이네요!<br>**치즈 선배**: 그래서 SRE는 커피를 마시지. |

## 컷에는 없는 운영 팁

- 19.5부터 `sudo gitlab-rake gitlab:background_migrations:wait`가 있다. 다 끝날 때까지 기다렸다가 0으로 끝나고, failed가 있으면 0이 아닌 값으로 끝난다. 자동화 파이프라인에서 다음 업그레이드를 막아 두기 좋다.
- DB에서 직접 확인하려면 아래 쿼리가 0행이면 다 끝난 것이다.

```shell
sudo gitlab-psql -c "SELECT job_class_name, table_name, column_name, job_arguments FROM batched_background_migrations WHERE status NOT IN(3, 6);"
```

- 동시 실행 개수는 Rails 콘솔에서 `ApplicationSetting.update_all(database_max_running_batched_background_migrations: 4)`로 바꿀 수 있다. DB 부하를 감당할 수 있을 때만 쓴다.

## 일부러 단순하게 그린 부분

- "설치 10분 컷"과 "Active 37%"는 그림용 숫자다. 실측값이 아니다. 제목의 "1시간 넘게"도 일반적인 표현이고, 문서는 큰 인스턴스에서 훨씬 오래 걸릴 수 있다고 적어 둔다.
- 4컷의 DB 상태 지표는 autovacuum과 WAL만 적었다. Patroni apdex 같은 지표도 있다.
- 필수 정류장은 17.5 이후 규칙만 그렸다. 16.x와 17.x 초반 정류장은 업그레이드 경로 문서의 표를 봐야 한다.

## 출처

| # | 출처 | 확인일 |
|---|------|--------|
| S1 | [Check migrations before upgrade](https://docs.gitlab.com/update/background_migrations/) (GitLab 관리자 문서) | 2026-11-03 |
| S2 | [Plan your upgrade path](https://docs.gitlab.com/update/upgrade_paths/) (GitLab 관리자 문서) | 2026-11-03 |
| S3 | [Batched background migrations](https://docs.gitlab.com/development/database/batched_background_migrations/) (GitLab 개발자 문서) | 2026-11-03 |

4컷의 autovacuum 복선은 [2화 MVCC와 VACUUM](/posts/cs-comic-02-mvcc-vacuum/)에서 이어진다.

## Related posts

- [[CS 당직일지 2화] DELETE 했는데 왜 디스크가 그대로예요?](https://s3onghyun.github.io/posts/cs-comic-02-mvcc-vacuum/)
- [불침번을 만들며: AI 에이전트가 일하는 동안만 Mac을 깨워 두는 법](https://s3onghyun.github.io/posts/building-bulchimbeon/)
- [nvim-edu를 만들며: 브라우저 Vim 연습장을 진짜 Neovim에 맞추기](https://s3onghyun.github.io/posts/building-nvim-edu/)
