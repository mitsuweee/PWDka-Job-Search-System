import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ViewJobs from "../components/Dashboard/ViewJobs";

const ViewJobsPage = () => {
  return (
    <div>
      <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
        <header>
          <Navbar />
        </header>
        <ViewJobs />
        <footer>
          <Footer />
        </footer>
      </div>
    </div>
  );
};

export default ViewJobsPage;
