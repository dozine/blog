import styles from "./tagsPage.module.css";
import CardList from "@/components/cardList/CardList";
import dynamic from "next/dynamic";

const TagsPageClient = dynamic(() => import("./tagsPageClient"), {
  loading: () => <p>loading...</p>,
});

const TagsPage = async ({ searchParams }) => {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const rawTags = params.tags || "";
  const tags = rawTags ? rawTags.split(".").filter((tag) => tag !== "") : [];

  return (
    <div className={styles.container}>
      <h1></h1>
      <TagsPageClient initialTags={tags} initialPage={page} />
      <div className={styles.content}>
        <CardList page={page} tags={tags} />
      </div>
    </div>
  );
};

export default TagsPage;
