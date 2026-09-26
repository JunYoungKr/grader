import type { ReactNode } from "react";
import { Container, Breadcrumb } from "../ui/Primitives";
export function ReadingPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Container className="py-8 md:py-12">
      <div className="mx-auto max-w-reading">
        <Breadcrumb items={[{ label: title }]} />
        <h1 className="text-heading font-medium">{title}</h1>
        <p className="mb-10 mt-4 text-body text-muted">{description}</p>
        <div className="panel p-6 md:p-10">{children}</div>
      </div>
    </Container>
  );
}
