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
          <p>
            {(() => {
              const descText = item.desc.replace(/<[^>]+>/g, "");
              return descText.length > 60
                ? descText.substring(0, 60) + "..."
                : descText;
            })()}
          </p>
          {console.log("Card received tags:", item.tags)}
          {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
            <div className={styles.tagContainer}>
              {item.tags.map((tagObj) => (
                <span key={tagObj.tag?.id} className={styles.tag}>
                  {tagObj.tag?.name || tagObj.name}
                </span>
              ))}
            </div>
          )}
        </div>
        {Array.isArray(item.img) &&
          item.img.length > 0 &&
          item.img[0].trim() !== "" && (
            <div className={styles.imageContainer}>
              <div className={styles.image}>
                <Image
                  src={item.img[0]}
                  alt=""
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
          )}
      </div>
    </Link>
  );
};

export default Card;
