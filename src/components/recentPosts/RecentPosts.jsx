"use client";

import React, { useEffect, useState } from "react";
import styles from "./recentPosts.module.css";
import Card from "../card/Card";

const RecentPosts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch("/api/posts?page=1", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch recent posts");
        const data = await res.json();
        setPosts(data?.posts.slice(0, 5) ?? []);
      } catch (err) {
        console.error(err);
        setPosts([]);
      }
    };

    fetchRecent();
  }, []);

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
