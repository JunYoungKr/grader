import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { normalizeGa4Date, runGa4Explorer } from "@/lib/ga4-admin";

function csvCell(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const search = request.nextUrl.searchParams;
  const dimensions = search.getAll("dimension").slice(0, 9);
  const metrics = search.getAll("metric").slice(0, 10);
  const startDate = normalizeGa4Date(search.get("start") ?? undefined, "28daysAgo");
  const endDate = normalizeGa4Date(search.get("end") ?? undefined, "today");
  const table = await runGa4Explorer({
    dimensions,
    metrics,
    startDate,
    endDate,
    limit: 10_000,
  });

  if (table.error) {
    return NextResponse.json({ error: table.error }, { status: 400 });
  }

  const lines = [
    table.columns.map((column) => csvCell(column.name)).join(","),
    ...table.rows.map((row) => row.map(csvCell).join(",")),
  ];
  return new NextResponse(`\uFEFF${lines.join("\r\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ga4-${startDate}-${endDate}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
