import prisma from "@/app/utils/connect";
import { NextResponse } from "next/server";

export async function GET(req) {
  const url = new URL(req.url);
  const tagsQuery = url.searchParams.get("tags");
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });
    return NextResponse.json(tags, { status: 200 });
  } catch (error) {
    console.error("태그 조회 중 오류 발생", error);
    return NextResponse.json(
      { message: "태그 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { message: "태그 이름은 필수입니다." },
        { status: 400 }
      );
    }

    const existingTag = await prisma.tag.findUnique({
      where: { name },
    });

    if (existingTag) {
      return NextResponse.json(
        { message: "이미 존재하는 태그입니다." },
        { status: 409 }
      );
    }

    const newTag = await prisma.tag.create({
      data: { name },
    });

    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    console.error("태그 생성 중 오류 발생:", error);
    return NextResponse.json(
      { message: "태그 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
