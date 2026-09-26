# 쿠팡 상품 정기 갱신

한국 시간 매일 오전 9시에 Supabase Cron이 운영 사이트의 `POST /api/cron/coupang`을 호출한다. 예약 시각은 UTC 00:00이며 작업 이름은 `coupang-products-daily-0900-kst`다. Codex 앱이나 개발자 컴퓨터가 실행 중일 필요가 없다.

## 데이터 흐름

1. Supabase Vault의 전용 비밀값으로 요청을 인증한다.
2. DB에서 5분 임대를 획득한다. 동시 호출과 같은 오전 9시 기준 갱신 주기의 성공 후 재호출은 건너뛴다.
3. 기존 쿠팡 파트너스 API로 6개 사이트 분야의 상품을 수집한다. 각 API 호출은 5초 후 중단한다.
4. 상품 ID와 정규화 상품명 중복, 잘못된 가격과 링크, 다른 카테고리 응답을 제외한다.
5. 모든 분야가 20개씩 준비되면 120개 전체 목록을 단일 DB 트랜잭션으로 교체한다. 일부 실패 시 기존 목록을 유지한다.
6. 사이트의 상품 캐시와 목록 페이지 캐시를 갱신한다. 정상 완료 시각과 상품 수, 실패 시 오류를 비공개 상태 테이블에 기록한다.

현재 API는 카테고리 베스트 목록을 반환하므로 상품 구성도 바뀔 수 있다. 글 안에 수동으로 넣은 상품 정보와 사용자가 브라우저에 저장한 과거 가격은 이 작업의 갱신 대상이 아니다. 웹 화면의 조회일과 판매처의 현재 가격 확인 안내를 유지한다.

## 필요한 설정

- 서버 환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `COUPANG_ACCESS_KEY`, `COUPANG_SECRET_KEY`, `COUPANG_SYNC_SECRET`.
- 비밀값은 서버 환경변수 또는 Supabase Vault에만 저장한다. `COUPANG_SYNC_SECRET`은 32자 이상이며 쿠팡 인증 키와 분리한다.
- `supabase/migrations/`의 쿠팡 갱신 마이그레이션을 순서대로 적용한다. 기존 articles 테이블은 변경하지 않는다.
- 사이트를 배포한 뒤 service role로 `configure_coupang_schedule` RPC에 `p_endpoint_url`과 `p_secret`을 전달한다. 함수는 동일한 작업 이름으로 예약을 갱신하므로 중복 작업을 만들지 않는다.
- Cron 시간대가 GMT 또는 UTC인지 확인한다. 예약은 `0 0 * * *`로 저장한다.

## 확인 및 중단

- service role로 `coupang_sync_status` RPC를 호출하면 활성 예약, 마지막 시도 및 성공 시각, 상품 수, 오류를 확인할 수 있다.
- 최초 배포 후 인증된 POST 1회로 전체 경로를 검증한다. 같은 갱신 주기에 다시 요청하면 `skipped`를 반환한다.
- Supabase Dashboard의 Cron에서 작업 이름을 찾아 비활성화할 수 있다. 수집을 중단해도 마지막 정상 상품 목록은 유지된다.
- API가 갑자기 종료되면 임대가 5분 후 만료된다. 이 경우 `lastAttemptAt`과 `lastSuccessAt`으로 미완료 실행을 구분한다.
- DB 읽기는 5분 캐시를 사용한다. 정상 갱신은 캐시를 무효화하므로 다음 조회에 최신 목록이 반영된다. DB를 읽을 수 없으면 번들에 포함된 기존 스냅샷을 조회일과 함께 표시한다.

공식 문서: [Supabase Cron](https://supabase.com/docs/guides/cron), [Supabase Vault](https://supabase.com/docs/guides/database/vault).

## 운영 확인 기록

2026-09-27 설정 완료. 운영 주소는 `https://grader.co.kr`이며 Supabase Cron 작업 1개가 GMT 00:00에 활성화되어 있다. 최초 실제 API 실행으로 120개 고유 상품을 저장했다. 재호출은 skipped, 인증 없는 갱신 요청은 401, anon 역할의 갱신 RPC 요청은 401을 반환했다. 한국 시간 오전 9시 경계 함수도 마이그레이션에서 검증했다.
