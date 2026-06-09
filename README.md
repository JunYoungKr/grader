# Grader — 제품 등급 비교 (스캐폴드)

DogGrade 모델을 본뜬 제휴(쿠팡 파트너스) 등급 비교 사이트의 Next.js 골격입니다.
브랜드명은 Grader, 도메인은 grader.co.kr입니다. 현재는 육아용품 콘텐츠가 샘플로 구현되어 있으며,
이후 생활·가전·건강 등 다른 제품 카테고리로 확장하는 구조입니다.

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 정적 생성 검증
```

Node 18.18+ (권장 20+) 필요. Pretendard 폰트는 빌드 시 CDN(jsDelivr)에서 로드됩니다.

## 구조

```
src/
  app/
    layout.tsx                  공통 헤더/푸터, 메타데이터 기본값
    page.tsx                    홈 (카테고리 + 최신 등급표)
    [slug]/page.tsx             등급표 글 (예: /baby-stroller-grade-2026)
    category/[category]/page.tsx 카테고리 목록 (예: /category/stroller)
    globals.css                 디자인 토큰(CSS 변수) + 다크모드
  components/
    GradeBadge        S/A/B/C 등급 배지 (브랜드 시그니처)
    ProductCard       모바일 비교 카드
    ComparisonCards   카드 그리드 (모바일)
    ComparisonTable   비교 표 (데스크톱)
    AffiliateButton   rel="sponsored nofollow" 자동 부착
    MethodologyStrip  "광고비 분리·1차 출처" 신뢰 띠
    DisclosureNote    공정위 고지 문구
    MetricCard / Header / Footer
  lib/
    types.ts          데이터 모델 (Article, Product, Grade ...)
    grade.ts          등급 색/라벨, 가격 포맷
    content.ts        데이터 로더 (지금은 정적 import)
    jsonld.tsx        ItemList 구조화 데이터
  content/
    categories.ts     카테고리 정의
    products/stroller.ts  유모차 샘플 등급 데이터
```

## 디자인 토큰

색·폰트·등급색은 모두 `globals.css`의 CSS 변수와 `tailwind.config.ts`에 모여 있습니다.
톤을 바꾸려면 `--paper / --ink / --brand` 값만 교체하면 사이트 전체가 따라옵니다.
등급 칩 색은 `lib/grade.ts`의 `GRADE_STYLES`에서 관리합니다.

## 실서비스 전 교체할 것

- `content/products/*` 의 `coupangUrl`("#")을 실제 파트너스 추적 링크로 교체
- `priceExample` 는 예시값 — 실제 가격/스펙은 1차 출처로 검증 후 입력
- `metadataBase` 기본값은 grader.co.kr. 배포 환경에서는 `NEXT_PUBLIC_SITE_URL`로 확정
- `/about`, `/privacy` 페이지 추가 (평가 방법론·운영자 실명 = E-E-A-T 핵심)
- 새 글은 `content/products/*.ts` 추가 후 `lib/content.ts` 배열에 등록
  (글이 늘면 MDX 또는 헤드리스 CMS로 이전 권장)

## 다음 단계 후보

- 조건 입력 → 제품 필터링하는 인터랙티브 비교 엔진 (차별점)
- AI 초안 → 검수 → 발행 파이프라인 연동
- sitemap.ts / robots.ts 추가

---

## 다중 제휴(멀티 어필리에이트) 구조

제품은 이제 제휴처(provider)와 추적 링크(affiliateUrl)를 분리해서 가집니다.

- `lib/types.ts` — `Provider = "coupang" | "iherb" | "linkprice" | "tenping"`,
  `Product.provider` + `Product.affiliateUrl`
- `lib/providers.ts` — 제휴처별 라벨·CTA·고지 문구(`PROVIDERS`),
  글에 쓰인 제휴처만 모아 고지문을 만드는 `buildDisclosure()`,
  사이트 전역 기본 제휴처 `SITE_PROVIDERS`
- `components/AffiliateButton` — provider에 맞는 CTA("쿠팡 최저가 보기" / "아이허브에서 보기") 자동
- `components/DisclosureNote` — 글에 실제 쓰인 provider만 받아 고지 문구 자동 조합
- `components/ProviderTag` — 카드/표에 "쿠팡 / 아이허브" 출처 표기(투명성)

샘플: `baby-lotion-grade-2026` 글이 쿠팡 + 아이허브를 섞어 쓰며,
고지 문구가 두 제휴처를 자동으로 함께 표기합니다.

제휴처를 추가하려면 `Provider` 타입과 `PROVIDERS`에 항목만 넣으면 됩니다.

## 실제 상품 기반 작성 (수집 파이프라인)

가짜 스펙·가격을 쓰지 않는 것이 핵심입니다. 실제 데이터는 API에서 가져옵니다.

`lib/coupang.ts` (서버 전용) — 쿠팡 파트너스 Open API 클라이언트:
- `searchProducts(keyword, limit)` — 실제 이름·가격·이미지·상품 URL
- `createDeeplinks(urls, subId?)` — 일반 URL → 파트너스 추적 딥링크

키는 `.env.local`에 (`.env.local.example` 참고). 발급: 쿠팡 파트너스 → Tools → 파트너스 API.
HMAC 서명은 5분 유효, Search API는 호출 제한(시간당 약 10회, 10개 상품)이 있으니
배치로 모아 캐시하세요. 최신 사양은 공식 문서로 재확인 필요.

권장 워크플로:
1. 수집 — `searchProducts()`로 카테고리 상위 제품 + 가격/이미지/평점, `createDeeplinks()`로 추적 링크
   (아이허브는 공개 상품 API가 약해 추천 코드/링크로 수동 큐레이션)
2. 정규화 — 결과를 `Product` 스키마(JSON)로 변환해 `content/products/*`에 저장
3. 등급 산정 — 평가 축 규칙으로 S/A/B/C 1차 자동 산정 → 사람이 보정
4. 초안 — 제품 데이터 + 등급 + 1차 출처(KC인증·소비자원)를 컨텍스트로 AI 초안 생성
5. 검수 — 사람이 사실·안전 주장 검수(육아·건강·안전 제품은 YMYL이라 필수)
6. 발행 — 커밋 → Next.js 정적 생성. 가격은 변동되므로 "조회 시점" 표기 + 실시간 가격은 링크에서 확인

주의: 공식 API/피드를 우선하고, 쇼핑몰 페이지 무단 크롤링은 약관 위반 소지가 있으니 피하세요.

---

## v2 업데이트 — 생애주기 구조 + YMYL E-E-A-T + 답-우선 레이아웃

### 1) 생애주기 카테고리
`content/categories.ts`를 제품유형 → **생애주기**로 재구성:
임산부(maternity) · 신생아(newborn) · 영아(infant) · 유아(toddler) · 안전(safety).
제품유형은 글 제목/slug로 표현하고, 카테고리는 부모의 단계 사고에 맞춥니다(재방문·LTV↑).

### 2) 글 타입 + 출처 + 의료 면책 (E-E-A-T)
`Article.type = "comparison" | "guide" | "hub"`:
- comparison — 등급표(제품 비교). `products` + `axes`
- guide — 설명형(예: KC 인증). `sections` 본문
- hub — 토픽 클러스터 허브(예: 신생아 종합). `sections` + `related`(스포크 링크)

공통 추가 필드: `summary`(한눈에 요약), `sources`(1차 출처), `related`(내부 링크), `medical`(의료 면책).
- `components/MedicalDisclaimer` — `medical: true` 글에 의료 면책 표시(YMYL 대응)
- `components/SourceList` — 법령·식약처·소비자원 등 1차 출처 인용 블록
- `components/RelatedLinks` — 허브↔스포크 내부 링크(토픽 클러스터)

샘플: `kc-certification-2026`(guide), `newborn-essentials-hub-2026`(hub).

### 3) sitemap / robots
`app/sitemap.ts` — 전 카테고리·제품 URL 자동 등록(빌드 시 `/sitemap.xml`).
`app/robots.ts` — `/robots.txt`.
도메인은 `NEXT_PUBLIC_SITE_URL` 환경변수로 주입(`lib/site.ts`). 미설정 시 https://grader.co.kr.
배포 후 구글 서치콘솔 + 네이버 서치어드바이저에 `/sitemap.xml` 제출하세요.

### 4) 답-우선(answer-first) 레이아웃
긴 글의 이탈 우려를 구조로 해결:
- `components/SummaryBox` — 상단 "한눈에 요약"(결론 먼저)
- `components/TableOfContents` — 목차 점프 링크
- `components/StickyCta` — 모바일 하단 고정 "1순위 추천" CTA(스크롤 없이 클릭 유도)
- 상세·평가기준·출처는 아래로 배치(점진적 공개)

제휴 사이트에서 "요약 → 등급표 → 링크 클릭 → 이탈"은 전환이지 실패가 아닙니다.
지표는 단순 이탈률이 아니라 제휴 CTR·스크롤·체류시간으로 보세요.
