import prisma from "@/app/utils/connect";
import { TagWithPostCount } from "@/types/tag";
import { Prisma, Tag } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const tags: TagWithPostCount[] = await prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });
    return NextResponse.json(tags, { status: 200 });
  } catch (error) {
    console.error("태그 조회 중 오류 발생", error);
    return NextResponse.json({ message: "태그 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name }: { name: string } = await req.json();

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ message: "태그 이름은 필수입니다." }, { status: 400 });
    }

    const existingTag: Tag | null = await prisma.tag.findUnique({
      where: { name },
    });

    if (existingTag) {
      return NextResponse.json(existingTag, { status: 409 });
    }

    const newTag = await prisma.tag.create({
      data: { name },
    });

    return NextResponse.json(newTag, { status: 201 });
  } catch (error: any) {
    console.error("태그 생성 중 오류 발생:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json({ message: "이미 존재하는 태그 이름입니다." }, { status: 409 });
      }
    }
    return NextResponse.json({ message: "태그 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
