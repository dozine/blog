import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WritePage from "./page.jsx";

import ImageUploader from "@/components/imageUploader/ImageUploader";
import PostSettingModal from "@/components/postSettingModal/PostSettingModal";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

jest.mock("@/components/postSettingModal/PostSettingModal", () => ({
  __esModule: true,
  default: require("../../__mocks__/@/components/PostSettingModal/PostSettingModal").default,
}));

jest.mock("@/components/imageUploader/ImageUploader", () => ({
  __esModule: true,
  default: require("../../__mocks__/@/components/ImageUploader/ImageUploader").default,
}));

describe("WritePage (심플 핵심 기능 테스트)", () => {
  let mockPush;
  let mockUseSearchParams;
  let mockUseSession;
  let mockAlert;
  let mockFetch;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPush = jest.fn();
    useRouter.mockReturnValue({ push: mockPush });

    mockUseSearchParams = jest.fn(() => new URLSearchParams());
    useSearchParams.mockReturnValue(mockUseSearchParams());

    mockUseSession = jest.fn(() => ({
      status: "authenticated",
      data: { user: { name: "Test User" } },
    }));
    useSession.mockReturnValue(mockUseSession());
    mockAlert = jest.spyOn(window, "alert").mockImplementation(() => {});
    mockFetch = jest.spyOn(global, "fetch").mockImplementation((url) => {
      if (url === "/api/categories") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { slug: "travel", title: "여행" },
              { slug: "food", title: "음식" },
            ]),
        });
      }
      if (url === "/api/tags") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { id: 1, name: "react" },
              { id: 2, name: "javascript" },
            ]),
        });
      }
      if (url.startsWith("/api/posts/")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              title: "기존 제목",
              desc: "기존 내용",
              img: "",
              catSlug: "uncategorized",
              isPublished: false,
              tags: [],
            }),
        });
      }

      return Promise.reject(new Error(`Unhandled fetch: ${url}`));
    });
  });

  afterEach(() => {
    mockAlert.mockRestore();
    jest.restoreAllMocks();
  });

  test("인증되지 않은 사용자 처리(리다이렉트 로직 확인)", async () => {
    useSession.mockReturnValue({ status: "unauthenticated" });
    render(<WritePage />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  test("세션 로딩 중에는 로딩 메시지를 표시한다", () => {
    useSession.mockReturnValue({ status: "loading" });
    render(<WritePage />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("인증된 사용자는 작성 페이지 UI를 볼 수 있다", async () => {
    render(<WritePage />);
    await waitFor(
      () => {
        expect(screen.getByPlaceholderText("Title")).toBeInTheDocument();
        expect(screen.getByTestId("mock-react-quill")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Publish/i })).toBeInTheDocument();
        expect(screen.getByTestId("mock-image-uploader")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
    expect(screen.queryByTestId("mock-post-setting-modal")).not.toBeInTheDocument();
  });

  test("제목 입력 필드에 텍스트를 입력할 수 있다", async () => {
    const user = userEvent.setup();
    render(<WritePage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Title")).toBeInTheDocument();
    });
    const titleInput = screen.getByPlaceholderText("Title");
    await user.type(titleInput, "새로운 글 제목");
    expect(titleInput).toHaveValue("새로운 글 제목");
  });

  test("Quill 에디터(모킹된 textarea)에 내용을 입력할 수 있다", async () => {
    const user = userEvent.setup();
    render(<WritePage />);
    await waitFor(() => {
      expect(screen.getByTestId("quill-textarea")).toBeInTheDocument();
    });
    const quillTextArea = screen.getByTestId("quill-textarea");
    await user.type(quillTextArea, "내용");
    expect(quillTextArea).toHaveValue("내용");
  });

  test("제목과 내용이 모두 있을 때 'Publish' 버튼 클릭 시 게시 설정 모달이 열린다", async () => {
    const user = userEvent.setup();
    render(<WritePage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Title")).toBeInTheDocument();
    });

    const titleInput = screen.getByPlaceholderText("Title");
    await user.type(titleInput, "유효한 제목");

    const quillTextArea = screen.getByTestId("quill-textarea");
    await user.type(quillTextArea, "유효한 내용");

    const publishButton = screen.getByRole("button", { name: /Publish/i });
    await user.click(publishButton);

    await waitFor(() => {
      expect(screen.getByTestId("mock-post-setting-modal")).toBeInTheDocument();
    });
    expect(PostSettingModal).toHaveBeenCalledWith(expect.objectContaining({ isOpen: true }), {});
  });

  test("Publish 버튼 클릭 시 제목이 비어있으면 경고 메시지를 표시한다", async () => {
    const user = userEvent.setup();
    render(<WritePage />);

    await waitFor(() => {
      expect(screen.getByTestId("quill-textarea")).toBeInTheDocument();
    });
    const quillTextArea = screen.getByTestId("quill-textarea");
    await user.type(quillTextArea, "내용만 있음");

    const publishButton = screen.getByRole("button", { name: /Publish/i });
    await user.click(publishButton);

    expect(mockAlert).toHaveBeenCalledWith("제목을 입력해주세요.");

    expect(screen.queryByTestId("mock-post-setting-modal")).not.toBeInTheDocument();
  });

  test("Publish 버튼 클릭 시 내용이 비어있으면 경고 메시지를 표시한다", async () => {
    const user = userEvent.setup();
    render(<WritePage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Title")).toBeInTheDocument();
    });

    const titleInput = screen.getByPlaceholderText("Title");
    await user.type(titleInput, "제목만 있음");

    const publishButton = screen.getByRole("button", { name: /Publish/i });
    await user.click(publishButton);

    expect(mockAlert).toHaveBeenCalledWith("내용을 입력해주세요.");
    expect(screen.queryByTestId("mock-post-setting-modal")).not.toBeInTheDocument();
  });

  test("게시 설정 모달의 닫기 버튼 클릭 시 모달이 닫힌다", async () => {
    const user = userEvent.setup();
    render(<WritePage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Title")).toBeInTheDocument();
    });

    const titleInput = screen.getByPlaceholderText("Title");
    await user.type(titleInput, "유효한 제목");
    const quillTextArea = screen.getByTestId("quill-textarea");
    await user.type(quillTextArea, "유효한 내용");
    const publishButton = screen.getByRole("button", { name: /Publish/i });
    await user.click(publishButton);

    await waitFor(() => {
      expect(screen.getByTestId("mock-post-setting-modal")).toBeInTheDocument();
    });

    const mockModalCloseButton = screen.getByTestId("mock-modal-close-button");
    await user.click(mockModalCloseButton);

    await waitFor(() => {
      expect(screen.queryByTestId("mock-post-setting-modal")).not.toBeInTheDocument();
    });
  });

  test("수정 모드에서 '수정하기' 버튼이 표시된다", async () => {
    useSearchParams.mockReturnValue(new URLSearchParams("edit=true&slug=test-slug"));

    jest.spyOn(global, "fetch").mockImplementation((url) => {
      if (url === "/api/posts/test-slug") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              title: "기존 제목",
              desc: "기존 내용",
              img: "",
              catSlug: "uncategorized",
              isPublished: false,
              tags: [],
            }),
        });
      }
      if (url === "/api/categories") {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url === "/api/tags") {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      return Promise.reject(new Error(`Unhandled fetch: ${url}`));
    });

    render(<WritePage />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /수정하기/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Title")).toHaveValue("기존 제목");
      expect(screen.getByTestId("quill-textarea")).toHaveValue("기존 내용");
    });
  });
});
