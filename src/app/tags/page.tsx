import styles from "./tagsPage.module.css";
import CardList from "@/components/cardList/CardList";
import TagsPageClient from "./tagsPageClient";
import { TagsPageSearchParams, TagWithPostCount } from "@/types/tag";
import { Tag } from "@prisma/client";
const TagsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tags?: string }>;
}) => {
  const params = await searchParams;
  const page: number = Number(params.page) || 1;
  const rawTags: string = params.tags || "";
  const tags: string[] = rawTags ? rawTags.split(".").filter((tag) => tag !== "") : [];

  let allTags: TagWithPostCount[] = [];
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (baseUrl) {
      const res = await fetch(`${baseUrl}/api/tags`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data: TagWithPostCount[] = await res.json();
        allTags = Array.from(new Map(data.map((tag) => [tag.name, tag])).values());
      }
    }
  } catch (error: any) {
    console.error("태그 데이터 가져오기 실패:", error);
  }

  return (
    <div className={styles.container}>
      <h1>태그별 포스트</h1>
      <TagsPageClient initialTags={tags} initialPage={page} allTags={allTags} />
      <div className={styles.content}>
        <CardList page={page} tags={tags} />
      </div>
    </div>
  );
};

export default TagsPage;
