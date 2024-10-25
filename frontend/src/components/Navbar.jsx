import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if userType is set in localStorage
    const userId = localStorage.getItem("Id");
    const userRole = localStorage.getItem("Role");

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
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (role === "company") {
      handleNavigation("/dashc");
    } else if (!isRegistered) {
      handleNavigation("/");
    }
  };

  return (
    <header className="relative flex flex-wrap sm:justify-start sm:flex-nowrap w-full bg-white text-sm py-3 shadow-2xl rounded-lg">
      <nav className="max-w-[85rem] w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center justify-between">
          {/* Make the logo conditionally clickable */}
          <div
            className={`flex-none text-xl font-semibold focus:outline-none ${
              role === "company" || !isRegistered
                ? "cursor-pointer"
                : "cursor-default"
            }`}
            onClick={handleLogoClick} // Handle logo click based on role
            aria-label="Brand"
          >
            <img className="w-26 h-14" src="/imgs/LOGO PWDKA.png" alt="Logo" />
          </div>
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
            {/* Conditionally render the Home button */}
            {role === "admin" && (
              <button
                onClick={() => handleNavigation("/")}
                className="nav-link mx-2 font-roboto text-[#007bff] text-lg font-bold py-2 px-4 rounded-lg bg-[#e3edf7] shadow-2xl transition duration-300 hover:bg-[#007bff] hover:text-white flex items-center"
              >
                <span className="material-symbols-outlined text-2xl mr-2">
                  home
                </span>
                <span>Home</span>
              </button>
            )}
            <button
              onClick={() => handleNavigation("/about")}
              className="nav-link mx-2 font-sfprobold text-[#007bff] text-lg font-bold py-2 px-4 rounded-lg bg-white shadow-2xl transition duration-300 hover:bg-[#007bff] hover:text-white flex items-center"
            >
              <span className="material-symbols-outlined text-2xl mr-2">
                info
              </span>
              <span>About</span>
            </button>
            <button
              onClick={() => handleNavigation("/contactpage")}
              className="nav-link mx-2 font-sfprobold text-[#007bff] text-lg font-bold py-2 px-4 rounded-lg bg-white shadow-2xl transition duration-300 hover:bg-[#007bff] hover:text-white flex items-center"
            >
              <span className="material-symbols-outlined text-2xl mr-2">
                phone_in_talk
              </span>
              <span>Contact</span>
            </button>

            {isRegistered && role !== "company" && (
              <button
                onClick={() => handleNavigation("/joblist")}
                className="nav-link mx-2 font-sfprobold text-[#e3edf7] text-lg font-bold py-2 px-4 rounded-lg bg-[#007bff] shadow-2xl transition duration-300 hover:bg-white hover:text-[#007bff] flex items-center"
              >
                <span className="material-symbols-outlined text-2xl mr-2">
                  work
                </span>
                <span>Browse Jobs</span>
              </button>
            )}
            {isRegistered && (
              <button
                onClick={() => handleNavigation("/profile")}
                className="nav-link mx-2 font-roboto text-[#007bff] text-lg font-bold py-2 px-4 rounded-lg bg-white shadow-2xl transition duration-300 hover:bg-[#007bff] hover:text-white flex items-center"
              >
                <span className="material-symbols-outlined text-2xl">
                  person
                </span>
                <span className="ml-2">Profile</span>
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
