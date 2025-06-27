"use client";

import { useState, useEffect, useRef, MouseEvent, TouchEvent } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import styles from "./categoryList.module.css";
import AddCategoryModal from "../categoryModal/AddCategoryModal";
import DeleteCategoryModal from "../categoryModal/DeleteCategoryModal";
import { CategoryListClientProps } from "@/types";
import { Category } from "@prisma/client";

const CategoryListClient = ({ initialCategories }: CategoryListClientProps) => {
  const session = useSession();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [scrollLeft, setScrollLeft] = useState<number>(0);

  useEffect(() => {
    if (!initialCategories || initialCategories.length === 0) {
      fetchCategories();
    }
  }, [initialCategories]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) {
        throw new Error("카테고리를 불러오는데 실패했습니다");
      }
      const data: Category[] = await res.json();
      setCategories(data);
    } catch (err: any) {
      console.error("카테고리 로딩 오류:", err);
      setError(err.message || "카테고리 로딩 중 문제가 발생했습니다");
    }
  };

  const handleAdd = async (categoryData: string) => {
    try {
      const title = categoryData.trim();
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      if (!title || !slug) {
        throw new Error("카테고리를 입력해주세요.");
      }
      setIsLoading(true);
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, slug }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `카테고리 추가 실패 (${res.status})`);
      }

      await fetchCategories();
      setIsAddModalOpen(false);
      return { success: true };
    } catch (error: any) {
      console.error("카테고리 추가 오류:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
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

      await fetchCategories();
      setIsDeleteModalOpen(false);
      return { success: true };
    } catch (error: any) {
      console.error("카테고리 삭제 오류:", error);
      setError(error.message || "카테고리 삭제 중 문제가 발생했습니다");
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const scrollLeftHandler = (): void => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft -= 200;
    }
  };

  const scrollRightHandler = (): void => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft += 200;
    }
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>): void => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseUp = (): void => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>): void => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>): void => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>): void => {
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
            {categories?.map((item: Category) => {
              return (
                <Link
                  href={`/blog?cat=${item.slug}`}
                  className={`${styles.category} ${
                    item.slug === "uncategorized" ? styles.uncategorized : ""
                  }`}
                  key={item.id || item.id}
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
