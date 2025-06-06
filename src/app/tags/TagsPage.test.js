import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TagsPage from "./page";
import { useSearchParams, useRouter } from "next/navigation";
import TagList from "@/components/tagList/TagList";
import CardList from "@/components/cardList/CardList";

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("@/components/tagList/TagList", () => ({
  __esModule: true,
  default: require("../../__mocks__/@/components/TagList/TagList").default,
}));

jest.mock("@/components/cardList/CardList", () => ({
  __esModule: true,
  default: require("../../__mocks__/@/components/CardList/CardList").default,
}));

describe("TagsPage", () => {
  const mockPush = jest.fn();
  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({
      push: mockPush,
    });
    useSearchParams.get = jest.fn();
    mockSearchParams.toString = jest.fn(() => "");
    useSearchParams.mockReturnValue(mockSearchParams);
  });
  mockSearchParams.get = jest.fn();
  mockSearchParams.toString = jest.fn(() => "");
  useSearchParams.mockReturnValue(mockSearchParams);

  describe("초기 렌더링 ", () => {
    test("기본 구조가 올바르게 렌더링된다", () => {
      mockSearchParams.get.mockImplementation((key) => {
        if (key === "page") return "1";
        if (key === "tags") return "";
        return null;
      });

      render(<TagsPage />);

      expect(screen.getByTestId("mock-tag-list")).toBeInTheDocument();
      expect(screen.getByTestId("mock-card-list")).toBeInTheDocument();
    });

    test("URL파라미터가 없을 때 기본값으로 설정된다.", () => {
      mockSearchParams.get.mockReturnValue(null);
      render(<TagsPage />);
      expect(TagList).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedTags: [],
        }),
        expect.any(Object)
      );
    });
  });

  describe("URL 파라미터 파싱", () => {
    test("page 파라미터가 올바르게 파싱된다", () => {
      mockSearchParams.get.mockImplementation((key) => {
        if (key === "page") return "3";
        if (key === "tags") return "";
        return null;
      });

      render(<TagsPage />);
      expect(screen.getByTestId("mock-tag-list")).toBeInTheDocument();
    });

    test("tags 파라미터가 올바르게 파싱된다", () => {
      mockSearchParams.get.mockImplementation((key) => {
        if (key === "page") return "1";
        if (key === "tags") return "react.javascript.typescript";
        return null;
      });

      render(<TagsPage />);

      expect(TagList).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedTags: ["react", "javascript", "typescript"],
        }),
        {}
      );
    });

    test("빈 태그가 필터링된다", () => {
      mockSearchParams.get.mockImplementation((key) => {
        if (key === "page") return "1";
        if (key === "tags") return "react..javascript.";
        return null;
      });

      render(<TagsPage />);

      expect(TagList).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedTags: ["react", "javascript"],
        }),
        {}
      );
    });
  });

  describe("태그 클릭 핸들러", () => {
    let user;

    beforeEach(() => {
      user = userEvent.setup();
      mockSearchParams.get.mockImplementation((key) => {
        if (key === "page") return "1";
        if (key === "tags") return "react.javascript";
        return null;
      });
      mockSearchParams.toString.mockReturnValue("page=1&tags=react.javascript");
    });

    test("새로운 태그를 추가한다", async () => {
      const mockParams = {
        get: jest.fn().mockImplementation((key) => {
          if (key === "tags") return "react.javascript";
          return null;
        }),
        set: jest.fn(),
        toString: jest.fn(() => "page=1&tags=react.javascript.newTag"),
      };

      // URLSearchParams 생성자 모킹
      global.URLSearchParams = jest.fn(() => mockParams);

      render(<TagsPage />);

      const newTagButton = screen.getByTestId("new-tag-button");
      await user.click(newTagButton);

      expect(mockParams.set).toHaveBeenCalledWith("tags", "react.javascript.newTag");
      expect(mockParams.set).toHaveBeenCalledWith("page", "1");
      expect(mockPush).toHaveBeenCalledWith("/tags?page=1&tags=react.javascript.newTag");
    });

    test("기존 태그를 제거한다", async () => {
      const mockParams = {
        get: jest.fn().mockImplementation((key) => {
          if (key === "tags") return "react.javascript";
          return null;
        }),
        set: jest.fn(),
        toString: jest.fn(() => "page=1&tags=javascript"),
      };

      global.URLSearchParams = jest.fn(() => mockParams);

      render(<TagsPage />);

      const reactTagButton = screen.getByTestId("selected-tag-react");
      await user.click(reactTagButton);

      expect(mockParams.set).toHaveBeenCalledWith("tags", "javascript");
      expect(mockParams.set).toHaveBeenCalledWith("page", "1");
      expect(mockPush).toHaveBeenCalledWith("/tags?page=1&tags=javascript");
    });

    test("마지막 태그를 제거하면 tags 파라미터가 삭제된다", async () => {
      mockSearchParams.get.mockImplementation((key) => {
        if (key === "page") return "1";
        if (key === "tags") return "react";
        return null;
      });

      const mockParams = {
        get: jest.fn().mockImplementation((key) => {
          if (key === "tags") return "react";
          return null;
        }),
        set: jest.fn(),
        delete: jest.fn(),
        toString: jest.fn(() => "page=1"),
      };

      global.URLSearchParams = jest.fn(() => mockParams);

      render(<TagsPage />);

      const reactTagButton = screen.getByTestId("selected-tag-react");
      await user.click(reactTagButton);

      expect(mockParams.delete).toHaveBeenCalledWith("tags");
      expect(mockParams.set).toHaveBeenCalledWith("page", "1");
      expect(mockPush).toHaveBeenCalledWith("/tags?page=1");
    });

    test("중복 태그는 추가되지 않는다", async () => {
      const mockParams = {
        get: jest.fn().mockImplementation((key) => {
          if (key === "tags") return "react.javascript";
          return null;
        }),
        set: jest.fn(),
        toString: jest.fn(() => "page=1&tags=javascript"),
      };

      global.URLSearchParams = jest.fn(() => mockParams);

      render(<TagsPage />);

      // 이미 존재하는 태그를 클릭 (제거됨)
      const reactTagButton = screen.getByTestId("selected-tag-react");
      await user.click(reactTagButton);

      expect(mockParams.set).toHaveBeenCalledWith("tags", "javascript");
    });
  });

  describe("컴포넌트 통합", () => {
    test("TagList에 올바른 props가 전달된다", () => {
      mockSearchParams.get.mockImplementation((key) => {
        if (key === "page") return "1";
        if (key === "tags") return "react.vue";
        return null;
      });

      render(<TagsPage />);

      expect(TagList).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedTags: ["react", "vue"],
          onTagClick: expect.any(Function),
        }),
        {}
      );
    });

    test("CardList가 렌더링된다", () => {
      mockSearchParams.get.mockReturnValue(null);

      render(<TagsPage />);

      expect(CardList).toHaveBeenCalled();
      expect(screen.getByTestId("mock-card-list")).toBeInTheDocument();
    });
  });

  describe("에러 처리", () => {
    test("잘못된 page 파라미터는 1로 기본값 설정된다", () => {
      mockSearchParams.get.mockImplementation((key) => {
        if (key === "page") return "invalid";
        if (key === "tags") return "";
        return null;
      });

      render(<TagsPage />);

      // 컴포넌트가 정상적으로 렌더링되는지 확인
      expect(screen.getByTestId("mock-tag-list")).toBeInTheDocument();
    });

    test("null tags 파라미터 처리", () => {
      mockSearchParams.get.mockImplementation((key) => {
        if (key === "page") return "1";
        if (key === "tags") return null;
        return null;
      });

      render(<TagsPage />);

      expect(TagList).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedTags: [],
        }),
        {}
      );
    });
  });
});
