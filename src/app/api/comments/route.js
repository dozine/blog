import { getAuthSession } from "@/app/utils/auth";
import prisma from "@/app/utils/connect";
import { NextResponse } from "next/server";
//GET COMMENT POST
export const GET = async (req) => {
  const { searchParams } = new URL(req.url);
  const postSlug = searchParams.get("postSlug");
  try {
    const comments = await prisma.comment.findMany({
      where: {
        ...(postSlug && { postSlug }),
      },
      include: { user: true },
    });

    return new NextResponse(JSON.stringify(comments), { status: 200 });
  } catch (err) {
    console.log(err);
    return new NextResponse(JSON.stringify({ message: "Something went wrong!" }, { status: 500 }));
  }
};
// CREATE A COMMENT
export const POST = async (req) => {
  const session = await getAuthSession();
  if (!session) {
    return new NextResponse(JSON.stringify({ message: "Not Authenticate" }, { status: 401 }));
  }

  try {
    const body = await req.json();
    const { desc, postSlug } = body;
    const comment = await prisma.comment.create({
      data: { desc, postSlug, userEmail: session.user.email },
    });

    return new NextResponse(JSON.stringify(comment), { status: 200 });
  } catch (err) {
    console.log(err);
    return new NextResponse(JSON.stringify({ message: "Something went wrong!" }, { status: 500 }));
  }
};
