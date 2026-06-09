import type { Article } from "@/lib/types";

export const newbornEssentialsHub: Article = {
  slug: "newborn-essentials-hub-2026",
  category: "newborn",
  type: "hub",
  title: "신생아 용품 종합 가이드 — 우선순위 체크리스트 (2026)",
  description:
    "0~3개월 신생아 필수 용품을 우선순위로 정리한 허브 가이드. 각 품목의 상세 등급 비교 글로 바로 연결됩니다.",
  updated: "2026.06",
  medical: false,
  summary: [
    "출산 전 미리 준비할 것과 태어난 뒤 사도 되는 것을 나누면 초기 비용 부담을 줄일 수 있습니다.",
    "수유·수면·위생 3개 축의 핵심 품목부터 갖추고, 나머지는 필요할 때 추가하는 것이 합리적입니다.",
    "안전인증(KC)과 무향·저자극 여부를 우선 기준으로 두면 실패 확률이 줄어듭니다.",
  ],
  sections: [
    {
      heading: "먼저 갖출 핵심 품목",
      paragraphs: [
        "신생아 시기에는 수유 용품(젖병·로션 등 위생), 수면 용품, 외출 용품을 우선 갖추는 것이 좋습니다. 아래 개별 비교 글에서 품목별 등급과 추천 제품을 확인하세요.",
      ],
    },
  ],
  related: [
    { slug: "baby-lotion-grade-2026", title: "신생아 보습로션 등급 비교 — 성분·저자극·가성비" },
    { slug: "baby-stroller-grade-2026", title: "유모차 등급 비교 — 경량·디럭스·휴대형" },
    { slug: "kc-certification-2026", title: "KC 인증이란 — 어린이제품 안전 3단계" },
  ],
  sources: [
    { label: "국가기술표준원 제품안전정보센터", url: "https://www.safetykorea.kr/" },
  ],
};
