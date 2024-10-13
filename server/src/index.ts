import { serve } from "@hono/node-server";

import app from "./app";

const port = 3000;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server is running on port ${info.port}`);
  },
);
