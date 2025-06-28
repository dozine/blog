import React from "react";
import { jest } from "@jest/globals";

interface MockImageUploaderProps {
  onImageUploaded: (url: string) => void;
}

const MockImageUploader = jest.fn((props: MockImageUploaderProps) => (
  <div data-testid="mock-image-uploader">
    <button
      data-testid="mock-image-upload-trigger"
      onClick={() => props.onImageUploaded("mock-image-url.jpg")}
    >
      이미지 업로드 모킹
    </button>
  </div>
));

export default MockImageUploader;
