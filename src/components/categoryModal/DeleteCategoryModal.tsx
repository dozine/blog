"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import Modal from "../modal/Modal";
import { DeleteCategoryModalProps } from "@/types";
import { Category } from "@prisma/client";

const DeleteCategoryModal = ({
  isOpen,
  onClose,
  onDelete,
  categories,
}: DeleteCategoryModalProps) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isOpen) {
      setSelectedCategoryId("");
      setError("");
    }
  }, [isOpen]);

  const handleDeleteSubmit = async (): Promise<void> => {
    if (!selectedCategoryId) {
      setError("삭제할 카테고리를 선택해주세요.");
      return;
    }

    // 선택한 카테고리가 uncategorized인지 확인
    const selectedCategory = categories?.find(
      (cat) => cat.id === selectedCategoryId
    );

    if (selectedCategory?.slug === "uncategorized") {
      setError("'미분류' 카테고리는 삭제할 수 없습니다.");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      const result = await onDelete(selectedCategoryId);
      if (result?.success === false) {
        setError(result.error || "삭제 중 오류가 발생했습니다.");
      } else {
        setSelectedCategoryId("");
        onClose();
      }
    } catch (err: any) {
      setError("삭제 중 오류가 발생했습니다.");
      console.error("카테고리 삭제 오류:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3>삭제할 카테고리를 선택해주세요</h3>
      <select
        value={selectedCategoryId}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
          setSelectedCategoryId(e.target.value);
          setError(""); // 새 선택 시 오류 메시지 초기화
        }}
        style={{
          width: "100%",
          marginTop: "1rem",
          padding: "8px",
          marginBottom: "1rem",
        }}
        disabled={isLoading}
      >
        <option value="">선택해주세요</option>
        {categories
          ?.filter((cat) => cat.slug !== "uncategorized")
          .map((category: Category) => (
            <option key={category.id} value={category.id}>
              {category.title}
            </option>
          ))}
      </select>

      {error && (
        <p
          style={{
            color: "red",
            margin: "0.5rem 0 1rem",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </p>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={handleDeleteSubmit}
          disabled={!selectedCategoryId || isLoading}
          style={{
            cursor:
              !selectedCategoryId || isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "처리중..." : "삭제"}
        </button>
        <button onClick={onClose}>취소</button>
      </div>
    </Modal>
  );
};

export default DeleteCategoryModal;
