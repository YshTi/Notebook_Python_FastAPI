"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { TaskFilter } from "@/components/task-filters/task-filters";
import { TaskForm } from "@/components/task-form/task-form";
import { TaskList } from "@/components/task-list/task-list";
import { Modal } from "@/components/modal/modal";
import {
  createTask,
  deleteTask,
  getTasks,
  getTasksStats,
  updateTask,
} from "@/lib/api";
import type {
  Task,
  TaskCreate,
  TaskSort,
  TaskStats,
  TaskStatus,
  TaskUpdate,
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
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
        const [loadedTasks, loadedStats] = await Promise.all([
          getTasks({
            search,
            status,
            sort,
          }),
          getTasksStats(),
        ]);

        setTasks(loadedTasks);
        setStats(loadedStats);
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
    setIsCreateModalOpen(false);
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

  async function handleUpdate(
    taskId: number,
    updates: TaskUpdate,
  ) {
    setUpdatingTaskId(taskId);
    setError("");

    try {
      const updatedTask =
        await updateTask(taskId, updates);

      setTasks((currentTasks) =>
        currentTasks.map(
          (currentTask) =>
            currentTask.id === taskId
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
              <svg className={styles.summaryCardBg}><use href="/sprite.svg#icon-notes-blank"></use></svg>
              <div className={styles.summaryCardText}>
                <span
                  className={styles.summaryValue}
                >
                  {stats?.total ?? 0}
                </span>

                <span className={styles.summaryLabel} >
                  Total
                </span>
              </div>
            </div>

            <div
              className={styles.summaryCard}
            >
              <svg className={styles.summaryCardBg}><use href="/sprite.svg#icon-notes-blank"></use></svg>
              <div className={styles.summaryCardText}>
                <span
                  className={styles.summaryValue}
                >
                  {stats?.undone ?? 0}
                </span>

                <span className={styles.summaryLabel} >
                  Undone
                </span>
              </div>
            </div>

            <div className={styles.summaryCard} >
              <svg className={styles.summaryCardBg}><use href="/sprite.svg#icon-notes-blank"></use></svg>
              <div className={styles.summaryCardText}>
                <span
                  className={styles.summaryValue}
                >
                  {stats?.urgent ?? 0}
                </span>

                <span className={styles.summaryLabel} >
                  Urgent
                </span>
              </div>
            </div>

            <div
              className={styles.summaryCard}
            >
              <svg className={styles.summaryCardBg}><use href="/sprite.svg#icon-notes-blank"></use></svg>
              <div className={styles.summaryCardText}>
                <span
                  className={styles.summaryValue}
                >
                  {stats?.done ?? 0}
                </span>

                <span className={styles.summaryLabel} >
                  Done
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.layout}>

          <section className={styles.content}>
            <div className={styles.controlsHeader}>
              <TaskFilter
                search={search}
                status={status}
                sort={sort}
                onSearchChange={setSearch}
                onStatusChange={setStatus}
                onSortChange={setSort}
              />
              <button
                className={styles.addTaskButton}
                onClick={() => setIsCreateModalOpen(true)}
                aria-label="Add Task"
                title="Add Task"
              >
                +
              </button>
            </div>

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
              onUpdate={handleUpdate}
            />
          </section>
        </div>
      </div>

      {isCreateModalOpen && (
        <Modal
          title="Create New Task"
          onClose={() => setIsCreateModalOpen(false)}
        >
          <TaskForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>
      )}
    </main>
  );
}