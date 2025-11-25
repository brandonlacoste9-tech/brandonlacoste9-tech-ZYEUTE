import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root #root missing");

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
