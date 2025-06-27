"use client";
import React, { useState } from "react";
import TagList from "@/components/tagList/TagList";
import styles from "./tagsPage.module.css";
import { useSearchParams, useRouter } from "next/navigation";
import { TagsPageClientProp, TagWithPostCount } from "@/types/tag";

const TagsPageClient = ({ initialPage, initialTags, allTags }: TagsPageClientProp) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tags, setTags] = useState<TagWithPostCount[]>(allTags);

  const page: number = Number(searchParams.get("page")) || initialPage;
  const rawTags: string = searchParams.get("tags");
  const selectedTags: string[] = rawTags
    ? rawTags.split(".").filter((tag) => tag !== "")
    : initialTags;

  const handleTagClick = (tagName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentTags: string[] = params.get("tags") ? params.get("tags").split(".") : [];

    if (!currentTags.includes(tagName)) {
      currentTags.push(tagName);
      params.set("tags", currentTags.join("."));
    } else {
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

  const handleTagDelete = (deletedTagId: string) => {
    setTags((prevTags) => prevTags.filter((tag) => tag.id !== deletedTagId));
  };

  return (
    <div className={styles.container}>
      <TagList
        tags={tags}
        selectedTags={selectedTags}
        onTagClick={handleTagClick}
        onTagDelete={handleTagDelete}
      />
    </div>
  );
};

export default TagsPageClient;
