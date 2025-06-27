import TagsPage from "@/app/tags/page";
import { Category, Post, Prisma, Tag, User } from "@prisma/client";

export type TagWithPostCount = Tag & {
  _count: {
    posts: number;
  };
};

export type TagWithPosts = Prisma.TagGetPayload<{
  include: {
    posts: {
      include: {
        post: true;
      };
    };
  };
}>;

export interface CreateTagBody {
  name: string;
}

export type PostWithAllPrismaRelations = Prisma.PostGetPayload<{
  include: { user: true; tags: { include: { tag: true } } };
}>;

export interface TagsPageSearchParams {
  page?: string;
  tags?: string;
}

export interface PostWithRelations extends Post {
  user: User;
  cat: Category;
}

export interface TagsPageClientProp {
  initialPage: number;
  initialTags: string[];
  allTags: TagWithPostCount[];
}
