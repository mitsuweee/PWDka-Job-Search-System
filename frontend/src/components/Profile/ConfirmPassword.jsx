import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const ConfirmPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract the reset token from the URL query parameters
  const query = new URLSearchParams(useLocation().search);
  const resetToken = query.get("token");

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsSubmitting(true); // Disable the form while processing the request

    // Axios configuration for the password reset request
    const config = {
      method: "put",
      url: "http://localhost:8080/password/resetpassword", // Your backend API endpoint
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        token: resetToken, // The reset token passed to the component (from URL)
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    };

    try {
      // Send PUT request to backend to change password
      const response = await axios(config);
      console.log(response.data);

      // If successful, show success message via toast
      toast.success("Your password has been changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(
        "Passwords do not match, or the old password cannot be reused."
      );
    } finally {
      setIsSubmitting(false); // Re-enable form
    }
  };

  return (
    <div className="max-w-lg mb-10 mx-auto mt-10 p-12 bg-white rounded-2xl shadow-xl">
      <Toaster position="top-center" reverseOrder={false} />{" "}
      {/* Toaster for displaying notifications */}
      <div className="flex justify-center mb-6">
        <img src="imgs/LOGO PWDKA.png" alt="Logo" className="h-14 w-22" />
      </div>
      <h2 className="text-3xl font-bold text-custom-blue mb-4 text-center">
        Change Password
      </h2>
      <p className="text-center text-gray-700 mb-6">
        Enter your new password and confirm it below to reset your password.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label
            htmlFor="newPassword"
            className="block text-gray-700 font-semibold mb-2"
          >
            New Password:
          </label>
          <input
            type="password"
            name="newPassword"
            id="newPassword"
            value={newPassword}
            onChange={handleNewPasswordChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xl"
            placeholder="Enter new password"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="confirmPassword"
            className="block text-gray-700 font-semibold mb-2"
          >
            Confirm Password:
          </label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xl"
            placeholder="Confirm new password"
          />
        </div>
        <button
          type="submit"
          className={`w-full py-3 mt-6 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitting} // Disable button while submitting
        >
          {isSubmitting ? "Changing Password..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default ConfirmPassword;
