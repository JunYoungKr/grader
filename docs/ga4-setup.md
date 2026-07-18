# GA4 연동

이 프로젝트는 Next.js App Router에서 Google tag(`gtag.js`)를 로드하고, GA4 향상된 측정으로 초기 및 클라이언트 라우트 페이지뷰를 전송한다. 제휴 링크와 비교 UI는 별도 이벤트로 측정한다.

## 1. GA4 웹 스트림 준비

1. [Google Analytics](https://analytics.google.com/)에서 GA4 속성을 만든다.
2. **관리 > 데이터 수집 및 수정 > 데이터 스트림 > 웹**에서 사이트 도메인으로 웹 스트림을 만든다.
3. `G-`로 시작하는 **측정 ID**를 복사한다. 숫자로만 된 속성 ID와 다른 값이다.
4. 웹 스트림의 **향상된 측정**을 켜고, 페이지 조회의 **브라우저 기록 이벤트에 따른 페이지 변경**과 **스크롤**을 활성화한다.

## 2. 프로젝트와 배포 환경 설정

`.env.local`에 측정 ID를 넣고 개발 서버를 다시 시작한다.

```dotenv
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Vercel을 사용하면 **Project Settings > Environment Variables**에도 같은 키를 Production, Preview 환경에 추가한 뒤 재배포한다. `NEXT_PUBLIC_*`는 빌드 시점에 클라이언트 번들에 포함되므로 값을 바꿨을 때도 재빌드가 필요하다. GA4 측정 ID는 공개 키이며 비밀 값이 아니다.

로컬 이벤트를 DebugView에서 확인할 때만 아래 값을 임시로 추가한다. 일반 방문 데이터와 섞이지 않도록 확인 후 제거한다.

```dotenv
NEXT_PUBLIC_GA_DEBUG=true
```

## 3. 수집하는 이벤트

| 이벤트 | 의미 |
| --- | --- |
| `page_view` | 페이지 진입과 App Router 라우트 변경 |
| `scroll` | GA4 향상된 측정의 90% 스크롤 |
| `view_item_list` | 비교표/인기 상품 목록이 화면에 노출됨 |
| `select_item` | 제품 제휴 링크 클릭 |
| `select_promotion` | 제휴 프로모션 배너 클릭 |
| `filter_apply` | 예산·기능·월령 필터 적용 |
| `toc_click` | 목차 클릭 |

GA4 **관리 > 데이터 표시 > 이벤트**에서 `select_item`을 **주요 이벤트**로 표시하면 제휴 클릭을 핵심 전환으로 볼 수 있다. 실제 구매는 외부 판매처에서 발생하므로 GA4가 아닌 파트너스 대시보드와 대조한다.

`placement`, `target`, `filter_budget_max`, `filter_features`, `filter_month`, `top_item`을 일반 보고서에서 사용하려면 **관리 > 데이터 표시 > 맞춤 정의 > 맞춤 측정기준 만들기**에서 각 이벤트 매개변수를 이벤트 범위로 등록한다. 등록 전 데이터는 보고서에 소급 적용되지 않는다.

## 4. 검증

1. `npm run dev`를 실행하고 사이트를 연다.
2. 브라우저 개발자 도구 Network에서 `gtag/js` 및 `g/collect`를 검색한다.
3. GA4 **보고서 > 실시간**에서 `page_view`를 확인한다. 페이지를 이동했을 때 페이지뷰가 한 번씩만 증가해야 한다.
4. 제품 CTA를 클릭해 `select_item`이 들어오는지 확인한다. 보통 실시간 보고서는 수 분, 일반 보고서는 최대 24~48시간이 걸릴 수 있다.

광고 차단 확장이 설치된 브라우저에서는 Google tag가 차단될 수 있다. 검증할 때는 확장을 끄거나 시크릿 창을 이용한다.

## 5. 선택: GA4 Data API 인사이트

`npm run insights`는 수집용 측정 ID와 별개로 아래 서버 환경변수를 사용한다.

```dotenv
GA4_PROPERTY_ID=123456789
GOOGLE_APPLICATION_CREDENTIALS=./ga-service-account.json
ANTHROPIC_API_KEY=...
```

Google Cloud에서 서비스 계정을 만들고, GA4 **속성 액세스 관리**에서 해당 서비스 계정 이메일에 뷰어 권한을 부여한다. JSON 키는 절대 커밋하지 않는다.

## 6. `/admin` GA4 대시보드

`/admin`은 서버 환경변수 `ADMIN_PASSWORD`로 보호되며, 로그인 후 8시간 동안 HttpOnly 세션 쿠키를 사용한다. 비밀번호는 코드나 커밋되는 파일에 넣지 않는다.

```dotenv
ADMIN_PASSWORD=...
ADMIN_SESSION_SECRET=... # 선택, 긴 임의 문자열
GA4_PROPERTY_ID=123456789
```

로컬은 `GOOGLE_APPLICATION_CREDENTIALS`에 JSON 키 경로를 지정한다. Vercel 같은 서버리스 배포에서는 파일 대신 아래 중 하나를 설정한다.

```dotenv
GOOGLE_CLIENT_EMAIL=analytics-reader@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
# 또는 GOOGLE_SERVICE_ACCOUNT_JSON={...}
```

대시보드는 실시간, 일별 추이, 유입, 페이지, 이벤트, 상품, 지역, 기기 보고서와 해당 속성의 모든 차원·측정항목을 선택하는 자유 탐색기, CSV 내보내기를 제공한다. GA4 Data API는 집계 보고서 API이므로 개별 사용자의 원시 이벤트 덤프는 BigQuery Export가 필요하다.
