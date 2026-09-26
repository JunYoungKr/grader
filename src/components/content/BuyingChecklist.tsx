const checks = [
  { title: "크기", text: "놓을 공간과 문을 여는 데 필요한 여유를 확인하세요." },
  {
    title: "사용 조건",
    text: "사용 인원과 횟수, 설치할 곳의 조건을 확인하세요.",
  },
  {
    title: "관리 방법",
    text: "세척 방법과 교체할 소모품의 비용을 확인하세요.",
  },
];

export function BuyingChecklist() {
  return (
    <dl className="grid gap-6 md:grid-cols-3 md:gap-8">
      {checks.map((check) => (
        <div key={check.title}>
          <dt className="text-body font-medium">{check.title}</dt>
          <dd className="mt-2 text-small text-muted">{check.text}</dd>
        </div>
      ))}
    </dl>
  );
}
