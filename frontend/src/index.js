import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// 渲染 React 应用到 DOM 中的根节点
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
