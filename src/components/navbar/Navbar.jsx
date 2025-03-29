import React from "react";
import styles from "./navbar.module.css";
import Link from "next/link";
import Image from "next/image";
import AuthLinks from "../authLinks/AuthLinks";
import ThemeToggle from "../themeToggle/ThemeToggle";

const Navbar = () => {
  return (
    <div className={styles.container}>
      <div className={styles.social}></div>
      <div className={styles.logo}>Blog</div>
      <div className={styles.links}>
        <ThemeToggle />
        <Link href="/" className={styles.link}>
          Homepage
        </Link>

        <AuthLinks />
      </div>
    </div>
  );
};
export default Navbar;
