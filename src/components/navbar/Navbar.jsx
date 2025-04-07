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
      <Link href="/" className={styles.logo}>
        zindozang
      </Link>
      <div className={styles.links}>
        <Link href="/">Tags</Link>
        <Link href="/">About</Link>
        {session.status === "authenticated" && <AuthLinks />}
        <ThemeToggle />
      </div>
    </div>
  );
};
export default Navbar;
