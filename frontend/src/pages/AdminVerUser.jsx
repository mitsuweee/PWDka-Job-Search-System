import React from "react";
import Footer from "../components/Footer";
import UserProf from "../components/Profile/UserPContent";
import AdminVerifyUsers from "../components/Admin/AdminVerifyUsers";

const AdminVerUsers = () => {
  return (
    <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <AdminVerifyUsers />
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default AdminVerUsers;
