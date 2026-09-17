/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";
import { handleApiRequest } from "./src/server/api-handler";

function mysqlApiPlugin(): Plugin {
  return {
    name: "mysql-api-middleware",

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith("/api/")) {
          try {
            let body = null;

            if (
              req.method === "POST" ||
              req.method === "PUT" ||
              req.method === "PATCH"
            ) {
              const buffers: any[] = [];

              for await (const chunk of req) {
                buffers.push(chunk);
              }

              const raw = Buffer.concat(buffers).toString("utf-8");

              if (raw) {
                try {
                  body = JSON.parse(raw);
                } catch {
                  body = raw;
                }
              }
            }

            const result = await handleApiRequest(
              req.method || "GET",
              req.url,
              body,
            );

            res.statusCode = result.status;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result.data));

            return;
          } catch (err: any) {
            console.error("Vite API Middleware Error:", err);

            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: err.message }));

            return;
          }
        }

        next();
      });
    },
  };
}


export default defineConfig({
  nitro: {
    preset: "node-server",
  },

  vite: {
    plugins: [mysqlApiPlugin()],
  },

  tanstackStart: {
    server: {
      entry: "server",
    },
  },
});