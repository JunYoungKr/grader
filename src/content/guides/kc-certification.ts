import type { Article } from "@/lib/types";

export const kcCertificationGuide: Article = {
  slug: "kc-certification-2026",
  category: "safety",
  type: "guide",
  title: "KC 인증이란 — 어린이제품 안전 3단계 가이드 (2026)",
  description:
    "「어린이제품 안전특별법」에 따른 KC 인증의 3단계(안전인증·안전확인·공급자적합성확인) 차이와 인증번호 조회 방법을 정리합니다.",
  updated: "2026.06",
  medical: false,
  summary: [
    "KC 인증은 어린이제품에 대한 법정 의무 인증으로, 위해도에 따라 3단계로 나뉩니다.",
    "위해도가 높은 제품일수록 더 엄격한 단계(안전인증)가 적용됩니다.",
    "인증번호는 국가기술표준원 제품안전정보센터에서 직접 조회·검증할 수 있습니다.",
  ],
  sections: [
    {
      heading: "KC 인증의 3단계",
      paragraphs: [
        "어린이제품 안전관리는 위해도에 따라 안전인증, 안전확인, 공급자적합성확인의 세 단계로 구분됩니다. 단계가 높을수록 제3자 시험·심사의 강도가 커집니다.",
        "안전인증은 위해도가 가장 높은 제품군에 적용되며, 지정된 인증기관의 제품 시험과 공장 심사를 모두 거쳐야 합니다.",
      ],
    },
    {
      heading: "인증번호 조회 방법",
      paragraphs: [
        "제품에 표시된 KC 마크 옆 인증번호를 제품안전정보센터에서 조회하면, 해당 인증이 유효한지와 어떤 제품에 발급된 것인지 확인할 수 있습니다.",
        "표시만 있고 조회되지 않거나, 다른 제품의 번호를 도용한 사례가 있으므로 구매 전 번호 조회를 권장합니다.",
      ],
    },
  ],
  related: [
    { slug: "newborn-essentials-hub-2026", title: "신생아 용품 종합 가이드 — 우선순위 체크리스트" },
    { slug: "baby-stroller-grade-2026", title: "유모차 등급 비교 — 경량·디럭스·휴대형" },
  ],
  sources: [
    { label: "국가기술표준원 제품안전정보센터", url: "https://www.safetykorea.kr/" },
    { label: "「어린이제품 안전특별법」 (국가법령정보센터)", url: "https://www.law.go.kr/" },
  ],
};
