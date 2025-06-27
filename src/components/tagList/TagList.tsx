"use client";
import { useSession } from "next-auth/react";
import styles from "./tagList.module.css";
import { useState } from "react";
import DeleteTagModal from "../tagModal/DeleteTagModal";

const TagList = ({ tags, selectedTags = [], onTagClick, onTagDelete }) => {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  const handleDelete = async (tagId: string): Promise<{ success: boolean; error?: string }> => {
    if (!tagId) return { success: false, error: "태그 ID가 없습니다." };

    try {
      const res = await fetch(`/api/tags/${tagId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "태그 삭제 실패");
      }

      // 부모 컴포넌트에 삭제 알림
      if (onTagDelete) {
        onTagDelete(tagId);
      }

      alert("태그가 성공적으로 삭제되었습니다.");
      setIsDeleteModalOpen(false);
      setMenuOpen(false);
      return { success: true };
    } catch (error: any) {
      console.error("태그 삭제 오류:", error);
      alert(`태그 삭제 실패: ${error.message}`);
      return { success: false, error: error.message || "태그 삭제 실패" };
    }
  };

  return (
    <div className={styles.container}>
      {status === "authenticated" && (
        <div className={styles.menuContainer}>
          <div className={styles.menuWrapper}>
            <button className={styles.menuButton} onClick={() => setMenuOpen(!menuOpen)}>
              태그 관리
            </button>
            {menuOpen && (
              <div className={styles.menu}>
                <button onClick={() => setIsDeleteModalOpen(true)}>삭제하기</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.tagGrid}>
        {tags && tags.length > 0 ? (
          tags.map((tag) => {
            const isActive = selectedTags.includes(tag.name);
            return (
              <button
                key={tag.id || tag.name}
                onClick={() => onTagClick && onTagClick(tag.name)}
                className={`${styles.tag} ${isActive ? styles.activeTag : ""}`}
              >
                {tag.name} ({tag._count?.posts ?? 0})
              </button>
            );
          })
        ) : (
          <p>사용 가능한 태그가 없습니다.</p>
        )}
      </div>

      <DeleteTagModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
        tags={tags}
      />
    </div>
  );
};

export default TagList;
