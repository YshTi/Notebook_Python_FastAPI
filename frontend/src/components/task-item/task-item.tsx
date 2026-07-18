"use client";

import type { Task } from "@/lib/types";

import styles from "./task-item.module.css";

type TaskItemProps = {
  task: Task;
  isUpdating?: boolean;
  onToggle: (
    task: Task,
  ) => Promise<void>;
  onDelete: (
    taskId: number,
  ) => Promise<void>;
};

function getPriorityClass(
  priority: number,
): string {
  if (priority >= 8) {
    return styles.highPriority;
  }

  if (priority >= 5) {
    return styles.mediumPriority;
  }

  return styles.lowPriority;
}

function formatDate(
  value: string,
): string {
  return new Date(value).toLocaleString();
}

export function TaskItem({
  task,
  isUpdating = false,
  onToggle,
  onDelete,
}: TaskItemProps) {
  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${task.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    await onDelete(task.id);
  }

  return (
    <article
      className={`${styles.taskItem} ${
        task.is_done
          ? styles.completed
          : ""
      }`}
    >
      <button
        type="button"
        onClick={() => void onToggle(task)}
        disabled={isUpdating}
        className={styles.statusButton}
        aria-pressed={task.is_done}
        aria-label={
          task.is_done
            ? `Mark ${task.title} as undone`
            : `Mark ${task.title} as done`
        }
      >
        {task.is_done ? "✓" : ""}
      </button>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <h3 className={styles.title}>
              {task.title}
            </h3>

            <span
              className={`${styles.statusBadge} ${
                task.is_done
                  ? styles.doneBadge
                  : styles.undoneBadge
              }`}
            >
              {task.is_done
                ? "Done"
                : "Undone"}
            </span>

            {task.is_urgent && !task.is_done && (
              <span
                className={styles.urgentBadge}
              >
                Urgent
              </span>
            )}
          </div>

          <span
            className={`${styles.priorityBadge} ${getPriorityClass(
              task.priority,
            )}`}
          >
            Priority {task.priority}
          </span>
        </div>

        {task.description && (
          <p className={styles.description}>
            {task.description}
          </p>
        )}

        <div className={styles.meta}>
          <span>
            Created {formatDate(task.created_at)}
          </span>

          {task.deadline && (
            <span>
              Deadline {formatDate(task.deadline)}
            </span>
          )}

          {task.completed_at && (
            <span>
              Completed{" "}
              {formatDate(task.completed_at)}
            </span>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() =>
              void handleDelete()
            }
            disabled={isUpdating}
            className={styles.deleteButton}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}