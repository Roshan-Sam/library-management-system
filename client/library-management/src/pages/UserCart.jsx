import UserNav from "../components/user/UserNav";
import { useState, useEffect } from "react";
import axios from "axios";
import { useCartCountContext } from "../hooks/useCartCountContext";
import FadeLoader from "react-spinners/FadeLoader";
import { Modal, Button } from "flowbite-react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { Link } from "react-router-dom";
import { Accordion } from "flowbite-react";
import UserFooter from "./UserFooter";
import Cookies from "js-cookie";

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

const UserCart = () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [cartDetails, setCartDetails] = useState([]);
  const { cartCount, dispatch: cartDispatch } = useCartCountContext();
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [state, setState] = useState(currentUser.state);
  const [houseName, setHouseName] = useState(currentUser.house_name);
  const [city, setCity] = useState(currentUser.city);
  const [street, setStreet] = useState(currentUser.street);
  const [pincode, setPincode] = useState(currentUser.pincode);
  const [totalAmount, setTotalAmount] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [success, setSuccess] = useState("");
  const [orderDetails, setOrderDetails] = useState([]);
  const [timerKey, setTimerKey] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentModal, setPaymentModal] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
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
        setCartDetails(res.data.cart_details);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching cart details:", error);
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}update-cart-quantity/`,
        { id: cartItemId, quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Error updating cart quantity:", error);
    }
  };

  const handleIncrement = async (cartItem) => {
    if (cartItem.book_details.stock != 0) {
      const updatedQuantity = cartItem.quantity + 1;
      const updatedStock = cartItem.book_details.stock - 1;

      const updatedCartDetails = cartDetails.map((item) =>
        item.id === cartItem.id
          ? {
              ...item,
              quantity: updatedQuantity,
              book_details: { ...item.book_details, stock: updatedStock },
            }
          : item
      );
      setCartDetails(updatedCartDetails);

      await updateQuantity(cartItem.id, updatedQuantity);
    }
  };

  const handleDecrement = async (cartItem) => {
    if (cartItem.quantity > 1) {
      const updatedQuantity = cartItem.quantity - 1;
      const updatedStock = cartItem.book_details.stock + 1;

      const updatedCartDetails = cartDetails.map((item) =>
        item.id === cartItem.id
          ? {
              ...item,
              quantity: updatedQuantity,
              book_details: { ...item.book_details, stock: updatedStock },
            }
          : item
      );
      setCartDetails(updatedCartDetails);

      await updateQuantity(cartItem.id, updatedQuantity);
    }
  };

  const handleDelete = async (cartItem) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}delete-cart-item/`,
        {
          id: cartItem.id,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        const updatedCartDetails = cartDetails.filter(
          (item) => item.id !== cartItem.id
        );
        setCartDetails(updatedCartDetails);
        cartDispatch({
          type: "UPDATE_CART",
          payload: cartCount - 1,
        });
      }
    } catch (error) {
      console.error("Error deleting cart item:", error);
    }
  };

  useEffect(() => {
    const newSubTotal = cartDetails.reduce(
      (acc, item) => acc + item.quantity * item.book_details.price,
      0
    );
    const shipping = 50;
    const GSTRate = 0.18;
    const GST = newSubTotal * GSTRate;
    const total = newSubTotal + GST + shipping;
    setTotalAmount(total);
    setSubTotal(newSubTotal);
    setShippingPrice(shipping);
  }, [cartDetails]);

  const formatCurrency = (amount) => {
    return amount.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    });
  };

  const handleCheckOut = async (e) => {
    e.preventDefault();
    try {
      const cartData = cartDetails.map((cartItem) => ({
        book: cartItem.book,
        quantity: cartItem.quantity,
      }));

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}place-order/`,
        {
          state,
          city,
          street,
          house_name: houseName,
          pincode,
          total_amount: totalAmount,
          cart_data: cartData,
          user: currentUser.id,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        setSuccess(res.data.message);
        setShowTimer(true);
        setTimeout(() => {
          setShowTimer(false);
          setTimerKey(timerKey + 1);
          setSuccess("");
          handleCheckConfirmation(res.data.order_id);
        }, 15000);
      }
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCheckConfirmation = async (order_id) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}check-confirm-order/${order_id}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200 && res.data.message) {
        setOrderDetails(res.data.order);
        setOpenModal(false);
        setPaymentModal(true);
        setState(currentUser.state);
        setCity(currentUser.city);
        setStreet(currentUser.street);
        setHouseName(currentUser.house_name);
        setPincode(currentUser.pincode);
        fetchCart();
      } else if (res.status == 200 && res.data.error) {
        setErrorMessage(res.data.error);
        setTimeout(() => {
          setErrorMessage("");
          setOpenModal(false);
          setState(currentUser.state);
          setCity(currentUser.city);
          setStreet(currentUser.street);
          setHouseName(currentUser.house_name);
          setPincode(currentUser.pincode);
        }, 5000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <UserNav />
      <div className="pt-20 pb-20 min-h-screen">
        <h2 className="text-center text-2xl font-bold mb-10">Cart</h2>
        {loading ? (
          <div className="flex justify-center mt-10">
            <FadeLoader height={12} width={4} color="#5AB2FF" />
          </div>
        ) : cartDetails.length === 0 ? (
          <div className="text-center mt-10">
            <p className="text-lg font-semibold text-gray-600 text-center">
              No books added to cart. Your cart is empty!
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-5xl justify-center px-6 md:flex md:space-x-6 xl:px-0">
            <div className="rounded-lg md:w-2/3">
              {cartDetails.map((item) => (
                <div
                  key={item.id}
                  className="justify-between mb-6 rounded-lg bg-white p-6 shadow-slate-300 shadow-sm-light sm:flex sm:justify-start"
                >
                  <img
                    src={`${import.meta.env.VITE_API_IMAGE_URL}${
                      item.book_details.image
                    }`}
                    alt={item.book_details.name}
                    className="w-full rounded-lg sm:w-40"
                  />
                  <div className="sm:ml-4 sm:flex sm:w-full sm:justify-between">
                    <div className="mt-5 sm:mt-0">
                      <h2 className="text-lg font-bold text-gray-900">
                        {item.book_details.name}
                      </h2>
                      <p className="mt-1 text-xs text-gray-700">
                        Author: {item.book_details.author}
                      </p>
                      <p className="mt-1 text-xs text-gray-700">
                        Publisher Id: {item.book_details.publisher_id}
                      </p>
                      <p className="mt-1 text-xs text-gray-700">
                        Available Stock: {item.book_details.stock}
                      </p>
                    </div>
                    <div className="mt-4 flex justify-between sm:space-y-6 sm:mt-0 sm:block sm:space-x-6">
                      <div className="flex items-center border-gray-100">
                        <span
                          onClick={() => handleDecrement(item)}
                          className="cursor-pointer rounded-l bg-gray-100 py-1 px-3.5 duration-100 hover:bg-blue-500 hover:text-blue-50"
                        >
                          {" "}
                          -{" "}
                        </span>
                        <input
                          className="max-w-14 border text-start border-gray-200 bg-white text-xs outline-none focus:ring-1"
                          type="number"
                          value={item.quantity}
                          readOnly
                        />
                        <span
                          onClick={() => handleIncrement(item)}
                          className="cursor-pointer rounded-r bg-gray-100 py-1 px-3 duration-100 hover:bg-blue-500 hover:text-blue-50"
                        >
                          {" "}
                          +{" "}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <p className="text-sm">{item.book_details.price} Rs</p>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="h-5 w-5 cursor-pointer duration-150 hover:text-red-500"
                          onClick={() => handleDelete(item)}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 h-full rounded-lg border bg-white p-6 shadow-sm-light shadow-slate-300 md:mt-0 md:w-1/3">
              <div className="mb-2 flex justify-between">
                <p className="text-gray-700">Subtotal</p>
                <p className="text-gray-700">{formatCurrency(subTotal)} </p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-700">Shipping</p>
                <p className="text-gray-700">{formatCurrency(shippingPrice)}</p>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between">
                <p className="text-lg font-bold">Total</p>
                <div className="">
                  <p className="mb-1 text-lg font-bold">
                    {formatCurrency(totalAmount)}
                  </p>
                  <p className="text-sm text-gray-700">including GST</p>
                </div>
              </div>
              <button
                onClick={() => setOpenModal(true)}
                className="mt-6 w-full rounded-md bg-blue-500 py-1.5 font-medium text-blue-50 hover:bg-blue-600"
              >
                Check out
              </button>
            </div>
          </div>
        )}
      </div>
      <Modal
        show={openModal}
        size="lg"
        onClose={() => setOpenModal(false)}
        popup
      >
        <Modal.Header className="w-full" />
        <Modal.Body className="w-full">
          <div className="flex flex-col gap-0 mb-4">
            <h1 className="font-sans font-semibold text-slate-950 text-lg">
              Shipping Address
            </h1>
            <p className="font-sans text-sm text-slate-950">
              Please confirm your address or update it for a better order
              placement experience.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <form
              onSubmit={handleCheckOut}
              className="flex flex-col gap-4 w-full"
            >
              <input
                type="text"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="focus:ring-slate-950 focus:border-slate-900"
                required
              />
              <input
                type="text"
                placeholder="House Name"
                value={houseName}
                onChange={(e) => setHouseName(e.target.value)}
                className="focus:ring-slate-950 focus:border-slate-900"
                required
              />
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="focus:ring-slate-950 focus:border-slate-900"
                required
              />
              <input
                type="text"
                placeholder="Street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="focus:ring-slate-950 focus:border-slate-900"
                required
              />
              <input
                type="number"
                placeholder="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="focus:ring-slate-950 focus:border-slate-900"
                required
              />
              <div className="flex gap-2 py-4">
                <Button
                  type="submit"
                  color="primary"
                  className="border bg-slate-900 text-white hover:opacity-80"
                >
                  Submit
                </Button>
                <Button
                  type="button"
                  color="secondary"
                  onClick={() => setOpenModal(false)}
                  className="border bg-red-600 text-white hover:opacity-80"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
          {success && showTimer && (
            <div className="flex items-center gap-4 justify-between">
              <p className="text-sm text-teal-500">{success}</p>
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
          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}
        </Modal.Body>
      </Modal>
      <Modal
        show={paymentModal}
        size="md"
        onClose={() => setPaymentModal(false)}
        popup
        dismissible
      >
        <Modal.Body>
          <div className="bg-gray-100">
            <div className="bg-white p-6  md:mx-auto">
              <svg
                viewBox="0 0 24 24"
                className="text-green-600 w-16 h-16 mx-auto my-6"
              >
                <path
                  fill="currentColor"
                  d="M12,0A12,12,0,1,0,24,12,12.014,12.014,0,0,0,12,0Zm6.927,8.2-6.845,9.289a1.011,1.011,0,0,1-1.43.188L5.764,13.769a1,1,0,1,1,1.25-1.562l4.076,3.261,6.227-8.451A1,1,0,1,1,18.927,8.2Z"
                ></path>
              </svg>
              <div className="text-center">
                <h3 className="md:text-2xl text-base text-gray-900 font-semibold text-center">
                  Payment Done!
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Your Order has been placed successfully.
                </p>
                <Accordion className="mt-4">
                  <Accordion.Panel>
                    <Accordion.Title className="focus:ring-0 focus:outline-none flex justify-center gap-4">
                      Your purchase details!
                    </Accordion.Title>
                    <Accordion.Content>
                      <div className="space-y-2">
                        {orderDetails &&
                          orderDetails.order_items &&
                          orderDetails.order_items.map((item, index) => (
                            <div
                              key={index}
                              className="border-b space-y-1 pb-2"
                            >
                              <h3 className="font-bold text-sm">
                                {item.book_details.name}
                              </h3>
                              <p className="text-sm text-gray-800">
                                Price: ₹{item.book_details.price}
                              </p>
                              <p className="text-sm text-gray-800">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                          ))}
                        <p className="text-lg font-medium text-red-600">
                          Total: ₹{orderDetails.total_amount}
                        </p>
                      </div>
                      <div className="space-y-1 mt-1">
                        <p className="text-sm text-gray-800">
                          State: {orderDetails.state}
                        </p>
                        <p className="text-sm text-gray-800">
                          City: {orderDetails.city}
                        </p>
                        <p className="text-sm text-gray-800">
                          Street: {orderDetails.street}
                        </p>
                        <p className="text-sm text-gray-800">
                          House Name: {orderDetails.house_name}
                        </p>
                        <p className="text-sm text-gray-800">
                          Pincode: {orderDetails.pincode}
                        </p>
                      </div>
                    </Accordion.Content>
                  </Accordion.Panel>
                </Accordion>
                <div className="py-10 text-center">
                  <Link
                    to="/books"
                    className="px-12 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3"
                  >
                    Go to books page
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <UserFooter />
    </>
  );
};

export default UserCart;
