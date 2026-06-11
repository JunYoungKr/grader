import { renderOgImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Grader — 쿠팡에서 뭘 살지 고민될 때, 등급으로 비교";

export default async function OgImage() {
  return renderOgImage();
}
