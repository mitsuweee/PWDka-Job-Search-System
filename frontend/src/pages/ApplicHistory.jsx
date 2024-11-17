import React from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ApplicationHistory from "../components/Main/ApplicationHistory";

const AppliHistory = () => {
  return (
    <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <header>
        <Navbar />
      </header>
      <ApplicationHistory />
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default AppliHistory;
