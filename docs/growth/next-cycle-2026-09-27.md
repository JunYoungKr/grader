# 다음 유입 실험과 검수 기록

기준일: 2026-09-27. 검색 상태와 검색어 조사는 확인 시점의 관측값이다. 색인 요청은 실제 색인이나 검색 노출을 보장하지 않는다.

## 현재 검색 상태

| 출처 | 확인 결과 | 다음 확인 |
| --- | --- | --- |
| [Google 사이트맵](https://search.google.com/search-console/sitemaps?resource_id=sc-domain%3Agrader.co.kr) | 2026-09-27 마지막 읽기, 성공, 발견된 페이지 16개. 현재 공개 사이트맵에는 19개 URL이 있다. | 새 글 2개의 발견 및 색인 상태를 다시 확인한다. |
| [Google 검색 실적](https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Agrader.co.kr&num_of_days=28) | 2026-08-28부터 2026-09-24까지 노출 10회, 클릭 0회. 표에 보인 검색어는 `제품 비교` 4회뿐이다. | 검색어 수가 늘기 전에는 특정 주제의 사이트 내 검색 수요를 단정하지 않는다. |
| [네이버 웹 페이지 수집](https://searchadvisor.naver.com/console/site/request/crawl?site=https%3A%2F%2Fgrader.co.kr) | 매직캔과 수납함 가이드의 수집 요청이 각각 등록됐다. | 수집 성공과 검색 노출을 별도로 확인한다. |

Google과 네이버에 새 글의 요청을 반복해서 보내지 않는다. [Google 검색 센터](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)와 [네이버 서치어드바이저](https://searchadvisor.naver.com/guide/request-crawl)는 처리에 시간이 걸리고 반복 요청이 속도를 높이지 않는다고 안내한다.

## 다음 주제 선택

[네이버 데이터랩 검색어 트렌드](https://datalab.naver.com/keyword/trendResult.naver?hashKey=N_84419cd7ba20b51aa3140bc855f91b1b)에서 2025-09-26부터 2026-09-26까지 `키친타월 가격`, `밀폐용기 전자레인지`, `식기세척기 설치`, `수납함 사이즈`, `매직캔 리필 호환`을 같은 조건으로 비교했다. 하위 검색어 입력값의 공백은 데이터랩 화면에서 제거되어 표시됐다. `식기세척기 설치`가 이 후보 중 가장 꾸준하고 높은 상대 검색 지수를 보였다. 데이터랩 지수는 조회 기간의 최대치를 100으로 환산한 값이며 절대 검색량이나 Grader의 예상 방문 수가 아니다. 다른 표현을 쓰는 검색까지 합산한 결과도 아니다.

다음 원고는 [식기세척기 설치 전 확인 가이드](dishwasher-guide-draft.json)다. [LG전자 2026년 3월 카탈로그](https://www.lge.co.kr/kr/ebook/2026/march/best/catImage/630/20260304_best_catalogue.pdf)의 DEE6BGE 표에서 제품 크기 598×815×567mm와 설치 공간 600×815×600mm를 확인했다. [LG 설치 가이드](https://www.lge.co.kr/story/user-guide/dishwashers-install-guide)에서 걸레받이, 문 열림 공간, 가구 시공에 따른 차이를 확인했다. 원고는 한 모델의 치수를 모든 식기세척기에 적용하지 않는다.

운영 DB에는 비공개 초안으로만 등록한다. 정확한 판매 옵션과 설치 서비스 조건, 제휴 링크, 가격이 검증되지 않아 상품 카드와 가격은 넣지 않는다. `CLAUDE.md`에 따라 사람의 사실 검수 전에 공개하지 않는다.

## 같은 기간에 볼 지표

| 판단 | 지표와 계산 | 출처와 주의점 |
| --- | --- | --- |
| 검색 발견 | 두 신규 URL의 색인 상태, 검색 노출과 클릭 | Google Search Console, 네이버 서치어드바이저. 두 검색엔진의 집계와 지연은 별도로 기록한다. |
| 방문 | 신규 글별 자연 검색 진입 세션 | GA4 방문 페이지와 세션 소스. `internal_test` 등 내부 시험 UTM은 제외한다. |
| 상품 관심 | 글별 `select_item`이 발생한 세션을 해당 글의 세션과 비교 | GA4의 제휴 클릭은 구매가 아니다. 표본이 적을 때 비율의 증감으로 승자를 정하지 않는다. |
| 실제 구매 | 쿠팡 파트너스에서 Grader에 귀속된 주문과 확정 수익 | 현재 기본 채널의 주문은 Grader 귀속이 확인되지 않는다. 공식 subId 또는 채널 구분을 확인하기 전에는 GA4 클릭과 결합하지 않는다. |

검색이 노출되기 시작하면 검색어별 질문이 글에서 답을 얻는지 먼저 확인한다. 유입이 충분히 쌓인 다음에 상품 선택과 버튼 위치를 바꿔 비교한다. [Google의 유용한 콘텐츠 지침](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)에 맞춰 확인하지 않은 사용 경험이나 성능은 추가하지 않는다.
