"use client";
import React from "react";
import styles from "./pagination.module.css";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PaginationProps } from "@/types";

const Pagination = ({ page, totalPages }: PaginationProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePagination = (newPage: number): void => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
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
          totalPages
        );
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={styles.container}>
      {getPageNumbers().map((p: number | string, index: number) =>
        typeof p === "number" ? (
          <button
            key={index}
            className={`${styles.button} ${page === p ? styles.active : ""}`}
            onClick={() => handlePagination(p as number)}
          >
            {p}
          </button>
        ) : (
          <span key={index} className={styles.ellipsis}>
            {p}
          </span>
        )
      )}
    </div>
  );
};
export default Pagination;
