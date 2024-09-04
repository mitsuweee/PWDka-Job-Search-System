import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ConfirmPassword from "../components/Profile/ConfirmPassword";

const ConfirmP = () => {
  return (
    <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <header>
        <Navbar />
      </header>
      <ConfirmPassword />
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default ConfirmP;
