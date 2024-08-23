import React from "react";
import Footer from "../components/Footer";
import AdminViewUsers from "../components/Admin/AdminViewUsers";

const AdminViewUserss = () => {
  return (
    <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <AdminViewUsers />
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default AdminViewUserss;
