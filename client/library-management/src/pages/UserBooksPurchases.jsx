import axios from "axios";
import { useEffect, useState } from "react";
import FadeLoader from "react-spinners/FadeLoader";
import { Badge, Table } from "flowbite-react";
import UserNav from "../components/user/UserNav";
import UserFooter from "./UserFooter";
import Cookies from "js-cookie";

const UserBooksPurchases = () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserOrders();
  }, [currentUser.id]);

  const fetchUserOrders = async (userId) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}get-user-orders/${currentUser.id}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        setUserOrders(res.data);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  return (
    <>
      <UserNav />
      <div className="w-full overflow-x-auto h-screen">
        <div className="overflow-x-auto mx-auto py-10 px-10">
          <h1 className="text-center text-2xl font-bold">Books Purchases</h1>
          {loading && (
            <div className="flex justify-center mt-10">
              <FadeLoader height={12} width={4} color="#5AB2FF" />
            </div>
          )}
          {userOrders.length > 0 ? (
            <div className="px-4 mt-6 overflow-x-auto">
              <div className="overflow-x-auto border border-gray-100 overflow-y-auto">
                <Table hoverable>
                  <Table.Head>
                    <Table.HeadCell>No</Table.HeadCell>
                    <Table.HeadCell>Ordered Date</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Order Details</Table.HeadCell>
                    <Table.HeadCell>Address</Table.HeadCell>
                    <Table.HeadCell>Total Amount</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {userOrders.map((order, index) => (
                      <Table.Row key={order.id} className="bg-white">
                        <Table.Cell>{index + 1}</Table.Cell>
                        <Table.Cell>{formatDate(order.created_at)}</Table.Cell>
                        <Table.Cell>
                          <Badge className="w-fit" color="purple">
                            {order.status}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <ul className="space-y-1 min-w-max">
                            {order.order_items.map((item) => (
                              <li key={item.id}>
                                <p className="font-semibold text-gray-800">
                                  Book name:{" "}
                                  <span className="font-normal text-gray-500">
                                    {item.book_details.name}
                                  </span>
                                </p>
                                <p className="font-semibold text-gray-800">
                                  Quantity:{" "}
                                  <span className="font-normal text-gray-500">
                                    {item.quantity}
                                  </span>
                                </p>
                                <p className="font-semibold text-gray-800">
                                  Price:{" "}
                                  <span className="font-normal text-gray-500">
                                    ₹{item.book_details.price}
                                  </span>
                                </p>
                              </li>
                            ))}
                          </ul>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex flex-col gap-1 min-w-max">
                            <p className="font-semibold text-gray-800">
                              State:{" "}
                              <span className="font-normal text-gray-500">
                                {order.state}
                              </span>
                            </p>
                            <p className="font-semibold text-gray-800">
                              City:{" "}
                              <span className="font-normal text-gray-500">
                                {order.city}
                              </span>
                            </p>
                            <p className="font-semibold text-gray-800">
                              Street:{" "}
                              <span className="font-normal text-gray-500">
                                {order.street}
                              </span>
                            </p>
                            <p className="font-semibold text-gray-800">
                              House name:{" "}
                              <span className="font-normal text-gray-500">
                                {order.house_name}
                              </span>
                            </p>
                            <p className="font-semibold text-gray-800">
                              Pincode:{" "}
                              <span className="font-normal text-gray-500">
                                {order.pincode}
                              </span>
                            </p>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="text-base text-red-600 font-semibold">
                          ₹{order.total_amount}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            </div>
          ) : (
            <p className="text-lg font-semibold text-gray-600 text-center mt-10">
              No purchases yet!
            </p>
          )}
        </div>
      </div>
      <UserFooter />
    </>
  );
};

export default UserBooksPurchases;
