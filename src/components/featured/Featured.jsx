import React from "react";
import styles from "./featured.module.css";
import Image from "next/image";
import Slider from "react-slick";

const Featured = () => {
  const featuredPosts = [
    {
      id: 1,
      title: "블로그 소개글 ",
      desc: "안녕하세요. 프론트엔드 개발자 장도진입니다.",
      image: "/zindozang.png",
    },
    {
      id: 2,
      title: "Next.js로 블로그 만들기",
      desc: "Next.js를 활용한 블로그 제작 과정을 소개합니다.",
      image: "/p1.jpeg",
    },
  ];

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
  };
  return (
    <div className={styles.container}>
      <div className={styles.featuredTitle}>안녕하세요. 블로그 진도장입니다.</div>

      <Slider {...settings}>
        {featuredPosts.map((post, index) => (
          <div key={post.id} className={styles.slide}>
            <div className={styles.imgContainer}>
              <Image
                src={post.image}
                alt={post.title}
                fill
                className={styles.image}
                priority={index === 0}
                sizes="(max-width: 1024px) 90vw, (max-width: 1280px) 50vw, 33vw"
              />
            </div>
            <div className={styles.textContainer}>
              <h1 className={styles.postTitle}>{post.title}</h1>
              <p className={styles.postDesc}>{post.desc}</p>
              <button className={styles.button}>더 읽기</button>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};
export default Featured;
