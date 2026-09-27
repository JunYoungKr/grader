import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { CONTACT_EMAIL, OPERATOR_NAME } from "@/lib/site";
import {
  Container,
  Breadcrumb,
  SectionHeading,
  ButtonLink,
} from "@/components/ui/Primitives";
import { BuyingChecklist } from "@/components/content/BuyingChecklist";
import { DisclosureNote } from "@/components/DisclosureNote";
export const metadata: Metadata = pageMetadata({
  title: "Grader의 기준",
  description:
    "주부의 매일을 생각하는 살림 가이드. 우리 집에 맞는 제품을 고르는 기준과 콘텐츠 작성 원칙을 소개합니다.",
  path: "/about",
});
const principles = [
  {
    title: "사용 조건",
    body: "크기, 설치 조건, 관리 방법을 정리합니다. 집의 공간과 사용 방식에 맞는지 비교할 수 있도록 돕습니다.",
  },
  {
    title: "정보 출처",
    body: "공개 사양과 직접 사용한 경험을 구분하고 출처를 남깁니다. 확인하지 않은 성능이나 사용 경험은 작성하지 않습니다.",
  },
  {
    title: "가격 조회일",
    body: "가격을 수집한 날짜를 표시합니다. 현재 가격과 배송 조건은 구매 전 판매처에서 확인해야 합니다.",
  },
  {
    title: "제휴 링크",
    body: "일부 구매 링크를 통해 수수료를 받을 수 있습니다. 해당 링크에 제휴 관계를 표시합니다.",
  },
];
export default function AboutPage() {
  return (
    <Container className="py-8 md:py-12">
      <Breadcrumb items={[{ label: "Grader의 기준" }]} />
      <header className="max-w-reading">
        <h1 className="text-heading font-medium">Grader의 기준</h1>
        <p className="mt-5 text-lead text-muted">
          Grader는 주부를 위한 살림 가이드입니다. 생활용품의 사용 조건과 구매
          전에 확인할 정보를 정리합니다.
        </p>
      </header>
      <section
        id="criteria"
        className="section-block border-t border-hairline pt-8"
      >
        <SectionHeading title="구매 전 확인" />
        <BuyingChecklist />
      </section>
      <section className="section-block">
        <SectionHeading title="작성 원칙" />
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {principles.map((p) => (
            <div key={p.title} className="border-t border-hairline pt-5">
              <h3 className="mb-3 text-title font-medium">{p.title}</h3>
              <p className="text-body text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section-block flex flex-col items-start justify-between gap-6 border-t border-hairline pt-8 sm:flex-row">
        <div>
          <h2 className="text-section font-medium">문의 및 정정 요청</h2>
          <p className="mt-3 text-small text-muted">
            잘못된 정보나 추가로 확인할 내용이 있다면 알려주세요.
          </p>
          {!OPERATOR_NAME.startsWith("[") && (
            <p className="mt-2 text-small text-muted">
              운영자: {OPERATOR_NAME}
            </p>
          )}
          <a className="text-link mt-2" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </div>
        <ButtonLink href="/browse" variant="secondary">
          살림 둘러보기
        </ButtonLink>
      </section>
      <DisclosureNote className="mt-8" />
    </Container>
  );
}
