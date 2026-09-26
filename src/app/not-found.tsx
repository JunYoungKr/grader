import { Container, EmptyState } from "@/components/ui/Primitives";
export default function NotFound() {
  return (
    <Container className="py-16">
      <EmptyState
        title="이 페이지는 찾을 수 없어요"
        description="주소가 바뀌었거나 아직 공개되지 않은 글이에요. 다른 살림 정보를 둘러보세요."
        href="/browse"
      />
    </Container>
  );
}
