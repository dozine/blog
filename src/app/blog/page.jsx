const { default: CardList } = require("@/components/cardList/CardList");
const { default: Menu } = require("@/components/menu/Menu");
import styles from "@/app/blog/blogPage.module.css";
const BlogPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Style Blog</h1>
      <div className={styles.content}>
        <CardList />
        <Menu />
      </div>
    </div>
  );
};

export default BlogPage;
