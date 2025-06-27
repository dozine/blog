import styles from "@/app/blog/blogPage.module.css";
import CardList from "@/components/cardList/CardList";
import CategoryList from "@/components/categoryList/CategoryList";
import Menu from "@/components/menu/Menu";
import { BlogPageSearchParams } from "@/types";

const BlogPage = async ({ searchParams }: { searchParams: BlogPageSearchParams }) => {
  const params = await searchParams;
  const page = Number(params.page || "1");
  const cat = params.cat || "";
  const tags = params.tags || "";

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{cat ? `${cat}` : "Blog"}</h1>
      <CategoryList />
      <div className={styles.content}>
        <CardList page={page} cat={cat} tags={tags} />
        <Menu />
      </div>
    </div>
  );
};

export default BlogPage;
