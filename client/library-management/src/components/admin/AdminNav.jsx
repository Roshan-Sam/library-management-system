import axios from "axios";
import { useState, useEffect } from "react";
import { Avatar, Dropdown, Navbar, Sidebar, Drawer } from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { RiNotificationBadgeFill } from "react-icons/ri";
import { RiLogoutCircleLine } from "react-icons/ri";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoNotifications } from "react-icons/io5";
import { Badge } from "antd";
import { useNotificationContext } from "../../hooks/useNotificationContext";
import Cookies from "js-cookie";
import { BiSolidBookAdd } from "react-icons/bi";
import { ImBooks } from "react-icons/im";
import { FaUsers } from "react-icons/fa";
import { BiSolidPurchaseTag } from "react-icons/bi";
import { TbBooksOff } from "react-icons/tb";
import { BiBookBookmark, BiBookOpen } from "react-icons/bi";

const AdminNav = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const { dispatch } = useNotificationContext();
  const { notificationCount, unreadNotifications } = useNotificationContext();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) setTab(tabFromUrl);
  }, [location.search]);

  const handleClose = () => setIsOpen(false);

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

  const handleSignOut = () => {
    Cookies.remove("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div>
      <Navbar fluid className="border-b-2 px-4">
        <Navbar.Brand>
          <div className="flex items-center">
            <GiHamburgerMenu
              className="mr-4 cursor-pointer block sm:hidden text-lg text-gray-500"
              onClick={() => setIsOpen(true)}
            />
            <span className="whitespace-nowrap text-lg font-bold dark:text-white">
              BookPath
            </span>
          </div>
        </Navbar.Brand>
        <div className="flex md:order-2 items-center gap-3">
          <Badge
            count={notificationCount}
            size="small"
            className="cursor-pointer"
            showZero
            color="geekblue"
          >
            <IoNotifications
              className="text-gray-700 text-xl"
              onClick={() => navigate("/admin-dash?tab=notifications")}
            />
          </Badge>
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="user"
                img={`${import.meta.env.VITE_API_IMAGE_URL}${
                  currentUser.profile
                }`}
                rounded
                className="w-10 h-10 object-cover rounded-full"
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
                to={"/admin-dash?tab=dash"}
                className={`${tab === "dash" ? "text-teal-500" : ""}`}
              >
                Dashboard
              </Link>
            </Dropdown.Item>
            <Dropdown.Item>
              <Link
                to={"/admin-dash?tab=profile"}
                className={`${tab === "profile" ? "text-teal-500" : ""}`}
              >
                Profile
              </Link>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleSignOut}>Sign out</Dropdown.Item>
          </Dropdown>
        </div>
      </Navbar>
      <Drawer open={isOpen} onClose={handleClose} className="w-fit">
        <Drawer.Header
          title={
            <>
              <span className="text-lg">Menu</span>
            </>
          }
          titleIcon={() => <></>}
        />
        <Drawer.Items>
          <Sidebar
            aria-label=""
            className="[&>div]:bg-transparent [&>div]:p-0 w-60"
          >
            <div className="flex h-full flex-col justify-between py-2">
              <div>
                <Sidebar.Items>
                  <Sidebar.ItemGroup className="flex flex-col gap-2 font-medium">
                    <Link
                      to={"/admin-dash?tab=dash"}
                      className={`flex items-center p-2 rounded-lg group ${
                        tab === "dash"
                          ? "bg-slate-900 text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <MdDashboard
                        className={`w-5 h-5 text-gray-500 transition duration-75 ${
                          tab === "dash"
                            ? "group-hover:text-white text-white"
                            : "group-hover:text-gray-900"
                        }`}
                      />
                      <span
                        className={`ms-3 transition duration-75 ${
                          tab === "dash"
                            ? "group-hover:text-white"
                            : "group-hover:text-gray-900"
                        }`}
                      >
                        Dashboard
                      </span>
                    </Link>
                    <Link
                      to={"/admin-dash?tab=notifications"}
                      className={`flex items-center p-2 rounded-lg group ${
                        tab === "notifications"
                          ? "bg-slate-900 text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <RiNotificationBadgeFill
                        className={`w-5 h-5 text-gray-500 transition duration-75 ${
                          tab === "notifications"
                            ? "group-hover:text-white text-white"
                            : "group-hover:text-gray-900"
                        }`}
                      />
                      <span
                        className={`ms-3 transition duration-75 ${
                          tab === "notifications"
                            ? "group-hover:text-white"
                            : "group-hover:text-gray-900"
                        }`}
                      >
                        Notifications
                      </span>
                    </Link>
                    <Link
                      to={"/admin-dash?tab=addbook"}
                      className={`flex items-center p-2 rounded-lg group ${
                        tab === "addbook"
                          ? "bg-slate-900 text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <BiSolidBookAdd
                        className={`w-5 h-5 text-gray-500 transition duration-75 ${
                          tab === "addbook"
                            ? "group-hover:text-white text-white"
                            : "group-hover:text-gray-900"
                        }`}
                      />
                      <span
                        className={`ms-3 transition duration-75 ${
                          tab === "addbook"
                            ? "group-hover:text-white"
                            : "group-hover:text-gray-900"
                        }`}
                      >
                        Add book
                      </span>
                    </Link>
                    <Link
                      to={"/admin-dash?tab=books"}
                      className={`flex items-center p-2 rounded-lg group ${
                        tab === "books"
                          ? "bg-slate-900 text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <ImBooks
                        className={`w-5 h-5 text-gray-500 transition duration-75 ${
                          tab === "books"
                            ? "group-hover:text-white text-white"
                            : "group-hover:text-gray-900"
                        }`}
                      />
                      <span
                        className={`ms-3 transition duration-75 ${
                          tab === "books"
                            ? "group-hover:text-white"
                            : "group-hover:text-gray-900"
                        }`}
                      >
                        Library
                      </span>
                    </Link>
                    <Link
                      to={"/admin-dash?tab=users"}
                      className={`flex items-center p-2 rounded-lg group ${
                        tab === "users"
                          ? "bg-slate-900 text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <FaUsers
                        className={`w-5 h-5 text-gray-500 transition duration-75 ${
                          tab === "users"
                            ? "group-hover:text-white text-white"
                            : "group-hover:text-gray-900"
                        }`}
                      />
                      <span
                        className={`ms-3 transition duration-75 ${
                          tab === "users"
                            ? "group-hover:text-white"
                            : "group-hover:text-gray-900"
                        }`}
                      >
                        Users
                      </span>
                    </Link>
                    <Link
                      to={"/admin-dash?tab=orders"}
                      className={`flex items-center p-2 rounded-lg group ${
                        tab === "orders"
                          ? "bg-slate-900 text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <BiSolidPurchaseTag
                        className={`w-5 h-5 text-gray-500 transition duration-75 ${
                          tab === "orders"
                            ? "group-hover:text-white text-white"
                            : "group-hover:text-gray-900"
                        }`}
                      />
                      <span
                        className={`ms-3 transition duration-75 ${
                          tab === "orders"
                            ? "group-hover:text-white"
                            : "group-hover:text-gray-900"
                        }`}
                      >
                        Orders
                      </span>
                    </Link>
                    <Link
                      to={"/admin-dash?tab=rentals"}
                      className={`flex items-center p-2 rounded-lg group ${
                        tab === "rentals"
                          ? "bg-slate-900 text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <TbBooksOff
                        className={`w-5 h-5 text-gray-500 transition duration-75 ${
                          tab === "rentals"
                            ? "group-hover:text-white text-white"
                            : "group-hover:text-gray-900"
                        }`}
                      />
                      <span
                        className={`ms-3 transition duration-75 ${
                          tab === "rentals"
                            ? "group-hover:text-white"
                            : "group-hover:text-gray-900"
                        }`}
                      >
                        Rentals
                      </span>
                    </Link>
                    <Link
                      to={"/admin-dash?tab=books-returned"}
                      className={`flex items-center p-2 rounded-lg group ${
                        tab === "books-returned"
                          ? "bg-slate-900 text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <BiBookBookmark
                        className={`w-5 h-5 text-gray-500 transition duration-75 ${
                          tab === "books-returned"
                            ? "group-hover:text-white text-white"
                            : "group-hover:text-gray-900"
                        }`}
                      />
                      <span
                        className={`ms-3 transition duration-75 ${
                          tab === "books-returned"
                            ? "group-hover:text-white"
                            : "group-hover:text-gray-900"
                        }`}
                      >
                        Books Returned
                      </span>
                    </Link>
                    <Link
                      to={"/admin-dash?tab=books-lost"}
                      className={`flex items-center p-2 rounded-lg group ${
                        tab === "books-lost"
                          ? "bg-slate-900 text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <BiBookOpen
                        className={`w-5 h-5 text-gray-500 transition duration-75 ${
                          tab === "books-lost"
                            ? "group-hover:text-white text-white"
                            : "group-hover:text-gray-900"
                        }`}
                      />
                      <span
                        className={`ms-3 transition duration-75 ${
                          tab === "books-lost"
                            ? "group-hover:text-white"
                            : "group-hover:text-gray-900"
                        }`}
                      >
                        Books Lost
                      </span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className={`flex items-center p-2 rounded-lg group text-gray-500 hover:bg-gray-100`}
                    >
                      <RiLogoutCircleLine className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                      <span className="ms-3 group-hover:text-gray-900 transition duration-75">
                        Sign out
                      </span>
                    </button>
                  </Sidebar.ItemGroup>
                </Sidebar.Items>
              </div>
            </div>
          </Sidebar>
        </Drawer.Items>
      </Drawer>
    </div>
  );
};

export default AdminNav;
