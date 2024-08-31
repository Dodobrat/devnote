import { http, HttpResponse } from "msw";

import { paginatedQuerySchema, positiveIntSchema } from "~/types";

import { NotesMockApi } from "./mockApi";

const notesHandlers = [
  http.get("/notes/list/pinned", async ({ request }) => {
    const searchParams = new URL(request.url).searchParams;
    const parsedSearchParams = Object.fromEntries(searchParams.entries());

    const result = paginatedQuerySchema.safeParse(parsedSearchParams);

    if (!result.success) {
      return HttpResponse.json({ error: result.error });
    }

    const response = await NotesMockApi.getPinnedPaginated(result.data);

    return HttpResponse.json(response);
  }),
  http.get("/notes/list", async ({ request }) => {
    const searchParams = new URL(request.url).searchParams;
    const parsedSearchParams = Object.fromEntries(searchParams.entries());

    const result = paginatedQuerySchema.safeParse(parsedSearchParams);

    if (!result.success) {
      return HttpResponse.json({ error: result.error });
    }

    const response = await NotesMockApi.getOthersPaginated(result.data);

    return HttpResponse.json(response);
  }),
  http.get("/notes/:id", async ({ params }) => {
    const { id } = params;

    const result = positiveIntSchema.safeParse(id);

    if (!result.success) {
      return HttpResponse.json({ error: result.error });
    }

    const response = await NotesMockApi.getById(result.data);

    return HttpResponse.json(response);
  }),
  http.post("/notes", async () => {
    const response = await NotesMockApi.create();
    return HttpResponse.json(response);
  }),
  http.delete("/notes/:id", ({ params }) => {
    console.log(`Captured a "DELETE /posts/${params.id}" request`);
  }),
];

export const handlers = [...notesHandlers];
