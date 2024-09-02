import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import FadeLoader from "react-spinners/FadeLoader";
import { Badge, Table } from "flowbite-react";
import Cookies from "js-cookie";

const UserPurchases = () => {
  const location = useLocation();
  const [userId, setUserId] = useState();
  const [userOrders, setUserOrders] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const userIdFromUrl = urlParams.get("userId");
    if (userIdFromUrl) {
      setUserId(userIdFromUrl);
      fetchUserOrders(userIdFromUrl);
    }
  }, [location.search]);

  const fetchUserOrders = async (userId) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}get-user-orders/${userId}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        setUserOrders(res.data);
      }
      const userRes = await axios.get(
        `${import.meta.env.VITE_API_URL}fetch-user-details/${userId}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (userRes.status === 200) {
        setUserDetails(userRes.data);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  return (
    <div className="w-full p-4 overflow-x-auto">
      <div className="mt-10 overflow-x-auto">
        {userDetails.username && (
          <h1 className="font-semibold text-2xl">
            {capitalizeFirstLetter(userDetails.username)}'s Purchases
          </h1>
        )}
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
                        <ul className="space-y-1">
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
                        <div className="flex flex-col gap-1">
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
            No order placed yet!
          </p>
        )}
      </div>
    </div>
  );
};

export default UserPurchases;
