// #region agent log — environment diagnostics (runs before JSX to diagnose _jsxDEV error)
console.log("[main.tsx] mode:", import.meta.env.MODE, "| dev:", import.meta.env.DEV, "| prod:", import.meta.env.PROD, "| base:", import.meta.env.BASE_URL);
// #endregion

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ClerkConvexProvider } from "@/providers/ClerkConvexProvider";

createRoot(document.getElementById("root")!).render(
  <ClerkConvexProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </ClerkConvexProvider>,
);
