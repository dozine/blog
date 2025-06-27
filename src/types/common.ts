import { Category, Tag } from "@prisma/client";
import { TagWithPostCount } from "./tag";
import type { default as ReactQuillType } from "react-quill-new";

export interface Params {
  params: {
    id: string;
    slug?: string;
  };
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export interface Featuredost {
  id: number;
  title: string;
  desc: string;
  image: string;
}

export interface SizedImageResult {
  file: File;
  sizeName: "card" | "medium" | "large";
}

export interface PostSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  catSlug: string;
  setCatSlug: (slug: string) => void;
  isPublished: boolean;
  setIsPublished: (published: boolean) => void;
  tagInput: string;
  setTagInput: (input: string) => void;
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
  categories: Category[];
  availableTags: TagWithPostCount[];
  setAvailableTags: (tags: TagWithPostCount[]) => void;
  onPublish: () => void;
}

export interface PaginationProps {
  page: number;
  totalPages: number;
}

export interface ThemeContextType {
  theme: "light" | "dark";
  toggle: () => void;
}

export interface BlogPageSearchParams {
  page?: string;
  tags?: string | string[];
  cat?: string;
}

export interface QuillInstanceMehods {
  getSelection: () => { index: number; length: number } | null;
  getLength: () => number;
  insertEmbed: (index: number, type: string, value: string) => void;
  setSelection: (index: number, length: number) => void;
  focus: () => void;
}

export interface ImageUploaderProps {
  onImageUploaded: (urls: string[]) => void;
  quillRef: React.MutableRefObject<ReactQuillType | null>;
}
