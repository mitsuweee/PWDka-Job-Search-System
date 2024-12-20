import { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Typewriter from "typewriter-effect";

const LoginComp = () => {
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const data = JSON.stringify({
      email: formValues.email.toLowerCase(),
      password: formValues.password,
    });

    const config = {
      method: "post",
      url: "/login/auth",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then((response) => {
        toast.success(response.data.message);
        setLoading(false);

        setTimeout(() => {
          const { id, role, token } = response.data;

          // Store token in localStorage
          localStorage.setItem("Token", token);
          localStorage.setItem("Id", id);
          localStorage.setItem("Role", role);

          if (role === "user") {
            window.location.href = "/joblist";
          } else if (role === "admin") {
            window.location.href = "/admin/dashboard";
          } else {
            window.location.href = "/dashc";
          }
        }, 2000);
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        toast.error(errorMessage);
        setLoading(false);
      });
  };

  return (
    <section className="relative bg-white">
      <Toaster position="top-center" reverseOrder={false} />
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
        </div>
      )}
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
        <section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6">
          <img
            alt=""
            src="/imgs/smiley-woman-working-laptop.jpg"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900  to-transparent opacity-90"></div>
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
              <Typewriter
                options={{
                  autoStart: true,
                  loop: true,
                  delay: 50,
                  strings: ["Login"],
                }}
              />
            </h2>
            <p className="mt-4 leading-relaxed text-white/90">
              We are glad to have you back! Login to continue connecting with
              opportunities tailored just for you. If you don't have an account
              yet, feel free to sign up and join our community.
            </p>
          </div>
        </section>

        <main
          className="relative flex items-start justify-start px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6 bg-cover bg-center bg-fixed min-h-screen"
          style={{
            backgroundImage: "url('/imgs/pft.png')",
          }}
        >
          {/* Form content */}
          <div className="w-full relative z-10">
            <p className="text-white text-left text-sfprobold font-extrabold leading-snug tracking-tight mb-4 md:text-4xl">
              <Typewriter
                options={{
                  autoStart: true,
                  loop: true,
                  delay: 50,
                  strings: ["Welcome Back!"],
                  wrapperClassName: "typewriter-wrapper",
                  cursorClassName: "typewriter-cursor",
                }}
              />
            </p>
            <div className="bg-white p-8 shadow-2xl rounded-2xl">
              <h2 className="text-3xl font-bold mt-2 text-custom-blue">
                <span className="material-symbols-outlined text-2xl mr-4">
                  login
                </span>
                Login
              </h2>
              <p className="text-gray-600 mt-5">
                Use your credentials to log in either as a User or a Company.
                You will be directed to the appropriate dashboard based on your
                role.
              </p>

              {/* Form */}
              <form
                className="mt-8 grid grid-cols-12 gap-6"
                onSubmit={handleSubmit}
              >
                <div className="col-span-12">
                  <label
                    htmlFor="email"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <div className="mt-2">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formValues.email}
                      onChange={handleInputChange}
                      className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-7 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
                      placeholder="Ex: user@gmail.com"
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
                      className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-7 pr-12 sm:pr-10 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
                      placeholder="******"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 hover:text-blue-500"
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="col-span-12 flex justify-between mt-6">
                  <button
                    type="submit"
                    className="px-6 py-2 text-lg shadow-xl font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Login
                  </button>
                </div>
              </form>

              {/* Links */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t-2 border-white mt-6 pt-6 space-y-4 sm:space-y-0">
                {/* Not a member and Sign Up */}
                <div className="flex items-center justify-start">
                  <p className="text-sm text-gray-800">Not a member?</p>
                  <a href="/signup" className="text-sm text-[#007bff] ml-2">
                    Sign Up
                  </a>
                </div>

                {/* Forgot Password */}
                <div className="flex items-center justify-start sm:justify-end">
                  <a href="/forgotpassword" className="text-sm text-[#007bff]">
                    Forgot Password?
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};

export default LoginComp;
