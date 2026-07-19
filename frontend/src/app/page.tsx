"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { TaskSearch, TaskSelects } from "@/components/task-filters/task-filters";
import { Summary } from "@/components/summary/summary";
import { TaskForm } from "@/components/task-form/task-form";
import { TaskList } from "@/components/task-list/task-list";
import { Modal } from "@/components/modal/modal";
import { ThemeToggle } from "@/components/theme-toggle/theme-toggle";
import toast from "react-hot-toast";
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
    try {
      await createTask(taskData);
      setIsCreateModalOpen(false);
      await loadTasks();
      toast.success("Task created successfully!");
    } catch (caughtError) {
      const msg = caughtError instanceof Error ? caughtError.message : "Could not add task.";
      setError(msg);
      toast.error(msg);
    }
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
      toast.success(task.is_done ? "Task marked as Todo" : "Task marked as Done");
    } catch (caughtError) {
      const msg = caughtError instanceof Error ? caughtError.message : "Could not update the task.";
      setError(msg);
      toast.error(msg);
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
      toast.success("Task deleted successfully!");
    } catch (caughtError) {
      const msg = caughtError instanceof Error ? caughtError.message : "Could not delete the task.";
      setError(msg);
      toast.error(msg);
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
      toast.success("Task updated successfully!");
    } catch (caughtError) {
      const msg = caughtError instanceof Error ? caughtError.message : "Could not update the task.";
      setError(msg);
      toast.error(msg);
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

            <div className={styles.titleWrapper}>
              <h1 className={styles.title}>
                Task Manager
              </h1>
              <ThemeToggle />
            </div>

            <p className={styles.subtitle}>
              Create, search, filter and
              prioritize your tasks.
            </p>
          </div>

          <Summary stats={stats} />
        </header>

        <div className={styles.layout}>

          <section className={styles.content}>
            <div className={styles.controlsHeader}>
              <div className={styles.searchPart}>
                <TaskSearch search={search} onSearchChange={setSearch} />
              </div>
              <div className={styles.filtersPart}>
                <TaskSelects
                  status={status}
                  sort={sort}
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