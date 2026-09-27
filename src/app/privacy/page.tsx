import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME, CONTACT_EMAIL } from "@/lib/site";
import { ReadingPage } from "@/components/content/ReadingPage";
import { DisclosureNote } from "@/components/DisclosureNote";

export const metadata: Metadata = pageMetadata({
  title: "개인정보처리방침",
  description: `${SITE_NAME}의 개인정보 처리와 제휴 링크 안내.`,
  path: "/privacy",
});

const SECTIONS = [
  {
    heading: "1. 수집하는 정보와 목적",
    paragraphs: [
      `${SITE_NAME}는 회원가입을 받지 않으며, 별도의 개인정보를 직접 수집하지 않습니다.`,
      "다만 사이트 운영 과정에서 접속 기록(IP, 브라우저, 방문 페이지)과 쿠키가 자동으로 생성될 수 있으며, 이는 서비스 안정화와 방문 통계 분석 목적에 한해 사용됩니다.",
      `문의 메일(${CONTACT_EMAIL})로 연락하신 경우, 답변을 위해 보내주신 이메일 주소와 문의 내용을 처리 목적 달성 후까지만 보관합니다.`,
    ],
  },
  {
    heading: "2. 쿠키와 브라우저 저장",
    paragraphs: [
      "저장한 글과 상품, 최근 본 글, 화면 테마는 이 브라우저의 로컬 저장소(localStorage)에 보관됩니다. 다른 기기와 동기화되지 않으며, 사이트 데이터 삭제 시 함께 삭제됩니다.",
      "방문 통계를 위해 Google Analytics 4를 사용합니다. Google은 페이지 방문, 접속 환경, 대략적인 위치, 사이트 내 클릭 이벤트 등을 처리하며, 이용자와 세션을 구분하기 위해 _ga 등의 1자 쿠키를 사용할 수 있습니다.",
      "쿠키는 브라우저 설정에서 차단하거나 삭제할 수 있으며, 차단해도 콘텐츠 이용에는 제한이 없습니다. Google의 데이터 처리 세부 내용은 Google 개인정보처리방침에서 확인할 수 있습니다.",
    ],
  },
  {
    heading: "3. 제휴 링크 안내",
    paragraphs: [
      `${SITE_NAME}의 일부 링크는 제휴 링크입니다. 링크를 통해 외부 판매처로 이동해 구매하면, 추가 비용 없이 ${SITE_NAME}가 일정액의 수수료를 받을 수 있습니다.`,
      "제휴 링크를 클릭하면 해당 판매처의 추적 쿠키가 설정될 수 있습니다. 제휴 관계는 해당 링크와 안내 문구에서 확인할 수 있습니다.",
    ],
  },
  {
    heading: "4. 외부 사이트",
    paragraphs: [
      "제휴 링크 등으로 이동하는 외부 사이트의 개인정보 처리는 해당 사이트의 정책을 따릅니다. 외부 사이트에서 발생하는 사항에 대해서는 책임지지 않으니, 각 사이트의 방침을 확인하시기 바랍니다.",
    ],
  },
  {
    heading: "5. 이용자의 권리",
    paragraphs: [
      `보관 중인 본인 정보의 열람, 정정, 삭제를 원하시면 ${CONTACT_EMAIL}로 요청해 주시면 지체 없이 처리합니다.`,
    ],
  },
  {
    heading: "6. 문의",
    paragraphs: [`개인정보 관련 문의: ${CONTACT_EMAIL}`],
  },
];

export default function PrivacyPage() {
  return (
    <ReadingPage
      title="개인정보처리방침"
      description="Grader에서 사용하는 정보와 브라우저 저장 기능, 제휴 링크를 안내합니다."
    >
      {SECTIONS.map((s) => (
        <section key={s.heading} className="mt-10">
          <h2 className="text-title font-medium">{s.heading}</h2>
          {s.paragraphs.map((p, i) => (
            <p key={i} className="mt-3 text-body leading-relaxed text-muted">
              {p}
            </p>
          ))}
        </section>
      ))}

      <DisclosureNote className="mt-12" />
      <p className="mt-4 text-caption text-faint">시행일: 2026.07</p>
    </ReadingPage>
  );
}
