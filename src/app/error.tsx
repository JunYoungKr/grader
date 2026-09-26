"use client";
import { Container } from "@/components/ui/Primitives";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <Container className="py-16">
      <div className="panel p-8 text-center">
        <h1 className="text-section font-medium">
          잠시 정보를 불러오지 못했어요.
        </h1>
        <p className="mt-3 text-muted">잠시 후 다시 시도해 주세요.</p>
        <button className="button button-primary mt-6" onClick={() => reset()}>
          다시 시도하기
        </button>
      </div>
    </Container>
  );
}
