import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AdminNav from "../components/admin/AdminNav";
import AdminDash from "../components/admin/AdminDash";
import AdminSideBar from "../components/admin/AdminSideBar";
import AdminNotifications from "../components/admin/AdminNotifications";
import AdminAddBooks from "../components/admin/AdminAddBooks";
import AdminBooks from "../components/admin/AdminBooks";
import AdminEditBook from "../components/admin/AdminEditBook";
import AdminUsers from "../components/admin/AdminUsers";
import UserRentals from "../components/admin/UserRentals";
import UserBooksReturns from "../components/admin/UserBooksReturns";
import UserLostBooks from "../components/admin/UserLostBooks";
import UserPurchases from "../components/admin/UserPurchases";
import AdminOrders from "../components/admin/AdminOrders";
import AdminProfile from "../components/admin/AdminProfile";
import AdminRentals from "../components/admin/AdminRentals";
import AdminLostBooks from "../components/admin/AdminLostBooks";
import AdminReturnedBooks from "../components/admin/AdminReturnedBooks";

const AdminDashboard = () => {
  const location = useLocation();
  const [tab, setTab] = useState();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) setTab(tabFromUrl);
  }, [location.search]);
  return (
    <>
      <AdminNav />
      <div className="flex min-h-screen">
        <div className="md:64">
          <AdminSideBar />
        </div>
        {tab === "dash" && <AdminDash />}

        {tab === "notifications" && <AdminNotifications />}

        {tab === "addbook" && <AdminAddBooks />}

        {tab === "books" && <AdminBooks />}

        {tab === "editbook" && <AdminEditBook />}

        {tab === "users" && <AdminUsers />}

        {tab === "user-rentals" && <UserRentals />}

        {tab === "user-books-returns" && <UserBooksReturns />}

        {tab === "user-books-lost" && <UserLostBooks />}

        {tab === "user-purchases" && <UserPurchases />}

        {tab === "orders" && <AdminOrders />}

        {tab === "profile" && <AdminProfile />}

        {tab === "rentals" && <AdminRentals />}

        {tab === "books-lost" && <AdminLostBooks />}

        {tab === "books-returned" && <AdminReturnedBooks />}
      </div>
    </>
  );
};

export default AdminDashboard;
