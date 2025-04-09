"use client";

import React, { useEffect, useState } from "react";
import styles from "./cardList.module.css";
import Pagination from "../pagination/Pagination";
import Card from "../card/Card";
import { useSearchParams } from "next/navigation";

const POSTS_PER_PAGE = 10;

const CardList = () => {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const cat = searchParams.get("cat") || "";
  const rawTags = searchParams.get("tags") || "";
  const tags = rawTags ? rawTags.split(",").filter((tag) => tag !== "") : [];
  console.log("rawTags:", rawTags);
  console.log("tags:", tags);
  const [posts, setPosts] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const getData = async () => {
      try {
        let apiUrl = `/api/posts?page=${page}&cat=${cat || ""}`;

        if (tags.length > 0) {
          apiUrl += `&tags=${tags.join(".")}`;
        }
        const res = await fetch(apiUrl, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Failed");
        }
        const data = await res.json();

        const postsWithFormattedTags = data.posts.map((post) => ({
          ...post,
          tags: post.tags?.map((pt) => pt.tag) || [], // PostTag 관계 객체에서 실제 태그 객체만 추출
        }));
        console.log("원본 post:", data.posts);
        setPosts(postsWithFormattedTags);
        setCount(data.count);
      } catch (error) {
        console.error(error);
        setPosts([]);
      }
    };
    getData();
  }, [page, cat, JSON.stringify(tags)]);

  const totalPages = Math.max(1, Math.ceil(count / POSTS_PER_PAGE));

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Post</h1>
      <div className={styles.posts}>
        {posts.length > 0 ? (
          posts.map((item) => (
            <div key={item.id}>
              <Card item={item} />
            </div>
          ))
        ) : (
          <p>POST가 없습니다.</p>
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} />
    </div>
  );
};
export default CardList;
