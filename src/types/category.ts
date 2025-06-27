import { Category } from "@prisma/client";

export interface CreateCategoryBody {
  slug: string;
  title: string;
  img?: string | null;
}

export interface CategoryListClientProps {
  initialCategories: Category[];
}

export interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (categoryData: string) => Promise<{ success: boolean; error?: string }>;
}

export interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (categoryId: string) => Promise<{ success: boolean; error?: string }>;
  categories: Category[];
}
