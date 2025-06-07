import React from "react";
import styles from "./singlePage.module.css";
import Image from "next/image";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

const SinglePageClient = dynamic(() => import("./singlePageClient"), {
  loading: () => <p>로딩 중...</p>,
});

async function getPostData(slug) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    console.error("Next_PUBLIC_BASE_URL이 설정되지 않았습니다.");
  }

  try {
    const res = await fetch(`${baseUrl}/api/posts/${slug}?popular=true`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(`Error fetching post data: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();

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

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getPostData(slug);

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

const SinglePage = async ({ params }) => {
  const { slug } = await params;

  const data = await getPostData(slug);
  if (!data) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.textContainer}>
          <h1 className={styles.title}>{data.title}</h1>
          <div className={styles.userContainer}>
            <div className={styles.user}>
              {data.user?.img && (
                <div className={styles.userImageContainer}>
                  <Image
                    src={data.user.img}
                    alt={data.user.name ? `${data.user.name}의 아바타` : "사용자 아바타"}
                    fill
                    className={styles.avatar}
                    sizes="(max-width: 768px) 40px, 50px"
                    priority
                  />
                </div>
              )}
              <div className={styles.userTextContainer}>
                <span className={styles.date}>
                  {new Date(data.createdAt).toLocaleString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                <SinglePageClient data={data} slug={slug} />
              </div>
            </div>
          </div>

          {data?.tags && data.tags.length > 0 && (
            <div className={styles.tagContainer}>
              {data.tags.map((tag) => (
                <a
                  key={tag.id || tag.name}
                  href={`/tags?tags=${encodeURIComponent(tag.name)}`}
                  className={styles.tag}
                >
                  #{tag.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.post}>
          <div className="ql-editor" dangerouslySetInnerHTML={{ __html: data.desc }} />
        </div>
      </div>
    </div>
  );
};

export default SinglePage;
