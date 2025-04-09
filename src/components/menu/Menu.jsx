import React from "react";
import styles from "./menu.module.css";
import MenuTags from "../menuTags/MenuTags";

const Menu = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.subtitle}>explore</h2>
      <h1 className={styles.title}>Tags</h1>
      <MenuTags />
    </div>
  );
};
export default Menu;
