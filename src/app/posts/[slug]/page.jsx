"use client";
import React, { useEffect, useState } from "react";
import styles from "./singlePage.module.css";
import Image from "next/image";
import Comments from "@/components/comments/Comments";
import { useParams, useRouter } from "next/navigation";

const SinglePage = () => {
  const { slug } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!slug) return;
    const getData = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/posts/${slug}?popular=true`,
          {
            cache: "no-store",
          }
        );
        if (!res.ok) {
          throw new Error("Failed!");
        }
        const result = await res.json();
        if (!result || typeof result !== "object" || !result.title) {
          throw new Error("Invalid data received");
        }
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getData();
    console.log("Slug:", slug);
  }, [slug]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const handleDelete = async () => {
    if (!slug) return;
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${slug}`, {
        method: "DELETE",
        cache: "no-store",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete post");
      alert("삭제되었습니다.");
      router.push("/blog");
    } catch (err) {
      console.error("삭제 오류", err);
    }
  };

  const handleEdit = () => {
    router.push(`/write?edit=true&slug=${slug}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.textContainer}>
          <h1 className={styles.title}>{data?.title}</h1>
          <div className={styles.userContainer}>
            <div className={styles.user}>
              {data?.user?.img && (
                <div className={styles.userImageContainer}>
                  <Image
                    src={data.user.img}
                    alt=""
                    fill
                    className={styles.avatar}
                  />
                </div>
              )}
              <div className={styles.userTextContainer}>
                <span className={styles.username}>{data?.user.name}</span>
                <span className={styles.date}>01.01.2024</span>
              </div>
            </div>
            {/* 메뉴 버튼 추가 */}
            <div className={styles.menuContainer}>
              <button
                className={styles.menuButton}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                ⋮
              </button>
              {menuOpen && (
                <div className={styles.menu}>
                  .
                  <button className={styles.menuItem} onClick={handleEdit}>
                    수정하기
                  </button>
                  <button className={styles.menuItem} onClick={handleDelete}>
                    삭제하기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {data?.img && (
          <div className={styles.imageContainer}>
            <Image
              src={data.img}
              alt="게시글 이미지"
              fill
              className={styles.postImage}
            />
          </div>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.post}>
          <div
            className={styles.description}
            dangerouslySetInnerHTML={{ __html: data?.desc }}
          />

          <div className={styles.comment}>
            <Comments postSlug={slug} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePage;
