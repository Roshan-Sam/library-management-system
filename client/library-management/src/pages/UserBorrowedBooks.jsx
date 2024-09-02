import { useState, useEffect } from "react";
import UserNav from "../components/user/UserNav";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Badge, Modal, Button } from "flowbite-react";
import { Link } from "react-router-dom";
import UserFooter from "./UserFooter";
import Cookies from "js-cookie";

const UserBorrowedBooks = () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [rentals, setRentals] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [returnRental, setReturnRental] = useState({});
  const [paymentModal, setPayementModal] = useState(false);
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [lostBookDetails, setLostBookDetails] = useState({});
  const [lostPaymentModal, setLostPaymentModal] = useState(false);

  useEffect(() => {
    fetchRental();
  }, []);

  const fetchRental = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}fetch-user-rentals/${currentUser.id}/`,
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

  const highlightDates = (rental) => {
    const currentDate = new Date();
    const rentalDate = new Date(rental.rental_date);
    const dueDate = new Date(rental.due_date);
    const cDate = currentDate.setHours(0, 0, 0, 0);
    const dDate = dueDate.setHours(0, 0, 0, 0);
    const overdueDays = Math.max(
      0,
      Math.floor((cDate - dDate) / (24 * 60 * 60 * 1000))
    );
    const fine = overdueDays > 0 ? 6 + overdueDays * 1 : 0;
    return { rentalDate, dueDate, overdueDays, fine };
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const handleReturnBook = async (rentalId) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}return-book/${rentalId}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        setPayementModal(true);
        setReturnRental({});
        setRentals((prevRentals) =>
          prevRentals.filter((prevRental) => prevRental.id != rentalId)
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLostBook = async (rentalId) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}lost-book/${rentalId}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        setLostPaymentModal(true);
        setLostBookDetails({});
        setRentals((prevRentals) =>
          prevRentals.filter((prevRental) => prevRental.id != rentalId)
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const openReturnModal = (rental) => {
    const currentDate = new Date();
    const dueDate = new Date(rental.due_date);
    currentDate.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    let fine = 0;
    let overdueDays = 0;
    let totalAmount = 0;

    if (currentDate > dueDate) {
      const oneDay = 24 * 60 * 60 * 1000;
      overdueDays = Math.ceil((currentDate - dueDate) / oneDay);
      fine = 6.0 + overdueDays * 1.0;
    }
    if (fine > 0) {
      totalAmount = Math.floor(fine) + Math.floor(rental.rental_amount);
    } else {
      totalAmount = Math.floor(rental.rental_amount);
    }

    const updatedRental = {
      ...rental,
      fine,
      overdueDays,
      totalAmount,
    };
    setReturnRental(updatedRental);
    setOpenModal(true);
  };

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };
  const formatCurrentDate = () => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date().toLocaleDateString("en-GB", options);
  };

  const openLostModal = (rental) => {
    const fineAmount = 60;
    const totalAmount = Math.floor(rental.book_details.price) + fineAmount;
    setLostBookDetails({ ...rental, fineAmount, totalAmount });
    setLostModalOpen(true);
  };

  return (
    <>
      <UserNav />
      <div className="container mx-auto px-10 py-10 min-h-screen">
        <h2 className="text-center text-2xl font-bold mb-10">Books Borrowed</h2>
        <div className="flex flex-wrap justify-center w-full gap-4">
          {rentals.length > 0 ? (
            rentals.map((rental) => {
              const { rentalDate, dueDate, overdueDays, fine } =
                highlightDates(rental);
              return (
                <div
                  key={rental.id}
                  className="p-4 rounded-lg mb-4 ring-2 ring-gray-100 shadow-md h-fit max-w-sm"
                >
                  <div className="flex items-end justify-between mb-4 gap-4">
                    <img
                      src={`${import.meta.env.VITE_API_IMAGE_URL}${
                        rental.book_details.image
                      }`}
                      alt="Book Cover"
                      className="w-36 h-32 mr-4 object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-semibold">
                        {rental.book_details.name}
                      </h3>
                      <p className="text-gray-700 text:lg font-semibold">
                        Price:{" "}
                        <span className="font-medium text-sm">
                          ₹{rental.book_details.price}
                        </span>
                      </p>
                      <p className="text-gray-700 text:lg font-semibold">
                        Available Stock:{" "}
                        <span className="font-medium text-sm">
                          {rental.book_details.stock}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-gray-900 text:lg font-semibold flex items-center">
                      Rental Period:{" "}
                      <Badge
                        className="inline-flex font-medium ml-auto"
                        color="purple"
                      >
                        {rental.rental_period !== "month"
                          ? `${rental.rental_period} days`
                          : `1 ${rental.rental_period}`}
                      </Badge>
                    </p>
                    <p className="text-gray-900 text:lg font-semibold flex items-center">
                      Rental Date:{" "}
                      <Badge
                        className="inline-flex font-medium ml-auto"
                        color="pink"
                      >
                        {formatDate(rental.rental_date)}
                      </Badge>
                    </p>
                    <p className="text-gray-900 text:lg font-semibold flex items-center">
                      Due Date:{" "}
                      <Badge
                        className="inline-flex font-medium ml-auto"
                        color="indigo"
                      >
                        {formatDate(rental.due_date)}
                      </Badge>
                    </p>
                    <p className="text-gray-900 text:lg font-semibold flex items-center">
                      Rental Amount:{" "}
                      <Badge
                        className="inline-flex font-medium ml-auto"
                        color="light"
                        size=""
                      >
                        ₹{rental.rental_amount}
                      </Badge>
                    </p>
                    {overdueDays > 0 && (
                      <div className="mt-1 flex flex-col gap-">
                        <p className="text-gray-900 text:md font-medium flex items-center">
                          Overdue:{" "}
                          <Badge
                            className="inline-flex font-medium ml-auto px-1 py-0"
                            color="yellow"
                            size="sm"
                          >
                            {overdueDays} {overdueDays === 1 ? "day" : "days"}
                          </Badge>
                        </p>
                        <p className="text-gray-900 text:md font-medium flex items-center">
                          Fine:{" "}
                          <Badge
                            className="inline-flex font-medium ml-auto px-1 py-0 text-red-600"
                            color=""
                            size="sm"
                          >
                            ₹ {fine}
                          </Badge>
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center">
                    <Calendar
                      className="border-none ring-2 ring-gray-100 shadow-sm p-2"
                      defaultValue={dueDate}
                      tileClassName={({ date, view }) => {
                        if (view === "month") {
                          if (isSameDay(date, rentalDate)) {
                            return "highlight-rental-date";
                          } else if (isSameDay(date, dueDate)) {
                            return "highlight-due-date";
                          }
                        }
                        return null;
                      }}
                    />
                  </div>
                  <div className="flex mt-4">
                    <button
                      onClick={() => openReturnModal(rental)}
                      type="button"
                      className="text-white w-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    >
                      Return
                    </button>
                    <button
                      onClick={() => openLostModal(rental)}
                      type="button"
                      className="focus:outline-none w-full text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:focus:ring-yellow-900"
                    >
                      Lost
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-lg font-semibold text-gray-600 text-center">
              No borrowed books found!
            </p>
          )}
        </div>
      </div>
      <Modal
        show={openModal}
        size="md"
        onClose={() => setOpenModal(false)}
        popup
        dismissible
      >
        <Modal.Body>
          <div className="text-center">
            <div className="py-2">
              <h1 className="text-lg font-semibold text-left">
                Rental Return Details
              </h1>
            </div>
            <div className="py-4">
              <p className="text-md font-semibold">
                Book Name: {returnRental.book_details?.name}
              </p>
              <p className="text-md font-medium">
                Rental Date: {formatDate(returnRental.rental_date)}
              </p>
              <p className="text-md font-medium">
                Due Date: {formatDate(returnRental.due_date)}
              </p>
              <p className="text-md font-semibold">
                Return Date: {formatCurrentDate()}
              </p>
              {returnRental.fine > 0 ? (
                <>
                  <p className="text-md font-semibold">
                    Rental Amount: ₹{returnRental.rental_amount}
                  </p>{" "}
                  <p className="text-md text-red-600 font-semibold">
                    Fine: ₹{returnRental.fine} ({returnRental.overdueDays}{" "}
                    overdue days)
                  </p>
                </>
              ) : (
                <p className="text-md text-cyan-600 font-semibold">
                  Rental Amount: ₹{returnRental.rental_amount}
                </p>
              )}
              {returnRental.fine > 0 ? (
                <p className="text-lg font-semibold">
                  Total Amount: ₹{returnRental.totalAmount}
                </p>
              ) : (
                <p className="text-lg font-semibold">
                  Total Amount: ₹{returnRental.totalAmount}
                </p>
              )}
            </div>
            <div className="flex justify-center gap-4">
              <Button
                color="failure"
                onClick={() => handleReturnBook(returnRental.id)}
              >
                Pay Amount and Return
              </Button>
              <Button color="gray" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={paymentModal}
        size="md"
        onClose={() => setPayementModal(false)}
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
                <p className="text-gray-600 my-2">
                  Book Returned Successfully.
                </p>
                <div className="py-10 text-center">
                  <Link
                    to="/books-returned"
                    className="px-12 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3"
                  >
                    Go to returned books details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={lostModalOpen}
        size="md"
        onClose={() => setLostModalOpen(false)}
        popup
        dismissible
      >
        <Modal.Body>
          <div className="text-center">
            <div className="py-2">
              <h1 className="text-lg font-semibold text-left">
                Lost Book Details
              </h1>
            </div>
            <div className="py-4">
              <p className="text-md font-semibold">
                Book Name: {lostBookDetails.book_details?.name}
              </p>
              <p className="text-md font-medium">
                Book Price: ₹{lostBookDetails.book_details?.price}
              </p>
              <p className="text-md font-semibold">
                Fine Amount: ₹{lostBookDetails.fineAmount}
              </p>
              <p className="text-md font-semibold">
                Total Amount: ₹{lostBookDetails.totalAmount}
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <Button
                color="failure"
                onClick={() => handleLostBook(lostBookDetails.id)}
              >
                Confirm Lost Book
              </Button>
              <Button color="gray" onClick={() => setLostModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={lostPaymentModal}
        size="md"
        onClose={() => setLostPaymentModal(false)}
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
                <p className="text-gray-600 my-2">
                  Book Lost Updated Successfully.
                </p>
                <div className="py-10 text-center">
                  <Link
                    to="/books-lost"
                    className="px-12 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3"
                  >
                    Go to lost books details
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

export default UserBorrowedBooks;
