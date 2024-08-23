import React from "react";
import Footer from "../components/Footer";
import AdminViewJobs from "../components/Admin/AdminViewJobs";

const AdminViewJobss = () => {
  return (
    <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <AdminViewJobs />
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default AdminViewJobss;
