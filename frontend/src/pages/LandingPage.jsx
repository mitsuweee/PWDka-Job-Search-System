import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import LandingContent from "../components/LandingContent.jsx";

function LandingPage() {
  return (
    <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <header>
        <Navbar />
      </header>
      <main className="flex-1 flex justify-center items-center">
        <LandingContent/>
         
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default LandingPage;
