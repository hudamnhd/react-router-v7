// actions.ts

import { z } from "zod";
const EmptyString = z
  .string()
  .optional()
  .transform((value) => value ?? "");

const SubTaskSchema = z.object({
  id: z.coerce.number(),
  checked: z
    .string()
    .default("off")
    .transform((value) => (value === "on" ? true : false)),
  title: EmptyString,
  category: z.object({ label: EmptyString, color: EmptyString }),
});

const TaskSchema = z.object({
  id: z.number(),
  status: z.enum(["pending", "progress", "done", "cancel"]).default("pending"),
  title: EmptyString,
  category: z.object({ label: EmptyString, color: EmptyString }),
  target_sessions: z.number().default(0),
  updated_at: z.number().nullable().default(null), // Nullable, set when task is completed
  created_at: z.number(),
  sessions: z
    .array(
      z.object({
        id: z.number(),
      }),
    )
    .default([]),
  sub_tasks: z.array(SubTaskSchema).default([]),
});

export type Task = z.infer<typeof TaskSchema>;
export type SubTask = z.infer<typeof SubTaskSchema>;

export interface AddTaskAction {
  type: "ADD_TASK";
  payload: { key?: number };
}

export interface CopyTaskAction {
  type: "COPY_TASK";
  payload: { id: number; key?: number };
}

export interface AddSubTaskAction {
  type: "ADD_SUB_TASK";
  payload: { id: number; key?: number };
}

export interface DeleteSubTaskAction {
  type: "DELETE_SUB_TASK";
  payload: {
    sub_task_id: number;
    title: string;
    sub_task_title: string;
    id: number;
    key?: number;
  };
}

export interface UpdateSubTaskAction {
  type: "UPDATE_SUB_TASK";
  payload: {
    sub_task_id: number;
    id: number;
    key?: number;
    updated_sub_task: any;
  };
}

export interface UpdateSessionTaskAction {
  type: "UPDATE_SESSON_TASK";
  payload: {
    id: number;
    key?: number;
    updated_session_task: {
      date: string;
      time: number;
    }[];
  };
}

export interface UpdateTaskAction {
  type: "UPDATE_TASK";
  payload: {
    id: number;
    key?: number;
    updated_task: any;
  };
}

export interface DeleteTaskAction {
  type: "DELETE_TASK";
  payload: { id: number; title: string; key?: number };
}

export interface SetTasksAction {
  type: "SET_TASKS";
  payload: Task[];
}

export interface UpdateColoumnTask {
  type: "UPDATE_COLUMN_TASK";
  payload: { updated_task: Task[]; key?: number };
}

export interface UpdateColoumnSubTask {
  type: "UPDATE_COLUMN_SUBTASK";
  payload: { updated_sub_task: SubTask[]; id: number; key?: number };
}

export type TaskActionTypes =
  | AddTaskAction
  | CopyTaskAction
  | AddSubTaskAction
  | DeleteSubTaskAction
  | UpdateSubTaskAction
  | UpdateSessionTaskAction
  | UpdateColoumnTask
  | UpdateColoumnSubTask
  | UpdateTaskAction
  | SetTasksAction
  | DeleteTaskAction;

export const addTask = ({ key }: { key?: number }): AddTaskAction => {
  return {
    type: "ADD_TASK",
    payload: { key },
  };
};

export const copyTask = ({
  key,
  id,
}: { id: number; key?: number }): CopyTaskAction => {
  return {
    type: "COPY_TASK",
    payload: { key, id },
  };
};

export const addSubTask = ({
  id,
  key,
}: { id: number; key?: number }): AddSubTaskAction => {
  return {
    type: "ADD_SUB_TASK",
    payload: { id, key },
  };
};

export const updateSubTask = ({
  sub_task_id,
  id,
  key,
  updated_sub_task,
}: {
  sub_task_id: number;
  id: number;
  key?: number;
  updated_sub_task: any;
}): UpdateSubTaskAction => {
  return {
    type: "UPDATE_SUB_TASK",
    payload: { sub_task_id, id, key, updated_sub_task },
  };
};

export const updateSessionTask = ({
  id,
  key,
  updated_session_task,
}: {
  id: number;
  key?: number;
  updated_session_task: {
    date: string;
    time: number;
  }[];
}): UpdateSessionTaskAction => {
  return {
    type: "UPDATE_SESSON_TASK",
    payload: { id, key, updated_session_task },
  };
};

export const deleteSubTask = ({
  sub_task_id,
  sub_task_title,
  id,
  title,
  key,
}: {
  sub_task_id: number;
  id: number;
  title: string;
  sub_task_title: string;
  key?: number;
}): DeleteSubTaskAction => {
  return {
    type: "DELETE_SUB_TASK",
    payload: { sub_task_title, sub_task_id, title, id, key },
  };
};

export const updateTask = ({
  id,
  key,
  updated_task,
}: {
  id: number;
  key?: number;
  updated_task: any;
}): UpdateTaskAction => {
  return {
    type: "UPDATE_TASK",
    payload: { id, key, updated_task },
  };
};

export const deleteTask = ({
  id,
  title,
  key,
}: { id: number; title: string; key?: number }): DeleteTaskAction => {
  return {
    type: "DELETE_TASK",
    payload: { title, id, key },
  };
};

export const updateTasksColumn = ({
  updated_task,
  key,
}: { updated_task: Task[]; key?: number }): UpdateColoumnTask => ({
  type: "UPDATE_COLUMN_TASK",
  payload: { updated_task, key },
});

export const updateSubTasksColumn = ({
  updated_sub_task,
  key,
  id,
}: {
  updated_sub_task: SubTask[];
  id: number;
  key?: number;
}): UpdateColoumnSubTask => ({
  type: "UPDATE_COLUMN_SUBTASK",
  payload: { updated_sub_task, id, key },
});

export const setTasks = (todos: Task[]): SetTasksAction => ({
  type: "SET_TASKS",
  payload: todos,
});
