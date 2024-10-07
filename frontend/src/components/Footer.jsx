import React from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <footer className="bg-[#e3edf7]">
      <div className="w-full max-w-screen-xl mx-auto px-6 py-8">
        {/* Flex container */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center space-x-3 rtl:space-x-reverse transition-all duration-300 hover:scale-105"
            aria-label="PWDKA Home"
          >
            <img src="/imgs/LOGO PWDKA.png" className="h-12" alt="PWDKA Logo" />
          </a>

          {/* Navigation Links */}
          <nav>
            <ul className="flex flex-wrap items-center justify-center text-sm font-bold text-[#0083FF] space-x-4 md:space-x-6">
              <li>
                <button
                  onClick={() => handleNavigation("/about")}
                  className="hover:underline hover:text-[#005BB5] focus:outline-none transition-colors duration-200"
                  aria-label="About"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/privacypolicy")}
                  className="hover:underline hover:text-[#005BB5] focus:outline-none transition-colors duration-200"
                  aria-label="Privacy Policy"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/contactpage")}
                  className="hover:underline hover:text-[#005BB5] focus:outline-none transition-colors duration-200"
                  aria-label="Contact"
                >
                  Contact
                </button>
              </li>
            </ul>
          </nav>

          {/* Back to Top Button */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center text-[#0083FF] hover:text-[#005BB5] transition-all duration-300 focus:outline-none"
            aria-label="Back to top"
          >
            <span className="material-symbols-outlined text-3xl mr-2 transform transition-transform duration-300 hover:translate-y-[-4px]">
              arrow_upward
            </span>
            <span className="text-base font-semibold">Back to Top</span>
          </button>
        </div>

        <hr className="my-8 border-[#0083FF] sm:mx-auto" />

        {/* Copyright */}
        <section className="text-center">
          <span className="block text-sm text-[#0083FF]">
            © 2024{" "}
            <a
              href="#"
              className="hover:underline hover:text-[#005BB5] transition-colors duration-200 focus:outline-none"
            >
              PWDKA
            </a>
            . All Rights Reserved.
          </span>
        </section>
      </div>
    </footer>
  );
};

export default Footer;
