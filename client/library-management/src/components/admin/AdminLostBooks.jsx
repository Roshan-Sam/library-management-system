import { useState, useEffect } from "react";
import axios from "axios";
import FadeLoader from "react-spinners/FadeLoader";
import { Badge, Table } from "flowbite-react";
import "react-photo-view/dist/react-photo-view.css";
import { PhotoProvider, PhotoView } from "react-photo-view";
import Cookies from "js-cookie";

const AdminLostBooks = () => {
  const [allLostBooks, setAllLostBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllLostBooks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}fetch-books-lost/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        setAllLostBooks(res.data);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLostBooks();
  }, []);

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  const calculateFineDetails = (lostBook) => {
    let totalAmount = 0;
    if (lostBook.fine > 0) {
      totalAmount =
        Math.floor(lostBook.fine) + Math.floor(lostBook.book_details.price);
    }
    return { totalAmount };
  };

  return (
    <div className="w-full p-4 overflow-x-auto">
      <div className="mt-10 overflow-x-auto">
        <h1 className="font-semibold text-2xl">Books Lost</h1>
        {loading && (
          <div className="flex justify-center mt-10">
            <FadeLoader height={12} width={4} color="#5AB2FF" />
          </div>
        )}
        {allLostBooks.length > 0 ? (
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
                  <Table.HeadCell>Lost Date</Table.HeadCell>
                  <Table.HeadCell>Rental Period</Table.HeadCell>
                  <Table.HeadCell>Rental Amount</Table.HeadCell>
                  <Table.HeadCell>Lost</Table.HeadCell>
                  <Table.HeadCell>Fine Amount</Table.HeadCell>
                  <Table.HeadCell>Total Amount</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {allLostBooks.map((lostBook, index) => {
                    const { fine, totalAmount } =
                      calculateFineDetails(lostBook);
                    return (
                      <Table.Row
                        key={lostBook.id}
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
                                  lostBook.user_details.profile
                                }`}
                              >
                                <img
                                  src={`${import.meta.env.VITE_API_IMAGE_URL}${
                                    lostBook.user_details.profile
                                  }`}
                                  alt={lostBook.user_details.username}
                                  className="w-10 h-10 object-cover rounded-lg"
                                />
                              </PhotoView>
                            </PhotoProvider>
                            {lostBook.user_details.first_name}{" "}
                            {lostBook.user_details.last_name}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                          <PhotoProvider
                            bannerVisible={false}
                            speed={() => 300}
                          >
                            <PhotoView
                              src={`${import.meta.env.VITE_API_IMAGE_URL}${
                                lostBook.book_details.image
                              }`}
                            >
                              <img
                                src={`${import.meta.env.VITE_API_IMAGE_URL}${
                                  lostBook.book_details.image
                                }`}
                                alt={lostBook.book_details.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            </PhotoView>
                          </PhotoProvider>
                        </Table.Cell>
                        <Table.Cell className="text-slate-950 font-bold">
                          {lostBook.book_details.name}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge color="pink" size="" className="py-0">
                            ₹{lostBook.book_details.price}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell className="font-semibold text-stone-950">
                          {lostBook.book_details.stock}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge size="" className="py-0">
                            {formatDate(lostBook.rental_date)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge size="" color="purple" className="py-0">
                            {formatDate(lostBook.due_date)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge size="" color="green" className="py-0">
                            {formatDate(lostBook.lost_date)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell className="text-indigo-600 font-semibold">
                          {lostBook.rental_period} days
                        </Table.Cell>
                        <Table.Cell>
                          <Badge className="w-fit py-0" size="" color="red">
                            ₹{lostBook.rental_amount}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell className="font-semibold text-slate-950">
                          {lostBook.lost ? "Yes" : "No"}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge className="w-fit py-0" color="yellow" size="">
                            ₹{lostBook.fine}
                          </Badge>
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
            No lost books found!
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminLostBooks;
