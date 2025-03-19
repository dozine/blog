import Image from "next/image";
import styles from "./card.module.css";
import Link from "next/link";

const Card = () => {
  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        <Image src="/p1.jpeg" alt="" fill className={styles.image} />
      </div>
      <div className={styles.textContainer}>
        <div className={styles.detail}>
          <span className={styles.date}>03.19.2025 - </span>
          <span className={styles.category}>CULTURE</span>
        </div>
        <h1>Lorem ipsum dolor sit amet alim consectetur adipisicing elit.</h1>
        <p>
          {" "}
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Cupiditate,
          quam nisi magni ea laborum inventore voluptatum laudantium repellat
          ducimus unde aspernatur fuga. Quo, accusantium
        </p>

        <Link href="/" className={styles.link}>
          Read More
        </Link>
      </div>
    </div>
  );
};

export default Card;
