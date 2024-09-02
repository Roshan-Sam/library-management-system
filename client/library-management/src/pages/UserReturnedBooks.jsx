import { useState, useEffect } from "react";
import UserNav from "../components/user/UserNav";
import axios from "axios";
import Calendar from "react-calendar";
import { Badge } from "flowbite-react";
import UserFooter from "./UserFooter";
import Cookies from "js-cookie";

const UserReturnedBooks = () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [returnedBooks, setReturnedBooks] = useState([]);

  const fetchReturnedBooks = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}get-returned-books/${currentUser.id}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      setReturnedBooks(res.data);
    } catch (error) {
      console.error("Error fetching returned books:", error);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.id) {
      fetchReturnedBooks();
    }
  }, [currentUser.id]);

  const highlightDates = (returnedBook) => {
    const rentalDate = new Date(returnedBook.rental_date);
    const dueDate = new Date(returnedBook.due_date);
    const returnDate = new Date(returnedBook.return_date);
    const rDate = returnDate.setHours(0, 0, 0, 0);
    const dDate = dueDate.setHours(0, 0, 0, 0);
    const overdueDays = Math.max(
      0,
      Math.floor((rDate - dDate) / (24 * 60 * 60 * 1000))
    );
    const fine = overdueDays > 0 ? 6 + overdueDays * 1 : 0;
    let totalAmount = 0;
    if (fine > 0) {
      totalAmount = Math.floor(fine) + Math.floor(returnedBook.rental_amount);
    } else {
      totalAmount = Math.floor(returnedBook.rental_amount);
    }
    return { rentalDate, dueDate, returnDate, overdueDays, fine, totalAmount };
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
        <h2 className="text-center text-2xl font-bold mb-10">Books Returned</h2>
        <div className="flex flex-wrap justify-center w-full gap-4">
          {returnedBooks.length > 0 ? (
            returnedBooks.map((returnedBook) => {
              const {
                rentalDate,
                dueDate,
                returnDate,
                overdueDays,
                fine,
                totalAmount,
              } = highlightDates(returnedBook);
              return (
                <div
                  key={returnedBook.id}
                  className="p-4 rounded-lg mb-4 ring-2 ring-gray-100 shadow-md h-fit max-w-sm"
                >
                  <div className="flex items-end justify-between mb-4 gap-4">
                    <img
                      src={`${import.meta.env.VITE_API_IMAGE_URL}${
                        returnedBook.book_details.image
                      }`}
                      alt="Book Cover"
                      className="w-36 h-32 mr-4 object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-semibold">
                        {returnedBook.book_details.name}
                      </h3>
                      <p className="text-gray-700 text:lg font-semibold">
                        Price:{" "}
                        <span className="font-medium text-sm">
                          ₹{returnedBook.book_details.price}
                        </span>
                      </p>
                      <p className="text-gray-700 text:lg font-semibold">
                        Available Stock:{" "}
                        <span className="font-medium text-sm">
                          {returnedBook.book_details.stock}
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
                        {returnedBook.rental_period !== "month"
                          ? `${returnedBook.rental_period} days`
                          : `1 ${returnedBook.rental_period}`}
                      </Badge>
                    </p>
                    <p className="text-gray-900 text:lg font-semibold flex items-center">
                      Rental Date:{" "}
                      <Badge
                        className="inline-flex font-medium ml-auto"
                        color="pink"
                      >
                        {formatDate(returnedBook.rental_date)}
                      </Badge>
                    </p>
                    <p className="text-gray-900 text:lg font-semibold flex items-center">
                      Due Date:{" "}
                      <Badge
                        className="inline-flex font-medium ml-auto"
                        color="indigo"
                      >
                        {formatDate(returnedBook.due_date)}
                      </Badge>
                    </p>
                    <p className="text-gray-900 text:lg font-semibold flex items-center">
                      Returned Date:{" "}
                      <Badge
                        className="inline-flex font-medium ml-auto"
                        color="indigo"
                      >
                        {formatDate(returnedBook.return_date)}
                      </Badge>
                    </p>
                    <p className="text-gray-900 text:lg font-semibold flex items-center">
                      Rental Amount:{" "}
                      <Badge
                        className="inline-flex font-medium ml-auto py-0"
                        color="light"
                        size=""
                      >
                        ₹{returnedBook.rental_amount}
                      </Badge>
                    </p>
                    {overdueDays > 0 && (
                      <div className="mt-1 flex flex-col">
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
                    {fine > 0 ? (
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
                    ) : (
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
                            isSameDay(date, returnDate)
                          ) {
                            return "highlight-rental-return-date";
                          } else if (isSameDay(date, rentalDate)) {
                            return "highlight-rental-date";
                          } else if (isSameDay(date, dueDate)) {
                            return "highlight-due-date";
                          } else if (isSameDay(date, returnDate)) {
                            return "highlight-return-date";
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
              No returned books found!
            </p>
          )}
        </div>
      </div>
      <UserFooter />
    </>
  );
};

export default UserReturnedBooks;
