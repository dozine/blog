"use client";
import React, { useEffect, useState } from "react";
import styles from "./singlePage.module.css";
import Image from "next/image";
import Comments from "@/components/comments/Comments";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PostDeleteModal from "@/components/modal/PostDeleteModal";
import "react-quill-new/dist/quill.bubble.css";

const SinglePage = () => {
  const { slug } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const session = useSession();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const getData = async () => {
      try {
        const res = await fetch(`/api/posts/${slug}?popular=true`, {
          cache: "no-store",
        });
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
  }, [slug]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const handleDelete = async () => {
    if (!slug) return;
    try {
      const res = await fetch(`/api/posts/${slug}`, {
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

  const handleTagClick = (tagName) => {
    router.push(`/tags?tags=${tagName}`);
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
                <span className={styles.date}>
                  {new Date(data.createdAt).toLocaleString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {session.status === "authenticated" &&
                  session.data?.user?.email === data?.user?.email && (
                    <div className={styles.status}>
                      {data.isPublished ? (
                        <span className={styles.published}>공개</span>
                      ) : (
                        <span className={styles.unpublished}>비공개</span>
                      )}
                    </div>
                  )}
              </div>
            </div>
            {/* 메뉴 버튼 추가 */}
            {session.status === "authenticated" && (
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
                    <button
                      className={styles.menuItem}
                      onClick={() => setIsDeleteModalOpen(true)}
                    >
                      삭제하기
                    </button>
                    <PostDeleteModal
                      isOpen={isDeleteModalOpen}
                      onClose={() => setIsDeleteModalOpen(false)}
                      onDelete={handleDelete}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 태그 섹션 추가 */}
          {data?.tags && data.tags.length > 0 && (
            <div className={styles.tagContainer}>
              {data.tags.map((tag) => (
                <span
                  key={tag.id || tag.name}
                  className={styles.tag}
                  onClick={() => handleTagClick(tag.name)}
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.post}>
          <div
            className="ql-editor"
            dangerouslySetInnerHTML={{ __html: data?.desc }}
          />
        </div>
      </div>
    </div>
  );
};

export default SinglePage;
