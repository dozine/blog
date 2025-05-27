import React from "react";
import { jest } from "@jest/globals";

const MockImageUploader = jest.fn((props) => (
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
