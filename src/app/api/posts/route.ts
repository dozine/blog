import { getAuthSession } from "@/app/utils/auth";
import prisma from "@/app/utils/connect";
import { PostWithFormattedTags } from "@/types";
import { Post, PostTag, Prisma, Tag, User } from "@prisma/client";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const POST_PER_PAGE = 10;

export const GET = async (req: NextRequest) => {
  const session = await getAuthSession();
  const { searchParams } = new URL(req.url);
  const cat: string | null = searchParams.get("cat");
  const tagsParam: string | null = searchParams.get("tags");
  const pageParam: string | null = searchParams.get("page");

  const page: number = pageParam ? parseInt(pageParam, 10) : 1;
  const skip: number = Math.max(0, POST_PER_PAGE * (page - 1));

  const selectedTags: string[] = tagsParam
    ? tagsParam.split(".").filter((tag) => tag !== "")
    : [];
  let where: Prisma.PostWhereInput = {
    isPublished: true,
    ...(cat && { catSlug: cat }),
    ...(selectedTags.length > 0 && {
      tags: {
        some: {
          tag: {
            name: { in: selectedTags },
          },
        },
      },
    }),
  };

  if (session?.user) {
    if (session.user.email === (process.env.MYEMAIL as string)) {
      delete where.isPublished; // 관리자는 모든 글을 볼 수 있도록
    } else {
      where = {
        AND: [
          { ...where, isPublished: undefined },
          {
            OR: [{ isPublished: true }, { userEmail: session.user.email }],
          },
        ],
      };
    }
  }

  const query: Prisma.PostFindManyArgs = {
    take: POST_PER_PAGE,
    skip: skip,
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  };

  try {
    type PostsResult = Prisma.PostGetPayload<typeof query>[];
    const [posts, count]: [PostsResult, number] = await prisma.$transaction([
      prisma.post.findMany(query),
      prisma.post.count({ where: query.where }),
    ]);

    const formattedPosts: PostWithFormattedTags[] = posts.map((post) => ({
      ...post,
      tags: post.tags.map((pt) => pt.tag),
      user: {
        id: post.user.id,
        email: post.user.email,
        name: post.user.name || "",
        image: post.user.image || "",
      },
    }));

    return new NextResponse(JSON.stringify({ posts: formattedPosts, count }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err: any) {
    console.log(err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }),
      { status: 500 }
    );
  }
};

//CREATE A POST
export const POST = async (req: NextRequest) => {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    return new NextResponse(JSON.stringify({ message: "Not Authenticated!" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    interface CreatePostBody {
      slug: string;
      title: string;
      desc: string;
      img?: string | string[] | null;
      catSlug?: string;
      isPublished?: boolean;
      tags?: string[];
    }

    const body: CreatePostBody = await req.json();
    const { tags: tagIds, isPublished, ...postData } = body;
    const safeImg: string[] = Array.isArray(body.img)
      ? body.img
      : body.img
        ? [body.img]
        : [];

    if (!body.slug || !body.title) {
      return new NextResponse(
        JSON.stringify({ message: "Missing slug or title" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          title: body.title,
          slug: body.slug,
          desc: body.desc,
          img: safeImg,
          user: {
            connect: { email: session.user.email },
          },
          isPublished: body.isPublished ?? false,
          cat: {
            connect: { slug: body.catSlug || "uncategorized" },
          },
        },
      });

      // 태그가 있으면 PostTag 관계 생성
      if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
        await Promise.all(
          tagIds.map((tagIds: string) =>
            tx.postTag.create({
              data: {
                postId: post.id,
                tagId: tagIds,
              },
            })
          )
        );
      }

      type PostWithRelations = Prisma.PostGetPayload<{
        where: { id: string };
        include: { user: true; tags: { include: { tag: true } } };
      }>;

      const createdPostWithRelations: PostWithRelations | null =
        await tx.post.findUnique({
          where: { id: post.id },
          include: {
            user: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
        });
      if (!createdPostWithRelations) {
        throw new Error("Created post not found after transaction");
      }
      return createdPostWithRelations;
    });

    const formattedResult = {
      ...result,
      tags: result.tags.map((pt) => pt.tag),
    };

    return new NextResponse(JSON.stringify(formattedResult), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.log("Error creating post:", err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }),
      { status: 500 }
    );
  }
};
