import Image from "next/image";
import styles from "./card.module.css";
import Link from "next/link";
import { CardProps } from "@/types";
import { TagWithPostCount } from "@/types/tag";

const Card = ({ item, priority = false, index = 0 }: CardProps) => {
  const shouldPrioritize = priority || index < 3;
  return (
    <Link href={`/posts/${item.slug}`}>
      <div className={styles.container}>
        <div className={styles.textContainer}>
          <div className={styles.detail}>
            <span className={styles.date}>
              {item.createdAt instanceof Date
                ? item.createdAt.toISOString().substring(0, 10)
                : new Date(item.createdAt).toISOString().substring(0, 10)}{" "}
              -{" "}
            </span>
            <span className={styles.category}>{item.catSlug}</span>
          </div>
          <div className={styles.titleContainer}>
            <h1>{item.title}</h1>
          </div>
          <p>
            {(() => {
              if (!item.desc) return "";
              const descText = item.desc.replace(/<[^>]+>/g, "");
              return descText.length > 60
                ? descText.substring(0, 60) + "..."
                : descText;
            })()}
          </p>

          {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
            <div className={styles.tagContainer}>
              {item.tags.map((tag) => (
                <span key={tag.id || tag.name} className={styles.tag}>
                  {tag.name}
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
                  alt={item.title || "포스트 이미지"}
                  fill
                  style={{ objectFit: "cover" }}
                  priority={shouldPrioritize}
                  loading={shouldPrioritize ? "eager" : "lazy"}
                  sizes="(max-width:480px) 100vw, (max-width: 768px) 50vw, 280px"
                  quality={80}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
              </div>
            </div>
          )}
      </div>
    </Link>
  );
};

export default Card;
