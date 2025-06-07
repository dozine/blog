"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PostDeleteModal from "@/components/modal/PostDeleteModal";

import styles from "./singlePage.module.css";

const SinglePageClient = ({ data, slug }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (
    status === "loading" ||
    status !== "authenticated" ||
    session?.user?.email !== data?.user?.email
  ) {
    return null;
  }

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

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
    } catch (err) {
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
            <button className={styles.menuItem} onClick={handleEdit}>
              수정하기
            </button>
            <button className={styles.menuItem} onClick={() => setIsDeleteModalOpen(true)}>
              삭제하기
            </button>
          </div>
        )}
      </div>
      <PostDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
      />
    </>
  );
};

export default SinglePageClient;
