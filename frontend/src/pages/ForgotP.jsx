import React from "react";
import ForgotPassword from "../components/Profile/ForgotPassword";

const ForgotP = () => {
  return (
    <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <header>
        <Navbar />
      </header>
      <ForgotPassword />
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default ForgotP;
