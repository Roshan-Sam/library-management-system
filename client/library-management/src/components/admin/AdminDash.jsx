import axios from "axios";
import { useState, useEffect } from "react";
import { FaUsers } from "react-icons/fa";
import { IoBookSharp } from "react-icons/io5";
import { FcSalesPerformance } from "react-icons/fc";
import { GiBookshelf } from "react-icons/gi";
import { BiBookBookmark, BiBookOpen } from "react-icons/bi";
import { Table } from "flowbite-react";
import { FaBook } from "react-icons/fa";
import Cookies from "js-cookie";

const AdminDash = () => {
  const [totalUsers, setTotalUsers] = useState([]);
  const [totalOrders, setTotalOrders] = useState([]);
  const [totalBooks, setTotalBooks] = useState([]);
  const [totalRentedBooks, setTotalRentedBooks] = useState([]);
  const [totalReturnedBooks, setTotalReturnedBooks] = useState([]);
  const [totalLostBooks, setTotalLostBooks] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalBooksSold, setTotalBooksSold] = useState(0);

  const fetchTotalUsers = async () => {
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
        setTotalUsers(res.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchTotalOrders = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}get-all-orders/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        setTotalOrders(res.data);
        const sales = res.data.reduce(
          (sum, order) => sum + parseFloat(order.total_amount),
          0
        );
        setTotalSales(sales);

        const soldBooks = res.data.reduce((total, order) => {
          return (
            total +
            order.order_items.reduce((sum, item) => sum + item.quantity, 0)
          );
        }, 0);

        setTotalBooksSold(soldBooks);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTotalBooks = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}books/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (response.status === 200) {
        setTotalBooks(response.data.books);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const fetchTotalRentedBooks = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}fetch-books-rented/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        setTotalRentedBooks(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTotalReturnedBooks = async () => {
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
        setTotalReturnedBooks(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTotalLostBooks = async () => {
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
        setTotalLostBooks(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTotalUsers();
    fetchTotalOrders();
    fetchTotalBooks();
    fetchTotalRentedBooks();
    fetchTotalReturnedBooks();
    fetchTotalLostBooks();
  }, []);

  const currentDate = new Date().toISOString().split("T")[0];
  const currentDateOrders = totalOrders.filter(
    (order) => order.created_at.split("T")[0] === currentDate
  );

  return (
    <div className="w-full p-4 overflow-x-auto">
      <div className="px-10 py-10 overflow-x-auto">
        <div className="flex flex-wrap gap-4 justify-center mx-auto">
          <div className="rounded-lg border border-gray-100 bg-white p-6">
            <div className="flex items-center justify-between max-w-3xl gap-28">
              <div className="ml-0">
                <p className="text-sm text-gray-500">Users</p>

                <p className="text-2xl font-medium text-gray-900">
                  {totalUsers.length}
                </p>
              </div>

              <span className="rounded-full bg-blue-100 p-3 text-blue-600 mr-0">
                <FaUsers className="h-8 w-8" />
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-6">
            <div className="flex items-center justify-between max-w-3xl gap-28">
              <div className="ml-0">
                <p className="text-sm text-gray-500">Books</p>

                <p className="text-2xl font-medium text-gray-900">
                  {totalBooks.length}
                </p>
              </div>

              <span className="rounded-full bg-pink-100 p-3 text-pink-600 mr-0">
                <IoBookSharp className="h-8 w-8" />
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-6">
            <div className="flex items-center justify-between max-w-3xl gap-28">
              <div className="ml-0">
                <p className="text-sm text-gray-500">Total sales</p>

                <p className="text-2xl font-medium text-gray-900">
                  ₹ {totalSales.toFixed(2)}
                </p>
              </div>

              <span className="rounded-full bg-yellow-100 p-3 text-yellow-600 mr-0">
                <FcSalesPerformance className="h-8 w-8" />
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-6">
            <div className="flex items-center justify-between max-w-3xl gap-28">
              <div className="ml-0">
                <p className="text-sm text-gray-500">Rented Books</p>

                <p className="text-2xl font-medium text-gray-900">
                  {totalRentedBooks.length}
                </p>
              </div>

              <span className="rounded-full bg-green-100 p-3 text-green-600 mr-0">
                <GiBookshelf className="h-8 w-8" />
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-6">
            <div className="flex items-center justify-between max-w-3xl gap-28">
              <div className="ml-0">
                <p className="text-sm text-gray-500">Returned Books</p>

                <p className="text-2xl font-medium text-gray-900">
                  {totalReturnedBooks.length}
                </p>
              </div>

              <span className="rounded-full bg-purple-100 p-3 text-purple-600 mr-0">
                <BiBookBookmark className="h-8 w-8" />
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-6">
            <div className="flex items-center justify-between max-w-3xl gap-28">
              <div className="ml-0">
                <p className="text-sm text-gray-500">Lost Books</p>

                <p className="text-2xl font-medium text-gray-900">
                  {totalLostBooks.length}
                </p>
              </div>

              <span className="rounded-full bg-red-100 p-3 text-red-600 mr-0">
                <BiBookOpen className="h-8 w-8" />
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-6">
            <div className="flex items-center justify-between max-w-3xl gap-28">
              <div className="ml-0">
                <p className="text-sm text-gray-500">Total Books Sold</p>
                <p className="text-2xl font-medium text-gray-900">
                  {totalBooksSold}
                </p>
              </div>
              <span className="rounded-full bg-green-100 p-3 text-green-600 mr-0">
                <FaBook className="h-8 w-8" />
              </span>
            </div>
          </div>
        </div>
        {currentDateOrders.length > 0 ? (
          <div className="overflow-x-auto mt-20">
            <p className="text-gray-700 font-medium mb-6">Recent Orders</p>
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>No</Table.HeadCell>
                <Table.HeadCell>User</Table.HeadCell>
                <Table.HeadCell>Total Books Purchased</Table.HeadCell>
                <Table.HeadCell>Total Amount</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {currentDateOrders.map((order, index) => (
                  <Table.Row
                    key={order.id}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Table.Cell>{index + 1}</Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <img
                          src={`${import.meta.env.VITE_API_IMAGE_URL}${
                            order.user_details.profile
                          }`}
                          alt={order.user_details.username}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        {order.user_details.first_name}{" "}
                        {order.user_details.last_name}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      {order.order_items.reduce(
                        (total, item) => total + item.quantity,
                        0
                      )}
                    </Table.Cell>
                    <Table.Cell>₹ {order.total_amount}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        ) : (
          <p className="text-gray-700 text-sm mt-8 font-medium">
            No Recent Orders
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminDash;
