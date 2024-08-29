import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false); // State to track if a user or company is registered
  const [role, setRole] = useState(""); // State to track the role of the user
  const navigate = useNavigate();

  useEffect(() => {
    // Check if userType is set in sessionStorage
    const userId = sessionStorage.getItem("Id");
    const userRole = sessionStorage.getItem("Role");

    if (userId) {
      setIsRegistered(true);
    }
    if (userRole) {
      setRole(userRole);
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false); // Close the menu after navigation
  };

  return (
    <header className="relative flex flex-wrap sm:justify-start sm:flex-nowrap w-full bg-[#e3edf7] text-sm py-3 shadow-lg rounded-lg">
      <nav className="max-w-[85rem] w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center justify-between">
          <a
            className="flex-none text-xl font-semibold focus:outline-none focus:opacity-80"
            onClick={() => handleNavigation("/")}
            aria-label="Brand"
          >
            <img className="w-26 h-14" src="/imgs/LOGO PWDKA.png" alt="Logo" />
          </a>
          <div className="sm:hidden">
            <button
              type="button"
              className="relative flex justify-center items-center gap-x-2 rounded-lg border border-gray-200 bg-[#e3edf7] text-gray-800 shadow-sm "
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-controls="navbar"
            >
              <svg
                className={`w-6 h-6 ${isMenuOpen ? "hidden" : "block"}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" x2="21" y1="6" y2="6" />
                <line x1="3" x2="21" y1="12" y2="12" />
                <line x1="3" x2="21" y1="18" y2="18" />
              </svg>
              <svg
                className={`w-6 h-6 ${isMenuOpen ? "block" : "hidden"}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6L18 18" />
              </svg>
              <span className="sr-only">Toggle navigation</span>
            </button>
          </div>
        </div>
        <div
          id="navbar"
          className={`transition-all duration-300 ease-in-out ${
            isMenuOpen ? "block" : "hidden"
          } sm:flex sm:items-center sm:justify-end sm:ps-5`}
        >
          <div
            className={`flex flex-col sm:flex-row ${
              isMenuOpen ? "block" : "hidden"
            } sm:flex sm:items-center sm:justify-end sm:ps-5`}
          >
            <button
              onClick={() => handleNavigation("/")}
              className="nav-link mx-2 font-roboto text-[#007bff] text-lg font-bold py-2 px-4 rounded-lg bg-[#e3edf7] shadow-lg transition duration-300 hover:bg-[#007bff] hover:text-white"
            >
              Home
            </button>
            <button
              onClick={() => handleNavigation("/about")}
              className="nav-link mx-2 font-roboto text-[#007bff] text-lg font-bold py-2 px-4 rounded-lg bg-[#e3edf7] shadow-lg transition duration-300 hover:bg-[#007bff] hover:text-white"
            >
              About
            </button>
            <button
              onClick={() => handleNavigation("/contactpage")}
              className="nav-link mx-2 font-roboto text-[#007bff] text-lg font-bold py-2 px-4 rounded-lg bg-[#e3edf7] shadow-lg transition duration-300 hover:bg-[#007bff] hover:text-white"
            >
              Contact
            </button>

            {isRegistered &&
              role !== "company" && ( // Hide the browse job button if the role is company
                <button
                  onClick={() => handleNavigation("/joblist")}
                  className="nav-link mx-2 font-roboto text-[#e3edf7] text-lg font-bold py-2 px-4 rounded-lg bg-[#007bff] shadow-lg transition duration-300 hover:bg-white hover:text-[#007bff]"
                >
                  Browse Jobs
                </button>
              )}
            {isRegistered && (
              <button
                onClick={() => handleNavigation("/profile")}
                className="nav-link mx-2 font-roboto text-[#007bff] text-lg font-bold py-2 px-4 rounded-lg bg-[#e3edf7] shadow-lg transition duration-300 hover:bg-[#007bff] hover:text-white"
              >
                <span className="material-symbols-outlined">person</span>
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
