import React from "react";
import TermsAndConditions from "../components/Info/TermsContent";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Terms = () => {
  return (
    <div>
      <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
        <header>
          <Navbar />
        </header>
        <TermsAndConditions />
        <footer>
          <Footer />
        </footer>
      </div>
    </div>
  );
};

export default Terms;
