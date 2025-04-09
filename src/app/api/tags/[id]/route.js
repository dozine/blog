import prisma from "@/app/utils/connect";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        posts: {
          include: {
            post: true,
          },
        },
      },
    });

    if (!tag) {
      return NextResponse.json(
        { message: "태그를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(tag, { status: 200 });
  } catch (error) {
    console.error("태그 조회 중 오류 발생:", error);
    return NextResponse.json(
      { message: "태그 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// PUT: 태그 수정
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { message: "태그 이름은 필수입니다." },
        { status: 400 }
      );
    }

    // 이름 중복 체크 (같은 이름으로 변경하는 경우는 제외)
    const existingTag = await prisma.tag.findFirst({
      where: {
        name,
        NOT: { id },
      },
    });

    if (existingTag) {
      return NextResponse.json(
        { message: "이미 존재하는 태그 이름입니다." },
        { status: 409 }
      );
    }

    const updatedTag = await prisma.tag.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(updatedTag, { status: 200 });
  } catch (error) {
    console.error("태그 수정 중 오류 발생:", error);
    return NextResponse.json(
      { message: "태그 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// DELETE: 태그 삭제
export async function DELETE(res, { params }) {
  try {
    const { id } = await params;

    // 연결된 PostTag 관계 먼저 삭제
    await prisma.postTag.deleteMany({
      where: { tagId: id },
    });

    // 태그 삭제
    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "태그가 삭제되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("태그 삭제 중 오류 발생:", error);
    return NextResponse.json(
      { message: "태그 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
