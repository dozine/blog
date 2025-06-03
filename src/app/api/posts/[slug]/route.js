import { getAuthSession } from "@/app/utils/auth";
import prisma from "@/app/utils/connect";
import { NextResponse } from "next/server";
//GET SINGLE POST
export const GET = async (req, { params }) => {
  const { slug } = await params;
  const session = await getAuthSession();
  if (!slug || slug === "undefined") {
    return new NextResponse(JSON.stringify({ message: "Invalid post ID" }), {
      status: 400,
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
      });
    }

    if (!postExists.isPublished && session?.user.email !== postExists.user.email) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 403,
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
    return new NextResponse(JSON.stringify(formattedPost), { status: 200 });
  } catch (err) {
    console.log("Error", err);
    return new NextResponse(JSON.stringify({ message: "Something went wrong!" }, { status: 500 }));
  }
};

//DELETE POST
export const DELETE = async (req, { params }) => {
  const session = await getAuthSession();
  if (!session) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }, { status: 401 }));
  }
  const { slug } = await params;
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
    });
    if (!post) {
      return new NextResponse(JSON.stringify({ message: "Post not found" }, { status: 404 }));
    }
    if (post.userEmail !== session.user.email) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }, { status: 403 }));
    }

    await prisma.postTag.deleteMany({
      where: { postId: post.id },
    });

    await prisma.post.delete({ where: { slug } });
    return new NextResponse(JSON.stringify({ message: "Post deleted" }, { status: 200 }));
  } catch (err) {
    console.error("Errror deleting post:", err);
    return new NextResponse(JSON.stringify({ message: "Something went wrong!" }, { status: 500 }));
  }
};

//UPDATE POST
export const PUT = async (req, { params }) => {
  const session = await getAuthSession();
  if (!session) {
    return new NextResponse(JSON.stringify({ message: "Not Authenticate" }), {
      status: 401,
    });
  }

  try {
    const { slug } = await params;
    const body = await req.json();
    const { title, desc, img, tagIds, isPublished } = body;

    const formattedImg = Array.isArray(img) ? img : typeof img === "string" ? [img] : [];

    if (!title || !desc) {
      return new NextResponse(
        JSON.stringify({ message: "Missing required fields" }, { status: 400 })
      );
    }

    // 게시글 찾기
    const post = await prisma.post.findUnique({ where: { slug } });

    if (!post) {
      return new NextResponse(JSON.stringify({ message: "Post not found" }), {
        status: 404,
      });
    }

    // 게시글 작성자인지 확인
    if (post.userEmail !== session.user.email) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 403,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.postTag.deleteMany({
        where: { postId: post.id },
      });

      // 게시글 업데이트
      const updatedPost = await tx.post.update({
        where: { slug },
        data: {
          title,
          desc,
          img: formattedImg,
          isPublished,
          views: { increment: 1 },
        },
        include: { user: true },
      });

      if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
        for (const tagId of tagIds) {
          await tx.postTag.create({
            data: {
              postId: post.id,
              tagId,
            },
          });
        }
      }

      const postWithTags = await tx.post.findUnique({
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

      return {
        ...postWithTags,
        tags: postWithTags.tags.map((pt) => pt.tag),
      };
    });

    console.log("Sending response:", result);
    return new NextResponse(JSON.stringify(result), { status: 200 });
  } catch (err) {
    console.log("Error updating post:", err);
    return new NextResponse(JSON.stringify({ message: "Something went wrong!" }), { status: 500 });
  }
};
