import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/utils/connect";
import { Category } from "@prisma/client";
import { CreateCategoryBody } from "@/types";

const uncategorizedCategory = async (): Promise<Category> => {
  const uncategorized: Category | null = await prisma.category.findUnique({
    where: { slug: "uncategorized" },
  });
  if (!uncategorized) {
    return await prisma.category.create({
      data: {
        slug: "uncategorized",
        title: "미분류",
        img: null,
      },
    });
  }
  return uncategorized;
};

// GET API 함수
export const GET = async () => {
  try {
    await uncategorizedCategory();
    const categories: Category[] = await prisma.category.findMany({
      orderBy: {
        title: "asc",
      },
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (err: any) {
    console.error("카테고리 조회 오류:", err);
    return new NextResponse(`카테고리 조회 중 오류 발생 : ${err.message || "알수없는 오류"}`, {
      status: 500,
    });
  }
};

// POST API 함수
export const POST = async (req: NextRequest) => {
  try {
    const body: CreateCategoryBody = await req.json();
    const { slug, title, img } = body;

    // 필수 필드 확인
    if (!slug || !title) {
      return new NextResponse("slug와 title은 필수 입력 항목입니다.", {
        status: 400,
      });
    }

    const existingCategory: Category | null = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return new NextResponse("이미 사용 중인 slug입니다.", { status: 400 });
    }

    // 새 카테고리 생성
    const newCategory: Category = await prisma.category.create({
      data: {
        slug,
        title,
        img: img || null,
      },
    });

    return NextResponse.json(
      { message: "카테고리 생성 완료", category: newCategory },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("카테고리 생성 오류:", err);
    return new NextResponse("카테고리 생성 중 오류 발생: " + err.message, {
      status: 500,
    });
  }
};

// DELETE API 함수 - 카테고리 삭제 (기존 코드에 Uncategorized 체크 추가)
export const DELETE = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const id: string | null = searchParams.get("id");

    if (!id) {
      return new NextResponse("카테고리 id가 없습니다.", { status: 400 });
    }

    // 먼저 카테고리 정보 조회
    const categoryToDelete: Category | null = await prisma.category.findUnique({
      where: { id },
    });

    if (!categoryToDelete) {
      return new NextResponse("해당 카테고리를 찾을 수 없습니다.", {
        status: 404,
      });
    }

    if (categoryToDelete.slug === "uncategorized") {
      return new NextResponse("'미분류' 카테고리는 삭제할 수 없습니다.", {
        status: 400,
      });
    }

    const deleted: Category = await prisma.$transaction(async (tx) => {
      const uncategorized: Category = await uncategorizedCategory();

      await tx.post.updateMany({
        where: { catSlug: categoryToDelete.slug },
        data: { catSlug: uncategorized.slug },
      });
      return await tx.category.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: "카테고리 삭제 완료", deleted }, { status: 200 });
  } catch (err: any) {
    console.error("카테고리 삭제 오류:", err);
    return new NextResponse("카테고리 삭제 중 오류 발생: " + err.message, {
      status: 500,
    });
  }
};
