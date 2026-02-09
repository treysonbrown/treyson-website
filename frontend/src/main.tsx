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
