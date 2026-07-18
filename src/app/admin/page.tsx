import type { Metadata } from "next";
import {
  adminPasswordConfigured,
  isAdminAuthenticated,
} from "@/lib/admin-auth";
import {
  getGa4Configuration,
  getGa4Dashboard,
  normalizeGa4Date,
  runGa4Explorer,
  type Ga4Column,
  type Ga4DashboardData,
  type Ga4MetadataItem,
  type Ga4Table,
} from "@/lib/ga4-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "GA4 관리자",
  robots: { index: false, follow: false },
};

type SearchParams = Record<string, string | string[] | undefined>;

const LABELS: Record<string, string> = {
  activeUsers: "활성 사용자",
  totalUsers: "전체 사용자",
  newUsers: "신규 사용자",
  sessions: "세션",
  engagedSessions: "참여 세션",
  engagementRate: "참여율",
  averageSessionDuration: "평균 세션 시간",
  screenPageViews: "페이지뷰",
  eventCount: "이벤트",
  eventCountPerActiveUser: "사용자당 이벤트",
  keyEvents: "주요 이벤트",
  date: "날짜",
  sessionDefaultChannelGroup: "기본 채널 그룹",
  sessionSourceMedium: "소스 / 매체",
  pagePathPlusQueryString: "페이지 경로",
  pageTitle: "페이지 제목",
  eventName: "이벤트 이름",
  itemName: "상품명",
  itemBrand: "제휴처",
  itemCategory: "상품 카테고리",
  itemListId: "상품 목록",
  itemsViewed: "상품 조회",
  itemsViewedInList: "목록 노출",
  itemsClickedInList: "상품 클릭",
  itemRevenue: "상품 매출",
  country: "국가",
  region: "지역",
  city: "도시",
  deviceCategory: "기기",
  browser: "브라우저",
  operatingSystem: "운영체제",
  "customEvent:placement": "클릭 위치",
};

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function many(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function label(name: string): string {
  return LABELS[name] ?? name;
}

function formatValue(column: Ga4Column, value: string): string {
  if (!value || value === "(not set)") return "—";
  if (column.name === "date" && /^\d{8}$/.test(value)) {
    return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`;
  }
  const number = Number(value);
  if (!Number.isFinite(number) || column.kind === "dimension") return value;
  if (/Rate$/.test(column.name) || column.name.includes("Rate:")) {
    return `${(number * 100).toFixed(1)}%`;
  }
  if (column.name === "averageSessionDuration") {
    const minutes = Math.floor(number / 60);
    const seconds = Math.round(number % 60);
    return minutes ? `${minutes}분 ${seconds}초` : `${seconds}초`;
  }
  if (/Revenue|revenue/.test(column.name)) {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(number);
  }
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: Number.isInteger(number) ? 0 : 2,
  }).format(number);
}

function Login({ error }: { error?: string }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-5 py-16">
      <section className="w-full rounded-xl border border-hairline bg-surface p-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          Grader Admin
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">GA4 대시보드</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          관리자 비밀번호를 입력하면 실시간 방문과 전체 GA4 보고서를 볼 수 있습니다.
        </p>
        {!adminPasswordConfigured() && (
          <div className="mt-5 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            서버 환경변수 <code>ADMIN_PASSWORD</code>가 설정되지 않았습니다.
          </div>
        )}
        {error === "invalid" && (
          <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            비밀번호가 올바르지 않습니다.
          </p>
        )}
        <form action="/admin/session" method="post" className="mt-6 space-y-4">
          <label className="block text-sm font-medium" htmlFor="admin-password">
            비밀번호
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            className="w-full rounded-lg border border-hairline bg-paper px-4 py-3 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-on-brand transition hover:opacity-90 disabled:opacity-50"
            disabled={!adminPasswordConfigured()}
          >
            로그인
          </button>
        </form>
      </section>
    </div>
  );
}

function SetupRequired({
  propertyConfigured,
  credentialsConfigured,
}: {
  propertyConfigured: boolean;
  credentialsConfigured: boolean;
}) {
  return (
    <section className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-amber-950">
      <h2 className="text-lg font-semibold">GA4 읽기 권한 설정이 필요합니다</h2>
      <p className="mt-2 text-sm leading-relaxed">
        웹 태그의 측정 ID는 방문 데이터를 보내는 값이고, 이 화면에서 보고서를 읽으려면
        숫자형 속성 ID와 서비스 계정이 별도로 필요합니다.
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          GA4 관리의 <strong>속성 설정</strong>에서 숫자형 속성 ID를 찾아
          <code className="mx-1 rounded bg-white/70 px-1">GA4_PROPERTY_ID</code>로 설정
          {propertyConfigured ? " ✓" : ""}
        </li>
        <li>Google Cloud에서 Analytics Data API를 활성화하고 서비스 계정 생성</li>
        <li>GA4 속성 액세스 관리에서 서비스 계정 이메일에 뷰어 권한 부여</li>
        <li>
          로컬은 <code>GOOGLE_APPLICATION_CREDENTIALS</code>, 배포 환경은
          <code className="mx-1">GOOGLE_CLIENT_EMAIL</code>과
          <code>GOOGLE_PRIVATE_KEY</code>를 설정
          {credentialsConfigured ? " ✓" : ""}
        </li>
      </ol>
    </section>
  );
}

function MetricCards({ table }: { table: Ga4Table }) {
  if (table.error) return <ErrorNotice message={table.error} />;
  const values = table.rows[0] ?? [];
  const featured = new Set([
    "activeUsers",
    "sessions",
    "screenPageViews",
    "engagementRate",
    "averageSessionDuration",
    "keyEvents",
  ]);
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {table.columns.map((column, index) =>
        featured.has(column.name) ? (
          <article key={column.name} className="rounded-xl border border-hairline bg-paper p-4">
            <p className="text-xs text-muted">{label(column.name)}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
              {formatValue(column, values[index] ?? "0")}
            </p>
          </article>
        ) : null,
      )}
    </div>
  );
}

function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      {message}
    </div>
  );
}

function ReportTable({ table, maxRows = 50 }: { table: Ga4Table; maxRows?: number }) {
  if (table.error) return <ErrorNotice message={table.error} />;
  if (table.rows.length === 0) {
    return <p className="rounded-lg bg-surface p-5 text-sm text-muted">아직 수집된 데이터가 없습니다.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-hairline">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-surface text-xs text-muted">
          <tr>
            {table.columns.map((column) => (
              <th key={column.name} scope="col" className="whitespace-nowrap px-3 py-3 font-medium">
                {label(column.name)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {table.rows.slice(0, maxRows).map((row, rowIndex) => (
            <tr key={`${row.join("|")}-${rowIndex}`} className="hover:bg-surface/60">
              {table.columns.map((column, columnIndex) => (
                <td
                  key={column.name}
                  className={`max-w-sm px-3 py-3 ${
                    column.kind === "metric" ? "whitespace-nowrap text-right tabular-nums" : ""
                  }`}
                >
                  {formatValue(column, row[columnIndex] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {table.rowCount > maxRows && (
        <p className="border-t border-hairline bg-surface px-3 py-2 text-xs text-muted">
          전체 {table.rowCount.toLocaleString("ko-KR")}행 중 {maxRows}행 표시
        </p>
      )}
    </div>
  );
}

function ReportSection({
  id,
  title,
  description,
  table,
}: {
  id: string;
  title: string;
  description: string;
  table: Ga4Table;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-xl border border-hairline bg-paper p-5 md:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <ReportTable table={table} />
    </section>
  );
}

function groupMetadata(items: Ga4MetadataItem[]) {
  return Object.entries(
    items.reduce<Record<string, Ga4MetadataItem[]>>((groups, item) => {
      (groups[item.category] ??= []).push(item);
      return groups;
    }, {}),
  ).sort(([left], [right]) => left.localeCompare(right, "ko"));
}

function Explorer({
  data,
  table,
  dimensions,
  metrics,
  startDate,
  endDate,
}: {
  data: Ga4DashboardData;
  table?: Ga4Table;
  dimensions: string[];
  metrics: string[];
  startDate: string;
  endDate: string;
}) {
  const exportParams = new URLSearchParams({ start: startDate, end: endDate });
  dimensions.forEach((value) => exportParams.append("dimension", value));
  metrics.forEach((value) => exportParams.append("metric", value));

  return (
    <section id="explorer" className="scroll-mt-24 rounded-xl border border-brand/30 bg-brand-soft/50 p-5 md:p-6">
      <h2 className="text-lg font-semibold">전체 데이터 탐색기</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        이 속성에서 사용 가능한 차원 {data.metadata.dimensions.length.toLocaleString("ko-KR")}개와
        측정항목 {data.metadata.metrics.length.toLocaleString("ko-KR")}개를 자유롭게 조합합니다.
        호환되지 않는 조합은 GA4 오류를 그대로 안내합니다.
      </p>
      <form method="get" action="/admin" className="mt-5 grid gap-4 lg:grid-cols-2">
        <input type="hidden" name="start" value={startDate} />
        <input type="hidden" name="end" value={endDate} />
        <input type="hidden" name="explore" value="1" />
        <label className="block text-sm font-medium">
          차원 (최대 9개)
          <select
            name="dimension"
            multiple
            size={11}
            defaultValue={dimensions}
            className="mt-2 w-full rounded-lg border border-hairline bg-paper p-2 font-mono text-xs"
          >
            {groupMetadata(data.metadata.dimensions).map(([category, items]) => (
              <optgroup key={category} label={category}>
                {items.map((item) => (
                  <option key={item.apiName} value={item.apiName} title={item.description}>
                    {item.uiName} · {item.apiName}{item.customDefinition ? " (맞춤)" : ""}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          측정항목 (최대 10개)
          <select
            name="metric"
            multiple
            required
            size={11}
            defaultValue={metrics}
            className="mt-2 w-full rounded-lg border border-hairline bg-paper p-2 font-mono text-xs"
          >
            {groupMetadata(data.metadata.metrics).map(([category, items]) => (
              <optgroup key={category} label={category}>
                {items.map((item) => (
                  <option key={item.apiName} value={item.apiName} title={item.description}>
                    {item.uiName} · {item.apiName}{item.customDefinition ? " (맞춤)" : ""}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2 lg:col-span-2">
          <button type="submit" className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-on-brand">
            보고서 조회
          </button>
          {table && metrics.length > 0 && (
            <a
              href={`/admin/export?${exportParams.toString()}`}
              className="rounded-lg border border-hairline bg-paper px-4 py-2.5 text-sm font-medium"
            >
              CSV 다운로드
            </a>
          )}
        </div>
      </form>
      {table && (
        <div className="mt-6">
          <ReportTable table={table} maxRows={100} />
        </div>
      )}
    </section>
  );
}

function Dashboard({
  data,
  range,
  explorerTable,
  explorerDimensions,
  explorerMetrics,
}: {
  data: Ga4DashboardData;
  range: number;
  explorerTable?: Ga4Table;
  explorerDimensions: string[];
  explorerMetrics: string[];
}) {
  const reports = data.reports;
  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 md:px-6">
      <header className="flex flex-col gap-4 border-b border-hairline pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">GA4 Analytics</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Grader 데이터 센터</h1>
          <p className="mt-2 text-sm text-muted">
            속성 {data.propertyId} · {data.startDate} ~ {data.endDate} · 갱신 {new Date(data.generatedAt).toLocaleString("ko-KR")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/admin/content"
            className="rounded-lg border border-hairline px-3 py-2 text-sm font-medium"
          >
            글 관리
          </a>
          <form method="get" action="/admin" className="flex gap-2">
            <select name="range" defaultValue={String(range)} className="rounded-lg border border-hairline bg-paper px-3 py-2 text-sm">
              <option value="7">최근 7일</option>
              <option value="28">최근 28일</option>
              <option value="90">최근 90일</option>
              <option value="365">최근 1년</option>
            </select>
            <button className="rounded-lg border border-hairline px-3 py-2 text-sm font-medium">적용</button>
          </form>
          <form action="/admin/logout" method="post">
            <button className="rounded-lg bg-ink px-3 py-2 text-sm font-medium text-paper">로그아웃</button>
          </form>
        </div>
      </header>

      <nav className="sticky top-0 z-20 -mx-4 mt-4 flex gap-4 overflow-x-auto border-y border-hairline bg-paper/95 px-4 py-3 text-sm backdrop-blur md:-mx-6 md:px-6">
        {[
          ["realtime", "실시간"],
          ["trend", "추이"],
          ["acquisition", "유입"],
          ["pages", "페이지"],
          ["events", "이벤트"],
          ["items", "상품"],
          ["geography", "지역"],
          ["technology", "기기"],
          ["explorer", "전체 탐색"],
        ].map(([href, text]) => (
          <a key={href} href={`#${href}`} className="whitespace-nowrap text-muted hover:text-ink">
            {text}
          </a>
        ))}
      </nav>

      <div className="mt-6 space-y-6">
        <MetricCards table={reports.overview} />
        <ReportSection
          id="realtime"
          title="실시간 · 최근 30분"
          description="이벤트별 현재 활성 사용자와 발생 횟수"
          table={reports.realtime}
        />
        <ReportSection id="trend" title="일별 추이" description="방문, 페이지뷰, 이벤트, 주요 이벤트의 변화" table={reports.trend} />
        <div className="grid gap-6 xl:grid-cols-2">
          <ReportSection id="acquisition" title="유입 채널" description="채널 그룹별 세션과 참여 성과" table={reports.acquisition} />
          <ReportSection id="sources" title="소스 / 매체" description="구체적인 유입 출처와 매체" table={reports.sources} />
        </div>
        <ReportSection id="pages" title="페이지 성과" description="콘텐츠별 트래픽, 체류, 이벤트 성과" table={reports.pages} />
        <ReportSection id="events" title="전체 이벤트" description="page_view, select_item 등 수집된 모든 이벤트" table={reports.events} />
        <ReportSection id="items" title="상품·제휴 퍼널" description="상품 목록 노출에서 제휴 링크 클릭까지" table={reports.items} />
        {reports.placements && (
          <ReportSection id="placements" title="클릭 위치" description="등록된 placement 맞춤 측정기준별 이벤트" table={reports.placements} />
        )}
        <div className="grid gap-6 xl:grid-cols-2">
          <ReportSection id="geography" title="지역" description="국가·지역·도시별 사용자와 참여" table={reports.geography} />
          <ReportSection id="technology" title="기기·브라우저" description="접속 환경별 사용 패턴" table={reports.technology} />
        </div>
        <Explorer
          data={data}
          table={explorerTable}
          dimensions={explorerDimensions}
          metrics={explorerMetrics}
          startDate={data.startDate}
          endDate={data.endDate}
        />
        <p className="rounded-lg bg-surface p-4 text-xs leading-relaxed text-muted">
          GA4 Data API는 GA4 보고 ID 설정을 따르는 집계 데이터만 제공합니다. 개별 사용자의 원시 이벤트나 개인정보는 이 화면에서 조회할 수 없습니다.
          대규모 원시 이벤트 분석이 필요하면 GA4 BigQuery Export를 별도로 구성해야 합니다.
        </p>
      </div>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  if (!(await isAdminAuthenticated())) {
    return <Login error={one(params.error)} />;
  }

  const config = getGa4Configuration();
  if (!config.propertyConfigured || !config.credentialsConfigured) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">GA4 관리자 설정</h1>
          <form action="/admin/logout" method="post">
            <button className="rounded-lg border border-hairline px-3 py-2 text-sm">로그아웃</button>
          </form>
        </div>
        <SetupRequired {...config} />
      </div>
    );
  }

  const range = Math.min(Math.max(Number(one(params.range) ?? 28) || 28, 1), 730);
  const startDate = normalizeGa4Date(one(params.start), `${range}daysAgo`);
  const endDate = normalizeGa4Date(one(params.end), "today");
  const explorerDimensions = many(params.dimension).slice(0, 9);
  const explorerMetrics = many(params.metric).slice(0, 10);

  try {
    const data = await getGa4Dashboard({ startDate, endDate });
    const explorerTable =
      one(params.explore) === "1"
        ? await runGa4Explorer({
            dimensions: explorerDimensions,
            metrics: explorerMetrics,
            startDate,
            endDate,
            limit: 1000,
          })
        : undefined;
    return (
      <Dashboard
        data={data}
        range={range}
        explorerTable={explorerTable}
        explorerDimensions={explorerDimensions}
        explorerMetrics={explorerMetrics}
      />
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return (
      <div className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="text-2xl font-semibold">GA4 연결 오류</h1>
        <div className="mt-6"><ErrorNotice message={message} /></div>
        <p className="mt-4 text-sm text-muted">환경변수와 GA4 속성의 서비스 계정 뷰어 권한을 확인하세요.</p>
      </div>
    );
  }
}
