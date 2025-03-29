"use client";

import styles from "@/app/blog/blogPage.module.css";
import CardList from "@/components/cardList/CardList";
import { useSearchParams } from "next/navigation";

const BlogPage = () => {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const cat = searchParams.get("cat") || "";

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{cat ? `${cat} Blog` : "Blog"}</h1>
      <div className={styles.content}>
        <CardList page={page} cat={cat} />
      </div>
    </div>
  );
};

export default BlogPage;
