import { Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserHome from "./pages/UserHome";
import UserBooks from "./pages/UserBooks";
import UserBookPreview from "./pages/UserBookPreview";
import UserBorrowedBooks from "./pages/UserBorrowedBooks";
import UserReturnedBooks from "./pages/UserReturnedBooks";
import UserNotifications from "./pages/UserNotifications";
import UserLostBooks from "./pages/UserLostBooks";
import UserCart from "./pages/UserCart";
import UserProfile from "./pages/UserProfile";
import UserBooksPurchases from "./pages/UserBooksPurchases";
import About from "./pages/About";
import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-dash" element={<AdminDashboard />} />
        <Route path="/home" element={<UserHome />} />
        <Route path="/books" element={<UserBooks />} />
        <Route path="/book-preview/:id" element={<UserBookPreview />} />
        <Route path="/borrowed-books" element={<UserBorrowedBooks />} />
        <Route path="/books-returned" element={<UserReturnedBooks />} />
        <Route path="/notifications" element={<UserNotifications />} />
        <Route path="/books-lost" element={<UserLostBooks />} />
        <Route path="/books-purchases" element={<UserBooksPurchases />} />
        <Route path="/cart" element={<UserCart />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
}

export default App;
