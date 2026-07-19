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
import { useAuth } from "@/components/auth-provider/auth-provider";
import Link from "next/link";
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
  const { user, logout } = useAuth();

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
  }, [loadTasks, user]);

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
      {/* Warning Banners based on authentication status */}
      {!user ? (
        <div className={styles.demoBanner}>
          <span>🔒 You are viewing the public demo task list. Anyone can view/edit these tasks. </span>
          <Link href="/login" className={styles.bannerLink}>Log in</Link>
          <span> or </span>
          <Link href="/register" className={styles.bannerLink}>Register</Link>
          <span> to manage your private lists.</span>
        </div>
      ) : (
        !user.is_verified && (
          <div className={styles.verifyBanner}>
            <span>⚠️ Your email is not verified. Please check your inbox for the confirmation link from Brevo. </span>
            <Link href="/profile" className={styles.bannerLink}>Profile settings</Link>
          </div>
        )
      )}

      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <div className={styles.topHeader}>
              <p className={styles.eyebrow}>
                Junior Full-Stack Assignment
              </p>
              
              {/* Auth navigation controls */}
              <div className={styles.authSection}>
                {user ? (
                  <div className={styles.userInfo}>
                    <span className={styles.userGreet}>
                      Hello, <Link href="/profile" className={styles.profileLink}>{user.name || user.email}</Link>
                    </span>
                    <button onClick={logout} className={styles.logoutBtn}>
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className={styles.authLinks}>
                    <Link href="/login" className={styles.authLink}>Login</Link>
                    <span className={styles.separator}>|</span>
                    <Link href="/register" className={styles.authLink}>Register</Link>
                  </div>
                )}
              </div>
            </div>

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