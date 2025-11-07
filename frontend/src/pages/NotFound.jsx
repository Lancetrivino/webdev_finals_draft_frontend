import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center text-white bg-gradient-to-right from-orange-900 via-orange-700 to-orange-500">
      <h1 className="text-6xl font-extrabold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-gray-200 mb-8 max-w-md">
        Oops! The page you’re looking for doesn’t exist or has been moved.
      </p>

      <Link
        to="/events"
        className="bg-white text-orange-700 font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-orange-100 transition"
      >
        Back to Events
      </Link>
    </div>
  );
};

export default NotFound;
