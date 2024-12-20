import React from "react";
import UserProf from "./UserPContent";
import CompanyProf from "./CompanyPContent";
import Footer from "../Footer";
import Navbar from "../Navbar";

const Profile = () => {
  const userType = localStorage.getItem("Role");

  return (
    <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <header>
        <Navbar />
      </header>

      {/* Render the appropriate profile based on the user type */}
      <main className="flex-grow">
        {userType === "company" ? (
          <CompanyProf />
        ) : userType === "user" ? (
          <UserProf />
        ) : (
          <div>Error: Unknown user type</div>
        )}
      </main>

      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default Profile;
