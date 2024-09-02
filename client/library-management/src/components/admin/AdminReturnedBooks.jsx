import axios from "axios";
import { useEffect, useState } from "react";
import FadeLoader from "react-spinners/FadeLoader";
import { Badge, Table } from "flowbite-react";
import "react-photo-view/dist/react-photo-view.css";
import { PhotoProvider, PhotoView } from "react-photo-view";
import Cookies from "js-cookie";

const AdminReturnedBooks = () => {
  const [allBooksReturns, setAllBooksReturnes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllBooksReturns = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}fetch-books-returned/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        setAllBooksReturnes(res.data);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBooksReturns();
  }, []);

  const calculateFineDetails = (bookReturn) => {
    const dueDate = new Date(bookReturn.due_date);
    const returnDate = new Date(bookReturn.return_date);
    const rDate = returnDate.setHours(0, 0, 0, 0);
    const dDate = dueDate.setHours(0, 0, 0, 0);
    const overdueDays = Math.max(
      0,
      Math.floor((rDate - dDate) / (24 * 60 * 60 * 1000))
    );
    const fine = overdueDays > 0 ? 6 + overdueDays * 1 : 0;
    let totalAmount = 0;
    if (fine > 0) {
      totalAmount = Math.floor(fine) + Math.floor(bookReturn.rental_amount);
    } else {
      totalAmount = Math.floor(bookReturn.rental_amount);
    }
    return { overdueDays, fine, totalAmount };
  };

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  return (
    <div className="w-full p-4 overflow-x-auto">
      <div className="mt-10 overflow-x-auto">
        <h1 className="font-semibold text-2xl">Books Returned</h1>
        {loading && (
          <div className="flex justify-center mt-10">
            <FadeLoader height={12} width={4} color="#5AB2FF" />
          </div>
        )}
        {allBooksReturns.length > 0 ? (
          <div className="px-4 mt-6 overflow-x-auto">
            <div className="overflow-x-auto border border-gray-100">
              <Table>
                <Table.Head>
                  <Table.HeadCell>No</Table.HeadCell>
                  <Table.HeadCell>User</Table.HeadCell>
                  <Table.HeadCell>Book Image</Table.HeadCell>
                  <Table.HeadCell>Book Name</Table.HeadCell>
                  <Table.HeadCell>Book Price</Table.HeadCell>
                  <Table.HeadCell>Available Stock</Table.HeadCell>
                  <Table.HeadCell>Rental Date</Table.HeadCell>
                  <Table.HeadCell>Due Date</Table.HeadCell>
                  <Table.HeadCell>Return Date</Table.HeadCell>
                  <Table.HeadCell>Rental Period</Table.HeadCell>
                  <Table.HeadCell>Rental Amount</Table.HeadCell>
                  <Table.HeadCell>Returned</Table.HeadCell>
                  <Table.HeadCell>Fine Amount</Table.HeadCell>
                  <Table.HeadCell>Overdue Days</Table.HeadCell>
                  <Table.HeadCell>Total Amount</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {allBooksReturns.map((bookReturn, index) => {
                    const { overdueDays, fine, totalAmount } =
                      calculateFineDetails(bookReturn);
                    return (
                      <Table.Row
                        key={bookReturn.id}
                        className="bg-white dark:border-gray-700 dark:bg-gray-800"
                      >
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                          {index + 1}
                        </Table.Cell>
                        <Table.Cell className="font-semibold text-stone-950">
                          <div className="flex items-center gap-2 pr-6 min-w-max">
                            <PhotoProvider
                              bannerVisible={false}
                              speed={() => 300}
                            >
                              <PhotoView
                                src={`${import.meta.env.VITE_API_IMAGE_URL}${
                                  bookReturn.user_details.profile
                                }`}
                              >
                                <img
                                  src={`${import.meta.env.VITE_API_IMAGE_URL}${
                                    bookReturn.user_details.profile
                                  }`}
                                  alt={bookReturn.user_details.username}
                                  className="w-10 h-10 object-cover rounded-lg"
                                />
                              </PhotoView>
                            </PhotoProvider>
                            {bookReturn.user_details.first_name}{" "}
                            {bookReturn.user_details.last_name}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                          <PhotoProvider
                            bannerVisible={false}
                            speed={() => 300}
                          >
                            <PhotoView
                              src={`${import.meta.env.VITE_API_IMAGE_URL}${
                                bookReturn.book_details.image
                              }`}
                            >
                              <img
                                src={`${import.meta.env.VITE_API_IMAGE_URL}${
                                  bookReturn.book_details.image
                                }`}
                                alt={bookReturn.book_details.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            </PhotoView>
                          </PhotoProvider>
                        </Table.Cell>
                        <Table.Cell className="text-slate-950 font-bold">
                          {bookReturn.book_details.name}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge color="pink" size="" className="py-0">
                            ₹{bookReturn.book_details.price}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell className="font-semibold text-stone-950">
                          {bookReturn.book_details.stock}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge size="" className="py-0">
                            {formatDate(bookReturn.rental_date)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge size="" color="purple" className="py-0">
                            {formatDate(bookReturn.due_date)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge size="" color="green" className="py-0">
                            {formatDate(bookReturn.return_date)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell className="text-indigo-600 font-semibold">
                          {bookReturn.rental_period} days
                        </Table.Cell>
                        <Table.Cell>
                          <Badge className="w-fit py-0" size="" color="red">
                            ₹{bookReturn.rental_amount}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell className="font-semibold text-slate-950">
                          {bookReturn.returned ? "Yes" : "No"}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge className="w-fit py-0" color="yellow" size="">
                            ₹{fine}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell className="font-semibold text-sky-600">
                          {overdueDays} days
                        </Table.Cell>
                        <Table.Cell className="font-semibold text-red-600">
                          ₹{totalAmount}
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            </div>
          </div>
        ) : (
          <p className="text-lg font-semibold text-gray-600 text-center mt-10">
            No returned rentals found!
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminReturnedBooks;
