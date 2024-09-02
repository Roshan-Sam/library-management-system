import { useState, useEffect } from "react";
import UserNav from "../components/user/UserNav";
import axios from "axios";
import Calendar from "react-calendar";
import { Badge } from "flowbite-react";
import UserFooter from "./UserFooter";
import Cookies from "js-cookie";

const UserLostBooks = () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [lostBooks, setLostBooks] = useState([]);

  const fetchLostBooks = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}get-lost-books/${currentUser.id}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      setLostBooks(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (currentUser && currentUser.id) {
      fetchLostBooks();
    }
  }, [currentUser.id]);

  const highlightDates = (lostBook) => {
    const currentDate = new Date();
    const rentalDate = new Date(lostBook.rental_date);
    const dueDate = new Date(lostBook.due_date);
    const lostDate = new Date(lostBook.lost_date);

    let totalAmount = 0;
    if (lostBook.fine > 0) {
      totalAmount =
        Math.floor(lostBook.fine) + Math.floor(lostBook.book_details.price);
    }
    return { rentalDate, dueDate, lostDate, totalAmount };
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  return (
    <>
      <UserNav />
      <div className="container mx-auto px-10 py-10 min-h-screen">
        <h2 className="text-center text-2xl font-bold mb-10">Books Lost</h2>
        <div className="flex flex-wrap justify-center w-full gap-4">
          {lostBooks.length > 0 ? (
            lostBooks.map((lostBook) => {
              const { rentalDate, dueDate, lostDate, totalAmount } =
                highlightDates(lostBook);
              return (
                <div
                  key={lostBook.id}
                  className="p-4 rounded-lg mb-4 ring-2 ring-gray-100 shadow-md h-fit max-w-sm"
                >
                  <div className="flex items-end justify-between mb-4 gap-4">
                    <img
                      src={`${import.meta.env.VITE_API_IMAGE_URL}${
                        lostBook.book_details.image
                      }`}
                      alt="Book Cover"
                      className="w-36 h-32 mr-4 object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-semibold">
                        {lostBook.book_details.name}
                      </h3>
                      <p className="text-gray-700 text:lg font-semibold">
                        Price:{" "}
                        <span className="font-medium text-sm">
                          ₹{lostBook.book_details.price}
                        </span>
                      </p>
                      <p className="text-gray-700 text:lg font-semibold">
                        Available Stock:{" "}
                        <span className="font-medium text-sm">
                          {lostBook.book_details.stock}
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
                        {lostBook.rental_period !== "month"
                          ? `${lostBook.rental_period} days`
                          : `1 ${lostBook.rental_period}`}
                      </Badge>
                    </p>
                    <p className="text-gray-900 text:lg font-semibold flex items-center">
                      Rental Date:{" "}
                      <Badge
                        className="inline-flex font-medium ml-auto"
                        color="pink"
                      >
                        {formatDate(lostBook.rental_date)}
                      </Badge>
                    </p>
                    <p className="text-gray-900 text:lg font-semibold flex items-center">
                      Due Date:{" "}
                      <Badge
                        className="inline-flex font-medium ml-auto"
                        color="indigo"
                      >
                        {formatDate(lostBook.due_date)}
                      </Badge>
                    </p>
                    <p className="text-gray-900 text:lg font-semibold flex items-center">
                      Lost Date:{" "}
                      <Badge
                        className="inline-flex font-medium ml-auto"
                        color="indigo"
                      >
                        {formatDate(lostBook.lost_date)}
                      </Badge>
                    </p>
                    <p className="text-gray-900 text:lg font-semibold flex items-center">
                      Rental Amount:{" "}
                      <Badge
                        className="inline-flex font-medium ml-auto py-0"
                        color="light"
                        size=""
                      >
                        ₹{lostBook.rental_amount}
                      </Badge>
                    </p>
                    <p className="text-gray-900 text:md font-medium flex items-center">
                      Fine:{" "}
                      <Badge
                        className="inline-flex font-medium ml-auto px-1 py-0 text-red-600"
                        color=""
                        size="sm"
                      >
                        ₹ {lostBook.fine}
                      </Badge>
                    </p>

                    {lostBook.fine > 0 && (
                      <div className="mt-1">
                        <p className="text-gray-900 text:lg font-semibold flex items-center">
                          Total Amount:{" "}
                          <Badge
                            className="inline-flex font-medium ml-auto py-0"
                            color="red"
                            size=""
                          >
                            ₹{totalAmount}
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
                          if (
                            isSameDay(date, rentalDate) &&
                            isSameDay(date, lostDate)
                          ) {
                            return "highlight-rental-lost-date";
                          } else if (isSameDay(date, rentalDate)) {
                            return "highlight-rental-date";
                          } else if (isSameDay(date, dueDate)) {
                            return "highlight-due-date";
                          } else if (isSameDay(date, lostDate)) {
                            return "highlight-lost-date";
                          }
                        }
                        return null;
                      }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-lg font-semibold text-gray-600 text-center">
              No lost books found!
            </p>
          )}
        </div>
      </div>
      <UserFooter />
    </>
  );
};

export default UserLostBooks;
