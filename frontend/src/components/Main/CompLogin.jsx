import React, { useState } from "react";
import axios from "axios";

const CompanyLoginComp = () => {
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = JSON.stringify({
      email: formValues.email.toLowerCase(),
      password: formValues.password,
    });

    const config = {
      method: "post",
      url: "/company/login/auth",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        console.log(response.data);
        alert(response.data.message);

        // Store id and role in local storage or state
        const { id, role } = response.data;
        sessionStorage.setItem("companyId", id);
        sessionStorage.setItem("companyRole", role);

        // Redirect to CompanyDashboard.jsx
        window.location.href = "/companydashboard";
      })
      .catch(function (error) {
        const errorMessage = error.response?.data?.message || "An error occurred";
        console.log(error.response?.data);
        alert(errorMessage);
      });
  };

  const commonInputStyles = {
    boxShadow:
      "inset 13px 13px 27px #d1dae3, inset -13px -13px 27px #f5ffff",
  };

  return (
    <section className="bg-white">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
        <main className="flex items-start justify-start px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6 bg-custom-bg">
          <div className="w-full">
            <p className="text-[#007bff] text-left font-extrabold leading-snug tracking-tight mb-4 md:text-4xl">
              COMPANY LOGIN
            </p>
            <div className="bg-custom-bg p-8 shadow-2xl rounded-2xl">
              <form className="mt-8 grid grid-cols-12 gap-6" onSubmit={handleSubmit}>
                <div className="col-span-12">
                  <label
                    htmlFor="email"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Company Email
                  </label>
                  <div className="mt-2">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formValues.email}
                      onChange={handleInputChange}
                      className="mt-2 w-full h-10 rounded-md bg-white text-lg text-gray-700 focus:outline-none"
                      style={commonInputStyles}
                      placeholder="Ex: company@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-12">
                  <label
                    htmlFor="password"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Your Password
                  </label>
                  <div className="relative mt-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formValues.password}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-md h-10 bg-white text-lg text-gray-700 focus:outline-none pr-10"
                      style={commonInputStyles}
                      placeholder="********"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 hover:text-blue-500"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="col-span-12 flex justify-between mt-6">
                  <button
                    type="submit"
                    className="px-6 py-2 text-lg shadow-xl font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Login
                  </button>
                </div>
              </form>

              <div className="flex items-center justify-start border-t-2 border-[#1f2937] mt-6 pt-6">
                <p className="text-sm text-gray-800">Looking for Employees?</p>
                <a href="/signup" className="text-sm text-[#007bff] ml-2">
                  Sign Up
                </a>
              </div>
            </div>
          </div>
        </main>

        <section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6">
          <img
            alt=""
            src="/imgs/company-working-laptop.jpg"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          <div className="hidden lg:relative lg:block lg:p-12">
            <a className="block text-white" href="#">
              <span className="sr-only">Home</span>
              <svg
                className="h-8 sm:h-10"
                viewBox="0 0 28 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* SVG content here */}
              </svg>
            </a>
            <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
              Welcome Back, Partner!
            </h2>
            <p className="mt-4 leading-relaxed text-white/90">
              We're excited to see you again! Login to continue posting jobs and managing applicants effectively. If your company doesn't have an account yet, join us today.
            </p>
          </div>
        </section>
      </div>
    </section>
  );
};

export default CompanyLoginComp;
