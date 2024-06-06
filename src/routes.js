import { randomUUID } from "node:crypto";
import Database from "./database.js";
import buildRoutePath from "./utils/build-route-path.js";

const db = new Database();

const routes = [
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: async (req, res) => {
      const { title, description } = req.body;

      if (!title || !description)
        return res.writeHead(400).end(
          JSON.stringify({
            error: "Title and description are required.",
          })
        );

      const created_at = new Date().toISOString();
      const updated_at = new Date().toISOString();

      const task = {
        id: randomUUID(),
        title,
        description,
        created_at,
        updated_at,
      };
      await db.insert("tasks", task);
      return res.writeHead(201).end();
    },
  },
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;
      const filter = search
        ? { title: search, description: search }
        : undefined;
      const tasks = db.select("tasks", filter);
      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: async (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      const task = db.getById("tasks", id);
      if (!task)
        return res.writeHead(404).end(
          JSON.stringify({
            error: "Task not found.",
          })
        );

      if (!title && !description)
        return res.writeHead(400).end(
          JSON.stringify({
            error: "Title or description are required.",
          })
        );

      task.title = title ?? task.title;
      task.description = description ?? task.description;
      task.updated_at = new Date().toISOString();

      await db.update("tasks", { ...task });
      return res.writeHead(204).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: async (req, res) => {
      const { id } = req.params;

      const task = db.getById("tasks", id);
      if (!task)
        return res.writeHead(404).end(
          JSON.stringify({
            error: "Task not found.",
          })
        );

      await db.delete("tasks", id);
      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: async (req, res) => {
      const { id } = req.params;

      const task = db.getById("tasks", id);
      if (!task)
        return res.writeHead(404).end(
          JSON.stringify({
            error: "Task not found.",
          })
        );

      task.completed_at = task.completed_at ? null : new Date().toISOString();

      await db.update("tasks", { ...task });
      return res.writeHead(204).end();
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks/upload"),
    handler: async (req, res) => {
      if (!Array.isArray(req.body) || req.body.length === 0)
        return res.writeHead(400).end();

      // Valida se todos os objetos possuem title e description
      const hasInvalidTask = req.body.some(
        (task) => !task.title || !task.description
      );

      if (hasInvalidTask)
        return res.writeHead(400).end(
          JSON.stringify({
            error: "Title and description are required.",
          })
        );

      const created_at = new Date().toISOString();
      const updated_at = new Date().toISOString();

      req.body.forEach(async (taskToInsert) => {
        const task = {
          id: randomUUID(),
          created_at,
          updated_at,
          ...taskToInsert,
        };
        await db.insert("tasks", task);
      });

      return res.writeHead(204).end();
    },
  },
];

export default routes;
