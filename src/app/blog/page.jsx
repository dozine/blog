"use client";

import styles from "@/app/blog/blogPage.module.css";
import CardList from "@/components/cardList/CardList";
import CategoryList from "@/components/categoryList/CategoryList";
import Menu from "@/components/menu/Menu";
import { useSearchParams } from "next/navigation";

const BlogPage = () => {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const cat = searchParams.get("cat") || "";

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{cat ? `${cat} Blog` : "Blog"}</h1>
      <CategoryList />
      <div className={styles.content}>
        <CardList page={page} cat={cat} />
        <Menu />
      </div>
    </div>
  );
};

export default BlogPage;
