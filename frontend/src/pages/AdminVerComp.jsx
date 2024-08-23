import React from "react";
import Footer from "../components/Footer";
import AdminVerifyComp from "../components/Admin/AdminVeifyComp";

const AdminVerComps = () => {
  return (
    <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <AdminVerifyComp />
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default AdminVerComps;
