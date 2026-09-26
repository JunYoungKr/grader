export interface CoupangCategorySource {
  id: number;
  label: string;
}

// 쿠팡 파트너스 카테고리 베스트 API의 대분류 ID.
// 복합 Grader 카테고리는 두 소스를 번갈아 섞어 20개를 구성한다.
export const COUPANG_CATEGORY_SOURCES: Record<
  string,
  CoupangCategorySource[]
> = {
  baby: [{ id: 1011, label: "출산, 유아동" }],
  "daily-life": [
    { id: 1013, label: "주방용품" },
    { id: 1014, label: "생활용품" },
  ],
  digital: [{ id: 1016, label: "가전, 디지털" }],
  food: [
    { id: 1012, label: "식품" },
  ],
  beauty: [{ id: 1010, label: "뷰티" }],
  sports: [{ id: 1017, label: "스포츠, 레저" }],
};

// 베스트 API에는 교차 카테고리 광고 상품이 섞일 수 있어 응답 categoryName도 검증한다.
export const COUPANG_ALLOWED_CATEGORY_NAMES: Record<string, string[]> = {
  baby: ["출산/유아"],
  "daily-life": ["주방용품", "생활용품", "홈인테리어"],
  digital: ["가전디지털"],
  food: ["식품", "로켓프레시"],
  beauty: ["뷰티"],
  sports: ["스포츠/레저용품"],
};
