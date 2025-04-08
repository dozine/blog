"use client";
import React from "react";
import Modal from "./Modal"; // Modal 컴포넌트 경로 확인 필요

const PostDeleteModal = ({ isOpen, onClose, onDelete }) => {
  const handleDeleteConfirm = async () => {
    await onDelete();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3>정말 이 포스트를 삭제하시겠습니까?</h3>
      <p>이 작업은 되돌릴 수 없습니다.</p>

      <div
        style={{
          marginTop: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={handleDeleteConfirm}
          style={{
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          삭제
        </button>
        <button
          onClick={onClose}
          style={{
            backgroundColor: "#e0e0e0",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          취소
        </button>
      </div>
    </Modal>
  );
};

export default PostDeleteModal;
