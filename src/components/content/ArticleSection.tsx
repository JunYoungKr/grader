export function ArticleSection({
  id,
  heading,
  paragraphs,
}: {
  id: string;
  heading: string;
  paragraphs: string[];
}) {
  return (
    <section id={id} className="section-block article-copy">
      <h2 className="mb-5 text-section font-semibold">{heading}</h2>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </section>
  );
}
