"use client";

import { TaskItem } from "@/components/task-item/task-item";
import type { Task, TaskUpdate } from "@/lib/types";
import { AnimatePresence } from "framer-motion";

import styles from "./task-list.module.css";

type TaskListProps = {
  tasks: Task[];
  isLoading: boolean;
  updatingTaskId: number | null;
  onToggle: (
    task: Task,
  ) => Promise<void>;
  onDelete: (
    taskId: number,
  ) => Promise<void>;
  onUpdate: (
    taskId: number,
    updates: TaskUpdate,
  ) => Promise<void>;
};

export function TaskList({
  tasks,
  isLoading,
  updatingTaskId,
  onToggle,
  onDelete,
  onUpdate,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className={styles.stateCard}>
        Loading tasks...
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className={styles.stateCard}>
        <h2 className={styles.stateTitle}>
          No tasks found
        </h2>

        <p className={styles.stateText}>
          Add a task or change the filters.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.taskList}>
      <AnimatePresence>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isUpdating={
              updatingTaskId === task.id
            }
            onToggle={onToggle}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}