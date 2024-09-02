import { createContext, useEffect, useReducer } from "react";

export const NotificationContext = createContext();

export const notificationReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_NOTIFICATION_COUNT":
      return {
        ...state,
        notificationCount: action.payload,
      };
    case "UPDATE_NOTIFICATIONS":
      return {
        ...state,
        unreadNotifications: action.payload,
      };
    default:
      return state;
  }
};

export const NotificationContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, {
    notificationCount:
      JSON.parse(localStorage.getItem("notificationCount")) || 0,
    unreadNotifications:
      JSON.parse(localStorage.getItem("unreadNotifications")) || [],
  });

  useEffect(() => {
    localStorage.setItem(
      "notificationCount",
      JSON.stringify(state.notificationCount)
    );
    localStorage.setItem(
      "unreadNotifications",
      JSON.stringify(state.unreadNotifications)
    );
  }, [state.notificationCount, state.unreadNotifications]);

  //   console.log("NotificationContext state", state);

  return (
    <NotificationContext.Provider value={{ ...state, dispatch }}>
      {children}
    </NotificationContext.Provider>
  );
};
