"use client";
import { useSession } from "next-auth/react";
import styles from "./tagList.module.css";
import { useEffect, useState } from "react";
import DeleteTagModal from "../tagModal/DeleteTagModal";

const TagList = ({ selectedTags, onTagClick }) => {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const session = useSession();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/tags");
        if (!res.ok) {
          throw new Error("태그 데이터를 가져오는 데 실패했습니다.");
        }
        const data = await res.json();

        const uniqueTags = Array.from(
          new Map(data.map((tag) => [tag.name, tag])).values()
        );
        setTags(uniqueTags);
        setError(null);
      } catch (error) {
        console.error("태그 불러오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTags();
  }, []);

  const handleDelete = async (tagId) => {
    if (!tagId) return { success: false, error: "태그 ID가 없습니다." };

    try {
      const res = await fetch(`/api/tags/${tagId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "태그 삭제 실패");
      }

      // 성공적으로 삭제된 경우 태그 목록에서 제거
      setTags(tags.filter((tag) => tag.id !== tagId));
      alert("태그가 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("태그 삭제 오류:", error);
      alert(`태그 삭제 실패: ${error.message}`);
    }
  };

  if (isLoading) return <div>태그 로딩 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      {session?.status === "authenticated" && (
        <div className={styles.menuContainer}>
          <div className={styles.menuWrapper}>
            <button
              className={styles.menuButton}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              태그 관리
            </button>
            {menuOpen && (
              <div className={styles.menu}>
                <button onClick={() => setIsDeleteModalOpen(true)}>
                  삭제하기
                </button>

                <DeleteTagModal
                  isOpen={isDeleteModalOpen}
                  onClose={() => setIsDeleteModalOpen(false)}
                  onDelete={handleDelete}
                  tags={tags}
                />
              </div>
            )}
          </div>
        </div>
      )}
      <div className={styles.tagGrid}>
        {tags.length > 0 ? (
          tags.map((tag) => {
            const isActive = selectedTags.includes(tag.name);
            return (
              <button
                key={tag.id || tag.name}
                onClick={() => onTagClick(tag.name)}
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
    </div>
  );
};

export default TagList;
