import { getArticle } from "@/lib/content";
import { renderOgImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Grader 등급 비교 카드";
export const revalidate = 300;

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  return renderOgImage(article);
}
