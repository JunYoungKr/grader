import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Article, Grade } from "./types";

// OG 카드 (1200×630) — 공유될 때 "등급표 요약"이 보이게.
// 색은 라이트 토큰 값 하드코딩 (satori는 CSS 변수를 모름 — globals.css와 동기 유지).
export const OG_SIZE = { width: 1200, height: 630 };

const C = {
  paper: "#ffffff",
  ink: "#19202b",
  muted: "#555e68",
  faint: "#8a929b",
  hairline: "#e6e8eb",
  brand: "#1e3a5f",
  brandSoft: "#eaeff6",
};

const GRADE_BG: Record<Grade, string> = {
  S: "linear-gradient(135deg, #f3d27e, #c79a3c)",
  A: "#2e7d57",
  B: "#2f6fb0",
  C: "#6b7480",
};
const GRADE_FG: Record<Grade, string> = {
  S: "#3a2c08",
  A: "#ffffff",
  B: "#ffffff",
  C: "#ffffff",
};

const TYPE_LABEL: Record<Article["type"], string> = {
  comparison: "등급 비교",
  guide: "가이드",
  hub: "종합 가이드",
};

async function loadFonts() {
  const dir = join(process.cwd(), "assets", "fonts");
  const [regular, medium] = await Promise.all([
    readFile(join(dir, "Pretendard-Regular.otf")),
    readFile(join(dir, "Pretendard-Medium.otf")),
  ]);
  return [
    { name: "Pretendard", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Pretendard", data: medium, weight: 500 as const, style: "normal" as const },
  ];
}

function Badge({ grade, size = 64 }: { grade: Grade; size?: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: 14,
        background: GRADE_BG[grade],
        color: GRADE_FG[grade],
        fontSize: size * 0.55,
        fontWeight: 500,
      }}
    >
      {grade}
    </div>
  );
}

export async function renderOgImage(article?: Article) {
  const fonts = await loadFonts();
  const title = article?.title ?? "사야 할 제품, 등급으로 빠르게";
  const label = article ? TYPE_LABEL[article.type] : "쿠팡에서 뭘 살지 고민될 때";
  const products = (article?.products ?? []).slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: C.paper,
          color: C.ink,
          padding: "56px 64px",
          fontFamily: "Pretendard",
        }}
      >
        {/* 상단: 브랜드 + 신뢰 문구 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 52,
                height: 52,
                borderRadius: 12,
                background: C.ink,
                color: C.paper,
                fontSize: 30,
                fontWeight: 500,
              }}
            >
              G
            </div>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 500 }}>Grader</div>
          </div>
          <div style={{ display: "flex", fontSize: 22, color: C.muted }}>
            광고비와 분리된 평가 · 1차 출처 기반
          </div>
        </div>

        {/* 중앙: 라벨 + 제목 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            justifyContent: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: C.brandSoft,
              color: C.brand,
              fontSize: 24,
              fontWeight: 500,
              padding: "8px 20px",
              borderRadius: 999,
            }}
          >
            {label}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 58,
              fontWeight: 500,
              lineHeight: 1.25,
              letterSpacing: "-0.01em",
            }}
          >
            {title.length > 56 ? `${title.slice(0, 55)}…` : title}
          </div>
        </div>

        {/* 하단: 등급 요약(비교 글) 또는 도메인 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `2px solid ${C.hairline}`,
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", gap: 28 }}>
            {products.map((p) => (
              <div
                key={p.id}
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <Badge grade={p.grade} size={48} />
                <div
                  style={{
                    display: "flex",
                    fontSize: 24,
                    color: C.muted,
                    maxWidth: 240,
                  }}
                >
                  {p.name.length > 11 ? `${p.name.slice(0, 10)}…` : p.name}
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div style={{ display: "flex", gap: 16 }}>
                {(["S", "A", "B", "C"] as Grade[]).map((g) => (
                  <Badge key={g} grade={g} size={48} />
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", fontSize: 24, color: C.brand, fontWeight: 500 }}>
            grader.co.kr
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
