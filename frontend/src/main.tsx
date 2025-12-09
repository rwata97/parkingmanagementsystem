// src/main.tsx or src/index.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

async function enableMocking() {
  if (import.meta.env.MODE === "development") {
    const { startMsw } = await import("../msw/msw");
    await startMsw();
  }
}

const root = createRoot(document.getElementById("root")!);

enableMocking().finally(() => {
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  );
});
