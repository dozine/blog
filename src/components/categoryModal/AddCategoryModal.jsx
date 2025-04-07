"use client";
import React, { useEffect, useState } from "react";
import Modal from "../modal/Modal";

const AddCategoryModal = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (title.trim() === "") return;

    setIsLoading(true);
    try {
      await onAdd(title);
      setTitle("");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3>카테고리 추가</h3>

      <input
        type="text"
        placeholder="카테고리 이름"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "0.5rem" }}
      />

      <button onClick={handleSubmit}>{isLoading ? "처리 중" : "추가"}</button>
    </Modal>
  );
};

export default AddCategoryModal;
