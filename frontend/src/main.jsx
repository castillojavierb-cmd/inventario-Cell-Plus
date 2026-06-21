import App from "./App";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "#065ed8",
          color: "#fff",
          boxShadow: "0 10px 25px rgba(255, 251, 251, 0.3)"
        },
      }}
    />
    <App />
  </BrowserRouter>
);