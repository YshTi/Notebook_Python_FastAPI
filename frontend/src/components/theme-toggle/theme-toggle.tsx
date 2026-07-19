"use client";

import { useTheme } from "@/components/theme-provider/theme-provider";
import styles from "./theme-toggle.module.css";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons/icons";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return <div className={styles.placeholder} aria-hidden="true" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      className={`${styles.toggle} ${isDark ? styles.dark : styles.light}`}
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      <span className={styles.track}>
        {/* Sliding Thumb (renders behind the icons via z-index) */}
        <span className={styles.thumb} />

        {/* Static Icons (rendered on top of the track/thumb) */}
        <Icon name="icon-sun" className={`${styles.bgIcon} ${styles.bgSun}`} />
        <Icon name="icon-moon" className={`${styles.bgIcon} ${styles.bgMoon}`} />
      </span>
    </button>
  );
}
