import React from "react";
import styles from "./categoryList.module.css";
import Link from "next/link";
import Image from "next/image";

const CategoryList = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Categories</h1>
      <div className={styles.categories}>
        <Link href={`/blog`} className={`${styles.category} ${styles.style}`}>
          <Image
            src="/style.png"
            alt=""
            width={32}
            height={32}
            className={styles.image}
          />
          Programming
        </Link>
        <Link href={`/blog`} className={`${styles.category} ${styles.style}`}>
          <Image
            src="/style.png"
            alt=""
            width={32}
            height={32}
            className={styles.image}
          />
          Design
        </Link>
        <Link href={`/blog`} className={`${styles.category} ${styles.style}`}>
          <Image
            src="/style.png"
            alt=""
            width={32}
            height={32}
            className={styles.image}
          />
          Travel
        </Link>
        <Link href={`/blog`} className={`${styles.category} ${styles.style}`}>
          <Image
            src="/style.png"
            alt=""
            width={32}
            height={32}
            className={styles.image}
          />
          Architect
        </Link>
        <Link href={`/blog`} className={`${styles.category} ${styles.style}`}>
          <Image
            src="/style.png"
            alt=""
            width={32}
            height={32}
            className={styles.image}
          />
          Novel
        </Link>
        <Link href={`/blog`} className={`${styles.category} ${styles.style}`}>
          <Image
            src="/style.png"
            alt=""
            width={32}
            height={32}
            className={styles.image}
          />
          Movie
        </Link>
      </div>
    </div>
  );
};
export default CategoryList;
