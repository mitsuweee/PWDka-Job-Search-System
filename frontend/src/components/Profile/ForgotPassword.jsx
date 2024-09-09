import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // integrate here
    setEmail("");
  };

  return (
    <div className="max-w-lg mb-10 mx-auto mt-10 p-12 bg-white rounded-2xl shadow-xl">
      <div className="flex justify-center mb-6">
        <img src="imgs\LOGO PWDKA.png" alt="Logo" className="h-14 w-22" />
      </div>
      <h2 className="text-3xl font-bold text-custom-blue mb-4 text-center ">
        Forgot Password?
      </h2>
      <p className="text-center text-gray-700 mb-6">
        Enter the email address associated with your account and we'll send you
        a link to reset your password.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label
            htmlFor="email"
            className="block text-gray-700 font-semibold mb-2"
          >
            Email Address:
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xl"
            placeholder="user@gmail.com"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 mt-6 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
        >
          Send Reset Link
        </button>
      </form>
      <p className="mt-6 text-center text-gray-700">
        Don’t have an account?{" "}
        <a href="/signup" className="text-blue-500 hover:underline">
          Sign up
        </a>
      </p>
    </div>
  );
};

export default ForgotPassword;
