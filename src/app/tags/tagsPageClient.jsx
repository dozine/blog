"use client";
import React, { useState } from "react";
import TagList from "@/components/tagList/TagList";
import styles from "./tagsPage.module.css";
import { useSearchParams, useRouter } from "next/navigation";

const TagsPageClient = ({ initialPage, initialTags, allTags }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tags, setTags] = useState(allTags);

  const page = Number(searchParams.get("page")) || initialPage;
  const rawTags = searchParams.get("tags");
  const selectedTags = rawTags ? rawTags.split(".").filter((tag) => tag !== "") : initialTags;

  const handleTagClick = (tagName) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentTags = params.get("tags") ? params.get("tags").split(".") : [];

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

  const handleTagDelete = (deletedTagId) => {
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
