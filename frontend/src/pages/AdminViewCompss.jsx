import React from "react";
import Footer from "../components/Footer";
import AdminViewComp from "../components/Admin/AdminViewComp";

const AdminViewCompss = () => {
  return (
    <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <AdminViewComp />
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default AdminViewCompss;
