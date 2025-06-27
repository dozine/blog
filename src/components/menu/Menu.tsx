import React from "react";
import styles from "./menu.module.css";
import MenuTags from "../menuTags/MenuTags";

const Menu = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.subtitle}>
        Explore <b>TAGS</b>
      </h2>

      <MenuTags />
    </div>
  );
};
export default Menu;
