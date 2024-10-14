import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Signup from "../components/Info/SignupContent";

const SignUp = () => {
  return (
    <div className="bg-custom-blue min-h-screen flex flex-col">
      <header>
        <Navbar />
      </header>
      <Signup />
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default SignUp;
