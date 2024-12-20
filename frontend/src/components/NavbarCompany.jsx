import { useState } from "react";
import { useNavigate } from "react-router-dom";

const NavbarComp = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <header className="relative flex flex-wrap sm:justify-start sm:flex-nowrap w-full bg-[#e3edf7] text-sm py-3 shadow-lg">
      <nav className="max-w-[85rem] w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center justify-between">
          {/* Logo (Not clickables) */}
          <div className="flex-none text-xl font-semibold focus:outline-none focus:opacity-80">
            <img className="w-26 h-14" src="/imgs/LOGO PWDKA.png" alt="Logo" />
          </div>
          <div className="sm:hidden">
            <button
              type="button"
              className="relative flex justify-center items-center gap-x-2 rounded-lg border  bg-white text-gray-800  "
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
              onClick={() => handleNavigation("/profile")}
              className="nav-link mx-2 font-roboto text-[#007bff] text-lg font-bold py-2 px-4 rounded-lg bg-[#e3edf7] shadow-lg transition duration-300 hover:bg-[#007bff] hover:text-white"
            >
              <span className="material-symbols-outlined">person</span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default NavbarComp;
