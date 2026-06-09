/**
 * GA4 → Claude 인사이트 리포트
 * --------------------------------------------------------------------------
 * 쌓인 GA4 데이터에서 퍼널·전환 지표를 끌어와 Claude에게 진단·개선안을 받는다.
 * 전환(북극성) = select_item(제휴 클릭). 실제 구매는 쿠팡 파트너스 대시보드와 대조.
 *
 * 실행:  npm run insights            (기본: 최근 28일)
 *        npm run insights -- 90      (최근 90일)
 *
 * 필요 환경변수 (.env.local 또는 셸):
 *   GA4_PROPERTY_ID                숫자 속성 ID (예: 123456789)
 *   GOOGLE_APPLICATION_CREDENTIALS 서비스 계정 JSON 경로 (해당 GA4 속성에 '뷰어' 권한)
 *   ANTHROPIC_API_KEY              Claude API 키
 *   INSIGHTS_MODEL                 (선택) 기본 claude-sonnet-4-6
 *
 * 사전 준비:
 *   1) Google Cloud 서비스 계정 생성 → JSON 키 다운로드
 *   2) GA4 관리 > 속성 액세스 관리에서 그 서비스 계정 이메일에 '뷰어' 부여
 *   3) GA4에서 select_item을 '주요 이벤트(key event)'로 표시 (전환 리포트용, 권장)
 */

import { BetaAnalyticsDataClient } from "@google-analytics/data";
import Anthropic from "@anthropic-ai/sdk";

const PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const MODEL = process.env.INSIGHTS_MODEL ?? "claude-sonnet-4-6";
const DAYS = Number(process.argv[2] ?? 28);

type Row = Record<string, string>;

async function runReport(
  client: BetaAnalyticsDataClient,
  opts: {
    dimensions: string[];
    metrics: string[];
    limit?: number;
    orderByMetric?: string;
    eventFilter?: string;
  },
): Promise<Row[]> {
  const [res] = await client.runReport({
    property: `properties/${PROPERTY_ID}`,
    dateRanges: [{ startDate: `${DAYS}daysAgo`, endDate: "today" }],
    dimensions: opts.dimensions.map((name) => ({ name })),
    metrics: opts.metrics.map((name) => ({ name })),
    limit: opts.limit ? String(opts.limit) : undefined,
    orderBys: opts.orderByMetric
      ? [{ metric: { metricName: opts.orderByMetric }, desc: true }]
      : undefined,
    dimensionFilter: opts.eventFilter
      ? {
          filter: {
            fieldName: "eventName",
            stringFilter: { value: opts.eventFilter },
          },
        }
      : undefined,
  });
  const dims = opts.dimensions;
  const mets = opts.metrics;
  return (res.rows ?? []).map((r) => {
    const row: Row = {};
    dims.forEach((d, i) => (row[d] = r.dimensionValues?.[i]?.value ?? ""));
    mets.forEach((m, i) => (row[m] = r.metricValues?.[i]?.value ?? "0"));
    return row;
  });
}

// 실패해도 전체가 죽지 않게 (예: 맞춤 측정기준 미등록) 감싼다.
async function safe(label: string, fn: () => Promise<Row[]>): Promise<Row[]> {
  try {
    return await fn();
  } catch (e) {
    console.warn(`  ⚠︎ "${label}" 리포트 건너뜀: ${(e as Error).message}`);
    return [];
  }
}

async function collect(client: BetaAnalyticsDataClient) {
  const [eventFunnel, totals, perArticle, byProvider, byGrade, topProducts, topPages, byPlacement] =
    await Promise.all([
      safe("event funnel", () =>
        runReport(client, { dimensions: ["eventName"], metrics: ["eventCount"] }),
      ),
      safe("totals", () =>
        runReport(client, {
          dimensions: [],
          metrics: ["sessions", "totalUsers", "screenPageViews"],
        }),
      ),
      safe("per-article funnel", () =>
        runReport(client, {
          dimensions: ["itemListId"],
          metrics: ["itemsViewedInList", "itemsClickedInList"],
          orderByMetric: "itemsClickedInList",
          limit: 30,
        }),
      ),
      safe("provider split", () =>
        runReport(client, {
          dimensions: ["itemBrand"],
          metrics: ["itemsClickedInList"],
          orderByMetric: "itemsClickedInList",
        }),
      ),
      safe("grade split", () =>
        runReport(client, {
          dimensions: ["itemCategory"],
          metrics: ["itemsClickedInList"],
          orderByMetric: "itemsClickedInList",
        }),
      ),
      safe("top products", () =>
        runReport(client, {
          dimensions: ["itemName"],
          metrics: ["itemsClickedInList"],
          orderByMetric: "itemsClickedInList",
          limit: 15,
        }),
      ),
      safe("top pages", () =>
        runReport(client, {
          dimensions: ["pagePath"],
          metrics: ["screenPageViews", "sessions"],
          orderByMetric: "screenPageViews",
          limit: 15,
        }),
      ),
      // placement은 커스텀 이벤트 파라미터 → GA4에서 맞춤 측정기준 등록 시에만 잡힘.
      safe("placement (custom dim)", () =>
        runReport(client, {
          dimensions: ["customEvent:placement"],
          metrics: ["eventCount"],
          eventFilter: "select_item",
        }),
      ),
    ]);

  // 이벤트 카운트를 퍼널 형태로 정리.
  const ev = Object.fromEntries(eventFunnel.map((r) => [r.eventName, Number(r.eventCount)]));
  const funnel = {
    page_view: ev.page_view ?? 0,
    scroll_90: ev.scroll ?? 0, // GA4 향상된 측정 = 90% 스크롤
    view_item_list: ev.view_item_list ?? 0, // 등급표 도달
    select_item: ev.select_item ?? 0, // 전환(제휴 클릭)
    toc_click: ev.toc_click ?? 0,
  };

  return {
    periodDays: DAYS,
    totals: totals[0] ?? {},
    funnel,
    perArticle,
    byProvider,
    byGrade,
    topProducts,
    topPages,
    byPlacement,
  };
}

function buildPrompt(data: unknown): string {
  return `너는 영유아 용품 "등급 비교" 제휴 콘텐츠 사이트(그레이더)의 그로스 분석가다.
수익 모델은 제휴 링크 클릭(쿠팡 파트너스 등)이고, 이 사이트의 북극성 전환 지표는 GA4 'select_item'(제휴 버튼 클릭)이다.
실제 구매 전환은 GA로 추적 불가(쿠팡 측에서 발생)하므로 "클릭"까지가 우리가 최적화할 수 있는 범위다.

아래는 최근 ${DAYS}일 GA4 데이터다. 퍼널은 page_view → scroll(90%) → view_item_list(등급표 도달) → select_item(제휴 클릭) 순서다.

\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

다음을 한국어로, 군더더기 없이 분석해라:
1. **퍼널 진단** — 단계별 이탈률을 계산하고, 가장 크게 새는 구간 한두 곳을 지목. 수치 근거 포함.
2. **글별 진단** — 트래픽 대비 클릭이 아까운 글, 등급표 도달률(view_item_list/page_view)이 낮은 글을 구체적 slug로.
3. **등급·제휴처·위치 신호** — 사람들이 어떤 등급을 클릭하나(S 위주? 가성비?), 제휴처/버튼 위치(placement)별 차이.
4. **우선순위 액션 3~5개** — 각 항목에 (가설 → 구체적 변경 → 측정할 지표) 형식. 추측이면 추측이라고 표시.
데이터가 비어있거나 표본이 적으면 그 한계를 먼저 명시해라.`;
}

async function main() {
  if (!PROPERTY_ID) {
    console.error("✗ GA4_PROPERTY_ID 미설정. .env.local에 추가하세요.");
    process.exit(1);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("✗ ANTHROPIC_API_KEY 미설정.");
    process.exit(1);
  }

  console.log(`▶ GA4 속성 ${PROPERTY_ID} · 최근 ${DAYS}일 데이터 수집 중…`);
  const client = new BetaAnalyticsDataClient();
  const data = await collect(client);

  if (data.funnel.page_view === 0) {
    console.warn("⚠︎ page_view가 0입니다. 아직 데이터가 안 쌓였거나 측정 ID/권한을 확인하세요.");
  }

  console.log(`▶ ${MODEL} 분석 요청 중…\n`);
  const anthropic = new Anthropic();
  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: buildPrompt(data) }],
  });
  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  console.log("═".repeat(60));
  console.log(text);
  console.log("═".repeat(60));
}

main().catch((e) => {
  console.error("✗ 실패:", e);
  process.exit(1);
});
