import React, { MouseEvent } from "react";

import styles from "./modal.module.css";
import { ModalProps } from "@/types";

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <button className={styles.close} onClick={onClose}>
          x
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
