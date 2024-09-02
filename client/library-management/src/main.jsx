import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { NotificationContextProvider } from "./context/notificationContext.jsx";
import { UserNotificationContextProvider } from "./context/userNotificationContext.jsx";
import { CartCountContextProvider } from "./context/cartCountContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <NotificationContextProvider>
    <UserNotificationContextProvider>
      <CartCountContextProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CartCountContextProvider>
    </UserNotificationContextProvider>
  </NotificationContextProvider>
);
