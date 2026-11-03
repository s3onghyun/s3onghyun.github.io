# [CS 당직일지 2화] DELETE 했는데 왜 디스크가 그대로예요?

URL: https://s3onghyun.github.io/posts/cs-comic-02-mvcc-vacuum/
Markdown: https://s3onghyun.github.io/posts/cs-comic-02-mvcc-vacuum.md
Published: 2026-11-03
Updated: 2026-11-03

[치즈 선배의 CS 당직일지](/series/cs-comic/) 2화. [1화](/posts/cs-comic-01-batched-background-migrations/)에서 BBM이 왜 autovacuum을 지켜봤는지, 이번 화에서 답한다.
주제는 PostgreSQL의 **MVCC와 VACUUM**이다.

<figure class="comic">
<picture>
<source srcset="/comics/cs-comic/ep02-webtoon.avif" type="image/avif" />
<source srcset="/comics/cs-comic/ep02-webtoon.webp" type="image/webp" />
<img src="/comics/cs-comic/ep02-webtoon.png" width="1080" height="8258" loading="lazy" decoding="async" alt="8컷 세로 만화. 1컷: 월요일 아침 디스크 경보. 머리를 감싼 봄 옆 모니터에 데이터 볼륨이 DELETE 전 82%, DELETE 후에도 82%로 표시되고, 커피를 든 치즈 선배가 Postgres는 지웠음 표시만 한다고 말한다. 2컷: 8KB 힙 페이지 안에 xmin 100 xmax 205인 주문 #7 결제대기 옛 버전과, UPDATE 화살표 뒤 xmin 205 xmax 0인 결제완료 새 버전이 나란히 있다. 3컷: 점선으로 나뉜 화면 왼쪽에는 리포트 쿼리가 snapshot @ xid 204 사진 속 결제대기를 보고, 오른쪽에는 결제 서버가 xid 205를 커밋한다. 4컷: 주문 테이블 칸 대부분이 X 표시된 dead tuple이고, Seq Scan 돋보기가 그 칸들까지 훑는다. 5컷: 왼쪽은 로봇 청소기가 빈칸을 재사용 가능으로 표시하는 VACUUM, 오른쪽은 자물쇠 달린 이삿짐 트럭인 VACUUM FULL이다. 6컷: BEGIN 하고 3일째 잠든 유령이 xmin 100 옛 사진을 들고 있어 청소기가 dead tuple을 못 치운다. 7컷: 32비트 원형 XID 시계에 과거 21억과 미래 21억이 나뉘고, frozen 행 눈송이와 autovacuum_freeze_max_age 2억 표지가 있으며 봄이 겁에 질린다. 8컷: MVCC와 VACUUM 한 장 요약 치트 시트와 점검용 SQL 세 개, 아래에서 봄과 치즈 선배가 마무리 대사를 한다." />
</picture>
</figure>

<div class="learned">

## 이번 화에서 배운 것

- UPDATE는 덮어쓰기가 아니라 **새 행 버전 추가**다. 옛 버전에는 끝낸 트랜잭션 번호(xmax)가 찍히고, DELETE는 xmax만 찍는다.
- 문장마다 자기 시점의 **스냅샷**을 보기 때문에 읽기는 쓰기를 막지 않고, 쓰기도 읽기를 막지 않는다. 대신 아무도 안 보는 옛 버전(**dead tuple**)이 쌓인다.
- **VACUUM**은 dead tuple 자리를 재사용 가능으로 표시할 뿐 보통 파일 크기는 그대로다. **VACUUM FULL**은 ACCESS EXCLUSIVE 잠금을 잡고 통째로 다시 쓰니 운영 중엔 드물게.
- 오래 열린 트랜잭션(`idle in transaction`)은 VACUUM의 천적이다. 트랜잭션 ID는 32비트라 오래된 행은 **freeze** 해야 하고, 나이가 2억을 넘으면 autovacuum이 꺼져 있어도 강제로 돈다.

</div>

## 대사 옮겨 적기

| 컷 | 상황 | 대사 |
|----|------|------|
| 1 | 월요일 아침, 디스크 경보 (디스크 82% → 82%) | **봄**: 선배! 오래된 로그 행을 절반이나 DELETE 했는데 디스크가 그대로예요!<br>**치즈 선배**: Postgres는 바로 안 지워. '지웠음' 표시만 하지. |
| 2 | MVCC: UPDATE는 덮어쓰기가 아니라 '새 행 버전 추가' | **치즈 선배**: UPDATE는 새 버전을 쓰고, 옛 버전엔 'xid 205가 끝냄' 도장(xmax)만 찍어.<br>**봄**: 그럼 DELETE는요?<br>**치즈 선배**: DELETE = xmax 도장만. 끝. |
| 3 | 스냅샷: 각 문장(또는 트랜잭션)은 자기 시점의 버전만 본다 | (보이는 버전 = xmin이 내 스냅샷 전에 커밋됨, 그리고 xmax가 없거나 내 스냅샷엔 아직 미커밋)<br>**봄**: 제 쿼리는 옛 사진을 보고, 저쪽은 안 기다리고 바로 쓰네요!<br>**치즈 선배**: 읽기는 쓰기를 안 막고, 쓰기도 읽기를 안 막아. |
| 4 | dead tuple이 쌓이면 bloat — 디스크도, 스캔도 무거워진다 | **봄**: 죽은 버전도 디스크를 차지하고, 스캔할 때 같이 읽힌다고요?<br>**치즈 선배**: 그게 bloat. 그래서 청소부가 필요해. |
| 5 | VACUUM은 빈자리를 재사용할 뿐, OS 반환은 끝쪽 빈 페이지만 | (VACUUM · 청소: 죽은 칸 → '재사용 가능', SELECT·INSERT·UPDATE·DELETE 계속, 파일 크기는 보통 그대로 / VACUUM FULL · 이사: 새 파일로 통째로 다시 씀, ACCESS EXCLUSIVE로 아무도 못 씀, 그동안 테이블만큼 디스크 더 필요)<br>**봄**: 디스크 줄이려면 FULL 돌리면 되겠네요!<br>**치즈 선배**: 운영 중엔 함부로 못 해. 평소엔 청소를 자주. |
| 6 | 오래 열린 트랜잭션 = VACUUM의 천적 | (`BEGIN;` …3일째 대기, idle in transaction)<br>**치즈 선배**: 청소기가 와도 못 치워. 저 세션이 아직 옛 사진을 들고 있거든.<br>**봄**: BEGIN 해 놓고 퇴근한 게 누구죠…?<br>(버려진 replication slot, hot_standby_feedback도 같은 효과) |
| 7 | 트랜잭션 ID는 32비트 — 오래된 행은 얼려야(freeze) 한다 | (XID: 32비트 · 원형 · 약 43억 칸, 과거 21억 / 미래 21억. `autovacuum_freeze_max_age = 2억`. 방치하면 남은 XID 300만 미만일 때 새 쓰기 거부, 읽기만 가능)<br>**봄**: 21억 넘게 지나면 옛 행이 '미래'로 보여서 사라져요?!<br>**치즈 선배**: 그래서 미리 얼려 둬. 2억 넘으면 autovacuum이 꺼져 있어도 강제 출동. |
| 8 | 한 장 요약 (치트 시트) | (아래 요약과 SQL 참고)<br>**봄**: 1화 BBM이 왜 autovacuum을 지켜봤는지 알겠어요!<br>**치즈 선배**: 청소는 매일, 이사는 드물게. |

8컷 치트 시트의 SQL은 그대로 옮겨 둔다.

```sql
-- dead tuple 많은 테이블
SELECT relname, n_dead_tup, last_autovacuum FROM pg_stat_user_tables
  ORDER BY n_dead_tup DESC LIMIT 5;
-- 오래 열린 트랜잭션
SELECT pid, state, xact_start FROM pg_stat_activity
  WHERE backend_xmin IS NOT NULL ORDER BY age(backend_xmin) DESC;
SELECT datname, age(datfrozenxid) FROM pg_database; -- XID 나이
```

autovacuum은 dead tuple 수가 `min(50 + 0.2 × 행 수, 1억)`을 넘으면 출동한다(PG18 기본값. 1억 상한인 `autovacuum_vacuum_max_threshold`는 18에서 새로 생겼다). 예방으로는 `idle_in_transaction_session_timeout`을 설정한다. 기본값 0은 꺼짐이다.

## 컷에는 없는 운영 팁

- 테이블 전체를 주기적으로 비운다면 `DELETE` + `VACUUM` 대신 `TRUNCATE`를 고려한다. 공간을 바로 돌려주지만 엄격한 MVCC 의미는 깨진다.
- VACUUM FULL 대신 `CLUSTER`나 테이블을 다시 쓰는 `ALTER TABLE`도 같은 효과다. 모두 ACCESS EXCLUSIVE 잠금을 잡는다.
- wraparound 직전 복구에서는 VACUUM FULL과 VACUUM FREEZE를 쓰지 말라고 문서가 못 박아 둔다.

## 일부러 단순하게 그린 부분

- 1컷의 82%와 6컷의 "3일째"는 그림용 숫자다.
- 3컷의 가시성 규칙은 개념용 요약이다. 실제 판정에는 같은 트랜잭션 안의 변경(cmin/cmax), 롤백된 xmax, 진행 중인 트랜잭션 목록 같은 경우가 더 있다.
- 2컷은 새 버전이 같은 페이지에 들어가는 것처럼 그렸다. 실제로는 자리가 있으면 HOT 업데이트, 없으면 다른 페이지로 간다. HOT은 3화(B-tree 인덱스)에서 다룬다.
- 7컷은 2³¹을 "21억", 2³²를 "약 43억"으로 반올림했다. MultiXact ID wraparound는 다루지 않았다.
- 8컷 공식은 update/delete 기준 조건만 적었다. insert 기준 autovacuum(`autovacuum_vacuum_insert_threshold` 등)은 뺐다.

## 출처

모두 PostgreSQL 18 공식 문서(`current` 판)다.

| # | 출처 | 확인일 |
|---|------|--------|
| S1 | [13.1 Introduction (MVCC)](https://www.postgresql.org/docs/current/mvcc-intro.html) | 2026-11-03 |
| S2 | [13.2 Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html) | 2026-11-03 |
| S3 | [5.6 System Columns](https://www.postgresql.org/docs/current/ddl-system-columns.html) | 2026-11-03 |
| S4 | [24.1 Routine Vacuuming](https://www.postgresql.org/docs/current/routine-vacuuming.html) | 2026-11-03 |
| S5 | [19.10.1 Automatic Vacuuming](https://www.postgresql.org/docs/current/runtime-config-autovacuum.html) | 2026-11-03 |
| S6 | [19.11 Client Connection Defaults](https://www.postgresql.org/docs/current/runtime-config-client.html) | 2026-11-03 |
| S7 | [27.2 The Cumulative Statistics System](https://www.postgresql.org/docs/current/monitoring-stats.html) | 2026-11-03 |
| S8 | [19.6 Replication](https://www.postgresql.org/docs/current/runtime-config-replication.html) (`hot_standby_feedback`) | 2026-11-03 |
| S9 | [66.6 Database Page Layout](https://www.postgresql.org/docs/current/storage-page-layout.html) | 2026-11-03 |

## Related posts

- [[CS 당직일지 1화] GitLab 업그레이드, 왜 1시간 넘게 기다려요?](https://s3onghyun.github.io/posts/cs-comic-01-batched-background-migrations/)
- [불침번을 만들며: AI 에이전트가 일하는 동안만 Mac을 깨워 두는 법](https://s3onghyun.github.io/posts/building-bulchimbeon/)
- [nvim-edu를 만들며: 브라우저 Vim 연습장을 진짜 Neovim에 맞추기](https://s3onghyun.github.io/posts/building-nvim-edu/)
