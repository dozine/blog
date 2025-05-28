import { getAuthSession } from "@/app/utils/auth";
import prisma from "@/app/utils/connect";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  const session = await getAuthSession();
  const { searchParams } = new URL(req.url);
  const cat = searchParams.get("cat") || null;
  const tagsParam = searchParams.get("tags");
  const pageParam = searchParams.get("page");
  const POST_PER_PAGE = 10;

  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const skip = Math.max(0, POST_PER_PAGE * (page - 1));

  const selectedTags = tagsParam ? tagsParam.split(",") : [];
  const where = {
    isPublished: true,
    ...(cat && { catSlug: cat }),
    ...(selectedTags.length > 0 && {
      OR: selectedTags.map((tagName) => ({
        tags: {
          some: {
            tag: {
              name: tagName,
            },
          },
        },
      })),
    }),
  };

  if (session?.user) {
    if (session.user.email === process.env.MYEMAIL) {
      delete where.isPublished; // 관리자는 모든 글을 볼 수 있도록
    } else {
      where.OR = [{ isPublished: true }, { userEmail: session.user.email }]; // 본인 글 또는 공개 글
    }
  }

  const query = {
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
    const [posts, count] = await prisma.$transaction([
      prisma.post.findMany(query),
      prisma.post.count({ where: query.where }),
    ]);

    return new NextResponse(JSON.stringify({ posts, count }), {
      status: 200,
    });
  } catch (err) {
    console.log(err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }, { status: 500 }),
    );
  }
};

//CREATE A POST
export const POST = async (req) => {
  const session = await getAuthSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ message: "Not Authenticate" }, { status: 401 }),
    );
  }

  try {
    const body = await req.json();
    const { tags: tagIds, isPublished, ...postData } = body;
    const safeImg = Array.isArray(body.img)
      ? body.img
      : body.img
        ? [body.img]
        : [];

    if (!body.slug || !body.title) {
      return new NextResponse(
        JSON.stringify({ message: "Missing slug or title" }, { status: 400 }),
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 먼저 게시글 생성
      const post = await tx.post.create({
        data: {
          ...postData,
          img: safeImg,
          userEmail: session.user.email,
          isPublished,
        },
      });

      // 태그가 있으면 PostTag 관계 생성
      if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
        for (const tagId of tagIds) {
          await tx.postTag.create({
            data: {
              postId: post.id,
              tagId: tagId,
            },
          });
        }
      }

      return await tx.post.findUnique({
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
    });

    const formattedResult = {
      ...result,
      tags: result.tags.map((pt) => pt.tag),
    };

    return new NextResponse(JSON.stringify(formattedResult), { status: 200 });
  } catch (err) {
    console.log("Error creating post:", err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }, { status: 500 }),
    );
  }
};
