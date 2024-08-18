import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  const handlePrivacyPolicy = () => {
    navigate('/privacypolicy');
  };

  const handleAbout = () => {
    navigate('/about');
  };

  const handleContact = () => {
    navigate('/contactpage');
  };

  return (
    <footer className="bg-[#e3edf7]">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <a href="#" className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
            <img src="/imgs/LOGO PWDKA.png" className="h-10" alt="PWDKA Logo" />
          </a>
          <ul className="flex flex-wrap items-center mb-6 text-sm font-bold text-[#0083FF] sm:mb-0">
            <li><a
                href="/about"
                onClick={handleAbout}
                className="hover:underline me-4 md:me-6"
              >
                About
              </a></li>
            <li>
              <a
                href="/privacypolicy"
                onClick={handlePrivacyPolicy}
                className="hover:underline me-4 md:me-6"
              >
                Privacy Policy
              </a>
            </li>
            <li><a
                href="/contactpage"
                onClick={handleContact}
                className="hover:underline me-4 md:me-6"
              >
                Contact
              </a></li>
          </ul>
        </div>
        <hr className="my-6 border-[#0083FF] sm:mx-auto lg:my-8" />
        <span className="block text-sm text-[#0083FF] sm:text-center">
          © 2024 <a href="#" className="hover:underline">PWDKA</a>. All Rights Reserved.
        </span>
      </div>
    </footer>
  );
}

export default Footer;
