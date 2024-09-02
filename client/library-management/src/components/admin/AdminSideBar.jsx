import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { RiNotificationBadgeFill } from "react-icons/ri";
import { RiLogoutCircleLine } from "react-icons/ri";
import { BiSolidBookAdd } from "react-icons/bi";
import { ImBooks } from "react-icons/im";
import Cookies from "js-cookie";
import { FaUsers } from "react-icons/fa";
import { BiSolidPurchaseTag } from "react-icons/bi";
import { TbBooksOff } from "react-icons/tb";
import { BiBookBookmark, BiBookOpen } from "react-icons/bi";

const AdminSideBar = () => {
  const [tab, setTab] = useState();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) setTab(tabFromUrl);
  }, [location.search]);

  const handleSignOut = () => {
    Cookies.remove("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  return (
    <div className="w-64 border-r-2 hidden sm:block transition-transform -translate-x-full sm:translate-x-0 h-full">
      <aside
        id="default-sidebar"
        className="w-64 transition-transform -translate-x-full sm:translate-x-0"
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto dark:bg-gray-800">
          <ul className="space-y-2 font-medium flex flex-col gap-2">
            <li>
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
            </li>
            <li>
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
            </li>
            <li>
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
            </li>
            <li>
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
            </li>
            <li>
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
            </li>
            <li>
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
            </li>
            <li>
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
            </li>
            <li>
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
            </li>
            <li>
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
            </li>
            <li>
              <button
                onClick={handleSignOut}
                className={`w-full flex items-center p-2 rounded-lg group text-gray-500 hover:bg-gray-100`}
              >
                <RiLogoutCircleLine className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                <span className="ms-3 group-hover:text-gray-900 transition duration-75">
                  Sign out
                </span>
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default AdminSideBar;
