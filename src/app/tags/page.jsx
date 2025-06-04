"use client";
import TagList from "@/components/tagList/TagList";
import styles from "./tagsPage.module.css";
import CardList from "@/components/cardList/CardList";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

const TagsPage = () => {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const router = useRouter();
  const rawTags = searchParams.get("tags") || "";
  const tags = rawTags ? rawTags.split(".").filter((tag) => tag !== "") : [];

  const handleTagClick = (tagName) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentTags = params.get("tags") ? params.get("tags").split(".") : [];
    if (!currentTags.includes(tagName)) {
      currentTags.push(tagName);
      params.set("tags", currentTags.join("."));
    } else {
      // 태그 다시 누르면 제거
      const filtered = currentTags.filter((t) => t !== tagName);
      if (filtered.length > 0) {
        params.set("tags", filtered.join("."));
      } else {
        params.delete("tags");
      }
    }
    params.set("page", "1");

    router.push(`/tags?${params.toString()}`);
  };
  return (
    <div className={styles.container}>
      <h1></h1>
      <TagList selectedTags={tags} onTagClick={handleTagClick} />
      <div className={styles.content}>
        <CardList />
      </div>
    </div>
  );
};

export default TagsPage;
