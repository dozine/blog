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
    {
      id: 3,
      title: "CSS 모듈 실전 활용법",
      desc: "CSS 모듈을 효과적으로 사용하는 방법을 알아봅니다.",
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
      <div className={styles.featuredTitle}>Hello. This is blog zindoang.</div>

      <Slider {...settings}>
        {featuredPosts.map((post) => (
          <div key={post.id} className={styles.slide}>
            <div className={styles.imgContainer}>
              <Image
                src={post.image}
                alt={post.title}
                fill
                className={styles.image}
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

      {/* <div className={styles.post}>
        <div className={styles.imgContainer}>
          <Image src="/p1.jpeg" alt="" fill className={styles.image} />
        </div>
        <div className={styles.textContainer}>
          <h1 className={styles.postTitle}>안녕하세요</h1>
          <p className={styles.postDesc}>프론트엔드 개발자 장도진입니다.</p>
        </div>
      </div> */}
    </div>
  );
};
export default Featured;
