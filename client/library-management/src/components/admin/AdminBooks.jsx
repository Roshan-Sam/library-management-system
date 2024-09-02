import axios from "axios";
import { useState, useEffect } from "react";
import { Table } from "flowbite-react";
import "react-photo-view/dist/react-photo-view.css";
import { PhotoProvider, PhotoView } from "react-photo-view";
import FadeLoader from "react-spinners/FadeLoader";
import { Popover, Badge } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import Cookies from "js-cookie";

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const onOpenModal = () => setOpen(true);
  const onCloseModal = () => setOpen(false);
  const [bookIdToDelete, setBookIdToDelete] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
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
          setBooks(response.data.books);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, []);

  const handleDelete = async () => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}delete-book/${bookIdToDelete}/`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (res.status === 200) {
        setBooks(books.filter((book) => book.id !== bookIdToDelete));
        onCloseModal();
        setBookIdToDelete("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full p-4 overflow-x-auto">
      <div className="mt-10 overflow-x-auto">
        <h1 className="font-semibold text-2xl">Library</h1>
        {loading && (
          <div className="flex justify-center mt-10">
            <FadeLoader height={12} width={4} color="#5AB2FF" />
          </div>
        )}
        {books.length > 0 ? (
          <div className="px-4 mt-6 overflow-x-auto">
            <div className="overflow-x-auto border border-gray-100">
              <Table>
                <Table.Head>
                  <Table.HeadCell>No</Table.HeadCell>
                  <Table.HeadCell>Name</Table.HeadCell>
                  <Table.HeadCell>Author</Table.HeadCell>
                  <Table.HeadCell>Publisher ID</Table.HeadCell>
                  <Table.HeadCell>Price</Table.HeadCell>
                  <Table.HeadCell>Stock</Table.HeadCell>
                  <Table.HeadCell>Description</Table.HeadCell>
                  <Table.HeadCell>Category</Table.HeadCell>
                  <Table.HeadCell>Image</Table.HeadCell>
                  <Table.HeadCell>Action</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {books.map((book, index) => (
                    <Table.Row
                      key={book.id}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {index + 1}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {book.name}
                      </Table.Cell>
                      <Table.Cell>{book.author}</Table.Cell>
                      <Table.Cell>{book.publisher_id}</Table.Cell>
                      <Table.Cell>
                        <Badge className="w-fit" color="failure">
                          ₹{book.price}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge className="w-fit rounded-full" color="purple">
                          {book.stock}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell className="text-cyan-600 hover:underline cursor-pointer">
                        <Popover
                          content={book.description}
                          trigger="hover"
                          placement="bottom"
                          arrow={false}
                          className=" text-black text-sm bg-gray-50 p-2 border-gray-100 border rounded max-w-3xl focus:outline-none"
                        >
                          <a>View</a>
                        </Popover>
                      </Table.Cell>
                      <Table.Cell>{book.category}</Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center cursor-pointer">
                          <PhotoProvider
                            bannerVisible={false}
                            speed={() => 300}
                          >
                            <PhotoView
                              src={`${import.meta.env.VITE_API_IMAGE_URL}${
                                book.image
                              }`}
                            >
                              <img
                                src={`${import.meta.env.VITE_API_IMAGE_URL}${
                                  book.image
                                }`}
                                alt={book.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            </PhotoView>
                          </PhotoProvider>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-4">
                          <a
                            onClick={() =>
                              navigate(
                                `/admin-dash?tab=editbook&bid=${book.id}`
                              )
                            }
                            className="cursor-pointer font-medium text-cyan-600 hover:underline dark:text-cyan-500"
                          >
                            Edit/View
                          </a>
                          <a
                            onClick={() => {
                              onOpenModal();
                              setBookIdToDelete(book.id);
                            }}
                            className="cursor-pointer font-medium text-red-600 hover:underline dark:text-red-500"
                          >
                            Delete
                          </a>
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
            No books added!
          </p>
        )}
      </div>
      <Modal open={open} onClose={onCloseModal} center>
        <h2 className="text-lg font-semibold text-gray-500">Delete a book!</h2>
        <div className="flex flex-col gap-6 sm:mx-20 items-center">
          <p className="mt-4 text-center max-w-42 text-base text-gray-700">
            Are you sure you want to delete this book?
          </p>
          <div className="flex justify-center">
            <button
              onClick={handleDelete}
              type="button"
              className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
            >
              Delete
            </button>
            <button
              onClick={onCloseModal}
              type="button"
              className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminBooks;
