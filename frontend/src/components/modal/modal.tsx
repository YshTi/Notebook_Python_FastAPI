"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./modal.module.css";

type ModalProps = {
  title: string;
  onClose: () => void;
  priorityText?: string;
  priorityLevel?: number;
  children: React.ReactNode;
};

function getPriorityClass(styles: any, level?: number) {
  if (level === undefined) return "";
  if (level >= 8) return styles.highPriority;
  if (level >= 5) return styles.mediumPriority;
  return styles.lowPriority;
}

export function Modal({ title, onClose, priorityText, priorityLevel, children }: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === backdropRef.current) {
      onClose();
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div className={styles.backdrop} ref={backdropRef} onClick={handleBackdropClick}>
      <div className={styles.taskItem}>
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <span className={styles.titleText}>{title}</span>
          </div>
          <div className={styles.topBarRight}>
            {priorityText && (
              <span className={`${styles.priorityBadge} ${getPriorityClass(styles, priorityLevel)}`}>
                {priorityText}
              </span>
            )}
            <button className={styles.closeButton} onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
