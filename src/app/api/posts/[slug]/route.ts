import { getAuthSession } from "@/app/utils/auth";
import prisma from "@/app/utils/connect";
import { PostWithFormattedTags, UpdatePostBody } from "@/types";
import { Post, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    slug: string;
  };
}

//GET SINGLE POST
export const GET = async (req: NextRequest, { params }: RouteParams) => {
  const { slug } = params;
  const session = await getAuthSession();
  if (!slug || slug === "undefined") {
    return new NextResponse(JSON.stringify({ message: "Invalid post slug" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const postExists = await prisma.post.findUnique({
      where: { slug },
      include: { user: true },
    });

    if (!postExists) {
      return new NextResponse(JSON.stringify({ message: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!postExists.isPublished && session?.user.email !== postExists.user.email) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const post = await prisma.post.update({
      where: { slug },
      data: { views: { increment: 1 } },
      include: { user: true, tags: { include: { tag: true } } },
    });

    const formattedPost = {
      ...post,
      tags: post.tags.map((pt) => pt.tag),
    };

    return new NextResponse(JSON.stringify(formattedPost), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.log("Error", err);
    return new NextResponse(JSON.stringify({ message: "Something went wrong!" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

//DELETE POST
export const DELETE = async (req: NextRequest, { params }: RouteParams) => {
  const session = await getAuthSession();
  if (!session?.user?.email) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const { slug } = params;
  try {
    const post: Post | null = await prisma.post.findUnique({
      where: { slug },
    });
    if (!post) {
      return new NextResponse(JSON.stringify({ message: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (post.userEmail !== session.user.email) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.postTag.deleteMany({
        where: { postId: post.id },
      });

      await tx.post.delete({
        where: { slug },
      });
    });
    return new NextResponse(JSON.stringify({ message: "Post deleted" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Errror deleting post:", err);
    return new NextResponse(JSON.stringify({ message: "Something went wrong!" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const PUT = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return new NextResponse(JSON.stringify({ message: "Not Authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { slug } = params;
    if (!slug || slug === "undefined") {
      return new NextResponse(JSON.stringify({ message: "Invalid post slug" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body: UpdatePostBody = await req.json();
    const { title, desc, img, tags, isPublished, catSlug } = body;
    const formattedImg: string[] = Array.isArray(img)
      ? img
      : typeof img === "string" && img.trim() !== ""
        ? [img]
        : [];

    if (!title?.trim() || !desc?.trim()) {
      return new NextResponse(JSON.stringify({ message: "Title and description are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const post = await prisma.post.findUnique({
      where: { slug },
      select: {
        id: true,
        userEmail: true,
        isPublished: true,
        catSlug: true,
      },
    });

    if (!post) {
      return new NextResponse(JSON.stringify({ message: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (post.userEmail !== session.user.email) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.postTag.deleteMany({
        where: { postId: post.id },
      });

      const updateData: Prisma.PostUpdateInput = {
        title: title.trim(),
        desc: desc.trim(),
        img: formattedImg,
        isPublished: isPublished ?? post.isPublished,
      };

      if (catSlug && catSlug !== post.catSlug) {
        updateData.cat = { connect: { slug: catSlug } };
      }

      const updatedPost = await tx.post.update({
        where: { id: post.id },
        data: updateData,
      });

      if (tags && Array.isArray(tags) && tags.length > 0) {
        const validTagIds = tags.filter((id) => id && id.trim() !== "");
        if (validTagIds.length > 0) {
          await Promise.all(
            validTagIds.map(async (tagId) => {
              try {
                await tx.postTag.create({
                  data: {
                    postId: post.id,
                    tagId: tagId.trim(),
                  },
                });
              } catch (error) {
                if (
                  error instanceof Prisma.PrismaClientKnownRequestError &&
                  error.code === "P2002"
                ) {
                  return;
                }
                throw error;
              }
            })
          );
        }
      }

      // 업데이트된 게시글과 관련 데이터 조회
      const postWithTags = await tx.post.findUnique({
        where: { id: post.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      if (!postWithTags) {
        throw new Error("Updated post not found after re-fetching");
      }

      // 응답 형식 변환
      const formattedResponse: PostWithFormattedTags = {
        ...postWithTags,
        tags: postWithTags.tags.map((pt) => pt.tag),
      };

      return formattedResponse;
    });

    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating post:", error);

    // Prisma 에러 처리
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return new NextResponse(JSON.stringify({ message: "Duplicate entry detected" }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (error.code === "P2025") {
        return new NextResponse(JSON.stringify({ message: "Record not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new NextResponse(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
