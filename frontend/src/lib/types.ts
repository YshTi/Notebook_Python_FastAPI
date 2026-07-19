export type Task = {
  id: number;
  title: string;
  description: string | null;
  is_done: boolean;
  priority: number;
  is_urgent: boolean;
  completed_at: string | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskCreate = {
  title: string;
  description?: string;
  priority: number;
  is_urgent: boolean;
  deadline?: string | null;
};

export type TaskUpdate = {
  title?: string;
  description?: string | null;
  is_done?: boolean;
  priority?: number;
  is_urgent?: boolean;
  deadline?: string | null;
};

export type TaskStatus =
  | "all"
  | "undone"
  | "urgent"
  | "done";

export type TaskSort =
  | "created_desc"
  | "created_asc"
  | "priority_asc"
  | "priority_desc"
  | "deadline_asc"
  | "deadline_desc";

export type TaskStats = {
  total: number;
  done: number;
  undone: number;
  urgent: number;
};