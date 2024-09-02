import { useState, useEffect } from "react";
import { useNotificationContext } from "../../hooks/useNotificationContext";
import axios from "axios";
import { TiUserAdd } from "react-icons/ti";
import { LiaHourglassEndSolid } from "react-icons/lia";
import { FaCheck } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { Badge, Button } from "flowbite-react";
import { MdDeleteForever } from "react-icons/md";
import Cookies from "js-cookie";

const AdminNotifications = () => {
  const { dispatch } = useNotificationContext();
  const { notificationCount, unreadNotifications } = useNotificationContext();
  const [notifications, setNotifications] = useState([]);

  const fetchAdminNotifications = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}admin-notifications/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        setNotifications(res.data.notifications);
        const unreadNotifications = res.data.notifications.filter(
          (notification) => !notification.is_read
        );
        dispatch({
          type: "UPDATE_NOTIFICATION_COUNT",
          payload: unreadNotifications.length,
        });
        dispatch({
          type: "UPDATE_NOTIFICATIONS",
          payload: unreadNotifications,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchAdminNotifications();
  }, []);

  const handleApprove = async (notificationId) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}approve-user/${notificationId}/`,
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
              ? {
                  ...notification,
                  is_read: true,
                  reader_details: {
                    ...notification.reader_details,
                    is_active: true,
                  },
                }
              : notification
          )
        );
        const notification = notifications.find(
          (notification) => notification.id === notificationId
        );
        if (notification && !notification.is_read) {
          dispatch({
            type: "UPDATE_NOTIFICATION_COUNT",
            payload: notificationCount - 1,
          });
        }
        dispatch({
          type: "UPDATE_NOTIFICATIONS",
          payload: unreadNotifications.filter(
            (notification) => notification.id !== notificationId
          ),
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleNotificationClick = async (notificationId) => {
    const clickedNotification = notifications.find(
      (notification) => notification.id === notificationId
    );
    if (clickedNotification && !clickedNotification.is_read) {
      try {
        const res = await axios.put(
          `${
            import.meta.env.VITE_API_URL
          }mark-notification-as-read/${notificationId}/`,
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
          dispatch({
            type: "UPDATE_NOTIFICATION_COUNT",
            payload: notificationCount - 1,
          });
          dispatch({
            type: "UPDATE_NOTIFICATIONS",
            payload: unreadNotifications.filter(
              (notification) => notification.id !== notificationId
            ),
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleDecline = async (notificationId) => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}decline-user/${notificationId}/`,
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
              ? {
                  ...notification,
                  is_read: true,
                  reader_details: null,
                }
              : notification
          )
        );
        const notification = notifications.find(
          (notification) => notification.id === notificationId
        );
        if (notification && !notification.is_read) {
          dispatch({
            type: "UPDATE_NOTIFICATION_COUNT",
            payload: notificationCount - 1,
          });
        }
        dispatch({
          type: "UPDATE_NOTIFICATIONS",
          payload: unreadNotifications.filter(
            (notification) => notification.id !== notificationId
          ),
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}delete-notification/${notificationId}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        setNotifications((prevNotifications) =>
          prevNotifications.filter(
            (notification) => notification.id !== notificationId
          )
        );
        const deletedNotification = notifications.find(
          (notification) => notification.id === notificationId
        );
        if (deletedNotification && !deletedNotification.is_read) {
          dispatch({
            type: "UPDATE_NOTIFICATION_COUNT",
            payload: notificationCount - 1,
          });
        }
        dispatch({
          type: "UPDATE_NOTIFICATIONS",
          payload: unreadNotifications.filter(
            (notification) => notification.id !== notificationId
          ),
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

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

  return (
    <div className="w-full p-4">
      <h1 className="font-semibold text-2xl mt-10">Notifications</h1>
      {notifications.length > 0 ? (
        <div className="w-full flex flex-col gap-2 py-4 px-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-2 ${
                notification.is_read
                  ? "bg-white hover:bg-slate-100"
                  : "bg-sky-100 hover:bg-sky-200"
              } flex flex-wrap justify-center items-center rounded-md border border-gray-100 cursor-pointer gap-4`}
            >
              <div className="flex flex-grow items-center flex-wrap justify-center md:gap-6 gap-4">
                {notification.type === "approval" ? (
                  <div className="p-2 rounded-full bg-green-300">
                    <TiUserAdd className="text-slate-950 text-2xl rounded-full" />
                  </div>
                ) : (
                  <div className="p-2 rounded-full bg-red-300">
                    <LiaHourglassEndSolid className="text-slate-950 text-2xl rounded-full" />
                  </div>
                )}
                <div
                  className="flex-grow lg:text-start text-center"
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <span className="">{notification.message}</span>
                  {notification.type === "approval" && (
                    <>
                      <p className="">
                        Username:{" "}
                        <Badge className="inline-flex">
                          {notification.reader_details
                            ? notification.reader_details.username
                            : "user deleted"}
                        </Badge>
                        , Email:{" "}
                        <Badge className="inline-flex">
                          {notification.reader_details
                            ? notification.reader_details.email
                            : "user deleted"}
                        </Badge>
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center flex-wrap justify-center md:gap-0 gap-2">
                {notification.type === "approval" && (
                  <div className="flex mr-4 flex-wrap gap-2 justify-center">
                    {notification.reader_details ? (
                      notification.reader_details.is_active ? (
                        <Button
                          className="flex items-center"
                          color="blue"
                          pill
                          disabled
                        >
                          <FaCheck className="text-white mr-2 h-5 w-5" />
                          Approve
                        </Button>
                      ) : (
                        <Button
                          className="flex items-center"
                          color="blue"
                          pill
                          onClick={() => handleApprove(notification.id)}
                        >
                          <FaCheck className="text-white mr-2 h-5 w-5" />
                          Approve
                        </Button>
                      )
                    ) : (
                      <Button
                        className="flex items-center"
                        color="blue"
                        pill
                        disabled
                      >
                        <FaCheck className="text-white mr-2 h-5 w-5" />
                        Approve
                      </Button>
                    )}
                    {notification.reader_details ? (
                      <Button
                        className="flex items-center"
                        color="failure"
                        pill
                        onClick={() => handleDecline(notification.id)}
                      >
                        <RxCross2 className="text-white mr-2 h-5 w-5" />
                        Decline
                      </Button>
                    ) : (
                      <Button
                        className="flex items-center"
                        color="failure"
                        pill
                        disabled
                      >
                        <RxCross2 className="text-white mr-2 h-5 w-5" />
                        Decline
                      </Button>
                    )}
                  </div>
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="text-red-600 mr-2 text-2xl hover:text-red-500"
                >
                  <MdDeleteForever />
                </button>
                <span className="text-sm text-gray-400 w-6 text-end">
                  {getNotificationPeriod(notification)}
                </span>
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
  );
};

export default AdminNotifications;
