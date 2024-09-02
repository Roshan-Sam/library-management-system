import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import FadeLoader from "react-spinners/FadeLoader";
import { Badge, Table } from "flowbite-react";
import "react-photo-view/dist/react-photo-view.css";
import { PhotoProvider, PhotoView } from "react-photo-view";
import Cookies from "js-cookie";

const UserRentals = () => {
  const location = useLocation();
  const [userId, setUserId] = useState();
  const [userRentals, setUserRentals] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const userIdFromUrl = urlParams.get("userId");
    if (userIdFromUrl) {
      setUserId(userIdFromUrl);
      fetchUserRentals(userIdFromUrl);
    }
  }, [location.search]);

  const fetchUserRentals = async (userId) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}fetch-user-rentals/${userId}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        setUserRentals(res.data);
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

  const calculateFineDetails = (rental) => {
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
    return { overdueDays, fine, totalAmount };
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
            {capitalizeFirstLetter(userDetails.username)}'s Rentals
          </h1>
        )}
        {loading && (
          <div className="flex justify-center mt-10">
            <FadeLoader height={12} width={4} color="#5AB2FF" />
          </div>
        )}
        {userRentals.length > 0 ? (
          <div className="px-4 mt-6 overflow-x-auto">
            <div className="overflow-x-auto border border-gray-100">
              <Table>
                <Table.Head>
                  <Table.HeadCell>No</Table.HeadCell>
                  <Table.HeadCell>Book Image</Table.HeadCell>
                  <Table.HeadCell>Book Name</Table.HeadCell>
                  <Table.HeadCell>Book Price</Table.HeadCell>
                  <Table.HeadCell>Available Stock</Table.HeadCell>
                  <Table.HeadCell>Rental Date</Table.HeadCell>
                  <Table.HeadCell>Due Date</Table.HeadCell>
                  <Table.HeadCell>Rental Period</Table.HeadCell>
                  <Table.HeadCell>Rental Amount</Table.HeadCell>
                  <Table.HeadCell>Returned</Table.HeadCell>
                  <Table.HeadCell>Fine Amount</Table.HeadCell>
                  <Table.HeadCell>Overdue Days</Table.HeadCell>
                  <Table.HeadCell>Total Amount</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {userRentals.map((rental, index) => {
                    const { overdueDays, fine, totalAmount } =
                      calculateFineDetails(rental);
                    return (
                      <Table.Row
                        key={rental.id}
                        className="bg-white dark:border-gray-700 dark:bg-gray-800"
                      >
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                          {index + 1}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                          <PhotoProvider
                            bannerVisible={false}
                            speed={() => 300}
                          >
                            <PhotoView
                              src={`${import.meta.env.VITE_API_IMAGE_URL}${
                                rental.book_details.image
                              }`}
                            >
                              <img
                                src={`${import.meta.env.VITE_API_IMAGE_URL}${
                                  rental.book_details.image
                                }`}
                                alt={rental.book_details.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            </PhotoView>
                          </PhotoProvider>
                        </Table.Cell>
                        <Table.Cell className="text-slate-950 font-bold">
                          {rental.book_details.name}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge color="pink" size="" className="py-0">
                            ₹{rental.book_details.price}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell className="font-semibold text-stone-950">
                          {rental.book_details.stock}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge size="" className="py-0">
                            {formatDate(rental.rental_date)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge size="" color="purple" className="py-0">
                            {formatDate(rental.due_date)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell className="text-indigo-600 font-semibold">
                          {rental.rental_period} days
                        </Table.Cell>
                        <Table.Cell>
                          <Badge className="w-fit py-0" size="" color="red">
                            ₹{rental.rental_amount}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell className="font-semibold text-slate-950">
                          {rental.returned ? "Yes" : "No"}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge className="w-fit py-0" color="yellow" size="">
                            ₹{fine}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell className="font-semibold text-teal-500">
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
            No rentals found!
          </p>
        )}
      </div>
    </div>
  );
};

export default UserRentals;
