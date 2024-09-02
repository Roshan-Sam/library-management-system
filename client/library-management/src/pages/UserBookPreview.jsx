import UserNav from "../components/user/UserNav";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import { Rate } from "antd";
import { Modal } from "flowbite-react";
import { useCartCountContext } from "../hooks/useCartCountContext";
import UserFooter from "./UserFooter";
import Cookies from "js-cookie";

const UserBookPreview = () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [book, setBook] = useState({});
  const { id } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const [rentalPeriod, setRentalPeriod] = useState("7");
  const userId = currentUser.id;
  const [rentals, setRentals] = useState([]);
  const [cartDetails, setCartDetails] = useState([]);
  const [userRated, setUserRated] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const desc = ["terrible", "bad", "normal", "good", "wonderful"];
  const { cartCount, dispatch: cartDispatch } = useCartCountContext();

  useEffect(() => {
    fetchBook();
    fetchRental();
    fetchCart();
  }, [currentUser.id]);

  const fetchRental = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}fetch-user-rentals/${userId}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      setRentals(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchBook = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}book/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      setBook(res.data);
      checkIfUserRated(res.data.book_ratings);
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfUserRated = (ratings) => {
    if (ratings.some((rating) => rating.user.id === currentUser.id)) {
      setUserRated(true);
    } else {
      setUserRated(false);
    }
  };

  const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const total = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    return parseFloat((total / ratings.length).toFixed(1));
  };

  const handleBorrowNow = () => {
    setOpenModal(true);
  };

  const handleRentalPeriodChange = (e) => {
    setRentalPeriod(e.target.value).toString();
  };

  const handleOk = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}rent-book/`,
        {
          user: userId,
          book: id,
          rental_period: rentalPeriod,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      if (res.status === 200) {
        setOpenModal(false);
        setRentalPeriod("7");
        setBook((prevBook) => ({ ...prevBook, stock: prevBook.stock - 1 }));
        fetchRental();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddToCart = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}add-to-cart/`,
        {
          user: userId,
          book: id,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        cartDispatch({
          type: "UPDATE_CART",
          payload: cartCount + 1,
        });
        setBook((prevBook) => ({ ...prevBook, stock: prevBook.stock - 1 }));
        fetchCart();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCart = async () => {
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
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const isBookRented = rentals.some((rental) => rental.book === parseInt(id));
  const isBookInCart = cartDetails.some(
    (cartItem) => cartItem.book === parseInt(id)
  );

  const handleRatingChange = (value) => {
    setUserRating(value);
  };

  const handleRatingSubmit = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}add-rating/`,
        {
          user: userId,
          book: id,
          rating: userRating,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        fetchBook();
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  return (
    <>
      <UserNav />
      <div>
        <section className="text-gray-700 body-font overflow-hidden bg-white">
          <div className="container px-5 py-24 mx-auto">
            {book && (
              <div className="lg:w-4/5 mx-auto flex flex-wrap">
                <img
                  alt={book.name}
                  className="lg:w-1/2 w-full h-[500px] object-cover object-center rounded"
                  src={`${import.meta.env.VITE_API_IMAGE_URL}${book.image}`}
                />
                <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
                  <h2 className="text-sm title-font text-gray-500 tracking-widest">
                    BOOK NAME
                  </h2>
                  <h1 className="text-gray-900 text-3xl title-font font-semibold mb-1">
                    {book.name}
                  </h1>
                  <div className="flex mb-4">
                    <Rate
                      allowHalf
                      disabled
                      value={calculateAverageRating(book.book_ratings)}
                    />
                    <span className="ml-3 font-medium">
                      {calculateAverageRating(book.book_ratings)} Stars
                    </span>
                  </div>
                  <p className="leading-relaxed">{book.description}</p>
                  <div className="flex gap-1 flex-col mt-6 items-start pb-5 border-b-2 border-gray-200 mb-5">
                    <div className="flex items-center">
                      <span className="mr-3 text-sm font-bold">Category:</span>
                      <span className="text-sm font-medium">
                        {book.category}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-3 text-sm font-bold">
                        Publisher Id:
                      </span>
                      <span className="text-sm font-medium">
                        {book.publisher_id}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-3 text-sm font-bold">
                        Available Stock:
                      </span>
                      <span className="text-sm font-medium">{book.stock}</span>
                    </div>
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 transition-all duration-300">
                    <span className="title-font font-medium text-2xl text-gray-900">
                      ₹{book.price}
                    </span>
                    <div className="flex sm:ml-auto sm:flex-row flex-col gap-2">
                      {isBookInCart ? (
                        <button
                          disabled
                          className="text-white cursor-not-allowed bg-orange-500 border-0 py-2 px-6 focus:outline-none rounded"
                        >
                          Already in cart
                        </button>
                      ) : book.stock <= 0 ? (
                        <button
                          disabled
                          className="text-white cursor-not-allowed bg-gray-500 border-0 py-2 px-6 focus:outline-none rounded"
                        >
                          Out of stock
                        </button>
                      ) : (
                        <button
                          onClick={handleAddToCart}
                          className="text-white bg-orange-500 border-0 py-2 px-6 focus:outline-none hover:bg-orange-600 rounded"
                        >
                          Add to cart
                        </button>
                      )}
                      {isBookRented ? (
                        <button
                          disabled
                          className="text-white cursor-not-allowed bg-sky-500 border-0 py-2 px-6 focus:outline-none hover:bg-sky-600 rounded"
                        >
                          Already rented
                        </button>
                      ) : book.stock <= 0 ? (
                        <button
                          disabled
                          className="text-white cursor-not-allowed bg-gray-500 border-0 py-2 px-6 focus:outline-none rounded"
                        >
                          Out of stock
                        </button>
                      ) : (
                        <button
                          onClick={handleBorrowNow}
                          className="text-white bg-sky-500 border-0 py-2 px-6 focus:outline-none hover:bg-sky-600 rounded"
                        >
                          Borrow now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
        <Modal
          show={openModal}
          size="md"
          popup
          onClose={() => setOpenModal(false)}
          dismissible
        >
          <Modal.Header />
          <Modal.Body>
            <div className="flex flex-col">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                Borrow {book.name}
              </h3>
              <p className="mt-6">Choose rental period:</p>
              <select
                onChange={handleRentalPeriodChange}
                className="bg-gray-50 mt-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value={"7"}>7 days - ₹50</option>
                <option value={"24"}>24 days - ₹55</option>
                <option value={"month"}>1 month - ₹60</option>
              </select>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleOk}
                  type="button"
                  className="text-white bg-blue-700 w-full hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                >
                  Ok
                </button>
                <button
                  onClick={() => setOpenModal(false)}
                  type="button"
                  className="focus:outline-none text-white w-full bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal.Body>
        </Modal>

        {!userRated && (
          <div className="sm:px-10 px-4 flex flex-col">
            <h1 className="font-medium text-lg mb-4">Add Rating:</h1>
            <Rate
              tooltips={desc}
              className="text-lg mb-2"
              onChange={handleRatingChange}
            />
            <button
              onClick={handleRatingSubmit}
              className="mb-4 w-fit border text-sm font-sans px-6 py-2 rounded-md bg-slate-950 text-white focus:outline-none hover:opacity-85"
            >
              Add
            </button>
          </div>
        )}

        <div className="sm:px-10 px-4 pb-10">
          <h2 className="font-medium text-lg">Customers Ratings:</h2>
          <div className="flex flex-col mt-4">
            {book.book_ratings && book.book_ratings.length > 0 ? (
              book.book_ratings.map((rating, index) => (
                <div
                  key={index}
                  className="flex gap-2 pb-4 mb-4 flex-col ml-0 w-full"
                >
                  <div className="flex items-center ml-0 gap-2">
                    <img
                      src={`${import.meta.env.VITE_API_IMAGE_URL}${
                        rating.user.profile
                      }`}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-md font-semibold font-sans">
                      {rating.user.username}
                    </span>
                  </div>
                  <div className="ml-0">
                    <div className="flex items-center gap-2">
                      <Rate
                        allowHalf
                        disabled
                        value={rating.rating}
                        className="text-base"
                      />
                      <span className="font-sans  text-sm text-gray-600">
                        {rating.rating.toFixed(0)}
                      </span>
                    </div>
                    <p className="text-gray-600 font-sans text-sm">
                      Rated at:{" "}
                      {new Date(rating.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="font-sans text-gray-600 text-sm">No ratings yet</p>
            )}
          </div>
        </div>
      </div>
      <UserFooter />
    </>
  );
};

export default UserBookPreview;
