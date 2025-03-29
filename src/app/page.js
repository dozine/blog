"use client";

import CategoryList from "@/components/categoryList/CategoryList";
import styles from "./homepage.module.css";
import Featured from "@/components/featured/Featured";
import CardList from "@/components/cardList/CardList";
import Menu from "@/components/menu/Menu";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const [page, setPage] = useState(pageParam ? parseInt(pageParam, 10) : 1);

  return (
    <div className={styles.container}>
      <Featured />
      <CategoryList />
      <div className={styles.content}>
        <CardList page={page} />
      </div>
    </div>
  );
}
