import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig({
  server: { host: true, port: 8080 },
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart({
      // Use src/server.ts (our SSR error wrapper) as the server entry.
      server: { entry: "server" },
    }),
    // Picks the right deployment target automatically (Vercel, Netlify, Node, ...).
    nitro(),
    viteReact(),
  ],
});
