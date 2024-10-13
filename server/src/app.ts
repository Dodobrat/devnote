import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { z } from "zod";

const app = new Hono();

app.use("*", logger());

const createNoteSchema = z.object({
  value: z.string(),
  title: z.string(),
  orderId: z.number().int().positive().nullable(),
  parent: z.string(),
});

const notesRoute = new Hono()
  .get("/", (ctx) => {
    return ctx.json({ notes: [] });
  })
  .post("/", zValidator("json", createNoteSchema), async (ctx) => {
    const note = ctx.req.valid("json");
    ctx.status(201);
    return ctx.json({ note });
  })
  .get("/:id{[0-9]+}", (ctx) => {
    const id = parseInt(ctx.req.param("id"));

    if (id > 99) {
      return ctx.notFound();
    }

    return ctx.json({ note: { id } });
  })
  .delete("/:id{[0-9]+}", (ctx) => {
    const id = parseInt(ctx.req.param("id"));

    if (id > 99) {
      return ctx.notFound();
    }

    return ctx.json({ note: { id } });
  });

app.route("/api/notes", notesRoute);

export default app;
