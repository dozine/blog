import { getAuthSession } from "@/app/utils/auth";
import prisma from "@/app/utils/connect";
import { NextResponse } from "next/server";
//GET SINGLE POST
export const GET = async (req, { params }) => {
  const { slug } = params;
  try {
    const post = await prisma.post.update({
      where: { slug },
      data: { views: { increment: 1 } },
      include: { user: true },
    });
    console.log("Sending response:", post);
    return new NextResponse(JSON.stringify(post), { status: 200 });
  } catch (err) {
    console.log("Error", err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }, { status: 500 })
    );
  }
};

//DELETE POST
export const DELETE = async (req, { params }) => {
  const session = await getAuthSession();
  if (!session) {
    return new NextResponse(
      JSON.stringify({ message: "Unauthorized" }, { status: 401 })
    );
  }

  try {
    const { slug } = params;
    const post = await prisma.post.findUnique({
      where: { slug },
    });
    if (!post) {
      return new NextResponse(
        JSON.stringify({ message: "Post not found" }, { status: 404 })
      );
    }
    if (post.userId !== session.user.id) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }, { status: 403 })
      );
    }
    await prisma.post.delete({ where: { slug } });
    return new NextResponse(
      JSON.stringify({ message: "Post deleted" }, { status: 200 })
    );
  } catch (err) {
    console.log("Errror deleting post:", err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }, { status: 500 })
    );
  }
};

//UPDATE POST
export const PUT = async (req, { params }) => {
  const session = await getAuthSession();
  if (!session) {
    return new NextResponse(
      JSON.stringify({ message: "Not Authenticate" }, { status: 401 })
    );
  }

  try {
    const { slug } = params;
    const body = await req.json();
    const { title, desc, img, tags } = body;

    if (!title || !desc) {
      return new NextResponse(
        JSON.stringify({ message: "Missing required fields" }, { status: 400 })
      );
    }

    // 게시글 찾기
    const post = await prisma.post.findUnique({ where: { slug } });

    if (!post) {
      return new NextResponse(
        JSON.stringify({ message: "Post not found" }, { status: 404 })
      );
    }

    // 게시글 작성자인지 확인
    if (post.userId !== session.user.id) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }, { status: 403 })
      );
    }

    // 게시글 업데이트
    const updatedPost = await prisma.post.update({
      where: { slug },
      data: { title, desc, img, views: { increment: 1 } },
      include: { user: true },
    });
    console.log("Sending response:", updatedPost);
    return new NextResponse(JSON.stringify(updatedPost), { status: 200 });
  } catch (err) {
    console.log("Error updating post:", err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }),
      { status: 500 }
    );
  }
};
