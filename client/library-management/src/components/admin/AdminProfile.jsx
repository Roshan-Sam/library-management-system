import axios from "axios";
import { Button, Tooltip } from "flowbite-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { MdOutlineKeyboardArrowUp } from "react-icons/md";

const AdminProfile = () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [formData, setFormData] = useState({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
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
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

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
    if (isValidEmail(email)) {
      setEmailError("");
    } else {
      setEmailError("Invalid email format");
    }
    setFormData({ ...formData, email: email });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!isValidEmail(formData.email)) {
      setEmailError("Invalid email format");
      return;
    }

    const formDataObj = new FormData();
    for (const key in formData) {
      formDataObj.append(key, formData[key]);
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}update-profile/${currentUser.id}/`,
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

  return (
    <div className="flex-1">
      <div className="mx-auto max-w-2xl py-10 px-10">
        <div className="w-full flex justify-center mb-4">
          <h1 className="font-semibold text-2xl">Profile</h1>
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
              onChange={handleChange}
              type="text"
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
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
            {emailError && (
              <p className="mt-1 text-sm font-semibold text-red-600 dark:text-red-400">
                {emailError}
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
      </div>
    </div>
  );
};

export default AdminProfile;
