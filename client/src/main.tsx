import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { NakamaProvider } from "@/context/NakamaContext";
import { App } from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <NakamaProvider>
      <App />
      <Toaster theme="dark" position="top-right" />
    </NakamaProvider>
  </BrowserRouter>
);
