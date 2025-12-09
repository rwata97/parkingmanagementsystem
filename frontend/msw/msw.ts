import { setupWorker, SetupWorker } from "msw/browser";
import handlers from "./handlers";

export let mockServiceWorker: SetupWorker | null = null;

export const startMsw = () => {
  if (!mockServiceWorker) {
    mockServiceWorker = setupWorker(...handlers);
    if (mockServiceWorker) {
      mockServiceWorker.start({
        onUnhandledRequest: "error",
        serviceWorker: {
          url: "/mockServiceWorker.js",
        },
      });
    }
  }
};
