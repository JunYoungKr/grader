# Grader — 제품 등급 비교

생활 제품을 **안전성·성능·성분·가격 등으로 등급화(S/A/B/C)해 비교**하고, 쿠팡 파트너스 등
제휴 링크로 수익을 내는 콘텐츠 사이트입니다. 브랜드명은 Grader, 도메인은 grader.co.kr.
현재는 육아용품(생애주기 카테고리)이 구현되어 있으며, 이후 생활·가전·건강 등으로 확장하는 구조입니다.

작업 규칙·원칙·백로그는 **`CLAUDE.md`가 단일 기준 문서**입니다. 이 README는 빠른 소개·실행용.

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 정적 생성 검증
npm run test     # Vitest (비교 엔진·쿠팡 API 클라이언트)
npm run build:coupang -- --slug=zero-cola-grade-2026 --category=food --keyword="제로 콜라" --limit=5
npm run sync:coupang # 카테고리별 쿠팡 베스트 20개 스냅샷 갱신
npm run insights # GA4 → Claude 퍼널 진단 (env 필요, CLAUDE.md 참고)
```

Node 18.18+ (권장 20+). Pretendard 폰트는 jsDelivr CDN에서 로드됩니다.
환경변수는 `.env.local.example` 참고 (쿠팡 파트너스 키, `NEXT_PUBLIC_GA_ID`, GA4/Anthropic 키).

## 구조

```
src/
  app/
    layout.tsx                  공통 헤더/푸터·메타데이터·다크모드 초기화
    page.tsx                    홈 (생애주기 카테고리 + 최신 글)
    [slug]/page.tsx             글 페이지 (type별 렌더 + 답-우선 레이아웃)
    about/ · privacy/           평가 방법론·운영자 정보 / 개인정보 처리방침 (E-E-A-T)
    category/[category]/        카테고리 목록
    sitemap.ts · robots.ts      자동 사이트맵 + robots
  components/                   등급·비교 UI, 비교 엔진(island), 제휴·고지, E-E-A-T, GA4
  lib/                          데이터 모델·등급·비교 엔진 순수 함수·제휴처·쿠팡 API·GA4 헬퍼
  content/                      글 데이터 (products=comparison, guides, hubs) + categories
scripts/build-from-coupang.ts    쿠팡 검색 → 사람 검수용 비교글 초안
scripts/analytics-insights.ts    GA4 Data API → Claude 진단 리포트
docs/superpowers/               설계 스펙·구현 플랜 아카이브
```

파일별 상세 책임은 `CLAUDE.md`의 파일 맵 참고.

## 핵심 기능

- **등급표(comparison)** — 제품을 평가 축 기준 S/A/B/C로 비교. 데스크톱 표 / 모바일 카드.
- **인터랙티브 비교 엔진** — `Product.attributes`(월령·기능)가 있는 글은 예산·기능·월령 필터로
  소프트 랭킹(`lib/explorer.ts` + `ComparisonExplorer`). attributes 없는 글은 정적 표로 폴백.
- **답-우선 레이아웃** — 요약(SummaryBox) → 목차 → 등급표, 모바일 하단 고정 CTA(StickyCta),
  데스크톱 우측 sticky 사이드바(목차 + 최근 본 제품).
- **글 타입 3종** — comparison(등급표) / guide(설명형, 수량 체크리스트 지원) / hub(토픽 클러스터).
- **다중 제휴** — `Provider`(coupang/iherb/linkprice/tenping)별 CTA·공정위 고지 자동
  (`lib/providers.ts` + `AffiliateButton`/`DisclosureNote`). 모든 제휴 링크 `rel="sponsored nofollow noopener"`.
- **제휴처 공식 배너** — `Article.promoBanner`(쿠팡 creative)를 등급표 아래 노출 + 필수 고지문구.
- **GA4 퍼널 추적** — `page_view → scroll → view_item_list(등급표 도달) → select_item(제휴 클릭=전환)`,
  관심 신호 `filter_apply`/`toc_click`. 비밀번호 보호 `/admin` 종합 대시보드·CSV 내보내기 포함.
  설정은 [`docs/ga4-setup.md`](docs/ga4-setup.md).
- **E-E-A-T/YMYL** — 1차 출처 인용(SourceList), 의료 면책(`medical: true`), 평가 방법론(/about).

## 콘텐츠 추가

`src/content/{products|guides|hubs}/<slug>.ts`에 `Article` 작성 → `lib/content.ts`의 `articles` 배열에 등록.
가짜 스펙·가격 금지 — 실제 데이터는 쿠팡 파트너스 API(`lib/coupang.ts`)의
`searchProducts()`(이름·가격·이미지)와 `createDeeplinks()`(추적 링크)로 수집합니다.
`npm run build:coupang`은 키워드 검색 결과를 `.draft.ts`로만 생성하며 자동 발행하지 않습니다.
키 없이 생성 흐름만 확인하려면 `--dry-run --stdout`을 사용하세요. AI/API 초안은 반드시 사람 검수 후 발행합니다.

## 실서비스 전 남은 것

- `affiliateUrl: "#"` 플레이스홀더 → 실제 파트너스 추적 링크 (stroller/lotion/newborn-diaper)
- `priceExample` → 실제 가격 (조회 시점 표기)
- `lib/site.ts`의 `OPERATOR_NAME`(운영자 실명)·`CONTACT_EMAIL`(문의 메일)
- 배포 (Netlify/Vercel/Cloudflare Pages) → 서치콘솔·네이버 서치어드바이저에 `/sitemap.xml` 제출
- 쿠팡 API 초안의 등급·스펙·출처를 사람 검수한 뒤 실제 글로 등록
