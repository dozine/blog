"use client";

import Image from "next/image";
import styles from "./themeToggle.module.css";
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { ThemeContextType } from "@/types";

const ThemeToggle = () => {
  const { toggle, theme } = useContext<ThemeContextType>(ThemeContext);
  const claudeOrange: string = "#f9a03f";
  return (
    <button
      className={styles.button}
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      style={{
        borderColor: claudeOrange,
        color: theme === "dark" ? claudeOrange : "#333",
      }}
    >
      <span className={styles.icon}>
        {theme === "dark" ? (
          <Image src="/moon.png" alt="Light mode" width={20} height={20} />
        ) : (
          <Image src="/sun.png" alt="Dark mode" width={20} height={20} />
        )}
      </span>
      <span className={styles.text}>{theme === "dark"}</span>
    </button>
  );
};

export default ThemeToggle;
