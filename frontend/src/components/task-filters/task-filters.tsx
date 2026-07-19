"use client";

import type {
  TaskSort,
  TaskStatus,
} from "@/lib/types";
import { Dropdown } from "@/components/dropdown/dropdown";

import styles from "./task-filters.module.css";

type TaskSearchProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export function TaskSearch({
  search,
  onSearchChange,
}: TaskSearchProps) {
  return (
    <input
      type="search"
      value={search}
      onChange={(event) => onSearchChange(event.target.value)}
      placeholder="Search tasks..."
      aria-label="Search tasks"
      className={styles.searchInput}
    />
  );
}

type TaskSelectsProps = {
  status: TaskStatus;
  sort: TaskSort;
  onStatusChange: (value: TaskStatus) => void;
  onSortChange: (value: TaskSort) => void;
};

export function TaskSelects({
  status,
  sort,
  onStatusChange,
  onSortChange,
}: TaskSelectsProps) {
  const statusOptions = [
    { value: "all", label: "All" },
    { value: "undone", label: "Undone" },
    { value: "urgent", label: "Urgent" },
    { value: "done", label: "Done" },
  ];

  const sortOptions = [
    { value: "created_desc", label: "Newest first" },
    { value: "created_asc", label: "Oldest first" },
    { value: "priority_desc", label: "Priority: high to low" },
    { value: "priority_asc", label: "Priority: low to high" },
    { value: "deadline_asc", label: "Deadline: soonest first" },
    { value: "deadline_desc", label: "Deadline: latest first" },
  ];

  return (
    <>
      <Dropdown
        value={status}
        onChange={(val) => onStatusChange(val as TaskStatus)}
        options={statusOptions}
        ariaLabel="Filter tasks by status"
        className={styles.dropdownWrapper}
      />

      <Dropdown
        value={sort}
        onChange={(val) => onSortChange(val as TaskSort)}
        options={sortOptions}
        ariaLabel="Sort tasks"
        className={`${styles.dropdownWrapper} ${styles.sortDropdown}`}
      />
    </>
  );
}