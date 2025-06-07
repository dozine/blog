import CategoryList from "@/components/categoryList/CategoryList";
import styles from "./homepage.module.css";
import RecentPosts from "@/components/recentPosts/RecentPosts";

import dynamic from "next/dynamic";

const Featured = dynamic(() => import("@/components/featured/Featured"), {
  loading: () => <p>Loading featured posts...</p>,
});

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  return (
    <div className={styles.container}>
      <Featured />
      <CategoryList />
      <div className={styles.content}>
        <RecentPosts page={page} />
      </div>
    </div>
  );
}
