import { ArticleForm } from "@/components/admin/ArticleForm";

export default function AdminNewPage() {
  return (
    <div>
      <h1 className="text-xl font-medium">새 글</h1>
      <div className="mt-6">
        <ArticleForm />
      </div>
    </div>
  );
}
