# Grader 살림 디자인 시스템

2026-09-27 · 주부 고객을 위한 살림 가이드로 공개 화면 개편.

## 방향

- 주방·생활을 중심으로, 집의 조건에 맞는 구매 결정을 돕는다.
- 옅은 아이보리 바탕, 짙은 올리브 CTA. 텍스트와 실제 상품 정보를 우선한다.
- 공개 UI의 가운데 점과 긴 대시 구분자, 장식용 영문 소제목, 반복되는 감성 문구를 사용하지 않는다. 메타 정보는 간격이나 줄바꿈으로 구분한다.
- 장식용 아이콘, 메인 연출 이미지, 겹친 카드, 컬러 배너를 제거한다. 검색, 저장, 메뉴 등 동작을 설명하는 아이콘은 유지한다.
- 모서리는 토큰 기준 4~8px. 버튼과 검색창은 6px. 카테고리는 텍스트 링크와 밑줄로 구분하고, 상품 목록은 카드 외곽 박스를 사용하지 않는다.
- 본문 16px, 보조 설명 15px, 메타 정보 13px. 글자 확대와 모바일에서 읽히는 행간.
- S/A/B/C 배지와 순위 추천 표현은 공개 화면에서 제거. 상품 조건·사양·조회일 중심으로 표현한다.
- 기존 DB의 grade 필드는 호환을 위해 보존한다. 조건 정렬은 충족 수 → 조회 가격 → 원본 순서이며 grade는 사용하지 않는다.

## 토큰이 먼저

원천: `src/styles/tokens.css`. Tailwind 매핑: `tailwind.config.ts`. 기본 및 공통 스타일: `src/app/globals.css`.

| 구분      | 토큰                                                       | 용도                                   |
| --------- | ---------------------------------------------------------- | -------------------------------------- |
| 배경      | paper, surface, card                                       | 화면, 옅은 영역, 카드                  |
| 텍스트    | ink, muted, faint                                          | 본문, 설명, 메타                       |
| 강조      | brand, brand-hover, brand-soft, on-brand                   | CTA, 선택 상태                         |
| 보조 강조 | accent, accent-soft                                        | 작은 포인트                            |
| 사진      | photo-surface, photo-ink                                   | 실제 제품 이미지의 흰 배경과 대체 표시 |
| 글자      | text-caption/small/body/lead/title/section/heading/display | 역할별 크기와 반응형 제목              |
| 간격      | space-1…24, page-gutter, section-space                     | 4px 계열 간격·반응형 여백              |
| 형태      | radius-sm/md/lg/xl/hero/pill                               | 카드·버튼·메인 이미지                  |
| 레이아웃  | width-content/reading/sidebar, layout-article/hero         | 최대 너비·2열 배치                     |
| 접근성    | tap-target, button-height, focus-ring, safe-bottom         | 44px 이상 터치·키보드·안전 영역        |
| 상태      | shadow-sm/md/lg, duration-fast/base, ease-standard         | 계층·전환                              |

다크 모드는 `.dark` 토큰 재정의로 처리한다. 컴포넌트에 원시 색상을 추가하지 않는다. 새로운 반복 값은 먼저 토큰으로 정의한다. 시스템 대비와 `prefers-reduced-motion`을 유지한다.

## 컴포넌트 구조

- `ui/Icon`: 공통 SVG 아이콘. 장식 아이콘은 스크린 리더에서 숨긴다.
- `ui/Primitives`: Container, ButtonLink, SectionHeading, EmptyState, Breadcrumb.
- `ui/SearchForm`: GET 기반 검색. 검색 버튼과 입력창에 접근 가능한 이름을 제공한다.
- `home/*`: HomeHero, TopicNavigation, GuideSection, ChecklistSection, SavedCollectionBanner.
- `content/*`: ArticleCard, ProductPhoto, ProductPrice, DeliveryTags, BuyingChecklist, CategoryTabs, ArticleHeader, ArticleSidebar, ReadingPage.
- `saved/*`: SaveButton, SavedCollection, useSaved. 버튼과 페이지가 같은 로컬 저장소 이벤트를 구독한다.
- `ProductCard`, `PopularProductGrid`, `ComparisonTable`: 실제 상품 필드를 사용하는 표시 컴포넌트. 제휴 CTA와 조회 가격 표시를 재사용한다.
- 페이지 파일은 데이터 로딩과 컴포넌트 조합을 담당한다.

## 화면과 동작

- `/`: 짧은 서비스 소개 → 살림 분야 → 공개된 글(있을 때) → 생활 상품 → 구매 전 확인 → 저장 안내.
- `/browse`: 공개 글과 상품 스냅샷을 검색. 분야·검색어를 URL에 유지한다.
- `/category/[category]`: 기존 카테고리 URL 유지. 글과 수집 상품을 분리한다.
- `/[slug]`: 요약 → 체크리스트 → 상품 조건 비교 → 참고 자료. 모바일 구매 버튼 유지.
- `/saved`: 로그인 없이 글·상품 저장, 종류 필터, 삭제. 브라우저 데이터를 삭제하면 목록도 삭제된다.
- `/about`: 서비스 소개와 구매 전 기준. `/privacy`: 저장 방식 포함 개인정보 안내.
- 관리자 인증과 DB 쓰기 경로는 유지한다. 공통 토큰과 입력 스타일을 적용한다.

## 콘텐츠와 데이터

- Supabase의 공개 콘텐츠를 계속 사용한다. 환경변수 미설정 시 빈 상태를 명시한다.
- 새 상품 정보, 리뷰, 등급, 실측 결과를 만들지 않는다. 기존 시드를 자동 공개하지 않는다.
- 상품 스냅샷은 과거 수집 목록이며 실시간 인기 순위/직접 검수 추천으로 표시하지 않는다.
- 조회일, 제휴 고지, `rel="sponsored nofollow noopener"`, 기존 GA4 클릭 추적을 유지한다.
- 인스타 계정·댓글 DM 자동화는 아직 연결하지 않았다. 연결되지 않은 CTA를 노출하지 않는다.

## 이미지 출처

`public/images/kitchen-editorial.png`는 초기 시안에서 사용했던 built-in image_gen 생성 연출 이미지다. 이번 정리에서 공개 화면의 이미지 참조를 제거했다. 현재 화면에는 기존 상품 데이터의 제품 이미지만 사용한다.

생성 프롬프트:

> Use case: photorealistic-natural. Asset type: editorial kitchen lifestyle hero photograph for a Korean homemaking guide website. Create a beautiful calm realistic photograph of a modest, thoughtfully organized Korean apartment kitchen corner. Warm ivory cabinets, light oak open shelf, small stack of off-white ceramic bowls, clear glass food jars, a white tiled backsplash, pale countertop with a folded linen towel, a wooden cutting board, a small branch in a vase. A glimpse of organized drawers or woven basket beneath. Soft late morning sunlight from left, natural soft shadows, authentic gentle lived-in materials. Palette warm cream, natural oak, muted olive, a tiny touch of terracotta. Magazine quality yet approachable and practical, no luxury mansion. Landscape 3:2 framing, main cabinetry and objects centered, close enough to see textures, no people, no typography, no logos, no products with labels, no collages, no UI. This is a decorative editorial mood image and must not imply a specific branded product or product test.

## 검증 기록

- 장식 정리 후 프로덕션 빌드와 타입 검사 통과. 홈 1440px, 390px, 320px에서 가로 넘침 없음. 모바일 검색과 메뉴, 소개 및 저장 빈 화면 확인. 홈과 소개 화면의 가운데 점 및 긴 대시 구분자 없음.
- Next.js 프로덕션 빌드 및 TypeScript 검증 통과.
- Vitest 27건 중 26건 통과. 작업 전부터 변경되어 있던 `popular-products.test.ts`의 중복 상품 검사 1건 실패: 기존 스냅샷 120개 중 고유 쿠팡 상품 ID는 110개. 스냅샷·수집 스크립트·해당 테스트는 이 디자인 작업에서 변경하지 않았다.
- 1440px 데스크톱, 390px 모바일에서 홈·상세의 가로 넘침 없음. 모바일 메뉴와 다크 모드 확인.
- 상품 저장 → 저장 목록 → 새로고침 유지 → 종류 필터 → 저장 취소 확인.
- 검색어 유지, 카테고리 변경, 결과 없는 상태 확인.
- 상세 화면은 기존 시드 7개를 별도의 로컬 읽기 전용 응답으로 제공하여 검증. 운영 DB 읽기/쓰기는 하지 않았다. 예산 정렬·초기화·가로 비교표·모바일 고정 구매 버튼 확인.
- 상품 이미지는 기존 쿠팡 출처 사용. 이미지 오류 시 대체 UI 제공.
