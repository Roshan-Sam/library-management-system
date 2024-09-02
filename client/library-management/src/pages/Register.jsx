import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

const renderTime = ({ remainingTime }) => {
  if (remainingTime === 0) {
    return;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-slate-950 text-xs">{remainingTime}s</div>
    </div>
  );
};

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    state: "",
    city: "",
    street: "",
    house_name: "",
    pincode: "",
  });

  const [error, setError] = useState("");
  const [timerKey, setTimerKey] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [hasError, setHasError] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });

    if (id === "phone") {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(value)) {
        setPhoneError("Invalid phone number. It should be 10 digits.");
        setHasError(true);
      } else {
        setPhoneError("");
        setHasError(false);
      }
    }

    if (id === "pincode") {
      const pincodeRegex = /^[0-9]{1,6}$/;
      if (!pincodeRegex.test(value)) {
        setPincodeError(
          "Invalid pincode. It should contain only numbers and have a maximum length of 6 digits."
        );
        setHasError(true);
      } else {
        setPincodeError("");
        setHasError(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasError) {
      return;
    }
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}register/`,
        formData
      );
      if (res.status === 200) {
        const submittedEmail = formData.email;
        setFormData({
          username: "",
          email: "",
          first_name: "",
          last_name: "",
          phone: "",
          state: "",
          city: "",
          street: "",
          house_name: "",
          pincode: "",
        });
        setShowTimer(true);
        setTimeout(() => {
          setShowTimer(false);
          setTimerKey(timerKey + 1);
          checkVerificationStatus(submittedEmail);
        }, 15000);
      }
    } catch (error) {
      if (error) {
        console.log(error);
        if (error.response.data.username) {
          setError(error.response.data.username[0]);
        } else if (error.response.data.phone) {
          setError("A user with this phone number already exists.");
        } else if (error.response.data.email) {
          setError(error.response.data.email[0]);
        } else {
          setError(error.response.data.error);
        }
        setTimeout(() => {
          setError("");
        }, 3000);
      }
    }
  };

  const checkVerificationStatus = async (email) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}verify-status/${email}/`
      );
      if (res.data.verified) {
        const passRes = await axios.post(
          `${import.meta.env.VITE_API_URL}send-password/`,
          {
            email: email,
          }
        );
        if (passRes.status === 200) {
          const userData = passRes.data.user_data;
          notifyAdmin(userData);
        }
        setSuccess(res.data.message);
        setTimeout(() => {
          setSuccess("");
        }, 10000);
      } else {
        setError(res.data.message);
        setTimeout(() => {
          setError("");
        }, 10000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const notifyAdmin = async (userData) => {
    try {
      userData.message = `New user has been registered, please approve the user.`;
      userData.type = "approval";
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}notify-admin/`,
        userData
      );
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center">
      <div className="2xl:flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-16">
        {/*left*/}
        <div className="flex-1 2xl:mt-0 mt-10 2xl:text-start text-center">
          <Link className="font-bold dark:text-white text-4xl">
            <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
              Library
            </span>
            Management
          </Link>
          <p className="text-sm mt-5">
            You can sign up with your username and email.
          </p>
        </div>
        {/*right*/}
        <div className="flex-1 2xl:mt-0 mt-10">
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <label
              htmlFor="username"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Username
            </label>
            <div className="flex mb-5">
              <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-e-0 border-gray-300 rounded-s-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
                </svg>
              </span>
              <input
                type="text"
                id="username"
                className="rounded-none rounded-e-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="username"
                required
                onChange={handleChange}
                value={formData.username}
              />
            </div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Your Email
            </label>
            <div className="relative mb-4">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 16"
                >
                  <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z" />
                  <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z" />
                </svg>
              </div>
              <input
                type="email"
                id="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="email"
                required
                onChange={handleChange}
                value={formData.email}
              />
            </div>
            <div className="md:flex md:w-[600px] md:gap-10">
              <div className="w-full">
                <label
                  htmlFor="first_name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="first name"
                  required
                  onChange={handleChange}
                  value={formData.first_name}
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="last_name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="last name"
                  required
                  onChange={handleChange}
                  value={formData.last_name}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Phone Number
              </label>
              <input
                type="number"
                id="phone"
                className={`mb-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                placeholder="phone"
                required
                onChange={handleChange}
                value={formData.phone}
              />
              {phoneError && (
                <p className="text-red-500 text-xs font-semibold mb-1">
                  {phoneError}
                </p>
              )}
            </div>
            <div className="md:flex md:w-[600px] md:gap-10 mt-2">
              <div className="w-full">
                <label
                  htmlFor="state"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="state"
                  required
                  onChange={handleChange}
                  value={formData.state}
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="city"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="city"
                  required
                  onChange={handleChange}
                  value={formData.city}
                />
              </div>
            </div>
            <div className="md:flex md:w-[600px] md:gap-10">
              <div className="w-full">
                <label
                  htmlFor="street"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Street
                </label>
                <input
                  type="text"
                  id="street"
                  className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="street"
                  required
                  onChange={handleChange}
                  value={formData.street}
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="house_name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  House Name
                </label>
                <input
                  type="text"
                  id="house_name"
                  className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="house name"
                  required
                  onChange={handleChange}
                  value={formData.house_name}
                />
              </div>
            </div>
            <label
              htmlFor="pincode"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Pincode
            </label>
            <input
              type="text"
              id="pincode"
              className="mb-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="pincode"
              required
              onChange={handleChange}
              value={formData.pincode}
            />
            {pincodeError && (
              <p className="text-red-500 text-xs font-medium mb-2">
                {pincodeError}
              </p>
            )}
            <button
              type="submit"
              className="mt-2 text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 w-full"
            >
              Sign up
            </button>
          </form>
          <div className="mt-2">
            <p className="text-sm">
              Already have an account?{" "}
              <Link className="text-sky-500 " to={"/login"}>
                Sign in
              </Link>
            </p>
          </div>
          {success && (
            <div
              className="p-4 mb-4 mt-2 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400"
              role="alert"
            >
              <span className="font-medium">{success}</span>
            </div>
          )}
          {error && (
            <div
              className="p-4 mb-4 mt-2 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
              role="alert"
            >
              <span className="font-medium">{error}</span>
            </div>
          )}
          {showTimer && (
            <div className="flex items-center gap-4 mt-2">
              <p className="text-sm text-teal-500">
                Check your email for email confirmation.
              </p>
              <div className="">
                <CountdownCircleTimer
                  key={timerKey}
                  isPlaying
                  duration={15}
                  colors={["#03AED2"]}
                  onComplete={() => ({ shouldRepeat: false })}
                  size={40}
                  strokeWidth={3}
                >
                  {renderTime}
                </CountdownCircleTimer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
