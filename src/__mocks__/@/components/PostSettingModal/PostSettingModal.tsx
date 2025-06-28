import React from "react";
import { jest } from "@jest/globals";

interface MockPostSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void;
}

const MockPostSettingModal = jest.fn((props: MockPostSettingModalProps) => {
  if (!props.isOpen) return null;
  return (
    <div data-testid="mock-post-setting-modal">
      <button data-testid="mock-modal-close-button" onClick={props.onClose}>
        모달 닫기
      </button>
      <button data-testid="mock-modal-publish-button" onClick={props.onPublish}>
        모달에서 게시
      </button>
    </div>
  );
});

export default MockPostSettingModal;
