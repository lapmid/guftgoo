import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./app/reportWebVitals";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ErrorPage from "./app/ErrorPage";
import Home from "./app/chat/Home";
import { ChatPage } from "./app/chat/ChatPage";
import "./app/index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/chat/:room",
    element: <ChatPage />,
    errorElement: <ErrorPage />,
  },
]);

root.render(
  // <React.StrictMode>
  <RouterProvider router={router} />
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
