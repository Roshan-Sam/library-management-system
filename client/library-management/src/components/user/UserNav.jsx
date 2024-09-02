import { Avatar, Popover, Navbar, Dropdown, Drawer } from "flowbite-react";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Hamburger from "hamburger-react";
import axios from "axios";
import { Badge } from "antd";
import { notification } from "antd";
import { useUserNotificationContext } from "../../hooks/useUserNotificationContext";
import { FiShoppingCart } from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";
import { useCartCountContext } from "../../hooks/useCartCountContext";
import { FaHourglassStart } from "react-icons/fa";
import { HiMiniShoppingBag } from "react-icons/hi2";

const UserNav = () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const path = useLocation().pathname;
  const [open, setOpen] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const { dispatch } = useUserNotificationContext();
  const { notificationCount, unreadNotifications } =
    useUserNotificationContext();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { cartCount, dispatch: cartDispatch } = useCartCountContext();

  const handleClose = () => setIsOpen(false);

  const fetchCartCount = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}get-cart/${currentUser.id}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        cartDispatch({
          type: "UPDATE_CART",
          payload: res.data.cart_count,
        });
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}fetch-user-notifications/${
          currentUser.id
        }/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      res.data.forEach((notification) => {
        api.open({
          message: "Notification",
          description: notification.message,
          duration: 0,
        });
      });
      if (res.data.length > 0) {
        markNotificationsAsNotified(res.data.map((notif) => notif.id));
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markNotificationsAsNotified = async (notificationIds) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}mark-notifications-as-notified/`,
        { notification_ids: notificationIds },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        fetchUserNotifications();
      }
    } catch (error) {
      console.error("Error marking notifications as notified:", error);
    }
  };

  const handleSignOut = () => {
    Cookies.remove("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchRentals = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}fetch-user-rentals/${currentUser.id}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      const hasUnnotifiedRentals = res.data.some(
        (rental) => rental.notified === false
      );

      if (hasUnnotifiedRentals) {
        overdueAlert();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const overdueAlert = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}alert-overdue-rentals/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error sending notifications:", error);
    }
  };

  useEffect(() => {
    fetchRentals();
    fetchCartCount();
  }, [currentUser.id]);

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
      if (res.status === 200) {
        const unreadNotifications = res.data.filter(
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
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}get-user-orders/${currentUser.id}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        const ordersPending = res.data.filter(
          (order) => order.status === "pending"
        );
        setPendingOrders(ordersPending);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
  }, [isOpen]);

  useEffect(() => {
    fetchUserNotifications();
  }, [currentUser.id]);

  return (
    <div>
      {contextHolder}
      <Navbar fluid rounded className="border-b border-b-gray-300 px-4">
        <Navbar.Brand>
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            BookPath
          </span>
        </Navbar.Brand>
        <div className="flex md:order-2 items-center gap-2">
          <Popover
            className="-mt-2 border rounded-md md:hidden block bg-white z-50"
            arrow={false}
            open={open}
            onOpenChange={setOpen}
            content={
              <ul className="flex flex-col w-40 text-sm font-semibold transition-colors duration-75">
                <li
                  className={`border-b px-2 py-3 ${
                    path === "/home"
                      ? "text-blue-600 border-b-blue-500 border-b-2"
                      : ""
                  }`}
                >
                  <Link to="/home">Home</Link>
                </li>
                <li
                  className={`border-b px-2 py-3 ${
                    path === "/books"
                      ? "text-blue-600 border-b-blue-500 border-b-2"
                      : ""
                  }`}
                >
                  <Link to="/books">Books</Link>
                </li>
                <li
                  className={`border-b px-2 py-3 ${
                    path === "/about"
                      ? "text-blue-600 border-b-blue-500 border-b-2"
                      : ""
                  }`}
                >
                  <Link to="/about">About</Link>
                </li>
              </ul>
            }
          >
            <a className="cursor-pointer md:hidden block">
              <Hamburger toggled={open} toggle={setOpen} size={20} />
            </a>
          </Popover>
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="User"
                img={`${import.meta.env.VITE_API_IMAGE_URL}${
                  currentUser.profile
                }`}
                rounded
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm">{currentUser.username}</span>
              <span className="block truncate text-sm font-medium">
                {currentUser.email}
              </span>
            </Dropdown.Header>
            <Dropdown.Item>
              <Link
                to="/profile"
                className={`${path === "/profile" ? "text-teal-600" : ""}`}
              >
                Profile
              </Link>
            </Dropdown.Item>
            <Dropdown.Item>
              <Link
                to="/borrowed-books"
                className={`w-full h-full text-start ${
                  path === "/borrowed-books" ? "text-teal-600" : ""
                }`}
              >
                Books Borrowed
              </Link>
            </Dropdown.Item>
            <Dropdown.Item>
              <Link
                to="/books-returned"
                className={`w-full h-full text-start ${
                  path === "/books-returned" ? "text-teal-600" : ""
                }`}
              >
                Books Returned
              </Link>
            </Dropdown.Item>
            <Dropdown.Item>
              <Link
                to="/books-lost"
                className={`w-full h-full text-start ${
                  path === "/books-lost" ? "text-teal-600" : ""
                }`}
              >
                Books Lost
              </Link>
            </Dropdown.Item>
            <Dropdown.Item>
              <Link
                to="/books-purchases"
                className={`w-full h-full text-start ${
                  path === "/books-purchases" ? "text-teal-600" : ""
                }`}
              >
                Books Purchases
              </Link>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleSignOut}>Sign out</Dropdown.Item>
          </Dropdown>
          <div>
            <button
              className="rounded-full focus:outline-none"
              onClick={() => setIsOpen(true)}
            >
              <HiMiniShoppingBag className="text-slate-800 text-xl mt-1" />
            </button>
            <Drawer
              open={isOpen}
              onClose={handleClose}
              position="left"
              className="w-fit min-w-64"
            >
              <Drawer.Header
                title={<h1 className="text-slate-600 ml-2">Orders pending</h1>}
                titleIcon={() => (
                  <>
                    <FaHourglassStart className="text-slate-700" />
                  </>
                )}
              />
              <Drawer.Items>
                <div className="flex flex-col gap-4">
                  {pendingOrders.length === 0 ? (
                    <p className="text-center text-gray-500">
                      No pending orders
                    </p>
                  ) : (
                    pendingOrders.map((order) => (
                      <div
                        key={order.id}
                        class="w-full border border-slate-100 bg-gray-50"
                        aria-modal="true"
                        role="dialog"
                        tabIndex="-1"
                      >
                        {order.order_items.map((item) => (
                          <div className="mt-4" key={item.id}>
                            <ul className="">
                              <li className="flex justify-center items-center text-center flex-col gap-1">
                                <img
                                  src={`${import.meta.env.VITE_API_IMAGE_URL}${
                                    item.book_details.image
                                  }`}
                                  alt={item.book_details.name}
                                  className="size-12 rounded object-cover"
                                />

                                <div>
                                  <h3 className="text-sm font-medium text-gray-900">
                                    {item.book_details.name}
                                  </h3>

                                  <dl className="mt-0.5 space-y-px text-[10px] text-gray-600">
                                    <div>
                                      <dt className="inline text-xs">
                                        Price:{" "}
                                      </dt>
                                      <dd className="inline text-xs">
                                        ₹{item.book_details.price}
                                      </dd>
                                    </div>

                                    <div>
                                      <dt className="inline text-xs">
                                        Quantity:{" "}
                                      </dt>
                                      <dd className="inline text-xs">
                                        {item.quantity}
                                      </dd>
                                    </div>
                                  </dl>
                                </div>
                              </li>
                            </ul>
                          </div>
                        ))}
                        <div class="space-y-4 mt-4 bg-red-100 flex justify-center">
                          <p className="font-sans text-sm w-fit text-red-800 font-medium">
                            Total amount: ₹ {order.total_amount}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div className="flex justify-center">
                    <Link
                      to={"/books"}
                      class="cursor-pointer text-center inline-block text-sm text-gray-500 underline underline-offset-4 transition hover:text-gray-600"
                    >
                      Continue shopping
                    </Link>
                  </div>
                </div>
              </Drawer.Items>
            </Drawer>
          </div>
          <Badge
            count={notificationCount}
            showZero
            size="small"
            color="geekblue"
          >
            <Link to="/notifications">
              <IoNotificationsOutline className="text-xl cursor-pointer text-gray-900" />
            </Link>
          </Badge>
          <Badge count={cartCount} showZero size="small" color="geekblue">
            <Link to="/cart">
              <FiShoppingCart className="text-lg cursor-pointer text-gray-800" />
            </Link>
          </Badge>
        </div>
        <div className="md:block hidden">
          <ul className="flex gap-4 text-sm font-semibold transition-colors duration-75">
            <li
              className={`${path === "/home" ? "text-blue-600 underline" : ""}`}
            >
              <Link to="/home">Home</Link>
            </li>
            <li
              className={`${
                path === "/books" ? "text-blue-600 underline" : ""
              }`}
            >
              <Link to="/books">Books</Link>
            </li>
            <li
              className={`${
                path === "/about" ? "text-blue-600 underline" : ""
              }`}
            >
              <Link to="/about">About</Link>
            </li>
          </ul>
        </div>
      </Navbar>
    </div>
  );
};

export default UserNav;
