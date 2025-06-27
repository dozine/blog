import dynamic from "next/dynamic";
import { Category } from "@prisma/client";
import { CategoryListClientProps } from "@/types";

const CategoryListClient = dynamic<CategoryListClientProps>(
  () => import("./CategoryListClient"),
  {}
);

const CategoryListServer = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    console.error("Next_PUBLIC_BASE_URL이 설정되지 않았습니다.");
  }
  const res = await fetch(`${baseUrl}/api/categories`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    console.error(
      "Failed to fetch categories on server:",
      res.status,
      res.statusText
    );
    return <p>카테고리를 불러오는 데 실패했습니다.</p>;
  }

  const categories: Category[] = await res.json();

  return <CategoryListClient initialCategories={categories} />;
};

export default CategoryListServer;
