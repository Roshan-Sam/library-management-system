import { createContext, useEffect, useReducer } from "react";

export const UserNotificationContext = createContext();

export const userNotificationReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_USER_NOTIFICATION_COUNT":
      return {
        ...state,
        notificationCount: action.payload,
      };
    case "UPDATE_USER_NOTIFICATIONS":
      return {
        ...state,
        unreadNotifications: action.payload,
      };
    default:
      return state;
  }
};

export const UserNotificationContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userNotificationReducer, {
    notificationCount:
      JSON.parse(localStorage.getItem("UserNotificationCount")) || 0,
    unreadNotifications:
      JSON.parse(localStorage.getItem("UserUnreadNotifications")) || [],
  });

  useEffect(() => {
    localStorage.setItem(
      "UserNotificationCount",
      JSON.stringify(state.notificationCount)
    );
    localStorage.setItem(
      "UserUnreadNotifications",
      JSON.stringify(state.unreadNotifications)
    );
  }, [state.notificationCount, state.unreadNotifications]);

  return (
    <UserNotificationContext.Provider value={{ ...state, dispatch }}>
      {children}
    </UserNotificationContext.Provider>
  );
};
