import type { Article } from "@/lib/types";

// 등급·평가는 한국소비자원 '비교공감(제2023-2호) 밴드형 신생아 기저귀 비교시험'
// 결과와 각 제품 공개 사양을 종합한 것. (역류량·부드러움 측정 항목 기반)
// priceExample는 '개당 단가' 기준이며, 소비자원 보고서의 실측 범위(180~366원)를
// 제외하면 조회 시점 플레이스홀더 → 발행 전 쿠팡 파트너스 실측가로 교체할 것.
// affiliateUrl "#" → createDeeplinks()로 생성한 실제 추적 링크로 교체할 것.
export const newbornDiaperArticle: Article = {
  slug: "newborn-diaper-grade-2026",
  category: "newborn",
  type: "comparison",
  medical: true,
  title: "신생아 기저귀 등급 비교 — 밴드형 6종",
  description:
    "한국소비자원 비교시험(역류량·부드러움)과 성분·개당 단가를 4축으로 평가해 S/A/B/C로 매겼습니다. 신생아용 밴드형 기준입니다.",
  updated: "2026.06",
  summary: [
    "종합 1순위는 슈퍼대디 리얼소프트 밴드 — 소비자원 시험에서 역류량이 적고, 마른 상태·젖은 상태 모두 가장 부드러웠습니다.",
    "가성비는 마미포코 에어핏(개당 약 180원, 시험 최저가), 친환경·대중성은 하기스 네이처메이드가 좋습니다.",
    "기저귀는 아이 피부에 맞는 게 정답입니다 — 1~2종을 소량(소형 한 팩)으로 먼저 써보고 발진·새는지 확인한 뒤 정착하세요.",
  ],
  axes: [
    { label: "흡수·역류", desc: "소변이 피부로 다시 묻어나오는 역류량과 흡수 속도. 소비자원 비교시험 측정 항목입니다." },
    { label: "피부 부드러움", desc: "기저귀가 닿는 표면의 촉감을 마른 상태·젖은 상태로 나눠 평가합니다." },
    { label: "성분·안전", desc: "코튼·천연유래 소재 여부와 형광증백제 등 유해물질 무검출(위생용품 기준) 충족을 봅니다." },
    { label: "가성비", desc: "개당 단가(시험 기준 약 180~366원) 대비 흡수·부드러움 성능을 함께 봅니다." },
  ],
  products: [
    {
      id: "diaper-superdaddy",
      name: "슈퍼대디 리얼소프트 밴드",
      type: "밴드형 신생아용",
      descriptor: "역류 적고 가장 부드러움",
      grade: "S",
      recommended: true,
      priceExample: 330,
      provider: "coupang",
      affiliateUrl: "#",
      specs: [
        { label: "역류량", value: "적음(우수)" },
        { label: "부드러움", value: "마른·젖은 모두 최상" },
        { label: "기준", value: "개당 단가" },
      ],
    },
    {
      id: "diaper-huggies",
      name: "하기스 네이처메이드",
      type: "밴드형 신생아용",
      descriptor: "친환경 소재 · 균형형",
      grade: "A",
      priceExample: 300,
      provider: "coupang",
      // 하기스 네이처메이드 썸머 밴드형(2단계, 160매) — 실제 쿠팡 파트너스 추적링크
      affiliateUrl: "https://link.coupang.com/a/erhZyInjdQ",
      specs: [
        { label: "역류량", value: "적음(우수)" },
        { label: "소재", value: "대나무·사탕수수 유래" },
        { label: "부드러움", value: "마른 상태 우수" },
      ],
    },
    {
      id: "diaper-penelope",
      name: "페넬로페 미라클 올데이 밴드",
      type: "밴드형 신생아용",
      descriptor: "흡수력 강점",
      grade: "A",
      priceExample: 290,
      provider: "coupang",
      affiliateUrl: "#",
      specs: [
        { label: "역류량", value: "적음(우수)" },
        { label: "흡수", value: "미라클 시트" },
        { label: "기준", value: "개당 단가" },
      ],
    },
    {
      id: "diaper-bosomi",
      name: "보솜이 리얼코튼 원더",
      type: "밴드형 신생아용",
      descriptor: "미국산 코튼 · 민감 피부",
      grade: "B",
      priceExample: 250,
      provider: "coupang",
      affiliateUrl: "#",
      specs: [
        { label: "소재", value: "미국산 100% 코튼" },
        { label: "강점", value: "피부 안전·보온" },
        { label: "기준", value: "개당 단가" },
      ],
    },
    {
      id: "diaper-mamypoko",
      name: "마미포코 에어핏 밴드",
      type: "밴드형 신생아용",
      descriptor: "최저가 가성비",
      grade: "B",
      priceExample: 180,
      provider: "coupang",
      affiliateUrl: "#",
      specs: [
        { label: "개당가", value: "약 180원(시험 최저)" },
        { label: "부드러움", value: "마른 상태 우수" },
        { label: "역류량", value: "보통" },
      ],
    },
  ],
  related: [
    { slug: "newborn-essentials-hub-2026", title: "신생아 용품 종합 가이드 — 우선순위 체크리스트" },
    { slug: "kc-certification-2026", title: "KC 인증이란 — 어린이제품 안전 3단계" },
  ],
  sources: [
    {
      label: "한국소비자원 비교공감 — 밴드형 신생아 기저귀 비교시험",
      url: "https://www.consumer.go.kr/user/ftc/consumer/cnsmrBBS/79/selectInfoRptDetail.do?infoId=A1079561&cntntsId=00000566",
    },
    {
      label: "식품의약품안전처 — 위생용품(기저귀) 안전관리 정보",
      url: "https://www.mfds.go.kr/",
    },
  ],
};
