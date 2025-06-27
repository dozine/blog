import React from "react";
import styles from "./recentPosts.module.css";
import Card from "../card/Card";
import {
  PostApiResponse,
  PostWithFormattedTags,
  RecentPostsProps,
} from "@/types";
import { cookies } from "next/headers";

const RecentPosts = async ({ page }: RecentPostsProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    console.error("Next_PUBLIC_BASE_URL이 설정되지 않았습니다.");
  }
  let data: PostApiResponse | null = null;
  const cookie = await cookies();
  const cookieHeader = cookie.toString();
  try {
    const res = await fetch(`${baseUrl}/api/posts?page=${page}`, {
      cache: "no-store",
      headers: {
        Cookie: cookieHeader,
      },
    });
    if (!res.ok) {
      console.error("Failed to fetch recent posts on server");
      return <p>포스트를 불러오는 데 실패했습니다.</p>;
    }
    data = (await res.json()) as PostApiResponse;
  } catch (error: any) {
    console.error("Error fetching recent posts:", error.message);
  }
  const posts: PostWithFormattedTags[] = data?.posts?.slice(0, 5) ?? []; // 페이지네이션 로직에 따라 slice 범위 조정 필요
  return (
    <div className={styles.container}>
      <h2 className={styles.title}></h2>
      <div className={styles.posts}>
        {posts.length > 0 ? (
          posts.map((item: PostWithFormattedTags, index: number) => (
            <Card key={item.id} item={item} priority={index < 3} />
          ))
        ) : (
          <p>포스트가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default RecentPosts;
