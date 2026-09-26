# Grader SEO 운영

대표 주소는 `https://grader.co.kr`이다. 모든 공개 페이지가 자기 주소의 canonical과 Open Graph URL을 출력한다. `www.grader.co.kr`은 Vercel 도메인 설정에서 대표 주소로 308 리다이렉트한다.

## 검색엔진 연결

- Google Search Console: 기존 `sc-domain:grader.co.kr` 도메인 속성과 소유 확인을 유지한다.
- 네이버 서치어드바이저: `https://grader.co.kr`을 등록하고 `NAVER_SITE_VERIFICATION`을 운영 환경에 설정한다. 새 값을 적용하려면 재배포가 필요하다.
- 제출 주소: `https://grader.co.kr/sitemap.xml`, `https://grader.co.kr/feed.xml`.
- 소유 확인 태그는 공개 인증 코드이며 비밀번호나 API 키가 아니다. Google은 기존 DNS 인증을 유지하므로 메타 태그 값을 새로 만들 필요가 없다.

## 페이지와 콘텐츠

- `src/lib/seo.ts`: 페이지별 canonical, 공유용 제목·설명·이미지, RSS 연결.
- `/og`: 기존 CSS 디자인 토큰을 사용한 1200×630 공유 이미지.
- `src/lib/jsonld.tsx`: Organization, WebSite, Article, ItemList, BreadcrumbList. 실측하지 않은 평점이나 별점은 생성하지 않는다.
- 사이트맵: 홈, 소개, 개인정보, 카테고리, 공개 글. 5분 주기 갱신 및 어드민 저장 시 갱신.
- RSS: 공개 글의 설명·요약·본문·제품 사양을 제공하며 어드민 저장 시 갱신한다.
- 수정일은 DB `updated_at`을 사용한다. `updated`의 월 단위 평가 기준일과 구분해 화면에도 표시한다. 정확한 날짜를 모르면 날짜를 만들어내지 않는다.
- 운영 주체는 Grader, 실제 문의 주소는 `kop981020@naver.com`. 개인 운영자명을 공개하려면 확인된 이름으로 `SITE_OPERATOR_NAME`을 설정한다.
- DB 조회 오류는 빈 콘텐츠/404로 변환하지 않는다. 운영 빌드에서 DB 환경변수가 없으면 실패시켜 기존 배포를 보존한다.

## 배포 검증

`npm run test`와 `npm run build`를 실행한다. Vercel에서 민감 변수로 설정한 DB 키는 `vercel env pull`로 읽을 수 없으므로, 로컬 빌드만으로 운영 글을 검증하지 않는다. 운영 환경의 빌드와 실제 응답에서 글 7개 및 sitemap/RSS/JSON-LD를 확인한다.

코드 배포 후 Search Console에서 사이트맵을 제출하고 핵심 URL의 색인을 요청한다. 네이버에도 사이트맵과 RSS를 제출한다. 수집 요청 성공과 실제 색인·검색 순위는 별개이며, 노출·클릭 보고서에서 결과를 확인해야 한다.

콘텐츠 품질은 별도 편집 작업이다. 잠정 등급을 확정값처럼 바꾸거나 체험·시험 결과를 지어내지 않는다. 실제 비교 대상, 근거 출처, 장단점과 가격 조회일이 확보된 경우에만 본문을 보강한다.
