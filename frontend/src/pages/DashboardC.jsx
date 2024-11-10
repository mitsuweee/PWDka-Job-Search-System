import React from "react";
import { Link } from "react-router-dom";
import NavbarCompany from "../components/NavbarCompany.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import DashboardCompany from "../components/Dashboard/DashComp.jsx";
function DashboardC() {
  return (
    <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <header>
        <Navbar />
      </header>
      <DashboardCompany />
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default DashboardC;
