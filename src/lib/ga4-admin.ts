import { BetaAnalyticsDataClient } from "@google-analytics/data";

export interface Ga4Column {
  name: string;
  kind: "dimension" | "metric";
  type?: string;
}

export interface Ga4Table {
  columns: Ga4Column[];
  rows: string[][];
  rowCount: number;
  error?: string;
  quota?: {
    tokensPerDayRemaining?: number;
    tokensPerHourRemaining?: number;
  };
}

export interface Ga4MetadataItem {
  apiName: string;
  uiName: string;
  description: string;
  category: string;
  customDefinition: boolean;
  type?: string;
}

export interface Ga4MetadataCatalog {
  dimensions: Ga4MetadataItem[];
  metrics: Ga4MetadataItem[];
}

export interface Ga4DashboardData {
  propertyId: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  metadata: Ga4MetadataCatalog;
  reports: {
    overview: Ga4Table;
    trend: Ga4Table;
    acquisition: Ga4Table;
    sources: Ga4Table;
    pages: Ga4Table;
    events: Ga4Table;
    items: Ga4Table;
    geography: Ga4Table;
    technology: Ga4Table;
    placements?: Ga4Table;
    realtime: Ga4Table;
  };
}

type ReportResponse = {
  dimensionHeaders?: { name?: string | null }[] | null;
  metricHeaders?: { name?: string | null; type?: string | number | null }[] | null;
  rows?: {
    dimensionValues?: { value?: string | null }[] | null;
    metricValues?: { value?: string | null }[] | null;
  }[] | null;
  rowCount?: number | null;
  propertyQuota?: {
    tokensPerDay?: { remaining?: number | null } | null;
    tokensPerHour?: { remaining?: number | null } | null;
  } | null;
};

let analyticsClient: BetaAnalyticsDataClient | null = null;
let metadataPromise: Promise<Ga4MetadataCatalog> | null = null;

function propertyId(): string {
  const value = process.env.GA4_PROPERTY_ID?.trim() ?? "";
  if (!/^\d+$/.test(value)) {
    throw new Error("GA4_PROPERTY_ID에 G-가 아닌 숫자형 속성 ID를 설정하세요.");
  }
  return value;
}

function getClient(): BetaAnalyticsDataClient {
  if (analyticsClient) return analyticsClient;

  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (serviceAccountJson) {
    const credentials = JSON.parse(serviceAccountJson) as {
      client_email?: string;
      private_key?: string;
    };
    analyticsClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key?.replace(/\\n/g, "\n"),
      },
    });
  } else if (clientEmail && privateKey) {
    analyticsClient = new BetaAnalyticsDataClient({
      credentials: { client_email: clientEmail, private_key: privateKey },
    });
  } else {
    analyticsClient = new BetaAnalyticsDataClient();
  }
  return analyticsClient;
}

export function getGa4Configuration() {
  const configuredPropertyId = process.env.GA4_PROPERTY_ID?.trim() ?? "";
  const hasInlineCredentials = Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim() ||
      (process.env.GOOGLE_CLIENT_EMAIL?.trim() && process.env.GOOGLE_PRIVATE_KEY?.trim()),
  );
  const hasCredentialsFile = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim());
  return {
    propertyId: configuredPropertyId,
    propertyConfigured: /^\d+$/.test(configuredPropertyId),
    credentialsConfigured: hasInlineCredentials || hasCredentialsFile,
  };
}

function errorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("PERMISSION_DENIED") || message.includes("permission")) {
    return "서비스 계정에 이 GA4 속성의 뷰어 권한이 없습니다.";
  }
  if (message.includes("Could not load the default credentials")) {
    return "Google 서비스 계정 자격 증명을 찾을 수 없습니다.";
  }
  return message;
}

function toTable(response: ReportResponse): Ga4Table {
  const dimensionColumns: Ga4Column[] = (response.dimensionHeaders ?? []).map((header) => ({
    name: header.name ?? "dimension",
    kind: "dimension",
  }));
  const metricColumns: Ga4Column[] = (response.metricHeaders ?? []).map((header) => ({
    name: header.name ?? "metric",
    kind: "metric",
    type: String(header.type ?? ""),
  }));
  return {
    columns: [...dimensionColumns, ...metricColumns],
    rows: (response.rows ?? []).map((row) => [
      ...(row.dimensionValues ?? []).map((value) => value.value ?? ""),
      ...(row.metricValues ?? []).map((value) => value.value ?? "0"),
    ]),
    rowCount: response.rowCount ?? response.rows?.length ?? 0,
    quota: response.propertyQuota
      ? {
          tokensPerDayRemaining: response.propertyQuota.tokensPerDay?.remaining ?? undefined,
          tokensPerHourRemaining: response.propertyQuota.tokensPerHour?.remaining ?? undefined,
        }
      : undefined,
  };
}

function emptyError(error: unknown): Ga4Table {
  return { columns: [], rows: [], rowCount: 0, error: errorMessage(error) };
}

export function normalizeGa4Date(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  return /^(?:\d{4}-\d{2}-\d{2}|\d+daysAgo|today|yesterday)$/.test(value)
    ? value
    : fallback;
}

export async function getGa4Metadata(): Promise<Ga4MetadataCatalog> {
  if (metadataPromise) return metadataPromise;
  metadataPromise = (async () => {
    const [metadata] = await getClient().getMetadata({
      name: `properties/${propertyId()}/metadata`,
    });
    const dimensions = (metadata.dimensions ?? []).map((item) => ({
      apiName: item.apiName ?? "",
      uiName: item.uiName ?? item.apiName ?? "",
      description: item.description ?? "",
      category: item.category ?? "기타",
      customDefinition: item.customDefinition ?? false,
    }));
    const metrics = (metadata.metrics ?? []).map((item) => ({
      apiName: item.apiName ?? "",
      uiName: item.uiName ?? item.apiName ?? "",
      description: item.description ?? "",
      category: item.category ?? "기타",
      customDefinition: item.customDefinition ?? false,
      type: String(item.type ?? ""),
    }));
    return {
      dimensions: dimensions.filter((item) => item.apiName),
      metrics: metrics.filter((item) => item.apiName),
    };
  })().catch((error) => {
    metadataPromise = null;
    throw error;
  });
  return metadataPromise;
}

async function runCoreReport(input: {
  dimensions?: string[];
  metrics: string[];
  startDate: string;
  endDate: string;
  limit?: number;
  orderByMetric?: string;
  orderByDimension?: string;
}): Promise<Ga4Table> {
  try {
    const [response] = await getClient().runReport({
      property: `properties/${propertyId()}`,
      dateRanges: [{ startDate: input.startDate, endDate: input.endDate }],
      dimensions: (input.dimensions ?? []).map((name) => ({ name })),
      metrics: input.metrics.map((name) => ({ name })),
      limit: input.limit ?? 50,
      orderBys: input.orderByMetric
        ? [{ metric: { metricName: input.orderByMetric }, desc: true }]
        : input.orderByDimension
          ? [{ dimension: { dimensionName: input.orderByDimension }, desc: false }]
          : undefined,
      returnPropertyQuota: true,
    });
    return toTable(response as ReportResponse);
  } catch (error) {
    return emptyError(error);
  }
}

async function runRealtimeReport(): Promise<Ga4Table> {
  try {
    const [response] = await getClient().runRealtimeReport({
      property: `properties/${propertyId()}`,
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "activeUsers" }, { name: "eventCount" }],
      minuteRanges: [{ startMinutesAgo: 29, endMinutesAgo: 0, name: "최근 30분" }],
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 30,
      returnPropertyQuota: true,
    });
    return toTable(response as ReportResponse);
  } catch (error) {
    return emptyError(error);
  }
}

export async function getGa4Dashboard(input: {
  startDate: string;
  endDate: string;
}): Promise<Ga4DashboardData> {
  const metadata = await getGa4Metadata();
  const dimensionNames = new Set(metadata.dimensions.map((item) => item.apiName));

  const [
    overview,
    trend,
    acquisition,
    sources,
    pages,
    events,
    items,
    geography,
    technology,
    placements,
    realtime,
  ] = await Promise.all([
    runCoreReport({
      metrics: [
        "activeUsers",
        "totalUsers",
        "newUsers",
        "sessions",
        "engagedSessions",
        "engagementRate",
        "averageSessionDuration",
        "screenPageViews",
        "eventCount",
        "keyEvents",
      ],
      ...input,
      limit: 1,
    }),
    runCoreReport({
      dimensions: ["date"],
      metrics: ["activeUsers", "sessions", "screenPageViews", "eventCount", "keyEvents"],
      orderByDimension: "date",
      ...input,
      limit: 400,
    }),
    runCoreReport({
      dimensions: ["sessionDefaultChannelGroup"],
      metrics: ["sessions", "activeUsers", "engagedSessions", "engagementRate", "keyEvents"],
      orderByMetric: "sessions",
      ...input,
    }),
    runCoreReport({
      dimensions: ["sessionSourceMedium"],
      metrics: ["sessions", "activeUsers", "engagedSessions", "keyEvents"],
      orderByMetric: "sessions",
      ...input,
    }),
    runCoreReport({
      dimensions: ["pagePathPlusQueryString", "pageTitle"],
      metrics: [
        "screenPageViews",
        "activeUsers",
        "sessions",
        "averageSessionDuration",
        "eventCount",
        "keyEvents",
      ],
      orderByMetric: "screenPageViews",
      ...input,
    }),
    runCoreReport({
      dimensions: ["eventName"],
      metrics: ["eventCount", "totalUsers", "eventCountPerActiveUser", "keyEvents"],
      orderByMetric: "eventCount",
      ...input,
    }),
    runCoreReport({
      dimensions: ["itemName", "itemBrand", "itemCategory", "itemListId"],
      metrics: ["itemsViewed", "itemsViewedInList", "itemsClickedInList", "itemRevenue"],
      orderByMetric: "itemsClickedInList",
      ...input,
    }),
    runCoreReport({
      dimensions: ["country", "region", "city"],
      metrics: ["activeUsers", "sessions", "engagementRate", "keyEvents"],
      orderByMetric: "activeUsers",
      ...input,
    }),
    runCoreReport({
      dimensions: ["deviceCategory", "browser", "operatingSystem"],
      metrics: ["activeUsers", "sessions", "engagementRate", "screenPageViews"],
      orderByMetric: "activeUsers",
      ...input,
    }),
    dimensionNames.has("customEvent:placement")
      ? runCoreReport({
          dimensions: ["customEvent:placement"],
          metrics: ["eventCount", "totalUsers"],
          orderByMetric: "eventCount",
          ...input,
        })
      : Promise.resolve(undefined),
    runRealtimeReport(),
  ]);

  return {
    propertyId: propertyId(),
    startDate: input.startDate,
    endDate: input.endDate,
    generatedAt: new Date().toISOString(),
    metadata,
    reports: {
      overview,
      trend,
      acquisition,
      sources,
      pages,
      events,
      items,
      geography,
      technology,
      placements,
      realtime,
    },
  };
}

export async function runGa4Explorer(input: {
  dimensions: string[];
  metrics: string[];
  startDate: string;
  endDate: string;
  limit?: number;
}): Promise<Ga4Table> {
  const metadata = await getGa4Metadata();
  const allowedDimensions = new Set(metadata.dimensions.map((item) => item.apiName));
  const allowedMetrics = new Set(metadata.metrics.map((item) => item.apiName));
  const dimensions = input.dimensions.filter((name) => allowedDimensions.has(name)).slice(0, 9);
  const metrics = input.metrics.filter((name) => allowedMetrics.has(name)).slice(0, 10);
  if (metrics.length === 0) {
    return { columns: [], rows: [], rowCount: 0, error: "측정항목을 하나 이상 선택하세요." };
  }
  return runCoreReport({
    dimensions,
    metrics,
    startDate: input.startDate,
    endDate: input.endDate,
    limit: Math.min(Math.max(input.limit ?? 100, 1), 10_000),
    orderByMetric: metrics[0],
  });
}
