import prisma from "@/app/utils/connect";
import { TagWithPosts } from "@/types/tag";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || id === "undefined") {
    return NextResponse.json({ message: "유효하지 않은 태그 ID입니다." }, { status: 400 });
  }
  try {
    const tag: TagWithPosts | null = await prisma.tag.findUnique({
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
      return NextResponse.json({ message: "태그를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(tag, { status: 200 });
  } catch (error: any) {
    console.error("태그 조회 중 오류 발생:", error);
    return NextResponse.json({ message: "태그 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// DELETE: 태그 삭제
export async function DELETE(res: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || id === "undefined") {
    return NextResponse.json({ message: "유효하지 않은 태그 ID입니다." }, { status: 400 });
  }
  try {
    await prisma.$transaction(async (tx) => {
      await tx.postTag.deleteMany({
        where: { tagId: id },
      });

      await tx.tag.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: "태그가 삭제되었습니다." }, { status: 200 });
  } catch (error: any) {
    console.error("태그 삭제 중 오류 발생:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ message: "삭제할 태그를 찾을 수 없습니다." }, { status: 404 });
      }
    }
    return NextResponse.json({ message: "태그 삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
}
