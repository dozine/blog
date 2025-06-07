import React from "react";
import styles from "./recentPosts.module.css";
import Card from "../card/Card";

const RecentPosts = async ({ page }) => {
  const res = await fetch(`/api/posts?page=${page}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("Failed to fetch recent posts on server");
    return <p>포스트를 불러오는 데 실패했습니다.</p>;
  }
  const data = await res.json();
  const posts = data?.posts.slice(0, 5) ?? []; // 페이지네이션 로직에 따라 slice 범위 조정 필요

  return (
    <div className={styles.container}>
      <h2 className={styles.title}></h2>
      <div className={styles.posts}>
        {posts.length > 0 ? (
          posts.map((item, index) => <Card key={item.id} item={item} priority={index === 0} />)
        ) : (
          <p>포스트가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default RecentPosts;
