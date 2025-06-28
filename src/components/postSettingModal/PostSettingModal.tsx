"use client";
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import styles from "./postSettingModal.module.css";
import { PostSettingModalProps } from "@/types";
import { Category, Tag } from "@prisma/client";
import { TagWithPostCount } from "@/types/tag";
const PostSettingModal = ({
  isOpen,
  onClose,
  catSlug,
  setCatSlug,
  isPublished,
  setIsPublished,
  tagInput,
  setTagInput,
  tags,
  setTags,
  categories,
  availableTags,
  setAvailableTags,
  onPublish,
}: PostSettingModalProps) => {
  const [filteredTags, setFilteredTags] = useState<TagWithPostCount[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState<boolean>(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && tagInputRef.current && process.env.NODE_ENV !== "test") {
      setTimeout(() => tagInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (tagInput.trim()) {
      const filtered = availableTags.filter(
        (tag) =>
          tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
          !tags.some((selectedTag) => selectedTag.id === tag.id)
      );
      setFilteredTags(filtered);
    } else {
      setFilteredTags([]);
    }
  }, [tagInput, availableTags, tags]);

  const addTag = (tag: TagWithPostCount): void => {
    if (tags.length >= 5) {
      alert("태그는 최대 5개까지만 추가할 수 있습니다.");
      return;
    }

    if (tag && !tags.some((t) => t.id === tag.id)) {
      setTags([...tags, tag]);
    }

    setTagInput("");
    setShowTagSuggestions(false);
    if (process.env.NODE_ENV !== "test") {
      tagInputRef.current?.focus();
    }
    // 테스트 환경이
  };

  // 새 태그 생성 함수
  const createNewTag = async (): Promise<void> => {
    if (!tagInput.trim()) return;
    if (tags.length >= 5) {
      alert("태그는 최대 5개까지만 추가할 수 있습니다.");
      return;
    }

    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: tagInput.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json();

        if (res.status === 409) {
          const existingTag = availableTags.find(
            (tag) => tag.name.toLowerCase() === tagInput.trim().toLowerCase()
          );
          if (existingTag) {
            addTag(existingTag);
            return;
          }
        }
        throw new Error(errorData.message || "태그 생성에 실패했습니다.");
      }

      const newTag: TagWithPostCount = await res.json();
      addTag(newTag);
      setAvailableTags([...availableTags, newTag]);
    } catch (err: any) {
      console.error("태그 생성 실패:", err);
      alert(err.message);
    }
  };

  const removeTag = (tagId: string): void => {
    setTags(tags.filter((tag) => tag.id !== tagId));
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>게시 설정</h2>

        <div className={styles.settingSection}>
          <h3>카테고리</h3>
          <select
            className={styles.select}
            value={catSlug}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setCatSlug(e.target.value)}
          >
            <option value="">카테고리 선택</option>
            {categories.map((cat: Category) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.settingSection}>
          <h3>태그 설정</h3>
          <div className={styles.tagsContainer}>
            <div className={styles.tagInputWrapper}>
              <input
                ref={tagInputRef}
                type="text"
                placeholder={tags.length >= 5 ? "태그 최대 5개" : "태그 입력 (최대 5개)"}
                className={styles.tagInput}
                value={tagInput}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setTagInput(e.target.value);
                  setShowTagSuggestions(true);
                }}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (filteredTags.length > 0) {
                      addTag(filteredTags[0]);
                    } else if (tagInput.trim()) {
                      createNewTag();
                    }
                  }
                }}
                disabled={tags.length >= 5}
              />
              {tags.length < 5 && tagInput && (
                <button className={styles.addTagButton} onClick={createNewTag}>
                  +
                </button>
              )}
            </div>

            {/* 태그 제안 목록 */}
            {showTagSuggestions && filteredTags.length > 0 && (
              <div className={styles.tagSuggestions}>
                {filteredTags.slice(0, 5).map((tag: TagWithPostCount) => (
                  <div key={tag.id} className={styles.tagSuggestion} onClick={() => addTag(tag)}>
                    {tag.name}
                  </div>
                ))}
              </div>
            )}

            {/* 선택된 태그 표시 */}
            <div className={styles.selectedTags}>
              {tags.map((tag: Tag) => (
                <span key={tag.id} className={styles.tagBadge}>
                  {tag.name}
                  <button className={styles.removeTagButton} onClick={() => removeTag(tag.id)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.settingSection}>
          <h3>공개 설정</h3>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              aria-label="공개 설정"
              checked={isPublished}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setIsPublished(e.target.checked)}
              className={styles.toggleInput}
            />
            <span className={styles.toggleSlider}></span>
            <span className={styles.toggleText}>{isPublished ? "공개됨" : "비공개"}</span>
          </label>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.cancelButton} onClick={onClose}>
            취소
          </button>
          <button className={styles.publishButton} onClick={onPublish}>
            게시하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostSettingModal;
