import UserNav from "../components/user/UserNav";
import UserFooter from "./UserFooter";

const About = () => {
  return (
    <>
      <UserNav />
      <div className="min-h-screen mt-20">
        <div className="py-20 px-4 max-w-6xl mx-auto min-h-screen border-b-2 border-gray-200">
          <h1 className="text-3xl font-bold mb-4 text-slate-800">
            Welcome to BookPath - Your Comprehensive Library Management System
          </h1>
          <p className="mb-4 text-slate-700">
            Discover the future of library management with BookPath, where
            efficiency meets innovation. Our platform is designed to streamline
            your library operations, making it easier than ever to manage
            collections, track inventory, and serve your patrons with
            excellence.
          </p>
          <p className="mb-4 text-slate-700">
            At BookPath, we are committed to providing top-notch solutions that
            cater to the diverse needs of libraries of all sizes. Whether you're
            managing a small community library or a large academic institution,
            our comprehensive tools are built to support your goals and enhance
            your services.
          </p>
          <p className="mb-4 text-slate-700">
            Our user-friendly interface ensures that you can efficiently
            navigate through various functionalities, from cataloging and
            circulation to user management and reporting. With BookPath, you
            have the power to keep your library organized, up-to-date, and
            responsive to the needs of your community.
          </p>
          <p className="mb-4 text-slate-700">
            Experience seamless integration and powerful features that make
            library management a breeze. Our platform supports automated
            notifications, advanced search capabilities, and detailed analytics,
            giving you the insights you need to make informed decisions and
            improve your library's performance.
          </p>
          <p className="mb-4 text-slate-700">
            Join the growing community of libraries that trust BookPath to
            enhance their services and operations. With our reliable support and
            continuous updates, you can be confident that your library is in
            good hands. Start your journey with BookPath today and unlock the
            full potential of your library management system.
          </p>
        </div>
      </div>
      <UserFooter />
    </>
  );
};

export default About;
