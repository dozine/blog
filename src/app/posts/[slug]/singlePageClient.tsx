"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import PostDeleteModal from "@/components/modal/PostDeleteModal";
import styles from "./singlePage.module.css";
import { SinglePageClientProps } from "@/types";

const SinglePageClient = ({ data, slug }: SinglePageClientProps) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // 작성자인지 확인
  const isAuthor: boolean = session?.user?.email === data?.user?.email;
  const isAuthenticated: boolean = status === "authenticated";

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
      router.refresh();
    } catch (err: any) {
      console.error("삭제 오류", err);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleEdit = () => {
    router.push(`/write?edit=true&slug=${slug}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.textContainer}>
          <h1 className={styles.title}>{data.title}</h1>

          <div className={styles.userContainer}>
            <div className={styles.user}>
              {data.user?.image && (
                <div className={styles.userImageContainer}>
                  <Image
                    src={data.user.image}
                    alt={
                      data.user.name
                        ? `${data.user.name}의 아바타`
                        : "사용자 아바타"
                    }
                    fill
                    className={styles.avatar}
                    sizes="(max-width: 768px) 40px, 50px"
                    priority
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

                {/* 작성자에게만 액션 메뉴 표시 */}
                {isAuthenticated && isAuthor && (
                  <>
                    <div className={styles.status}>
                      {data.isPublished ? (
                        <span className={styles.published}>공개</span>
                      ) : (
                        <span className={styles.unpublished}>비공개</span>
                      )}
                    </div>
                    <div className={styles.menuContainer}>
                      <button
                        className={styles.menuButton}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="포스트 메뉴 열기"
                      >
                        ⋮
                      </button>
                      {menuOpen && (
                        <div className={styles.menu}>
                          <button
                            className={styles.menuItem}
                            onClick={handleEdit}
                          >
                            수정하기
                          </button>
                          <button
                            className={styles.menuItem}
                            onClick={() => setIsDeleteModalOpen(true)}
                          >
                            삭제하기
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 태그 표시 */}
          {data?.tags && data.tags.length > 0 && (
            <div className={styles.tagContainer}>
              {data.tags.map((tag) => (
                <a
                  key={tag.id || tag.name}
                  href={`/tags?tags=${encodeURIComponent(tag.name)}`}
                  className={styles.tag}
                >
                  #{tag.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 포스트 콘텐츠 */}
      <div className={styles.content}>
        <div className={styles.post}>
          <div
            className="ql-editor"
            dangerouslySetInnerHTML={{ __html: data.desc }}
          />
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      <PostDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default SinglePageClient;
