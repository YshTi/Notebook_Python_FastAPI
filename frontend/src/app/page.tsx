"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { TaskFilter } from "@/components/task-filters/task-filters";
import { TaskForm } from "@/components/task-form/task-form";
import { TaskList } from "@/components/task-list/task-list";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "@/lib/api";
import type {
  Task,
  TaskCreate,
  TaskSort,
  TaskStatus,
} from "@/lib/types";

import styles from "./page.module.css";

export default function HomePage() {
  const [tasks, setTasks] =
    useState<Task[]>([]);
  const [search, setSearch] =
    useState("");
  const [status, setStatus] =
    useState<TaskStatus>("all");
  const [sort, setSort] =
    useState<TaskSort>("created_desc");

  const [isLoading, setIsLoading] =
    useState(true);
  const [
    updatingTaskId,
    setUpdatingTaskId,
  ] = useState<number | null>(null);
  const [error, setError] =
    useState("");

  const loadTasks = useCallback(
    async () => {
      setIsLoading(true);
      setError("");

      try {
        const loadedTasks =
          await getTasks({
            search,
            status,
            sort,
          });

        setTasks(loadedTasks);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Could not load tasks.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [search, status, sort],
  );

  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        void loadTasks();
      }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadTasks]);

  async function handleCreate(
    taskData: TaskCreate,
  ) {
    await createTask(taskData);
    await loadTasks();
  }

  async function handleToggle(
    task: Task,
  ) {
    setUpdatingTaskId(task.id);
    setError("");

    try {
      const updatedTask =
        await updateTask(task.id, {
          is_done: !task.is_done,
        });

      setTasks((currentTasks) =>
        currentTasks.map(
          (currentTask) =>
            currentTask.id === task.id
              ? updatedTask
              : currentTask,
        ),
      );

      await loadTasks();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not update the task.",
      );
    } finally {
      setUpdatingTaskId(null);
    }
  }

  async function handleDelete(
    taskId: number,
  ) {
    setUpdatingTaskId(taskId);
    setError("");

    try {
      await deleteTask(taskId);
      await loadTasks();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not delete the task.",
      );
    } finally {
      setUpdatingTaskId(null);
    }
  }

  const doneCount = tasks.filter(
    (task) => task.is_done,
  ).length;

  const urgentCount = tasks.filter(
    (task) =>
      task.is_urgent && !task.is_done,
  ).length;

  const undoneCount = tasks.filter(
    (task) => !task.is_done,
  ).length;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              Junior Full-Stack Assignment
            </p>

            <h1 className={styles.title}>
              Task Manager
            </h1>

            <p className={styles.subtitle}>
              Create, search, filter and
              prioritize your tasks.
            </p>
          </div>

          <div className={styles.summary}>
            <div
              className={styles.summaryCard}
            >
              <span
                className={styles.summaryValue}
              >
                {tasks.length}
              </span>

              <span
                className={styles.summaryLabel}
              >
                Total
              </span>
            </div>

            <div
              className={styles.summaryCard}
            >
              <span
                className={styles.summaryValue}
              >
                {undoneCount}
              </span>

              <span
                className={styles.summaryLabel}
              >
                Undone
              </span>
            </div>

            <div
              className={styles.summaryCard}
            >
              <span
                className={styles.summaryValue}
              >
                {urgentCount}
              </span>

              <span
                className={styles.summaryLabel}
              >
                Urgent
              </span>
            </div>

            <div
              className={styles.summaryCard}
            >
              <span
                className={styles.summaryValue}
              >
                {doneCount}
              </span>

              <span
                className={styles.summaryLabel}
              >
                Done
              </span>
            </div>
          </div>
        </header>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <TaskForm
              onCreate={handleCreate}
            />
          </aside>

          <section className={styles.content}>
            <TaskFilter
              search={search}
              status={status}
              sort={sort}
              onSearchChange={setSearch}
              onStatusChange={setStatus}
              onSortChange={setSort}
            />

            {error && (
              <div
                className={styles.error}
                role="alert"
              >
                {error}
              </div>
            )}

            <TaskList
              tasks={tasks}
              isLoading={isLoading}
              updatingTaskId={
                updatingTaskId
              }
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          </section>
        </div>
      </div>
    </main>
  );
}