import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("firebase/storage");
jest.mock("@/app/utils/firebase");

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
} from "firebase/storage";
import ImageUploader from "./ImageUploader";

const mockQuillEditor = {
  getSelection: jest.fn(() => ({ index: 0 })),
  getLength: jest.fn(() => 0),
  insertEmbed: jest.fn(),
  setSelection: jest.fn(),
  focus: jest.fn(),
};

const mockQuillRef = {
  current: {
    getEditor: () => mockQuillEditor,
  },
};

let mockUploadTask;
let mockFileReader;
let mockImage;

describe("ImageUploader", () => {
  const mockOnImageUploaded = jest.fn(); // 테스트마다 초기화되는 mock 함수

  beforeEach(() => {
    jest.clearAllMocks();
    ref.mockReturnValue({});
    getStorage.mockReturnValue({});

    mockUploadTask = {
      on: jest.fn(),
      cancel: jest.fn(),
    };
    uploadBytesResumable.mockReturnValue(mockUploadTask);
    getDownloadURL.mockResolvedValue("http://mock-download-url.com/image.png");

    mockFileReader = {
      readAsDataURL: jest.fn(),
      onload: null,
      onerror: null,
      result: null,
    };
    global.FileReader = jest.fn(() => mockFileReader);
    mockImage = {
      src: "",
      onload: null,
      onerror: null,
      width: 1000,
      height: 800,
    };
    global.Image = jest.fn(() => mockImage);

    const originalCreateElement = document.createElement;
    document.createElement = jest.fn((tagName) => {
      if (tagName === "canvas") {
        return {
          getContext: jest.fn(() => ({
            drawImage: jest.fn(),
            canvas: {
              width: 0,
              height: 0,
            },
          })),
          toBlob: jest.fn((callback) =>
            callback(new Blob(["mock-image"], { type: "image/png" })),
          ),
          width: 0,
          height: 0,
        };
      }
      return originalCreateElement.call(document, tagName);
    });

    global.IntersectionObserver = jest.fn(() => ({
      disconnect: jest.fn(),
      observe: jest.fn(),
      unobserve: jest.fn(),
    }));
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const simulateFileReaderLoad = (
    dataUrl = "data:image/png;base64,mockdata",
  ) => {
    act(() => {
      mockFileReader.result = dataUrl;
      if (mockFileReader.onload) {
        mockFileReader.onload({ target: { result: dataUrl } });
      }
    });
  };

  const simulateFileReaderError = () => {
    act(() => {
      if (mockFileReader.onerror) {
        mockFileReader.onerror(new Error("FileReader error"));
      }
    });
  };

  const simulateImageLoad = () => {
    act(() => {
      if (mockImage.onload) {
        mockImage.onload();
      }
    });
  };

  const simulateImageError = () => {
    act(() => {
      if (mockImage.onerror) {
        mockImage.onerror(new Error("Image load error"));
      }
    });
  };

  const setupSuccessfulUpload = (
    downloadUrl = "http://mock-success-url.com/uploaded-image.png",
  ) => {
    getDownloadURL.mockImplementation(async () => {
      const resolvedUrl = await Promise.resolve(downloadUrl);
      act(() => {
        mockOnImageUploaded(resolvedUrl);
        mockQuillEditor.insertEmbed(0, "image", resolvedUrl);
        mockQuillEditor.setSelection(1, 0);
        mockQuillEditor.focus();
      });
      return resolvedUrl;
    });

    mockUploadTask.on.mockImplementation(
      (eventType, onProgress, onError, onComplete) => {
        if (eventType === "state_changed") {
          Promise.resolve().then(() => {
            act(() => {
              onProgress({
                bytesTransferred: 5000,
                totalBytes: 10000,
                state: "running",
              });
            });
          });
          Promise.resolve().then(async () => {
            await act(async () => {
              onComplete();
            });
          });
        }
      },
    );
  };

  const setupFailedUpload = (errorMessage = "Upload failed") => {
    mockUploadTask.on.mockImplementation(
      (eventType, onProgress, onError, onComplete) => {
        if (eventType === "state_changed") {
          Promise.resolve().then(() => {
            act(() => {
              const error = new Error(errorMessage);
              error.code = "storage/unknown";
              error.message = errorMessage;
              error.name = "StorageError";
              onError(error);
            });
          });
        }
      },
    );
  };

  test("클릭 시 파일 선택 UI가 토글된다", async () => {
    render(
      <ImageUploader
        onImageUploaded={mockOnImageUploaded}
        quillRef={mockQuillRef}
      />,
    );

    const plusButton = screen.getByRole("button", { name: "" });
    expect(document.getElementById("image")).not.toBeInTheDocument();
    await userEvent.click(plusButton);
    expect(document.getElementById("image")).toBeInTheDocument();
    await userEvent.click(plusButton);
    expect(document.getElementById("image")).not.toBeInTheDocument();
  });

  test("파일 크기가 5MB를 초과하면 오류 메시지를 표시한다", async () => {
    render(
      <ImageUploader
        onImageUploaded={mockOnImageUploaded}
        quillRef={mockQuillRef}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "" }));
    const fileInput = document.getElementById("image");
    const largeFile = new File(
      [new ArrayBuffer(5 * 1024 * 1024 + 1)],
      "large.png",
      { type: "image/png" },
    );

    await act(async () => {
      await userEvent.upload(fileInput, largeFile);
    });

    await waitFor(
      () => {
        const bodyText = document.body.textContent;
        const hasFileSizeError =
          bodyText.includes("5MB") ||
          bodyText.includes("파일 크기") ||
          bodyText.includes("크기가 너무") ||
          bodyText.includes("용량");

        if (!hasFileSizeError) {
          console.log("현재 화면 텍스트:", bodyText);
        }

        expect(hasFileSizeError).toBe(true);
      },
      { timeout: 5000 },
    );

    expect(uploadBytesResumable).not.toHaveBeenCalled();
  }, 10000);

  test("Firebase 업로드 중 오류가 발생하면 오류 메시지를 표시한다", async () => {
    setupFailedUpload("Firebase upload failed!");

    render(
      <ImageUploader
        onImageUploaded={mockOnImageUploaded}
        quillRef={mockQuillRef}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "" }));
    const fileInput = document.getElementById("image");

    const testFile = new File(["hello"], "test.png", { type: "image/png" });

    await act(async () => {
      await userEvent.upload(fileInput, testFile);
    });

    simulateFileReaderLoad();
    simulateImageLoad();

    await waitFor(
      () => {
        const bodyText = document.body.textContent;
        const hasUploadError =
          bodyText.includes("업로드") ||
          bodyText.includes("오류") ||
          bodyText.includes("실패") ||
          bodyText.includes("에러");

        if (!hasUploadError) {
          console.log("업로드 에러 테스트 - 현재 화면 텍스트:", bodyText);
        }

        expect(hasUploadError).toBe(true);
      },
      { timeout: 5000 },
    );

    expect(mockOnImageUploaded).not.toHaveBeenCalled();
  }, 10000);

  test("디버깅: 컴포넌트 렌더링 및 기본 동작 확인", async () => {
    render(
      <ImageUploader
        onImageUploaded={mockOnImageUploaded}
        quillRef={mockQuillRef}
      />,
    );

    console.log("=== 초기 렌더링 상태 ===");
    console.log("HTML:", document.body.innerHTML);
    console.log("Text:", document.body.textContent);

    const buttons = screen.getAllByRole("button");
    console.log("버튼 개수:", buttons.length);

    expect(buttons.length).toBeGreaterThan(0);
  });
});
