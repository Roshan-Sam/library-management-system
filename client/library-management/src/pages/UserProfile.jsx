import axios from "axios";
import { Button, Tooltip } from "flowbite-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { MdOutlineKeyboardArrowUp } from "react-icons/md";
import UserNav from "../components/user/UserNav";
import UserFooter from "./UserFooter";
import { HiMiniShoppingBag } from "react-icons/hi2";
import { MdPayment } from "react-icons/md";
import { FaBookOpen, FaBookDead } from "react-icons/fa";
import { BiBookBookmark } from "react-icons/bi";

const UserProfile = () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [formData, setFormData] = useState({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    first_name: currentUser?.first_name || "",
    last_name: currentUser?.last_name || "",
    phone: currentUser?.phone || "",
    state: currentUser?.state || "",
    city: currentUser?.city || "",
    street: currentUser?.street || "",
    house_name: currentUser?.house_name || "",
    pincode: currentUser?.pincode || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    oldpassword: "",
    newpassword: "",
  });
  const [emailError, setEmailError] = useState("");
  const filePickerRef = useRef();
  const [success, setSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [totalBooksPurchased, setTotalBooksPurchased] = useState(0);
  const [totalTransactionAmount, setTotalTransactionAmount] = useState(0);
  const [totalUserRentals, setTotalUserRentals] = useState(0);
  const [totalUserRentalReturns, setTotalUserRentalReturns] = useState(0);
  const [totalUserLostBooks, setTotalUserLostBooks] = useState(0);
  const [totalUsers, setTotalUsers] = useState([]);
  const [userExistsError, setUserExistsError] = useState("");
  const [emailExistsError, setEmailExistsError] = useState("");
  const [phoneExistsError, setPhoneExistsError] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
    fetchUserOrders();
    fetchUserRentals();
    fetchUserRentalsReturns();
    fetchUserLostBooks();
    fetchAllUsers();
  }, [currentUser.id]);

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}active-verified-nonstaff-users/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        const filteredUsers = res.data.filter(
          (user) => user.id !== currentUser.id
        );
        setTotalUsers(filteredUsers);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profile: file });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    return emailRegex.test(email);
  };

  const validateEmail = (e) => {
    const email = e.target.value;
    const emailExists = totalUsers.some(
      (user) => user.email === e.target.value
    );
    if (isValidEmail(email)) {
      setEmailError("");
      if (emailExists) {
        setEmailExistsError("Email already exists");
        setHasError(true);
      } else {
        setEmailExistsError("");
        setHasError(false);
      }
    } else {
      setEmailError("Invalid email format");
      setEmailExistsError("");
      setHasError(false);
    }
    setFormData({ ...formData, email: email });
  };

  const validateUserName = (e) => {
    const username = e.target.value;
    const usernameExists = totalUsers.some(
      (user) => user.username === e.target.value
    );
    if (usernameExists) {
      setUserExistsError("Username already taken");
      setHasError(true);
    } else {
      setUserExistsError("");
      setHasError(false);
    }
    setFormData({ ...formData, username: username });
  };

  const validatePhone = (e) => {
    const phone = e.target.value;
    const phoneExists = totalUsers.some(
      (user) => user.phone === e.target.value
    );
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError("Invalid phone number. It should be 10 digits.");
      setPhoneExistsError("");
      setHasError(true);
    } else if (phoneExists) {
      setPhoneExistsError("Phone number already exists");
      setPhoneError("");
      setHasError(true);
    } else {
      setPhoneError("");
      setPhoneExistsError("");
      setHasError(false);
    }
    setFormData({ ...formData, phone: phone });
  };

  const validatePincode = (e) => {
    const pincode = e.target.value;
    const pincodeRegex = /^[0-9]{1,6}$/;
    if (!pincodeRegex.test(pincode)) {
      setPincodeError(
        "Invalid pincode. It should contain only numbers and have a maximum length of 6 digits."
      );
      setHasError(true);
    } else {
      setPincodeError("");
      setHasError(false);
    }
    setFormData({ ...formData, pincode: pincode });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (hasError) {
      return;
    }
    if (!isValidEmail(formData.email)) {
      setEmailError("Invalid email format");
      return;
    }
    if (
      userExistsError ||
      emailExistsError ||
      phoneExistsError ||
      pincodeError ||
      phoneError
    ) {
      return;
    }

    const formDataObj = new FormData();
    for (const key in formData) {
      formDataObj.append(key, formData[key]);
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}update-user-profile/${currentUser.id}/`,
        formDataObj,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setSuccess("Profile updated successfully.");
        setTimeout(() => {
          setSuccess("");
        }, 2000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}delete-profile/${currentUser.id}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        setSuccess(res.data);
        setTimeout(() => {
          setSuccess("");
        }, 2000);
        localStorage.removeItem("user");
        Cookies.remove("token");
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (
      passwordForm.oldpassword.length < 6 ||
      passwordForm.newpassword.length < 6
    ) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    if (passwordForm.oldpassword === passwordForm.newpassword) {
      setPasswordError("New password cannot be the same as the old password.");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}reset-password/${currentUser.id}/`,
        passwordForm,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        setPasswordSuccess("Password reset successfully.");
        setTimeout(() => {
          setPasswordSuccess("");
          setPasswordForm({
            oldpassword: "",
            newpassword: "",
          });
        }, 2000);
      }
    } catch (error) {
      console.log(error);
      setPasswordError(error.response.data.error);
      setTimeout(() => {
        setPasswordError("");
      }, 2000);
    }
  };

  const handlePasswordChange = (e) => {
    const { id, value } = e.target;
    setPasswordForm({ ...passwordForm, [id]: value });

    if (id === "oldpassword" || id === "newpassword") {
      if (value.length < 6) {
        setPasswordError("Password must be at least 6 characters long.");
      } else if (id === "newpassword" && value === passwordForm.oldpassword) {
        setPasswordError(
          "New password cannot be the same as the old password."
        );
      } else {
        setPasswordError("");
      }
    }
  };

  const fetchUserOrders = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}get-user-orders/${currentUser.id}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      setUserOrders(res.data);
      calculateTotals(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const calculateTotals = (orders) => {
    let totalBooks = 0;
    let totalAmount = 0;

    orders.forEach((order) => {
      order.order_items.forEach((item) => {
        totalBooks += item.quantity;
      });
      totalAmount += parseFloat(order.total_amount);
    });

    setTotalBooksPurchased(totalBooks);
    setTotalTransactionAmount(totalAmount);
  };

  const fetchUserRentals = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}fetch-user-rentals/${currentUser.id}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      setTotalUserRentals(res.data.length);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUserRentalsReturns = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}get-returned-books/${currentUser.id}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      setTotalUserRentalReturns(res.data.length);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUserLostBooks = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}get-lost-books/${currentUser.id}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      setTotalUserLostBooks(res.data.length);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <UserNav />
      <div className="flex-1">
        <div className="mx-auto max-w-2xl py-10 px-10">
          <div className="w-full flex justify-center mb-4">
            <h2 className="text-center text-2xl font-bold">Profile</h2>
          </div>
          <form
            className="w-full flex flex-col gap-4 py-6 items-center"
            onSubmit={handleUpdateProfile}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={filePickerRef}
              hidden
              className="hidden"
            />
            <Tooltip content="Click to Upload Profile" animation="duration-500">
              <img
                src={
                  formData.profile
                    ? URL.createObjectURL(formData.profile)
                    : `${import.meta.env.VITE_API_IMAGE_URL}${
                        currentUser.profile
                      }`
                }
                alt={currentUser.username}
                className="rounded-full w-32 h-32 object-cover ring-2 ring-gray-100 cursor-pointer"
                onClick={() => filePickerRef.current.click()}
              />
            </Tooltip>
            <div className="flex flex-col gap-1 w-full">
              <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Username
              </p>
              <input
                id="username"
                name="username"
                value={formData.username}
                onChange={validateUserName}
                type="text"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
              {userExistsError && (
                <p className="mt-1 text-sm font-semibold text-red-600 dark:text-red-400">
                  {userExistsError}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1 w-full">
              <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Email
              </p>
              <input
                id="email"
                name="email"
                value={formData.email}
                onChange={validateEmail}
                type="email"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
              {emailExistsError && (
                <p className="mt-1 text-sm font-semibold text-red-600 dark:text-red-400">
                  {emailExistsError}
                </p>
              )}
              {emailError && (
                <p className="mt-1 text-sm font-semibold text-red-600 dark:text-red-400">
                  {emailError}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1 w-full">
              <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                First Name
              </p>
              <input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                type="text"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Last Name
              </p>
              <input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                type="text"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Phone
              </p>
              <input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={validatePhone}
                type="number"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
              {phoneExistsError && (
                <p className="mt-1 text-sm font-semibold text-red-600 dark:text-red-400">
                  {phoneExistsError}
                </p>
              )}
              {phoneError && (
                <p className="mt-1 text-sm font-semibold text-red-600 dark:text-red-400">
                  {phoneError}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1 w-full">
              <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                State
              </p>
              <input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                type="text"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                City
              </p>
              <input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                type="text"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Street
              </p>
              <input
                id="street"
                name="street"
                value={formData.street}
                onChange={handleChange}
                type="text"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                House Name
              </p>
              <input
                id="house_name"
                name="house_name"
                value={formData.house_name}
                onChange={handleChange}
                type="text"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Pincode
              </p>
              <input
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={validatePincode}
                type="number"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
              {pincodeError && (
                <p className="mt-1 text-sm font-semibold text-red-600 dark:text-red-400">
                  {pincodeError}
                </p>
              )}
              {success && (
                <p className="mt-1 text-sm text-center font-semibold text-green-600 dark:text-red-400">
                  {success}
                </p>
              )}
            </div>
            <Button color="blue" className="border-2 mt-2 w-full" type="submit">
              Update
            </Button>
          </form>
          <Button
            color="failure"
            className="border-2 w-full"
            onClick={handleDelete}
          >
            Delete account
          </Button>
          <div className="py-2 mt-10">
            <button
              onClick={() => setAccordionOpen(!accordionOpen)}
              className="flex justify-between w-full"
            >
              <span className="text-gray-600 font-semibold text-sm">
                Reset your password
              </span>
              {accordionOpen && (
                <MdOutlineKeyboardArrowUp
                  className={`fill-gray-500 shrink-0 ml-8 transform origin-center transition duration-300 ease-out text-2xl`}
                />
              )}
              {!accordionOpen && (
                <MdOutlineKeyboardArrowDown
                  className={`fill-gray-500 shrink-0 ml-8 transform origin-center transition duration-300 ease-out text-2xl`}
                />
              )}
            </button>
            <div
              className={`grid overflow-hidden transition-all duration-300 ease-in-out text-slate-600 text-sm ${
                accordionOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden mt-4 px-2 pb-2">
                <form
                  className="w-full flex flex-col gap-4 items-center"
                  onSubmit={handlePasswordReset}
                >
                  <div className="flex flex-col gap-1 w-full">
                    <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Old password
                    </p>
                    <input
                      id="oldpassword"
                      name="oldpassword"
                      value={passwordForm.oldpassword}
                      onChange={handlePasswordChange}
                      type="password"
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:purple-blue-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      New password
                    </p>
                    <input
                      id="newpassword"
                      name="newpassword"
                      value={passwordForm.newpassword}
                      onChange={handlePasswordChange}
                      type="password"
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:purple-blue-500"
                    />
                    {passwordError && (
                      <p className="mt-1 text-sm font-semibold text-red-600 dark:text-red-400">
                        {passwordError}
                      </p>
                    )}
                    {passwordSuccess && (
                      <p className="mt-1 text-sm text-center font-semibold text-green-600 dark:text-red-400">
                        {passwordSuccess}
                      </p>
                    )}
                  </div>
                  <Button
                    color="purple"
                    className="border-2 mt-2 w-full"
                    type="submit"
                  >
                    Reset password
                  </Button>
                </form>
              </div>
            </div>
          </div>

          <div className="max-w-screen-lg flex flex-col gap-2">
            <div className="rounded-lg border border-gray-100 bg-white p-6 w-full">
              <div className="flex items-center justify-between max-w-3xl">
                <div className="ml-0">
                  <p className="text-sm text-gray-500">Books purchased</p>
                  <p className="text-2xl font-medium text-gray-900">
                    {totalBooksPurchased}
                  </p>
                </div>
                <span className="rounded-full bg-pink-100 p-3 text-pink-600 mr-0">
                  <HiMiniShoppingBag className="h-8 w-8" />
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-gray-100 bg-white p-6 w-full">
              <div className="flex items-center justify-between max-w-3xl">
                <div className="ml-0">
                  <p className="text-sm text-gray-500">
                    Total transaction amount
                  </p>
                  <p className="text-2xl font-medium text-gray-900">
                    ₹{totalTransactionAmount.toFixed(2)}
                  </p>
                </div>
                <span className="rounded-full bg-purple-100 p-3 text-purple-600 mr-0">
                  <MdPayment className="h-8 w-8" />
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-gray-100 bg-white p-6 w-full">
              <div className="flex items-center justify-between max-w-3xl">
                <div className="ml-0">
                  <p className="text-sm text-gray-500">Total Books Rented</p>
                  <p className="text-2xl font-medium text-gray-900">
                    {totalUserRentals}
                  </p>
                </div>
                <span className="rounded-full bg-rose-100 p-3 text-rose-600 mr-0">
                  <FaBookOpen className="h-8 w-8" />
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-gray-100 bg-white p-6 w-full">
              <div className="flex items-center justify-between max-w-3xl">
                <div className="ml-0">
                  <p className="text-sm text-gray-500">Total Books Returned</p>
                  <p className="text-2xl font-medium text-gray-900">
                    {totalUserRentalReturns}
                  </p>
                </div>
                <span className="rounded-full bg-green-100 p-3 text-green-600 mr-0">
                  <BiBookBookmark className="h-8 w-8" />
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-gray-100 bg-white p-6 w-full">
              <div className="flex items-center justify-between max-w-3xl">
                <div className="ml-0">
                  <p className="text-sm text-gray-500">Total Books Lost</p>
                  <p className="text-2xl font-medium text-gray-900">
                    {totalUserLostBooks}
                  </p>
                </div>
                <span className="rounded-full bg-red-100 p-3 text-red-600 mr-0">
                  <FaBookDead className="h-8 w-8" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UserFooter />
    </>
  );
};

export default UserProfile;
