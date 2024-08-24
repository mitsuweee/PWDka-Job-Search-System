import React from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import DashboardAdmin from "../components/Admin/AdminDash.jsx";


function Dashboard() {
  return (
    <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      {/* <header>
        <Navbar />
      </header> */}
      <main className="flex-1 flex">
       <DashboardAdmin/>
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default Dashboard;
