import React from "react";
import Footer from "../components/Footer";
import AdminDeleteJobs from "../components/Admin/AdminDeleteJobs";

const AdminDelJobss = () => {
  return (
    <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <AdminDeleteJobs />
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default AdminDelJobss;
