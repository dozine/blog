import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PostSettingModal from "./PostSettingModal";
import { server } from "../../__mocks__/server";
import { rest } from "msw";
import { resetTagHandlersState, handlers } from "../../__mocks__/handlers";

let mockCatSlug = "";
let mockIsPublished = false;
let mockTagInput = "";
let mockTags = [];
let mockAvailableTags = [
  { id: 1, name: "react" },
  { id: 2, name: "javascript" },
  { id: 3, name: "nextjs" },
];
let mockTagIdCounter = 4;

const createMockProps = () => ({
  isOpen: true,
  onClose: jest.fn(),
  catSlug: mockCatSlug,
  setCatSlug: jest.fn((slug) => (mockCatSlug = slug)),
  isPublished: mockIsPublished,
  setIsPublished: jest.fn((published) => (mockIsPublished = published)),
  tagInput: mockTagInput,
  setTagInput: jest.fn((input) => {
    mockTagInput = input;
  }),
  tags: mockTags,
  setTags: jest.fn((newTags) => {
    mockTags = typeof newTags === "function" ? newTags(mockTags) : newTags;
    return newTags;
  }),
  categories: [
    { slug: "coding", title: "coding" },
    { slug: "food", title: "음식" },
  ],
  availableTags: mockAvailableTags,
  setAvailableTags: jest.fn((newTags) => {
    mockAvailableTags =
      typeof newTags === "function" ? newTags(mockAvailableTags) : newTags;
    return newTags;
  }),
  onPublish: jest.fn(),
});

describe("PostSettingModal (핵심 기능 테스트)", () => {
  let currentMockProps;
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  beforeEach(() => {
    mockCatSlug = "";
    mockIsPublished = false;
    mockTagInput = "";
    mockTags = [];
    mockAvailableTags = [
      { id: 1, name: "react" },
      { id: 2, name: "javascript" },
      { id: 3, name: "nextjs" },
    ];
    mockTagIdCounter = 4;
    currentMockProps = createMockProps();
    resetTagHandlersState(mockAvailableTags);
  });

  test("isOpen이 True면 모달이 렌더링됩니다.", async () => {
    jest.useFakeTimers();
    render(<PostSettingModal {...currentMockProps} />);
    act(() => {
      jest.runAllTimers();
    });

    expect(
      screen.getByRole("heading", { name: /게시 설정/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/태그 입력/i)).toBeInTheDocument();
    jest.useRealTimers();
  });

  test("isOpen이 False이면 모달이 렌더링되지 않습니다.", () => {
    render(<PostSettingModal {...currentMockProps} isOpen={false} />);
    expect(
      screen.queryByRole("heading", { name: /게시 설정/i })
    ).not.toBeInTheDocument();
  });

  test('calls onClose when "취소" button is clicked', async () => {
    const user = userEvent.setup();
    render(<PostSettingModal {...currentMockProps} />);
    const cancelButton = screen.getByRole("button", { name: /취소/i });
    await user.click(cancelButton);
    expect(currentMockProps.onClose).toHaveBeenCalledTimes(1);
  });

  // --- 태그 관련 핵심 비즈니스 로직 테스트 ---

  test("태그를 입력하면 태그가 추가됩니다.", async () => {
    const user = userEvent.setup();
    mockTagInput = "react";
    currentMockProps = createMockProps();
    const { rerender } = render(<PostSettingModal {...currentMockProps} />);

    const tagInput = screen.getByPlaceholderText(/태그 입력/i);

    await user.type(tagInput, "react");
    await user.keyboard("{enter}");
    await waitFor(() => {
      expect(currentMockProps.setTags).toHaveBeenCalledWith(
        expect.arrayContaining([{ id: 1, name: "react" }])
      );
    });
    expect(currentMockProps.setTagInput).toHaveBeenCalledWith("");
    mockTags = [{ id: 1, name: "react" }];
    mockTagInput = "";
    currentMockProps = createMockProps();
    rerender(<PostSettingModal {...currentMockProps} />);
    await waitFor(() => {
      expect(screen.getByText("react")).toBeInTheDocument();
    });
  });

  test("x버튼을 누르면 태그가 제거됩니다.", async () => {
    const user = userEvent.setup();
    mockTags = [{ id: 1, name: "react" }];
    currentMockProps = createMockProps();
    const { rerender } = render(<PostSettingModal {...currentMockProps} />);
    await waitFor(() => {
      expect(screen.getByText("react")).toBeInTheDocument();
    });

    const removeButton = screen.getByRole("button", { name: "×" });
    await user.click(removeButton);

    await waitFor(() => {
      expect(currentMockProps.setTags).toHaveBeenCalledWith([]);
    });

    mockTags = [];
    currentMockProps = createMockProps();
    rerender(<PostSettingModal {...currentMockProps} />);
    expect(screen.queryByText("react")).not.toBeInTheDocument();
  });

  test("태그가 5가 되면 추가 입력이 불가합니다.", () => {
    mockTags = [
      { id: 1, name: "tag1" },
      { id: 2, name: "tag2" },
      { id: 3, name: "tag3" },
      { id: 4, name: "tag4" },
      { id: 5, name: "tag5" },
    ];
    currentMockProps = createMockProps();
    render(<PostSettingModal {...currentMockProps} />);

    const tagInput = screen.getByPlaceholderText(/태그 최대 5개/i);
    expect(tagInput).toBeDisabled();
  });

  test("타이핑을 하면 기존의 태그를 제안해줍니다.", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<PostSettingModal {...currentMockProps} />);
    const tagInput = screen.getByPlaceholderText(/태그 입력/i);
    await user.type(tagInput, "re");
    mockTagInput = "re";
    currentMockProps = createMockProps();
    rerender(<PostSettingModal {...currentMockProps} />);

    await waitFor(() => {
      expect(screen.getByText("react")).toBeInTheDocument();
      expect(screen.queryByText("javascript")).not.toBeInTheDocument();
      expect(screen.queryByText("nextjs")).not.toBeInTheDocument();
    });
  });

  test("태그가 5개가 되면 correct placeholder를 보여줍니다.", () => {
    mockTags = [
      { id: 1, name: "tag1" },
      { id: 2, name: "tag2" },
      { id: 3, name: "tag3" },
      { id: 4, name: "tag4" },
      { id: 5, name: "tag5" },
    ];
    currentMockProps = createMockProps();
    render(<PostSettingModal {...currentMockProps} />);

    expect(screen.getByPlaceholderText("태그 최대 5개")).toBeInTheDocument();
  });

  test("태그가 5개를 넘어가는 것을 막아줍니다.", async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    mockTags = [
      { id: 1, name: "tag1" },
      { id: 2, name: "tag2" },
      { id: 3, name: "tag3" },
      { id: 4, name: "tag4" },
      { id: 5, name: "tag5" },
    ];
    currentMockProps = createMockProps();
    render(<PostSettingModal {...currentMockProps} />);

    const tagInput = screen.getByPlaceholderText(/태그 최대 5개/i);
    expect(tagInput).toBeDisabled();
    await user.type(tagInput, "tag6");
    await user.keyboard("{enter}");
    expect(currentMockProps.setTags).not.toHaveBeenCalledWith(
      expect.arrayContaining([{ id: expect.any(Number), name: "tag6" }])
    );
    alertSpy.mockRestore();
  });

  test("카테고리 업데이트 테스트입니다.", async () => {
    const user = userEvent.setup();

    render(<PostSettingModal {...currentMockProps} />);

    const categorySelect = screen.getByRole("combobox");
    expect(categorySelect).toBeInTheDocument();

    await user.selectOptions(categorySelect, "coding");

    expect(currentMockProps.setCatSlug).toHaveBeenCalledWith("coding");
  });

  test("공개설정 버튼을 눌렀을 때 토글됩니다.", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<PostSettingModal {...currentMockProps} />);

    const publishCheckbox = screen.getByRole("checkbox", {
      name: /공개 설정/i,
    });
    expect(publishCheckbox).not.toBeChecked();
    await user.click(publishCheckbox);
    expect(currentMockProps.setIsPublished).toHaveBeenCalledWith(true);

    mockIsPublished = true;
    currentMockProps = createMockProps();
    rerender(<PostSettingModal {...currentMockProps} />);
    await waitFor(() => {
      expect(
        screen.getByRole("checkbox", { name: /공개 설정/i })
      ).toBeChecked();
    });
    currentMockProps.setIsPublished.mockClear();
    await user.click(publishCheckbox);
    expect(currentMockProps.setIsPublished).toHaveBeenCalledWith(false);
    mockIsPublished = false;
    currentMockProps = createMockProps();
    rerender(<PostSettingModal {...currentMockProps} />);
    await waitFor(() => {
      expect(
        screen.getByRole("checkbox", { name: /공개 설정/i })
      ).not.toBeChecked();
    });
  });

  test("발행 버튼을 누르면 onPublish가 호출됩니다.", async () => {
    const user = userEvent.setup();
    render(<PostSettingModal {...currentMockProps} />);

    const publishButton = await waitFor(() =>
      screen.getByRole("button", { name: /게시하기/i })
    );
    await user.click(publishButton);

    expect(currentMockProps.onPublish).toHaveBeenCalledTimes(1);
  });
});
