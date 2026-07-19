"use client";

import {
  FormEvent,
  useState,
} from "react";

import type { Task, TaskCreate } from "@/lib/types";

import { Icon } from "@/components/icons/icons";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

import styles from "./task-form.module.css";

type TaskFormProps = {
  initialData?: Task;
  onSubmit: (
    taskData: TaskCreate,
  ) => Promise<void>;
  onCancel?: () => void;
  onPriorityChange?: (priority: number) => void;
};

// Not needed anymore since we deal with Date objects directly

export function TaskForm({
  initialData,
  onSubmit,
  onCancel,
  onPriorityChange,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] =
    useState(initialData?.description ?? "");
  const [priority, setPriority] =
    useState(initialData?.priority ?? 5);
  const [isUrgent, setIsUrgent] =
    useState(initialData?.is_urgent ?? false);
  
  // Use a Date object for the DatePicker
  const [deadline, setDeadline] = useState<Date | null>(
    initialData?.deadline ? new Date(initialData.deadline) : null
  );

  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [error, setError] = useState("");

  let rawTextLength = 0;
  if (description && description !== '<p><br></p>' && description !== '<p></p>') {
    const stripped = description.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ');
    rawTextLength = stripped.length;
  }
  
  // Enforce 1000 *visible* characters on frontend.
  // Backend allows 5000 total HTML characters, preventing DB crashes while giving plenty of room for markup.
  const isDescriptionTooLong = rawTextLength > 1000;
  
  const [now] = useState(() => Date.now());
  const isDeadlineInvalid = deadline ? deadline.getTime() <= now : false;

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

    const deadlineIso = deadline ? deadline.toISOString() : null;

    if (
      deadline &&
      deadline.getTime() <= Date.now()
    ) {
      setError(
        "Deadline must be in the future.",
      );
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await onSubmit({
        title: normalizedTitle,
        description:
          normalizedDescription || undefined,
        priority,
        is_urgent: isUrgent,
        deadline: deadlineIso,
      });

      if (!initialData) {
        setTitle("");
        setDescription("");
        setPriority(5);
        setIsUrgent(false);
        setDeadline(null);
      }
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
        <h2 className={styles.title}>
          {initialData 
            ? "Update details, priority and deadline." 
            : "Add details, priority and an optional deadline."}
        </h2>
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
            >
              Description
            </label>

            <span
              className={`${styles.characterCount} ${isDescriptionTooLong ? styles.characterCountError : ""}`}
            >
              {rawTextLength}/1000
            </span>
          </div>

          <ReactQuill
            id="task-description"
            theme="snow"
            value={description}
            onChange={setDescription}
            readOnly={isSubmitting}
            placeholder="Optional details"
            className={`${styles.quillEditor} ${isDescriptionTooLong ? styles.quillError : ""}`}
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
            onChange={(event) => {
              const newPriority = Number(event.target.value);
              setPriority(newPriority);
              onPriorityChange?.(newPriority);
            }}
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

          <div className={styles.datePickerWrapper}>
            <DatePicker
              id="task-deadline"
              selected={deadline}
              onChange={(date: Date | null) => setDeadline(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
              placeholderText="Select a deadline"
              disabled={isSubmitting}
              className={`${styles.input} ${isDeadlineInvalid ? styles.inputError : ""}`}
              popperPlacement="top-end"
              minDate={new Date()}
              showPopperArrow={false}
            />
            <Icon name="icon-calendar" className={styles.calendarIcon} aria-hidden="true" />
          </div>
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

      {(error || isDeadlineInvalid) && (
        <p
          className={styles.error}
          role="alert"
        >
          {error || (isDeadlineInvalid ? "Deadline must be in the future." : "")}
        </p>
      )}

      <div className={styles.actionsGroup}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={styles.cancelButton}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={
            isSubmitting || !title.trim() || isDescriptionTooLong || isDeadlineInvalid
          }
          className={styles.submitButton}
        >
          {isSubmitting
            ? "Saving..."
            : (initialData ? "Save changes" : "Add task")}
        </button>
      </div>
    </form>
  );
}