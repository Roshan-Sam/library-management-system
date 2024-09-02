import React, { useState, useEffect } from "react";
import UserNav from "../components/user/UserNav";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Rate } from "antd";
import { Badge } from "antd";
import AOS from "aos";
import "aos/dist/aos.css";
import UserFooter from "./UserFooter";
import Cookies from "js-cookie";

const UserBooks = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");
  const [books, setBooks] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const LIMIT = 5;

  useEffect(() => {
    AOS.init();
    AOS.refresh();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm") || "";

    if (searchTermFromUrl) setSearchTerm(searchTermFromUrl);

    fetchBooks(searchTermFromUrl, category, minRating, maxRating, 0);
  }, [location.search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set("searchTerm", searchTerm);
    navigate(`/books?${urlParams.toString()}`);
    setOffset(0);
  };

  const fetchBooks = async (
    search = "",
    category = "",
    minRating,
    maxRating,
    offset = 0
  ) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}books/`, {
        params: {
          searchTerm: search,
          category,
          minRating,
          maxRating,
          limit: LIMIT,
          offset,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      if (res.status === 200) {
        const newBooks = res.data.books;
        if (offset === 0) {
          setBooks(newBooks);
        } else {
          setBooks((prevBooks) => [...prevBooks, ...newBooks]);
        }
        setHasMore(newBooks.length === LIMIT);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const loadMoreBooks = () => {
    const newOffset = offset + LIMIT;
    setOffset(newOffset);
    fetchBooks(searchTerm, category, minRating, maxRating, newOffset);
  };

  const handleRatingChange = (rating) => {
    if (rating === 0) {
      setMinRating("");
      setMaxRating("");
      setOffset(0);
      fetchBooks(searchTerm, category, "", "", 0);
    } else {
      setMinRating(rating);
      setMaxRating(rating + 1);
      setOffset(0);
      fetchBooks(searchTerm, category, rating, rating + 1, 0);
    }
  };

  const handleCategoryChange = (category) => {
    setCategory(category);
    setOffset(0);
    fetchBooks(searchTerm, category, minRating, maxRating, 0);
  };

  const calculateAverageRating = (ratings) => {
    if (ratings.length === 0) return 0;
    const total = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    return parseFloat((total / ratings.length).toFixed(1));
  };

  return (
    <>
      <UserNav />
      <div className="py-10 min-h-screen">
        <div className="flex justify-between px-10 md:flex-row flex-col gap-x-4">
          <form className="md:w-96 w-full" onSubmit={handleSubmit}>
            <label
              htmlFor="search"
              className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
            >
              Search
            </label>
            <div className="relative w-full mb-4">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search books by book name, author name ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
          <div className="flex md:gap-4 md:flex-row flex-col">
            <div className="relative mb-4">
              <select
                id="category"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="">Select category</option>
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
            <div className="relative mb-4">
              <select
                id="rating"
                value={minRating}
                onChange={(e) => handleRatingChange(parseInt(e.target.value))}
                className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value={0}>Select rating</option>
                <option value={1}>1 star and above</option>
                <option value={2}>2 stars and above</option>
                <option value={3}>3 stars and above</option>
                <option value={4}>4 stars and above</option>
                <option value={5}>5 stars</option>
              </select>
            </div>
          </div>
        </div>
        <div className="mt-10 px-10">
          <h2 className="text-center text-2xl font-bold mb-10">Books</h2>
          {books.length > 0 ? (
            <>
              <div className="flex animated fadeIn faster flex-wrap mx-auto max-w-screen-2xl justify-center gap-x-6 gap-y-6">
                {books.map((book) => (
                  <div
                    data-aos="fade-zoom-in"
                    data-aos-offset="200"
                    data-aos-easing="ease-in-sine"
                    data-aos-duration="600"
                    className="w-fit cursor-pointer"
                    key={book.id}
                    onClick={() => navigate(`/book-preview/${book.id}`)}
                  >
                    <Badge.Ribbon
                      text={book.category}
                      color="geekblue"
                      className="-mt-3"
                    >
                      <div className="block rounded-lg bg-white w-72 shadow-sm-light group">
                        <div
                          className=" relative overflow-hidden bg-cover bg-no-repeat w-fit mx-auto group-hover:scale-110 group-hover:-translate-y-1 duration-300"
                          data-te-ripple-init
                          data-te-ripple-color="light"
                        >
                          <img
                            className="rounded-lg h-52 w-52 object-cover"
                            src={`${import.meta.env.VITE_API_IMAGE_URL}${
                              book.image
                            }`}
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
                                defaultValue={calculateAverageRating(
                                  book.book_ratings
                                )}
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
                    </Badge.Ribbon>
                  </div>
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={loadMoreBooks}
                    className="flex items-center py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                  >
                    Load More
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
              )}
            </>
          ) : (
            <p className="text-lg font-semibold text-gray-600 text-center mt-10">
              No books available!
            </p>
          )}
        </div>
      </div>
      <UserFooter />
    </>
  );
};

export default UserBooks;
