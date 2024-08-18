import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import JobListing from "../components/Main/JobListContent.jsx";

function JobListingPage() {
  return (
    <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <header>
        <Navbar />
      </header>
      <main className="flex-1 flex justify-center items-center">
        <JobListing/>
         
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default JobListingPage;
