import React from "react";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { FormattedPostResponse, Params } from "@/types";
import { cookies } from "next/headers";

const SinglePageClient = dynamic(() => import("./singlePageClient"), {
  loading: () => <p>로딩 중...</p>,
});

async function getPostData(slug: string): Promise<FormattedPostResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    console.error("Next_PUBLIC_BASE_URL이 설정되지 않았습니다.");
  }

  try {
    const cookie = cookies();
    const cookieHeader = cookie.toString();

    const res = await fetch(`${baseUrl}/api/posts/${slug}?popular=true`, {
      next: { revalidate: 3600 },
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (!res.ok) {
      console.error(`Error fetching post data: ${res.status} ${res.statusText}`);
      return null;
    }

    const data: FormattedPostResponse = await res.json();

    if (!data || typeof data !== "object" || !data.title) {
      console.warn("Invalid data received for post:", data);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error fetching post data:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const data = await getPostData(slug as string);

  if (!data) {
    return {
      title: "포스트를 찾을 수 없습니다",
    };
  }

  return {
    title: data.title,
    description: data.desc ? data.desc.substring(0, 160).replace(/<[^>]*>/g, "") : "",
  };
}

const SinglePage = async ({ params }: Params) => {
  const { slug } = await params;

  const data = await getPostData(slug as string);

  if (!data) {
    notFound();
  }

  return <SinglePageClient data={data} slug={slug as string} />;
};

export default SinglePage;
