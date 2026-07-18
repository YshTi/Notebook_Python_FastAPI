import type {
  Task,
  TaskCreate,
  TaskSort,
  TaskStatus,
  TaskUpdate,
} from "@/lib/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000";

type GetTasksOptions = {
  search?: string;
  status?: TaskStatus;
  sort?: TaskSort;
};

async function parseError(
  response: Response,
): Promise<string> {
  try {
    const data = await response.json();

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map(
          (item: { msg?: string }) =>
            item.msg ?? "Validation error",
        )
        .join(", ");
    }
  } catch {
    // The response did not contain JSON.
  }

  return `Request failed with status ${response.status}`;
}

export async function getTasks(
  options: GetTasksOptions = {},
): Promise<Task[]> {
  const parameters = new URLSearchParams();

  if (options.search?.trim()) {
    parameters.set(
      "search",
      options.search.trim(),
    );
  }

  if (options.status) {
    parameters.set("status", options.status);
  }

  if (options.sort) {
    parameters.set("sort", options.sort);
  }

  const query = parameters.toString();

  const response = await fetch(
    query
      ? `${API_URL}/tasks?${query}`
      : `${API_URL}/tasks`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function createTask(
  taskData: TaskCreate,
): Promise<Task> {
  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function updateTask(
  taskId: number,
  updates: TaskUpdate,
): Promise<Task> {
  const response = await fetch(
    `${API_URL}/tasks/${taskId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    },
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function deleteTask(
  taskId: number,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/tasks/${taskId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}