import React from "react";
import Footer from "../components/Footer";
import AdminSignup from "../components/Admin/AdminSignup";

const AdminSignups = () => {
  return (
    <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <header></header>
      <AdminSignup />
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default AdminSignups;
