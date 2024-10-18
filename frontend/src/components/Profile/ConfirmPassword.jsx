import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const ConfirmPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessCardVisible, setIsSuccessCardVisible] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  const query = new URLSearchParams(useLocation().search);
  const resetToken = query.get("token");

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsSubmitting(true);

    const config = {
      method: "put",
      url: "http://localhost:8080/password/resetpassword",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        token: resetToken,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    };

    try {
      const response = await axios(config);
      console.log(response.data);
      toast.success("Your password has been changed successfully!");
      setIsSuccessCardVisible(true); // Show success card
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(
        "Passwords do not match, or the old password cannot be reused."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mb-10 mx-auto mt-10 p-12 bg-white rounded-2xl shadow-xl">
      <Toaster position="top-center" reverseOrder={false} />
      {isSuccessCardVisible ? (
        <div className="max-w-4xl mx-auto mb-10 mt-10 p-10 bg-white rounded-xl shadow-lg space-y-8 transform transition-all hover:shadow-2xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-custom-blue">
              Password Changed Successfully!
            </h2>
            <p className="text-lg mt-4 text-gray-700">
              Your password has been successfully changed. You can now log in
              with your new password.
            </p>
            <button
              className="mt-8 py-3 px-6 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
              onClick={() => (window.location.href = "/login")} // Redirect to login page
            >
              Go to Login
            </button>
          </div>
        </div>
      ) : (
        <>
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
              <div className="relative">
                <input
                  type={passwordVisibility.newPassword ? "text" : "password"}
                  name="newPassword"
                  id="newPassword"
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xl"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center"
                  onClick={() => togglePasswordVisibility("newPassword")}
                >
                  <span className="material-symbols-outlined">
                    {passwordVisibility.newPassword
                      ? "visibility"
                      : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>
            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 font-semibold mb-2"
              >
                Confirm Password:
              </label>
              <div className="relative">
                <input
                  type={
                    passwordVisibility.confirmPassword ? "text" : "password"
                  }
                  name="confirmPassword"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xl"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                >
                  <span className="material-symbols-outlined">
                    {passwordVisibility.confirmPassword
                      ? "visibility"
                      : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>
            <button
              type="submit"
              className={`w-full py-3 mt-6 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Changing Password..." : "Change Password"}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ConfirmPassword;
