import { http, HttpResponse } from "msw";

import { intSchema, paginatedQuerySchema } from "~/types";

import { NotesMockApi } from "./mockApi";

const notesHandlers = [
  http.get("/notes/list", async ({ request }) => {
    const searchParams = new URL(request.url).searchParams;
    const parsedSearchParams = Object.fromEntries(searchParams.entries());

    const result = paginatedQuerySchema.safeParse(parsedSearchParams);

    if (!result.success) {
      return HttpResponse.json(
        { error: result.error.message },
        { status: 400 },
      );
    }

    const response = await NotesMockApi.getPaginated(result.data);

    return HttpResponse.json(response);
  }),
  http.get("/notes/:id", async ({ params }) => {
    const { id } = params;

    const result = intSchema.safeParse(id);

    if (!result.success) {
      return HttpResponse.json(
        { error: result.error.message },
        { status: 400 },
      );
    }

    const response = await NotesMockApi.getById(result.data);

    if (!response) return HttpResponse.json(response, { status: 404 });

    return HttpResponse.json(response);
  }),
  http.post("/notes", async () => {
    const response = await NotesMockApi.create();
    return HttpResponse.json(response);
  }),
];

export const handlers = [...notesHandlers];
