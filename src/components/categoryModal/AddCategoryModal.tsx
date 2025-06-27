"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import Modal from "../modal/Modal";
import { AddCategoryModalProps } from "@/types";

const AddCategoryModal = ({ isOpen, onClose, onAdd }: AddCategoryModalProps) => {
  const [title, setTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (): Promise<void> => {
    if (title.trim() === "") {
      setError("카테고리 이름을 입력해주세요.");
      return;
    }
    setError("");

    setIsLoading(true);
    try {
      const result = await onAdd(title);
      if (result.success) {
        setTitle("");
        onClose();
      } else {
        setError(result.error || "카테고리 추가 중 오류가 발생했습니다.");
      }
    } catch (err: any) {
      console.error("카테고리 추가 오류:", err);
      setError(err.message || "카테고리 추가 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setError("");
    }
  }, [isOpen]);
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3>카테고리 추가</h3>

      <input
        type="text"
        placeholder="카테고리 이름"
        value={title}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "0.5rem" }}
      />

      <button onClick={handleSubmit}>{isLoading ? "처리 중" : "추가"}</button>
    </Modal>
  );
};

export default AddCategoryModal;
