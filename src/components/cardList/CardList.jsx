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
  const tags = searchParams.get("tags") || "";
  const formattedTags = tags.replace(/,/g, ".");
  const [posts, setPosts] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(
          `/api/posts?page=${page}&cat=${cat || ""}&tags=${formattedTags}`,
          {
            cache: "no-store",
          },
        );
        if (!res.ok) {
          throw new Error("Failed");
        }
        const data = await res.json();

        setPosts(data.posts);
        setCount(data.count);
      } catch (error) {
        console.error(error);
        setPosts([]);
      }
    };
    getData();
  }, [page, cat, tags]);

  const totalPages = Math.max(1, Math.ceil(count / POSTS_PER_PAGE));

  return (
    <div className={styles.container}>
      <h1 className={styles.title}></h1>
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
