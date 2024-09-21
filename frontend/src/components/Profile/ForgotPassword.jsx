import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast"; // Import toast

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Track if request is being sent

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true); // Disable the button during the request

    // Create the Axios configuration
    const config = {
      method: "post",
      url: "http://localhost:8080/password/forgotpassword/email", // Replace with your backend URL
      headers: {
        "Content-Type": "application/json",
      },
      data: { email }, // Send the email as JSON in the body
    };

    try {
      // Send POST request to the backend
      const response = await axios(config);
      console.log(response.data);

      // Display success toast
      toast.success("Password reset link has been sent to your email.");
    } catch (error) {
      console.error("Error sending email:", error);
      // Display error toast
      toast.error("Error sending password reset email. Please try again.");
    } finally {
      setIsSubmitting(false); // Re-enable the button after the request
      setEmail(""); // Clear the email input field
    }
  };

  return (
    <div className="max-w-lg mb-10 mx-auto mt-10 p-12 bg-white rounded-2xl shadow-xl">
      <Toaster position="top-center" reverseOrder={false} />{" "}
      {/* Add Toaster component */}
      <div className="flex justify-center mb-6">
        <img src="imgs/LOGO PWDKA.png" alt="Logo" className="h-14 w-22" />
      </div>
      <h2 className="text-3xl font-bold text-custom-blue mb-4 text-center">
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
          className={`w-full py-3 mt-6 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitting} // Disable the button while the request is being sent
        >
          {isSubmitting ? "Sending..." : "Send Reset Link"}
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
