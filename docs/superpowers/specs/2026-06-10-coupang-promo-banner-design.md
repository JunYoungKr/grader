# 쿠팡 공식 배너 블록 — 최종 승인용

작성일: 2026-06-10

## 목표

쿠팡 파트너스 **최종 승인** 조건은 "활동 페이지에 게시된 파트너스 링크/배너를 확인할 수 있는 스크린샷"이다.
기저귀 비교 글(`/newborn-diaper-grade-2026`)에 팸퍼스 쿠팡 배너 + 필수 고지문구를 실제 노출시켜
스크린샷 → 쿠팡 마이페이지 등록 → 최종 승인을 받는다.

## 결정

- 노출 방식: **공식 쿠팡 배너 블록**. 쿠팡 호스팅 creative라 등급/가격을 지어낼 필요 없음
  (CLAUDE.md #1 실제 데이터만 원칙 충족). 비교표는 그대로 유지.
- 고지문구: 쿠팡 필수 문구를 **원문 그대로** 배너 옆에 노출.
  > 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.

## 변경 (3곳)

1. `src/components/PromoBanner.tsx` 신규
   - `<a>` (rel="sponsored nofollow noopener", target=_blank, referrerpolicy="unsafe-url") + 배너 `<img>`
   - `data-ga="affiliate"` + placement `promo_banner` → GA select_item 퍼널 포함
   - 토큰 클래스만 사용, 외부 CDN 이미지라 평범한 `<img>`
   - 쿠팡 필수 고지문구 정확히 노출
2. `src/lib/types.ts`
   - `PromoBanner` 인터페이스 + `Article.promoBanner?: PromoBanner`
3. 렌더/데이터
   - `src/app/[slug]/page.tsx`: comparison 비교 섹션 아래 `promoBanner` 있으면 렌더
   - `src/content/products/newborn-diaper.ts`: 팸퍼스 배너 데이터(실제 링크·이미지·alt)

## 배너 데이터 (실측)

- 제품: 팸퍼스 터치 오브 네이처 밴드형 기저귀 아동공용, 2단계, 156매
- 링크: https://link.coupang.com/a/etiAOFN7p6
- 이미지: https://image10.coupangcdn.com/image/affiliate/banner/61868e8e6c4810f8103113a19460f9d7@2x.jpg (120x240)

## 검증

- `npm run build` 정적 생성 통과
- `npm run dev` → 배너 + 고지문구 육안 확인(스크린샷용)
