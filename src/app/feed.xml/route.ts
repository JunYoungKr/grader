import { getAllArticles } from "@/lib/content";
import { buildFeed } from "@/lib/feed";

export const revalidate = 300;

export async function GET() {
  const articles = await getAllArticles();
  return new Response(buildFeed(articles), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
