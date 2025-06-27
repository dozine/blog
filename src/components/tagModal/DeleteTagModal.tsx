"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import Modal from "../modal/Modal";

const DeleteTagModal = ({ isOpen, onClose, onDelete, tags }) => {
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isOpen) {
      setSelectedTagId("");
      setError("");
    }
  }, [isOpen]);

  const handleDeleteSubmit = async (): Promise<void> => {
    if (!selectedTagId) {
      setError("삭제할 태그를 선택해주세요.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const result = await onDelete(selectedTagId);
      if (result?.success === false) {
        setError(result.error || "삭제 중 오류가 발생했습니다.");
      } else {
        setSelectedTagId("");
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "삭제 중 오류가 발생했습니다.");
      console.error("태그 삭제 오류:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3>삭제할 태그를 선택해주세요</h3>
      <select
        value={selectedTagId}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
          setSelectedTagId(e.target.value);
          setError("");
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
        {tags?.map((tag) => (
          <option key={tag.id} value={tag.id}>
            {tag.name} ({tag._count?.posts ?? 0})
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
          disabled={!selectedTagId || isLoading}
          style={{
            cursor: !selectedTagId || isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "처리중..." : "삭제"}
        </button>
        <button onClick={onClose}>취소</button>
      </div>
    </Modal>
  );
};

export default DeleteTagModal;
