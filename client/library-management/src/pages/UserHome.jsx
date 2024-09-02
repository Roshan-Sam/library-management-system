import UserNav from "../components/user/UserNav";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay } from "swiper/modules";
import { FaSearch } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Rate } from "antd";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import UserFooter from "./UserFooter";
import Cookies from "js-cookie";

const UserHome = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const [recentBooks, setRecentBooks] = useState([]);
  const [topRatedBooks, setTopRatedBooks] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("searchTerm", searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/books?${searchQuery}`);
  };

  const fetchBooks = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}books/?limit=4`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        setRecentBooks(res.data.books);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTopRatedBooks = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}books/?topRated=true`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        setTopRatedBooks(res.data.top_rated_books);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchTopRatedBooks();
  }, []);

  const calculateAverageRating = (ratings) => {
    if (ratings.length === 0) return 0;
    const total = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    return parseFloat((total / ratings.length).toFixed(1));
  };

  return (
    <>
      <UserNav />
      <div className="px-4 py-10">
        <div className="max-w-screen-2xl mx-auto relative">
          <div className="absolute inset-x-0 top-[550px] z-10 flex justify-center">
            <form className="relative w-2/3" onSubmit={handleSubmit}>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
                placeholder="Search books by book name, author name ..."
                className="w-full p-2 pl-4 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center justify-center  bg-blue-500 rounded-lg w-12"
              >
                <FaSearch className="text-gray-50" />
              </button>
            </form>
          </div>
          <Swiper
            modules={[EffectFade, Autoplay]}
            effect={"fade"}
            autoplay={{
              delay: 1500,
              disableOnInteraction: false,
            }}
          >
            <SwiperSlide>
              <img
                src="joe-ciciarelli-BVNmFNShq6U-unsplash.jpg"
                className="w-full h-[750px] object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 p-4 text-center">
                <h1 className="text-white text-4xl font-bold mb-4">
                  Welcome to Our Library
                </h1>
                <p className="text-white text-lg max-w-2xl">
                  Discover an extensive collection of books, journals, and
                  digital resources to cater to your literary and research
                  needs. Our library offers a tranquil environment for reading
                  and learning.
                </p>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <img
                src="caleb-woods-fulXJYIvRi8-unsplash.jpg"
                className="w-full h-[750px] object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 p-4 text-center">
                <h1 className="text-white text-4xl font-bold mb-4">
                  Explore New Worlds
                </h1>
                <p className="text-white text-lg max-w-2xl">
                  Step into a realm of imagination and adventure with our
                  diverse selection of fiction and non-fiction books. From
                  timeless classics to contemporary bestsellers, there's
                  something for everyone.
                </p>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <img
                src="matthew-feeney-Nwkh-n6l25w-unsplash.jpg"
                className="w-full h-[750px] object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 p-4 text-center">
                <h1 className="text-white text-4xl font-bold mb-4">
                  Unleash Your Imagination
                </h1>
                <p className="text-white text-lg max-w-2xl">
                  Our library is a gateway to knowledge and creativity. Engage
                  with our curated collections, participate in community events,
                  and let your imagination soar.
                </p>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>

        <div className="mt-10">
          <div className="text-center mb-10 mx-auto">
            <h1 className="text-3xl font-bold">LATEST BOOKS</h1>
          </div>
          <div className="flex animated fadeIn faster flex-wrap mx-auto max-w-screen-2xl justify-center gap-x-6 gap-y-6">
            {recentBooks.map((book) => (
              <div
                className="block rounded-lg bg-white w-72 shadow-sm-light group"
                key={book.id}
              >
                <div
                  className=" relative overflow-hidden bg-cover bg-no-repeat w-fit mx-auto group-hover:scale-110 group-hover:-translate-y-1 duration-300"
                  data-te-ripple-init
                  data-te-ripple-color="light"
                >
                  <img
                    className="rounded-lg h-52 w-52 object-cover"
                    src={`${import.meta.env.VITE_API_IMAGE_URL}${book.image}`}
                    alt={book.name}
                  />
                  <a>
                    <div className="absolute bottom-0 left-0 right-0 top-0 h-full w-full overflow-hidden bg-[hsla(0,0%,98%,0.15)] bg-fixed opacity-0 transition duration-300 ease-in-out hover:opacity-100"></div>
                  </a>
                </div>

                <div className="flex flex-col items-center gap-3 mt-6 mb-2">
                  <div className="flex flex-col items-center gap-2">
                    <h5 className="mb-2 text-sm font-bold leading-tight text-neutral-800 flex items-center gap-2">
                      <Rate
                        allowHalf
                        disabled
                        defaultValue={calculateAverageRating(book.book_ratings)}
                      />
                      {calculateAverageRating(book.book_ratings)}
                    </h5>
                    <h5 className="text-lg font-bold leading-tight text-neutral-800 text-center">
                      {book.name}
                    </h5>
                  </div>
                  <p className=" text-sm font-semibold text-neutral-600 dark:text-neutral-200">
                    {book.author}
                  </p>

                  <h5 className="text-sm font-bold leading-tight text-neutral-800 dark:text-neutral-50">
                    ₹{book.price}
                  </h5>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <button
              onClick={() => navigate("/books")}
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              View All
              <svg
                className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-10">
          <div className="text-center mb-10 mx-auto">
            <h1 className="text-3xl font-bold">TOP RATED BOOKS</h1>
          </div>
          <div className="flex animated fadeIn faster flex-wrap mx-auto max-w-screen-2xl justify-center gap-x-6 gap-y-6">
            {topRatedBooks.map((book) => (
              <div
                className="block rounded-lg bg-white w-72 shadow-sm-light group"
                key={book.id}
              >
                <div
                  className="relative overflow-hidden bg-cover bg-no-repeat w-fit mx-auto group-hover:scale-110 group-hover:-translate-y-1 duration-300"
                  data-te-ripple-init
                  data-te-ripple-color="light"
                >
                  <img
                    className="rounded-lg h-52 w-52 object-cover"
                    src={`${import.meta.env.VITE_API_IMAGE_URL}${book.image}`}
                    alt={book.name}
                  />
                  <a>
                    <div className="absolute bottom-0 left-0 right-0 top-0 h-full w-full overflow-hidden bg-[hsla(0,0%,98%,0.15)] bg-fixed opacity-0 transition duration-300 ease-in-out hover:opacity-100"></div>
                  </a>
                </div>

                <div className="flex flex-col items-center gap-3 mt-6 mb-2">
                  <div className="flex flex-col items-center gap-2">
                    <h5 className="mb-2 text-sm font-bold leading-tight text-neutral-800 flex items-center gap-2">
                      <Rate
                        allowHalf
                        disabled
                        defaultValue={calculateAverageRating(book.book_ratings)}
                      />
                      {calculateAverageRating(book.book_ratings)}
                    </h5>
                    <h5 className="text-lg font-bold leading-tight text-neutral-800 text-center">
                      {book.name}
                    </h5>
                  </div>
                  <p className=" text-sm font-semibold text-neutral-600 dark:text-neutral-200">
                    {book.author}
                  </p>

                  <h5 className="text-sm font-bold leading-tight text-neutral-800 dark:text-neutral-50">
                    ₹{book.price}
                  </h5>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate("/books")}
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            View All
            <svg
              className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 5h12m0 0L9 1m4 4L9 9"
              />
            </svg>
          </button>
        </div>
      </div>
      <UserFooter />
    </>
  );
};

export default UserHome;
