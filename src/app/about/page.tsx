import type { Metadata } from "next";
import { SITE_NAME, OPERATOR_NAME, CONTACT_EMAIL } from "@/lib/site";
import { GRADE_STYLES } from "@/lib/grade";
import { GradeBadge } from "@/components/GradeBadge";
import { MethodologyStrip } from "@/components/MethodologyStrip";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { SourceList } from "@/components/SourceList";
import { DisclosureNote } from "@/components/DisclosureNote";
import type { Grade } from "@/lib/types";

export const metadata: Metadata = {
  title: "소개 · 평가 방법론",
  description: `${SITE_NAME}는 제품을 안전성·성능·성분·가격으로 등급화해 비교합니다. 평가 방법, 객관성 원칙, 운영자 정보를 안내합니다.`,
};

const GRADES: Grade[] = ["S", "A", "B", "C"];

const PRINCIPLES = [
  {
    title: "광고비와 분리된 평가",
    body: "등급은 제휴 수수료·광고비와 무관하게 매깁니다. 수수료를 더 준다고 등급이 오르지 않습니다.",
  },
  {
    title: "1차 출처 기반",
    body: "안전인증 정보(국가기술표준원), 비교시험(한국소비자원), 성분 기준(식약처)과 관련 법령을 근거로 합니다. 직접 체험을 지어내지 않습니다.",
  },
  {
    title: "가격은 조회 시점 기준",
    body: "가격은 수시로 바뀌므로 조회 시점을 함께 표기하고, 실시간 가격은 판매처 링크로 확인하도록 안내합니다.",
  },
];

const SOURCES = [
  { label: "국가기술표준원 — 어린이제품·전기·생활용품 안전인증 정보", url: "https://www.kats.go.kr/" },
  { label: "한국소비자원 — 품목별 비교시험 자료", url: "https://www.kca.go.kr/" },
  { label: "식품의약품안전처 — 화장품·성분 안전 기준", url: "https://www.mfds.go.kr/" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-content px-5 pb-16 pt-10">
      <MethodologyStrip />
      <h1 className="mt-3 text-3xl font-medium leading-tight tracking-tight">
        {SITE_NAME} 소개
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        {SITE_NAME}는 <strong className="font-medium text-ink">쿠팡 같은 쇼핑몰에서 뭘 살지 막막한 순간</strong>을
        위한 사이트입니다. 검색하면 쏟아지는 비슷한 제품들을{" "}
        <strong className="font-medium text-ink">안전성·성능·성분·가격</strong> 기준으로
        등급화(S/A/B/C)해, 광고가 아닌 근거로 빠르게 결정하도록 돕습니다. 육아·출산을
        시작점으로 생활·주방, 가전·디지털, 식품·건강, 뷰티 등 생활 전반의 제품으로 넓혀가고
        있습니다.
      </p>

      <section className="mt-12">
        <h2 className="text-lg font-medium">등급은 이렇게 나눕니다</h2>
        <dl className="mt-4 divide-y divide-hairline border-y border-hairline">
          {GRADES.map((g) => (
            <div key={g} className="flex items-center gap-4 py-3">
              <dt className="shrink-0">
                <GradeBadge grade={g} size="sm" />
              </dt>
              <dd className="text-[15px] leading-relaxed">
                <span className="font-medium">{GRADE_STYLES[g].label}</span>
                <span className="text-muted">
                  {" "}
                  — {GRADE_DESC[g]}
                </span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[13px] leading-relaxed text-muted">
          축(안전성·성분·휴대성·가성비 등)은 카테고리마다 다르며, 각 비교 글의 “평가 기준”
          섹션에 무엇을 어떻게 봤는지 공개합니다.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-medium">평가 원칙</h2>
        <div className="mt-4 space-y-4">
          {PRINCIPLES.map((p) => (
            <div key={p.title}>
              <h3 className="text-[15px] font-medium">{p.title}</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-medium">운영자</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          운영자: <span className="text-ink">{OPERATOR_NAME}</span> · 문의:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand hover:underline">
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          오류·이의 제기나 정정 요청을 보내주시면 출처와 함께 검토해 반영합니다.
        </p>
      </section>

      <MedicalDisclaimer className="mt-12" />

      <SourceList sources={SOURCES} />

      <DisclosureNote className="mt-12" />
    </div>
  );
}

const GRADE_DESC: Record<Grade, string> = {
  S: "안전인증을 모두 충족하고 핵심 축에서 약점이 없는 최상위. 우선 추천합니다.",
  A: "필수 요건을 갖춘 우수 등급. 가격·특정 용도에서 합리적인 선택입니다.",
  B: "기본은 갖췄으나 일부 축에서 타협이 있는 보통 등급. 용도가 맞으면 무난합니다.",
  C: "최소 요건 위주의 입문 등급. 예산이 우선일 때만 권합니다.",
};
