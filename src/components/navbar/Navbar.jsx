"use client";
import React from "react";
import styles from "./navbar.module.css";
import Link from "next/link";
import Image from "next/image";
import AuthLinks from "../authLinks/AuthLinks";
import ThemeToggle from "../themeToggle/ThemeToggle";
import { useSession } from "next-auth/react";

const Navbar = () => {
  const session = useSession();
  return (
    <div className={styles.container}>
      <div className={styles.social}></div>
      <Link href="/" className={styles.logo}>
        zindozang
      </Link>
      <div className={styles.links}>
        <ThemeToggle />
        {session.status === "authenticated" && <AuthLinks />}
      </div>
    </div>
  );
};
export default Navbar;
