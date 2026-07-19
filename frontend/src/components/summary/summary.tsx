"use client";

import type { TaskStats } from "@/lib/types";
import { motion } from "framer-motion";
import { IconNotesBlank } from "@/components/icons/icons";
import styles from "./summary.module.css";

type SummaryProps = {
  stats: TaskStats | null;
};

export function Summary({ stats }: SummaryProps) {
  const hoverProps = {
    whileHover: { scale: 1.05 },
    transition: { type: "spring", stiffness: 400, damping: 10 }
  };

  return (
    <div className={styles.summary}>
      <motion.div className={styles.summaryCard} {...hoverProps}>
        <IconNotesBlank className={styles.summaryCardBg} />
        <div className={styles.summaryCardText}>
          <span className={styles.summaryValue}>{stats?.total ?? 0}</span>
          <span className={styles.summaryLabel}>Total</span>
        </div>
      </motion.div>

      <motion.div className={styles.summaryCard} {...hoverProps}>
        <IconNotesBlank className={styles.summaryCardBg} />
        <div className={styles.summaryCardText}>
          <span className={styles.summaryValue}>{stats?.undone ?? 0}</span>
          <span className={styles.summaryLabel}>Undone</span>
        </div>
      </motion.div>

      <motion.div className={styles.summaryCard} {...hoverProps}>
        <IconNotesBlank className={styles.summaryCardBg} />
        <div className={styles.summaryCardText}>
          <span className={styles.summaryValue}>{stats?.urgent ?? 0}</span>
          <span className={styles.summaryLabel}>Urgent</span>
        </div>
      </motion.div>

      <motion.div className={styles.summaryCard} {...hoverProps}>
        <IconNotesBlank className={styles.summaryCardBg} />
        <div className={styles.summaryCardText}>
          <span className={styles.summaryValue}>{stats?.done ?? 0}</span>
          <span className={styles.summaryLabel}>Done</span>
        </div>
      </motion.div>
    </div>
  );
}
