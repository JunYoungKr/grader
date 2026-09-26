# 유입과 구매 행동 기준 기록

확인일: 2026-09-27. 이 문서는 운영 화면에서 직접 읽은 집계값을 기록한다. GA4, Search Console, 쿠팡 파트너스의 집계 기간과 측정 대상이 다르므로 하나의 구매 전환율로 결합하지 않는다.

## 확인한 수치

| 출처와 기간 | 관측값 | 해석 범위 |
| --- | --- | --- |
| [GA4 트래픽 획득](https://analytics.google.com/analytics/web/#/a401537277p546058255/reports/explorer?params=_u..nav%3Dmaui&ruid=lifecycle-traffic-acquisition-v2,business-objectives,generate-leads&collectionId=business-objectives&r=lifecycle-traffic-acquisition-v2), 2026-08-30부터 2026-09-26 | 세션 19건, 참여 세션 15건, Direct 18건, Unassigned 1건, 주요 이벤트 0건 | 개편과 새 이벤트의 운영 테스트 이전 기간이다. Direct를 실제 고객 유입으로 단정할 수 없다. |
| [GA4 방문 페이지](https://analytics.google.com/analytics/web/#/a401537277p546058255/reports/explorer?params=_u..nav%3Dmaui&ruid=landing-page,business-objectives,generate-leads&collectionId=business-objectives&r=landing-page), 같은 기간 | 홈 16세션, `/ganong-vitamin-egg` 2세션, 미설정 1세션 | 방문 시작 위치를 뜻한다. 페이지 조회수나 구매 횟수가 아니다. |
| [Google 검색 실적](https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Agrader.co.kr&num_of_days=28), 2026-08-28부터 2026-09-24 | 클릭 0건, 노출 10건 | Search Console의 검색 결과 실적이다. GA4 세션 기간과 이틀 차이가 있다. |
| [Google 검색 실적](https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Agrader.co.kr), 2026-06-25부터 2026-09-24 | 클릭 2건, 노출 109건 | 클릭 2건 모두 `/kc-certification-2026`에서 발생했다. 최근 28일의 성과로 해석하지 않는다. |
| [쿠팡 파트너스 기간별 리포트](https://partners.coupang.com/#affiliate/ws/report/trend/monthly), 2026-08-28부터 2026-09-26 | 클릭 7건, 구매 1건, 합산 금액 31,830원, 화면상 수익 959원 | 기본 채널의 파트너스 집계다. Grader에서 발생한 주문인지 확인되지 않았고 확정 수익도 아니다. |

## 검색 노출의 선행 조건

[Search Console 색인 보고서](https://search.google.com/search-console/index?resource_id=sc-domain%3Agrader.co.kr)는 2026-09-21 최종 업데이트 기준으로 색인된 URL 4개, 색인되지 않은 URL 2개를 표시했다. 색인된 URL은 홈, `/kc-certification-2026`, `/category/baby`, `/category/sports`다. 제외 사유는 리디렉션 1개와 크롤링 후 미색인 1개다. 이 수치는 현재 공개 URL 전체의 최종 색인 상태가 아니라 보고서 갱신 시점의 상태다.

[제출된 사이트맵](https://search.google.com/search-console/sitemaps?resource_id=sc-domain%3Agrader.co.kr)은 성공 상태이며 2026-09-27 제출로 표시된다. 다만 마지막 읽기 날짜는 2026-06-22이고 발견 URL은 7개다. 새 사이트맵 제출 뒤 Google이 다시 읽고 색인 보고서가 갱신되는지 확인해야 한다. 검색 노출이 낮은 원인을 제목이나 구매 버튼 하나로 단정할 근거는 아직 없다.

## 운영 이벤트 확인

2026-09-27 운영 사이트에서 `utm_source=internal_test&utm_medium=qa&utm_campaign=growth_rollout_202609`로 시험했다. [GA4 실시간 보고서](https://analytics.google.com/analytics/web/#/a401537277p546058255/realtime/overview?params=_u..nav%3Dmaui)에 `search_results_view`, `save_item`, `remove_saved_item`, `view_item_list`가 도착했고 판매처 버튼 클릭 `select_item` 1건이 주요 이벤트로 표시됐다. 판매처의 상품과 선택 옵션도 클릭 후 화면에서 대조했다. 이 행동은 내부 시험이며 구매가 아니다. 이후 성과 비교에서는 해당 UTM을 제외한다.

## 다음 실행 판단

현재는 구매 버튼의 효과를 비교할 방문 표본이 없다. 우선 Search Console에서 사이트맵 재읽기, 색인 URL, 검색 노출을 확인한다. 동시에 [발행 전 원고](content-review-pack.md) 가운데 공식 호환 자료가 있는 매직캔 리필 안내와 치수 자료가 있는 수납함 안내를 실제 상품 옵션, 출처, 제휴 URL까지 검수한다. `CLAUDE.md`의 사람 사실 검수 조건이 충족된 글부터 공개한다. 공개 후에는 해당 글의 검색 노출, 진입 세션, 제휴 클릭 세션을 같은 기간으로 보고, 파트너스 주문과 수익은 별도 출처로 대조한다.

Google 검색 실적이 최근 28일 클릭 0건이고 GA4 직접 유입의 실제 방문자 비중도 알 수 없으므로, 이번 수치로 구매율이나 개편 효과를 계산하지 않는다.
