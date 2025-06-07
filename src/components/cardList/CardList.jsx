import React from "react";
import styles from "./cardList.module.css";
import Pagination from "../pagination/Pagination";
import Card from "../card/Card";
const POSTS_PER_PAGE = 10;

const CardList = async ({ page, cat, tags }) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    console.error("Next_PUBLIC_BASE_URL이 설정되지 않았습니다.");
  }
  const res = await fetch(
    `${baseUrl}/api/posts?page=${page}&cat=${cat || ""}&tags=${tags || ""}&postPerPage=${POSTS_PER_PAGE}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Failed to fetch posts on server:", res.status, res.statusText, errorText);
    return <p>포스트를 불러오는 데 실패했습니다.</p>;
  }

  const data = await res.json();
  const posts = data.posts || [];
  const count = data.count || 0;

  const totalPages = Math.max(1, Math.ceil(count / POSTS_PER_PAGE));

  return (
    <div className={styles.container}>
      <h1 className={styles.title}></h1>
      <div className={styles.posts}>
        {posts.length > 0 ? (
          posts.map((item, index) => (
            <div key={item.id}>
              <Card item={item} priority={index === 0} />
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
