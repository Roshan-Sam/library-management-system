import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { MdOutlineMenuBook } from "react-icons/md";
import { useLocation } from "react-router-dom";
import { Rate } from "antd";
import Cookies from "js-cookie";

const AdminEditBook = () => {
  const [bookId, setBookId] = useState("");
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    author: "",
    publisher_id: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    image: null,
  });
  const [displayImage, setDisplayImage] = useState("");
  const [bookRatings, setBookRatings] = useState([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const bidFromUrl = urlParams.get("bid");
    if (bidFromUrl) {
      setBookId(bidFromUrl);
      fetchBookDetails(bidFromUrl);
    }
  }, [location.search]);

  const fetchBookDetails = async (id) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}book/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        const data = await res.data;
        setFormData({
          name: data.name,
          author: data.author,
          publisher_id: data.publisher_id,
          price: data.price,
          stock: data.stock,
          category: data.category,
          description: data.description,
        });
        setDisplayImage(data.image);
        setBookRatings(data.book_ratings);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        formDataToSend.append(key, formData[key]);
      }
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}update-book/${bookId}/`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (response.status === 200) {
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-xs w-full bg-white shadow-md rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-center gap-2">
                <MdOutlineMenuBook />
                <p className="text-sm">Book updated successfully!</p>
              </div>
            </div>
          </div>
        ));
        const data = await response.data;
        setFormData({
          name: data.name,
          author: data.author,
          publisher_id: data.publisher_id,
          price: data.price,
          stock: data.stock,
          category: data.category,
          description: data.description,
        });
        setDisplayImage(data.image);
        document.getElementById("image").value = "";
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const calculateAverageRating = () => {
    if (!bookRatings || bookRatings.length === 0) return 0;
    const total = bookRatings.reduce((sum, rating) => sum + rating.rating, 0);
    return parseFloat((total / bookRatings.length).toFixed(1));
  };

  return (
    <div className="w-full p-4">
      <div className="mt-10">
        <h1 className="font-semibold text-2xl">Update A Book!</h1>
        <div className="px-4 mt-6">
          <form
            className="flex flex-col md:gap-4 gap-2"
            onSubmit={handleSubmit}
          >
            <div className="flex justify-between md:gap-10 gap-2 md:flex-row flex-col">
              <div className="w-full">
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Book name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Book name"
                  required
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="author"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Book Author
                </label>
                <input
                  type="text"
                  id="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Book author"
                  required
                />
              </div>
            </div>
            <div className="flex justify-between md:gap-10 gap-2 md:flex-row flex-col">
              <div className="w-full">
                <label
                  htmlFor="price"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Book price
                </label>
                <input
                  type="number"
                  id="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Book price"
                  required
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="stock"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Book stock
                </label>
                <input
                  type="number"
                  id="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Book stock"
                  required
                />
              </div>
            </div>
            <div className="flex justify-between md:gap-10 gap-2 md:flex-row flex-col">
              <div className="w-full">
                <label
                  htmlFor="category"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Choose book category
                </label>
                <select
                  required
                  id="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
                  <option value="">Choose category</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Science Fiction">Science Fiction</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Biography">Biography</option>
                  <option value="Self-Help">Self-Help</option>
                  <option value="Romance">Romance</option>
                  <option value="History">History</option>
                  <option value="Children's">Children's</option>
                </select>
              </div>
              <div className="w-full">
                <label
                  htmlFor="image"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Upload book image
                </label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                />
              </div>
            </div>
            <div>
              {displayImage && (
                <img
                  src={`${import.meta.env.VITE_API_IMAGE_URL}${displayImage}`}
                  alt="image"
                  className="w-full h-96 object-cover"
                />
              )}
            </div>
            <div className="flex max-w-3xl">
              <div className="w-full">
                <label
                  htmlFor="publisher_id"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Publisher
                </label>
                <input
                  type="text"
                  id="publisher_id"
                  value={formData.publisher_id}
                  onChange={handleChange}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Publisher"
                  required
                />
              </div>
            </div>
            <div className="w-full">
              <label
                htmlFor="description"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Book description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="block p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Type short description..."
                required
              ></textarea>
            </div>
            <div className="w-full">
              <button
                type="submit"
                className="w-full py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          className: "animate-enter animate-leave",
          duration: 500,
        }}
      />
      <div className="mt-6">
        <label className="block mb-2 text-lg font-medium text-gray-900 dark:text-white">
          Average Rating
        </label>
        <div className="flex items-center gap-2">
          <Rate
            allowHalf
            disabled
            value={calculateAverageRating()}
            className="text-base"
          />
          <span className="font-medium text-base ml-1">
            {calculateAverageRating()} Stars ({bookRatings.length} Ratings)
          </span>
        </div>
      </div>
      <div className="mt-6">
        <h1 className="font-medium text-lg">Customer Ratings:</h1>
        <div className="flex flex-col mt-4">
          {bookRatings && bookRatings.length > 0 ? (
            bookRatings.map((rating, index) => (
              <div
                key={index}
                className="flex gap-2 pb-4 mb-4 flex-col ml-0 w-full"
              >
                <div className="flex items-center ml-0 gap-2">
                  <img
                    src={`${import.meta.env.VITE_API_IMAGE_URL}${
                      rating.user.profile
                    }`}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-md font-semibold font-sans">
                    {rating.user.username}
                  </span>
                </div>
                <div className="ml-0">
                  <div className="flex items-center gap-2">
                    <Rate
                      allowHalf
                      disabled
                      value={rating.rating}
                      className="text-base"
                    />
                    <span className="font-sans  text-sm text-gray-600">
                      {rating.rating.toFixed(0)}
                    </span>
                  </div>
                  <p className="text-gray-600 font-sans text-sm">
                    Rated at:{" "}
                    {new Date(rating.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="font-sans text-gray-600 text-sm">No ratings yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEditBook;
