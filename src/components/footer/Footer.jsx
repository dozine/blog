import React from "react";
import styles from "./footer.module.css";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <p className={styles.desc}>© 2025. jangdojin all rights reserved.</p>
      </div>
    </div>
  );
};

export default Footer;
