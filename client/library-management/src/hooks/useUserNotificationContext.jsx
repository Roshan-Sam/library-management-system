import { useContext } from "react";
import { UserNotificationContext } from "../context/userNotificationContext";

export const useUserNotificationContext = () => {
  const context = useContext(UserNotificationContext);

  if (!context) {
    throw new Error(
      "useUserNotificationContext must be used within the UserNotificationContextProvider"
    );
  }

  return context;
};
