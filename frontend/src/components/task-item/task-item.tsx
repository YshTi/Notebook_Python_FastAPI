"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import type { Task, TaskCreate, TaskUpdate } from "@/lib/types";
import { TaskForm } from "@/components/task-form/task-form";
import { Modal } from "@/components/modal/modal";
import { ConfirmModal } from "@/components/confirm-modal/confirm-modal";

import styles from "./task-item.module.css";

type TaskItemProps = {
  task: Task;
  isUpdating?: boolean;
  onToggle: (
    task: Task,
  ) => Promise<void>;
  onUpdate: (
    taskId: number,
    updates: TaskUpdate,
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
  onUpdate,
  onDelete,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editPriority, setEditPriority] = useState(task.priority);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleDeleteConfirm() {
    setShowDeleteConfirm(false);
    await onDelete(task.id);
  }

  function handleDeleteClick() {
    setShowDeleteConfirm(true);
  }

  async function handleEditSubmit(taskData: TaskCreate) {
    await onUpdate(task.id, taskData);
    setIsEditing(false);
  }

  // isEditing does not return early anymore, we will just conditionally render the Modal at the end of the return statement


  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`${styles.taskItem} ${
        task.is_done
          ? styles.completed
          : ""
      }`}
    >
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
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

          <span
            className={`${styles.statusBadge} ${
              task.is_done
                ? styles.doneBadge
                : styles.undoneBadge
            }`}
          >
            {task.is_done
              ? "Done"
              : "Todo"}
          </span>
        </div>

        <div className={styles.topBarRight}>
          {task.is_urgent && !task.is_done && (
            <span
              className={styles.urgentBadge}
            >
              Urgent
            </span>
          )}

          <span
            className={`${styles.priorityBadge} ${getPriorityClass(
              task.priority,
            )}`}
          >
            Priority {task.priority}
          </span>
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>
          {task.title}
        </h3>

        {task.description && (
          <p className={styles.description}>
            {task.description}
          </p>
        )}

        <div className={styles.meta}>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Created:</span>
            <span>{formatDate(task.created_at)}</span>
          </div>

          {task.deadline && (
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Deadline:</span>
              <span>{formatDate(task.deadline)}</span>
            </div>
          )}

          {task.completed_at && (
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Completed:</span>
              <span>{formatDate(task.completed_at)}</span>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => {
              setEditPriority(task.priority);
              setIsEditing(true);
            }}
            disabled={isUpdating}
            className={styles.editButton}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={isUpdating}
            className={styles.deleteButton}
          >
            Delete
          </button>
        </div>
      </div>

      {isEditing && (
        <Modal 
          title="Edit Task" 
          priorityText={`Priority ${editPriority}`} 
          priorityLevel={editPriority}
          onClose={() => setIsEditing(false)}
        >
          <TaskForm
            initialData={task}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditing(false)}
            onPriorityChange={setEditPriority}
          />
        </Modal>
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => void handleDeleteConfirm()}
      />
    </motion.article>
  );
}