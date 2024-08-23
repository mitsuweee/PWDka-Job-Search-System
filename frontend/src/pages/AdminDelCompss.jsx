import React from "react";
import Footer from "../components/Footer";
import AdminDeleteComp from "../components/Admin/AdminDeleteComp";

const AdminDelCompss = () => {
  return (
    <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <AdminDeleteComp />
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default AdminDelCompss;
