"use client";

import {
  FormEvent,
  useState,
} from "react";

import type { TaskCreate } from "@/lib/types";

import styles from "./task-form.module.css";

type TaskFormProps = {
  onCreate: (
    taskData: TaskCreate,
  ) => Promise<void>;
};

function convertLocalDateToIso(
  value: string,
): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export function TaskForm({
  onCreate,
}: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [priority, setPriority] =
    useState(5);
  const [isUrgent, setIsUrgent] =
    useState(false);
  const [deadline, setDeadline] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedTitle = title.trim();
    const normalizedDescription =
      description.trim();

    if (!normalizedTitle) {
      setError("Task title is required.");
      return;
    }

    const deadlineIso =
      convertLocalDateToIso(deadline);

    if (
      deadlineIso &&
      new Date(deadlineIso).getTime() <= Date.now()
    ) {
      setError(
        "Deadline must be in the future.",
      );
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await onCreate({
        title: normalizedTitle,
        description:
          normalizedDescription || undefined,
        priority,
        is_urgent: isUrgent,
        deadline: deadlineIso,
      });

      setTitle("");
      setDescription("");
      setPriority(5);
      setIsUrgent(false);
      setDeadline("");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not create the task.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
    >
      <div className={styles.header}>
        <p className={styles.eyebrow}>
          Create task
        </p>

        <h2 className={styles.title}>
          Add a new task
        </h2>

        <p className={styles.subtitle}>
          Add details, priority and an optional
          deadline.
        </p>
      </div>

      <div className={styles.fields}>
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label
              className={styles.label}
              htmlFor="task-title"
            >
              Title
            </label>

            <span
              className={styles.characterCount}
            >
              {title.length}/200
            </span>
          </div>

          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            maxLength={200}
            disabled={isSubmitting}
            placeholder="For example: Finish the frontend"
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label
              className={styles.label}
              htmlFor="task-description"
            >
              Description
            </label>

            <span
              className={styles.characterCount}
            >
              {description.length}/1000
            </span>
          </div>

          <textarea
            id="task-description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            maxLength={1000}
            rows={4}
            disabled={isSubmitting}
            placeholder="Optional details"
            className={styles.textarea}
          />
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label
              className={styles.label}
              htmlFor="task-priority"
            >
              Priority
            </label>

            <span
              className={styles.priorityValue}
            >
              {priority}
            </span>
          </div>

          <input
            id="task-priority"
            type="range"
            min={1}
            max={10}
            step={1}
            value={priority}
            onChange={(event) =>
              setPriority(
                Number(event.target.value),
              )
            }
            disabled={isSubmitting}
            className={styles.range}
          />

          <div className={styles.priorityScale}>
            <span>1 · Low</span>
            <span>5 · Medium</span>
            <span>10 · High</span>
          </div>
        </div>

        <div className={styles.field}>
          <label
            className={styles.label}
            htmlFor="task-deadline"
          >
            Deadline
          </label>

          <input
            id="task-deadline"
            type="datetime-local"
            value={deadline}
            onChange={(event) =>
              setDeadline(event.target.value)
            }
            disabled={isSubmitting}
            className={styles.input}
          />
        </div>

        <label className={styles.checkboxField}>
          <input
            type="checkbox"
            checked={isUrgent}
            onChange={(event) =>
              setIsUrgent(
                event.target.checked,
              )
            }
            disabled={isSubmitting}
          />

          <span>Mark this task as urgent</span>
        </label>
      </div>

      {error && (
        <p
          className={styles.error}
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={
          isSubmitting || !title.trim()
        }
        className={styles.submitButton}
      >
        {isSubmitting
          ? "Adding task..."
          : "Add task"}
      </button>
    </form>
  );
}