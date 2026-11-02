import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "../../src/theme";
import { ToastProvider } from "../../src/toast";
import App from "./App";
import "./demo.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find root element");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system">
      <ToastProvider>
        <App />
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
