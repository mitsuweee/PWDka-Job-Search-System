import React from "react";
import AdminLogin from "../components/Admin/AdminLoginCont";

const AdminLog = () => {
  return (
    <div>
      <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
        <header>{/* <Navbar /> */}</header>
        <AdminLogin />
      </div>
    </div>
  );
};

export default AdminLog;
