import axios from "axios";
import { useEffect, useState } from "react";
import FadeLoader from "react-spinners/FadeLoader";
import { Badge, Table, Popover } from "flowbite-react";
import Cookies from "js-cookie";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
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
        setOrders(res.data);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId) => {
    setLoading(true);
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}delete-order/${orderId}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        setOrders(orders.filter((order) => order.id !== orderId));
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}update-order/${orderId}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: "completed" } : order
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full p-4 overflow-x-auto">
      <div className="mt-10 overflow-x-auto">
        <h1 className="font-semibold text-2xl">Orders</h1>
        {loading && (
          <div className="flex justify-center mt-10">
            <FadeLoader height={12} width={4} color="#5AB2FF" />
          </div>
        )}
        {orders.length > 0 ? (
          <div className="px-4 mt-6 overflow-x-auto">
            <div className="overflow-x-auto border border-gray-100 overflow-y-auto">
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>No</Table.HeadCell>
                  <Table.HeadCell>User</Table.HeadCell>
                  <Table.HeadCell>Ordered Date</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell>Order Details</Table.HeadCell>
                  <Table.HeadCell>Address</Table.HeadCell>
                  <Table.HeadCell>Total Amount</Table.HeadCell>
                  <Table.HeadCell>Action</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {orders.map((order, index) => (
                    <Table.Row key={order.id} className="bg-white">
                      <Table.Cell>{index + 1}</Table.Cell>
                      <Table.Cell>
                        {order.user_details.first_name}{" "}
                        {order.user_details.last_name}
                      </Table.Cell>
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
                      <Table.Cell className="text-sm text-red-600 font-semibold">
                        <div className="flex gap-4">
                          <Popover
                            arrow={false}
                            placement="top"
                            trigger="hover"
                            className="border-none"
                            content={
                              <button
                                className="btn btn-ghost focus:outline-none btn-xs hover:bg-transparent"
                                onClick={() => handleCompleteOrder(order.id)}
                              >
                                <Badge
                                  color="success"
                                  className="w-full h-full text-sm"
                                >
                                  Complete
                                </Badge>
                              </button>
                            }
                          >
                            <a className="cursor-pointer font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                              Edit status
                            </a>
                          </Popover>
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </div>
        ) : (
          <p className="text-lg font-semibold text-gray-600 text-center mt-10">
            {!loading ? "No orders placed yet!" : ""}
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
