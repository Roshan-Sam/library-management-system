import { useState, useEffect } from "react";
import UserNav from "../components/user/UserNav";
import axios from "axios";
import { IoNotificationsOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { useUserNotificationContext } from "../hooks/useUserNotificationContext";
import UserFooter from "./UserFooter";
import Cookies from "js-cookie";

const UserNotifications = () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [notifications, setNotifications] = useState([]);
  const { dispatch } = useUserNotificationContext();

  const fetchUserNotifications = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}get-user-notifications/${
          currentUser.id
        }/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.id) {
      fetchUserNotifications();
    }
  }, [currentUser.id]);

  const getNotificationPeriod = (notification) => {
    const createdAt = new Date(notification.created_at);
    const currentTime = new Date();
    const diff = Math.abs(currentTime - createdAt);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const res = await axios.patch(
        `${
          import.meta.env.VITE_API_URL
        }mark-user-notification-as-read/${notificationId}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, is_read: true }
              : notification
          )
        );
        const updatedNotifications = notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        );
        const unreadNotifications = updatedNotifications.filter(
          (notification) => !notification.is_read
        );
        dispatch({
          type: "UPDATE_USER_NOTIFICATION_COUNT",
          payload: unreadNotifications.length,
        });
        dispatch({
          type: "UPDATE_USER_NOTIFICATIONS",
          payload: unreadNotifications,
        });
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <>
      <UserNav />
      <div className="w-full bg-white min-h-screen py-10">
        <h1 className="text-center text-2xl font-bold mb-8">Notifications</h1>
        {notifications.length > 0 ? (
          <div className="max-w-7xl mx-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-center px-4 py-6 mb-2 cursor-pointer border border-gray-200 rounded-lg ${
                  notification.is_read ? "bg-white" : "bg-blue-100"
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <IoNotificationsOutline className="text-xl text-gray-600 mr-4" />
                <div className="flex-grow">
                  <div className="text-gray-800 text-base">
                    {notification.message}
                  </div>
                </div>
                <div className="text-sm text-gray-500 sm:flex gap-4 justify-between ml-4">
                  <Link to="/borrowed-books" className="text-sm text-teal-500">
                    Rental
                  </Link>
                  <div className="w-12 flex justify-center">
                    {getNotificationPeriod(notification)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-lg font-semibold text-gray-600 text-center mt-10">
            No notifications yet!
          </p>
        )}
      </div>
      <UserFooter />
    </>
  );
};

export default UserNotifications;
