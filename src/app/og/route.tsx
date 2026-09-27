import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const dynamic = "force-static";

// OG 이미지는 브라우저 밖에서 렌더하므로 같은 CSS 토큰의 실제 값을 읽는다.
export async function GET() {
  const css = await readFile(join(process.cwd(), "src/styles/tokens.css"), "utf8");
  const token = (name: string) => {
    const value = css.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();
    if (!value) throw new Error(`Missing design token: ${name}`);
    return value;
  };
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "64px 76px", background: token("paper"), color: token("ink") }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 76, height: 76, borderRadius: 16, background: token("ink"), color: token("paper"), fontSize: 54 }}>G</div>
        <div style={{ fontSize: 76, letterSpacing: -3 }}>Grader</div>
      </div>
      <div style={{ display: "flex", marginTop: 70, height: 4, width: "100%", background: token("brand") }} />
      <div style={{ display: "flex", marginTop: "auto", fontSize: 26, color: token("muted") }}>grader.co.kr</div>
    </div>,
    { width: 1200, height: 630 },
  );
}
