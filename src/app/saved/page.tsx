import type { Metadata } from "next";
import { Container, Breadcrumb } from "@/components/ui/Primitives";
import { SavedCollection } from "@/components/saved/SavedCollection";
export const metadata: Metadata = {
  title: "저장한 살림",
  robots: { index: false, follow: true },
};
export default function SavedPage() {
  return (
    <Container className="py-8 md:py-12">
      <Breadcrumb items={[{ label: "저장한 살림" }]} />
      <h1 className="text-heading font-medium">저장한 살림</h1>
      <p className="mb-8 mt-3 text-body text-muted">
        이 브라우저에 저장한 글과 상품입니다. 브라우저 데이터를 지우면 목록도
        삭제됩니다.
      </p>
      <SavedCollection />
    </Container>
  );
}
