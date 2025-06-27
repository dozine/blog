import { Category, Post, Prisma, Tag, User } from "@prisma/client";

export interface CardProps {
  item: PostWithFormattedTags;
  priority?: boolean;
  index?: number;
}

export interface CardListProps {
  page: number;
  cat?: string;
  tags?: string | string[];
}

export interface PostWithFormattedTags extends Omit<Post, "tags" | "user"> {
  tags: Tag[];
  user: Pick<User, "id" | "email" | "name" | "image">;
  createdAt: Date;
}

export interface CreatePostBody {
  slug: string;
  title: string;
  desc: string;
  img?: string | string[] | null;
  catSlug?: string;
  isPublished?: boolean;
  tags?: string[];
}

export interface PostApiResponse {
  posts: PostWithFormattedTags[];
  count: number;
}

export interface RecentPostsProps {
  page: number;
}

export interface PostWithRelations extends Post {
  user: User;
  cat: Category;
}

export interface UpdatePostBody {
  title?: string;
  desc?: string;
  img?: string | string[] | null;
  catSlug?: string;
  tags?: string[];
  isPublished?: boolean;
}

export type UpdatedPostWithRelations = Prisma.PostGetPayload<{
  include: { user: true; tags: { include: { tag: true } } };
}>;

export type FormattedPostResponse = Omit<UpdatedPostWithRelations, "tags" | "user"> & {
  tags: Tag[];
  user: Pick<User, "id" | "email" | "name" | "image">;
};

export interface SinglePageClientProps {
  data: FormattedPostResponse;
  slug: string;
}

export interface PostDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}
