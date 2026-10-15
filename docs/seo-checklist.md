# 검색 및 LLM 노출 점검표

이 사이트는 빌드 때 `robots.txt`, `sitemap.xml`, RSS, `llms.txt`, 구조화 데이터를
생성합니다. 아래 항목은 소유자 계정에서 한 번 설정해야 합니다.

1. [Google Search Console](https://search.google.com/search-console)에
   `https://s3onghyun.github.io/` 속성을 추가하고 소유권을 확인합니다.
2. Google에서 안내하는 HTML 메타 태그의 코드 값을
   `src/config/site.ts`의 `verification.google`에 붙여 넣고 배포합니다.
3. Search Console의 Sitemaps 메뉴에서
   `https://s3onghyun.github.io/sitemap.xml`을 제출합니다.
4. [네이버 서치어드바이저](https://searchadvisor.naver.com/)에 같은 사이트를
   등록하고, HTML 메타 태그 인증 코드 값을 `verification.naver`에 붙여 넣은 뒤
   배포합니다.
5. 네이버 서치어드바이저에도 `https://s3onghyun.github.io/sitemap.xml`을
   제출합니다.

인증 코드는 한 곳(`src/config/site.ts`)에서만 관리합니다. 공개 저장소이므로 비밀값이
아닌 사이트 소유 확인용 코드만 넣습니다.
