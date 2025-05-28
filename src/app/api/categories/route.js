import { NextResponse } from "next/server";
import prisma from "@/app/utils/connect";
// GET API 함수 - 모든 카테고리 조회
export const GET = async () => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        title: "asc", // 카테고리 이름 알파벳 순으로 정렬
      },
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (err) {
    console.error("카테고리 조회 오류:", err);
    return new NextResponse("카테고리 조회 중 오류 발생", { status: 500 });
  }
};

// POST API 함수 - 새 카테고리 생성
export const POST = async (req) => {
  try {
    const body = await req.json();
    const { slug, title, img } = body;

    // 필수 필드 확인
    if (!slug || !title) {
      return new NextResponse("slug와 title은 필수 입력 항목입니다.", {
        status: 400,
      });
    }

    // slug가 uncategorized인 경우 이미 존재하는지 확인
    if (slug === "uncategorized") {
      const existingCategory = await prisma.category.findUnique({
        where: { slug: "uncategorized" },
      });

      if (existingCategory) {
        return NextResponse.json(
          {
            message: "미분류 카테고리가 이미 존재합니다.",
            category: existingCategory,
          },
          { status: 200 },
        );
      }
    }

    // 슬러그 중복 확인
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return new NextResponse("이미 사용 중인 slug입니다.", { status: 400 });
    }

    // 새 카테고리 생성
    const newCategory = await prisma.category.create({
      data: {
        slug,
        title,
        img,
      },
    });

    return NextResponse.json(
      { message: "카테고리 생성 완료", category: newCategory },
      { status: 201 },
    );
  } catch (err) {
    console.error("카테고리 생성 오류:", err);
    return new NextResponse("카테고리 생성 중 오류 발생: " + err.message, {
      status: 500,
    });
  }
};

// DELETE API 함수 - 카테고리 삭제 (기존 코드에 Uncategorized 체크 추가)
export const DELETE = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("카테고리 id가 없습니다.", { status: 400 });
    }

    // 먼저 카테고리 정보 조회
    const categoryToDelete = await prisma.category.findUnique({
      where: { id },
    });

    if (!categoryToDelete) {
      return new NextResponse("해당 카테고리를 찾을 수 없습니다.", {
        status: 404,
      });
    }

    // Uncategorized 카테고리 삭제 방지
    if (categoryToDelete.slug === "uncategorized") {
      return new NextResponse("'미분류' 카테고리는 삭제할 수 없습니다.", {
        status: 400,
      });
    }

    const deleted = await prisma.$transaction(async (tx) => {
      // 1. Uncategorized 카테고리 확인 또는 생성
      let uncategorized = await tx.category.findUnique({
        where: { slug: "uncategorized" },
      });

      if (!uncategorized) {
        uncategorized = await tx.category.create({
          data: {
            slug: "uncategorized",
            title: "미분류",
          },
        });
      }

      // 2. 삭제할 카테고리를 참조하는 모든 포스트의 카테고리를 Uncategorized로 변경
      await tx.post.updateMany({
        where: { catSlug: categoryToDelete.slug },
        data: { catSlug: uncategorized.slug },
      });

      // 3. 카테고리 삭제
      return await tx.category.delete({
        where: { id },
      });
    });

    return NextResponse.json(
      { message: "카테고리 삭제 완료", deleted },
      { status: 200 },
    );
  } catch (err) {
    console.error("카테고리 삭제 오류:", err);
    return new NextResponse("카테고리 삭제 중 오류 발생: " + err.message, {
      status: 500,
    });
  }
};
