"use client";
import React from "react";
import styles from "./pagination.module.css";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const Pagination = ({ page, totalPages }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePagination = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    router.push(`${pathname}?${params.toString()}`);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={styles.container}>
      {getPageNumbers().map((p, index) =>
        typeof p === "number" ? (
          <button
            key={index}
            className={`${styles.button} ${page === p ? styles.active : ""}`}
            onClick={() => handlePagination(p)}
          >
            {p}
          </button>
        ) : (
          <span key={index} className={styles.ellipsis}>
            {p}
          </span>
        ),
      )}
    </div>
  );
};
export default Pagination;
