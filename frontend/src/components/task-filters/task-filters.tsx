"use client";

import type {
  TaskSort,
  TaskStatus,
} from "@/lib/types";

import styles from "./task-filters.module.css";

type TaskFilterProps = {
  search: string;
  status: TaskStatus;
  sort: TaskSort;
  onSearchChange: (
    value: string,
  ) => void;
  onStatusChange: (
    value: TaskStatus,
  ) => void;
  onSortChange: (
    value: TaskSort,
  ) => void;
};

export function TaskFilter({
  search,
  status,
  sort,
  onSearchChange,
  onStatusChange,
  onSortChange,
}: TaskFilterProps) {
  return (
    <div className={styles.filters}>
      <input
        type="search"
        value={search}
        onChange={(event) =>
          onSearchChange(event.target.value)
        }
        placeholder="Search tasks..."
        aria-label="Search tasks"
        className={styles.searchInput}
      />

      <select
        value={status}
        onChange={(event) =>
          onStatusChange(
            event.target.value as TaskStatus,
          )
        }
        aria-label="Filter tasks by status"
        className={styles.select}
      >
        <option value="all">All</option>
        <option value="undone">Undone</option>
        <option value="urgent">Urgent</option>
        <option value="done">Done</option>
      </select>

      <select
        value={sort}
        onChange={(event) =>
          onSortChange(
            event.target.value as TaskSort,
          )
        }
        aria-label="Sort tasks"
        className={styles.select}
      >
        <option value="created_desc">
          Newest first
        </option>

        <option value="created_asc">
          Oldest first
        </option>

        <option value="priority_desc">
          Priority: high to low
        </option>

        <option value="priority_asc">
          Priority: low to high
        </option>

        <option value="deadline_asc">
          Deadline: soonest first
        </option>

        <option value="deadline_desc">
          Deadline: latest first
        </option>
      </select>
    </div>
  );
}