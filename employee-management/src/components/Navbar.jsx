// src/components/Navbar.js
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Fetch the username from localStorage after login
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    // Clear token and user info from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userName");

    // Update authentication state and navigate to login
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <ul className="flex space-x-4">
          <li>
            <Link to="/" className="text-gray-700 hover:text-green-500">
              Home
            </Link>
          </li>
          {isAuthenticated && (
            <li>
              <Link
                to="/employeeList"
                className="text-gray-700 hover:text-green-500"
              >
                Employee List
              </Link>
            </li>
          )}
        </ul>
        {isAuthenticated && (
          <div className="flex items-center space-x-4">
            <span className="text-gray-800 font-semibold">{userName}</span>{" "}
            {/* Display the logged-in user's name */}
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
