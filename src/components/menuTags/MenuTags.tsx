"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import styles from "./menuTags.module.css";
import { Tag } from "@prisma/client";

const MenuTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const initialTagsToShow = 15;

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/tags");
        if (!res.ok) {
          throw new Error("태그를 불러오는데 실패했습니다.");
        }
        const data: Tag[] = await res.json();

        const uniqueTags = Array.from(
          new Map(data.map((tag) => [tag.name, tag])).values()
        );
        setTags(uniqueTags);
      } catch (err: any) {
        console.error("태그 불러오기 오류", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  const visibleTags: Tag[] = showAll ? tags : tags.slice(0, initialTagsToShow);
  const hasMoreTags: boolean = tags.length > initialTagsToShow;

  if (loading) return <div className={styles.loading}>태그 로딩 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  return (
    <div className={styles.container}>
      <div className={styles.tagGrid}>
        {visibleTags.map((tag: Tag) => (
          <Link
            href={`/tags?tags=${tag.name}`}
            key={tag.id || tag.name}
            className={styles.tag}
          >
            {tag.name}
          </Link>
        ))}
      </div>
      {hasMoreTags && (
        <div className={styles.viewMoreContainer}>
          {showAll ? (
            <button
              className={styles.viewMoreBtn}
              onClick={() => setShowAll(false)}
            >
              접기
            </button>
          ) : (
            <Link href="/tags" className={styles.viewMoreLink}>
              <span className={styles.arrow}>→ </span>
              전체 보기
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuTags;
