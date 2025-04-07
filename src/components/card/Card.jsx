import Image from "next/image";
import styles from "./card.module.css";
import Link from "next/link";

const Card = ({ item }) => {
  return (
    <Link href={`/posts/${item.slug}`}>
      <div className={styles.container}>
        <div className={styles.textContainer}>
          <div className={styles.detail}>
            <span className={styles.date}>
              {item.createdAt.substring(0, 10)} -{" "}
            </span>
            <span className={styles.category}>{item.catSlug}</span>
          </div>
          <div className={styles.titleContainer}>
            <h1>{item.title}</h1>
          </div>
          <p>{item.desc.replace(/<[^>]+>/g, "").substring(0, 60)}</p>
        </div>
        {item.img && item.img.length > 0 && item.img[0] !== "" && (
          <div className={styles.imageContainer}>
            <div className={styles.image}>
              <Image src={item.img} alt="" fill />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default Card;
