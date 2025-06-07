"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import styles from "./categoryList.module.css";
import AddCategoryModal from "../categoryModal/AddCategoryModal";
import DeleteCategoryModal from "../categoryModal/DeleteCategoryModal";

const CategoryListClient = ({ initialCategories }) => {
  const session = useSession();
  const [categories, setCategories] = useState(initialCategories);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) {
        throw new Error("카테고리를 불러오는데 실패했습니다");
      }
      const data = await res.json();

      // Uncategorized 카테고리 로직은 그대로 유지
      let hasUncategorized = data.some((cat) => cat.slug === "uncategorized");

      if (!hasUncategorized && session?.status === "authenticated") {
        await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: "uncategorized",
            title: "미분류",
            img: null,
          }),
        });
        const refreshRes = await fetch("/api/categories");
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          setCategories(refreshData);
          return;
        }
      }
      setCategories(data);
    } catch (err) {
      console.error("카테고리 로딩 오류:", err);
      setError(err.message);
    }
  };

  const handleAdd = async (categoryData) => {
    try {
      const title = categoryData;
      const slug = categoryData
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      setIsLoading(true);
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, slug }),
      });

      if (!res.ok) {
        throw new Error("카테고리 추가 실패");
      }

      await fetchCategories();
      setIsAddModalOpen(false);
      return { success: true };
    } catch (error) {
      console.error("카테고리 추가 오류:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      setIsLoading(true);
      const selectedCategory = categories.find((cat) => cat.id === categoryId);
      if (selectedCategory && selectedCategory.slug === "uncategorized") {
        throw new Error("'미분류' 카테고리는 삭제할 수 없습니다");
      }

      const res = await fetch(`/api/categories?id=${categoryId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("삭제 응답 에러:", res.status, errorData);
        throw new Error(errorData.message || `카테고리 삭제 실패 (${res.status})`);
      }

      const data = await res.json();

      await fetchCategories();
      setIsDeleteModalOpen(false);
      return { success: true };
    } catch (error) {
      console.error("카테고리 삭제 오류:", error);
      setError(error.message || "카테고리 삭제 중 문제가 발생했습니다");
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const scrollLeftHandler = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft -= 200;
    }
  };

  const scrollRightHandler = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft += 200;
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className={styles.container}>
      {session?.status === "authenticated" && (
        <div className={styles.menuContainer}>
          <div className={styles.menuWrapper}>
            <button className={styles.menuButton} onClick={() => setMenuOpen(!menuOpen)}>
              카테고리 관리
            </button>
            {menuOpen && (
              <div className={styles.menu}>
                <button onClick={() => setIsAddModalOpen(true)}>추가하기</button>
                <button onClick={() => setIsDeleteModalOpen(true)}>삭제하기</button>
                <AddCategoryModal
                  isOpen={isAddModalOpen}
                  onClose={() => setIsAddModalOpen(false)}
                  onAdd={handleAdd}
                />
                <DeleteCategoryModal
                  isOpen={isDeleteModalOpen}
                  onClose={() => setIsDeleteModalOpen(false)}
                  onDelete={handleDelete}
                  categories={categories}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.sliderContainer}>
        <button
          className={`${styles.navButton} ${styles.navButtonLeft}`}
          onClick={scrollLeftHandler}
          aria-label="이전카테고리"
        >
          <span className={styles.navArrow}>←</span>
        </button>
        <div
          className={styles.categoriesSlider}
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleMouseUp}
          onTouchMove={handleTouchMove}
        >
          <div className={styles.categories}>
            <Link href="/blog" className={`${styles.category} ${styles.allCategory}`}>
              <span className={styles.categoryText}>All</span>
            </Link>
            {categories?.map((item) => {
              return (
                <Link
                  href={`/blog?cat=${item.slug}`}
                  className={`${styles.category} ${
                    item.slug === "uncategorized" ? styles.uncategorized : ""
                  }`}
                  key={item._id || item.id}
                >
                  <span className={styles.categoryText}>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
        <button
          className={`${styles.navButton} ${styles.navButtonRight}`}
          onClick={scrollRightHandler}
          aria-label="다음 카테고리"
        >
          <span className={styles.navArrow}>→</span>
        </button>
      </div>
    </div>
  );
};

export default CategoryListClient;
