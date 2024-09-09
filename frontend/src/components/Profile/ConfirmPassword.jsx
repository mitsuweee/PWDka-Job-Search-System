import React, { useState } from "react";

const ConfirmPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    // api dito mits
    e.preventDefault();

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      setSuccess("");
    } else {
      setError("");
      // Here you can add the logic for changing the password using an API or Firebase.
      setSuccess("Your password has been changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="max-w-lg mb-10 mx-auto mt-10 p-12 bg-white rounded-2xl shadow-xl">
      <div className="flex justify-center mb-6">
        <img src="imgs/LOGO PWDKA.png" alt="Logo" className="h-14 w-22" />
      </div>
      <h2 className="text-3xl font-bold text-custom-blue mb-4 text-center">
        Change Password
      </h2>
      <p className="text-center text-gray-700 mb-6">
        Enter your new password and confirm it below to reset your password.
      </p>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {success && <p className="text-green-500 text-center mb-4">{success}</p>}

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
          className="w-full py-3 mt-6 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
        >
          Change Password
        </button>
      </form>
    </div>
  );
};

export default ConfirmPassword;
