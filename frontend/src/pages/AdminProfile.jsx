import React from "react";
import AdminProf from "../components/Profile/AdminPContent";
import Footer from "../components/Footer";

const AdminProfile = () => {
  return (
    <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <header></header>
      <AdminProf />
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default AdminProfile;
