import { useState, useEffect } from "react";
import axios from "axios";
import FadeLoader from "react-spinners/FadeLoader";
import { Table } from "flowbite-react";
import "react-photo-view/dist/react-photo-view.css";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { Badge } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchUsers = async (query = "") => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }active-verified-nonstaff-users/?search=${query}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        setLoading(false);
        setUsers(res.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchTerm(query);
    fetchUsers(query);
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const res = await axios.delete(
          `${import.meta.env.VITE_API_URL}delete-user/${userId}/`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          }
        );
        if (res.status === 200) {
          setUsers(users.filter((user) => user.id !== userId));
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  return (
    <div className="w-full p-4 overflow-x-auto">
      <div className="mt-10 overflow-x-auto">
        <h1 className="font-semibold text-2xl">Users</h1>
        <div className="mt-4 mb-6 px-10 max-w-lg">
          <input
            type="text"
            placeholder="Search by username"
            value={searchTerm}
            onChange={handleSearch}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>
        {loading && (
          <div className="flex justify-center mt-10">
            <FadeLoader height={12} width={4} color="#5AB2FF" />
          </div>
        )}
        {users.length > 0 ? (
          <div className="px-4 mt-6 overflow-x-auto">
            <div className="overflow-x-auto border border-gray-100">
              <Table>
                <Table.Head>
                  <Table.HeadCell>No</Table.HeadCell>
                  <Table.HeadCell>Profile</Table.HeadCell>
                  <Table.HeadCell>Username</Table.HeadCell>
                  <Table.HeadCell>Email</Table.HeadCell>
                  <Table.HeadCell>Fisrt Name</Table.HeadCell>
                  <Table.HeadCell>Last Name</Table.HeadCell>
                  <Table.HeadCell>Phone</Table.HeadCell>
                  <Table.HeadCell>Address</Table.HeadCell>
                  <Table.HeadCell>Date Joined</Table.HeadCell>
                  <Table.HeadCell>Is Active</Table.HeadCell>
                  <Table.HeadCell>Book Rentals</Table.HeadCell>
                  <Table.HeadCell>Book Returns</Table.HeadCell>
                  <Table.HeadCell>Books Lost</Table.HeadCell>
                  <Table.HeadCell>Book Purchases</Table.HeadCell>
                  <Table.HeadCell>Action</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {users.map((user, index) => (
                    <Table.Row
                      key={user.id}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {index + 1}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        <PhotoProvider bannerVisible={false} speed={() => 300}>
                          <PhotoView
                            src={`${import.meta.env.VITE_API_IMAGE_URL}${
                              user.profile
                            }`}
                          >
                            <img
                              src={`${import.meta.env.VITE_API_IMAGE_URL}${
                                user.profile
                              }`}
                              alt={user.username}
                              className="w-10 h-10 object-cover rounded-full"
                            />
                          </PhotoView>
                        </PhotoProvider>
                      </Table.Cell>
                      <Table.Cell>{user.username}</Table.Cell>
                      <Table.Cell>{user.email}</Table.Cell>
                      <Table.Cell>{user.first_name}</Table.Cell>
                      <Table.Cell>{user.last_name}</Table.Cell>
                      <Table.Cell>{user.phone}</Table.Cell>
                      <Table.Cell>
                        <div className="flex flex-col min-w-max gap-1">
                          <p className="font-semibold text-gray-800">
                            State:{" "}
                            <span className="font-normal text-gray-500">
                              {user.state}
                            </span>
                          </p>
                          <p className="font-semibold text-gray-800">
                            City:{" "}
                            <span className="font-normal text-gray-500">
                              {user.city}
                            </span>
                          </p>
                          <p className="font-semibold text-gray-800">
                            Street:{" "}
                            <span className="font-normal text-gray-500">
                              {user.street}
                            </span>
                          </p>
                          <p className="font-semibold text-gray-800">
                            House name:{" "}
                            <span className="font-normal text-gray-500">
                              {user.house_name}
                            </span>
                          </p>
                          <p className="font-semibold text-gray-800">
                            Pincode:{" "}
                            <span className="font-normal text-gray-500">
                              {user.pincode}
                            </span>
                          </p>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        {new Date(user.date_joined).toLocaleDateString()}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          className="w-fit"
                          color={user.is_active ? "success" : "failure"}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Link
                          to={`/admin-dash?tab=user-rentals&userId=${user.id}`}
                          className="cursor-pointer font-medium text-cyan-600 hover:underline dark:text-cyan-500"
                        >
                          View Rentals
                        </Link>
                      </Table.Cell>
                      <Table.Cell>
                        <Link
                          to={`/admin-dash?tab=user-books-returns&userId=${user.id}`}
                          className="cursor-pointer font-medium text-cyan-600 hover:underline dark:text-cyan-500"
                        >
                          View Books Returns
                        </Link>
                      </Table.Cell>
                      <Table.Cell>
                        <Link
                          to={`/admin-dash?tab=user-books-lost&userId=${user.id}`}
                          className="cursor-pointer font-medium text-cyan-600 hover:underline dark:text-cyan-500"
                        >
                          View Lost Books
                        </Link>
                      </Table.Cell>
                      <Table.Cell>
                        <Link
                          to={`/admin-dash?tab=user-purchases&userId=${user.id}`}
                          className="cursor-pointer font-medium text-cyan-600 hover:underline dark:text-cyan-500"
                        >
                          View Purchases
                        </Link>
                      </Table.Cell>
                      <Table.Cell>
                        <a
                          onClick={() => handleDelete(user.id)}
                          className="cursor-pointer font-medium text-red-600 hover:underline dark:text-red-500"
                        >
                          Delete
                        </a>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </div>
        ) : (
          <p className="text-lg font-semibold text-gray-600 text-center mt-10">
            No users found!
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
